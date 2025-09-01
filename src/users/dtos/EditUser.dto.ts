import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class EditUserDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(32)
  firstname?: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(32)
  lastname?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  displayName?: string;

  @IsNotEmpty()
  @IsEmail()
  email?: string;

  @IsString()
  @IsNotEmpty()
  password?: string;

  @IsString()
  @IsNotEmpty()
  role?: string;
}
