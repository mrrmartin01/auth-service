import {
  IsEmail,
  IsOptional,
  IsString,
  // IsArray,
  // IsIn,
  MinLength,
} from 'class-validator';

// export const USER_ROLES = ['user', 'admin', 'seller'] as const;
// export type UserRole = (typeof USER_ROLES)[number];

export class CreateUserDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  address?: string;

  // @IsOptional()
  // @IsArray()
  // @IsIn(USER_ROLES, { each: true })
  // roles?: UserRole[];
}
