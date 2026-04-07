import { IsString, IsEmail, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Пароль не менее 6 символов' })
  password!: string;
}
