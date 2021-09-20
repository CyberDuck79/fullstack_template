import { IsEmail, IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export default class UpdateUserDto {
  @ApiPropertyOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
	name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(7)
  password?: string;
}