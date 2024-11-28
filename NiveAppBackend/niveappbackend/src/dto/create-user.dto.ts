import {
  IsAlphanumeric,
  IsEmail,
  IsNotEmpty,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(2, { message: 'Name must have atleast 2 characters.' })
  @IsNotEmpty()
  name: string;

  @IsString()
  @MinLength(2, { message: 'firstName must have atleast 2 characters.' })
  @IsNotEmpty()
  firstName: string; // Nome do usuário

  @IsString()
  @MinLength(2, { message: 'lastName must have atleast 2 characters.' })
  @IsNotEmpty()
  lastName: string; // Nome do usuário

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(3, { message: 'Username must have atleast 3 characters.' })
  @IsAlphanumeric()
  username: string;

  @IsUrl() // Corrigido aqui para IsUrl sem parâmetros
  picture: string; // Agora o decorador será aplicado corretamente

  @IsNotEmpty()
  @MinLength(3, { message: 'Platform must have atleast 3 characters.' })
  @IsAlphanumeric()
  platform: string;

  @IsString()
  clerkId: string;
}
