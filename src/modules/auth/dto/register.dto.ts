import { IsEmail, IsNotEmpty, IsString, MinLength, IsArray, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @IsArray()
  @IsOptional()
  roles?: string[] = ['user'];
}