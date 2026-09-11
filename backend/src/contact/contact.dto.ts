import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateContactDto {
  @IsString()
  @MinLength(3, { message: 'Name must be at least 3 characters long.' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters.' })
  name!: string;

  @IsString()
  @MaxLength(150, { message: 'Email must not exceed 150 characters.' })
  email!: string;

  @IsString()
  @MinLength(10, { message: 'Message must be at least 10 characters long.' })
  @MaxLength(2000, { message: 'Message must not exceed 2000 characters.' })
  message!: string;
}
