import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-token'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return access_token when credentials are valid', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        passwordHash: await bcrypt.hash('password', 10),
      };
      mockPrisma.user.findUnique.mockResolvedValue(user);

      const result = await service.login('test@example.com', 'password');

      expect(result).toEqual({ access_token: 'mock-token' });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: '1',
        email: 'test@example.com',
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login('unknown@example.com', 'password')).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login('unknown@example.com', 'password')).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('should throw UnauthorizedException when password is wrong', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        passwordHash: await bcrypt.hash('correct', 10),
      });

      await expect(service.login('test@example.com', 'wrong')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('validateUser', () => {
    it('should return user when payload is valid', async () => {
      const user = { id: '1', email: 'test@example.com' };
      mockPrisma.user.findUnique.mockResolvedValue(user);

      const result = await service.validateUser({ sub: '1' });

      expect(result).toEqual(user);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        select: { id: true, email: true },
      });
    });

    it('should return null when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await service.validateUser({ sub: '999' });

      expect(result).toBeNull();
    });
  });
});
