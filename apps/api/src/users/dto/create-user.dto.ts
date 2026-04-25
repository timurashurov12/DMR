import { IsString, IsEmail, MinLength, IsOptional, IsEnum } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @IsEnum({ USER: 'USER', PLATFORM_OWNER: 'PLATFORM_OWNER' })
  @IsOptional()
  role?: 'USER' | 'PLATFORM_OWNER';
}