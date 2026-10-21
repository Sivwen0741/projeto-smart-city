import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'diego.prestes@pontagrossa.pr.gov.br' })
  @IsEmail({}, { message: 'Informe um e-mail válido.' })
  @MaxLength(160)
  email: string;

  @ApiProperty({ example: 'senha-do-usuario' })
  @IsString()
  @IsNotEmpty({ message: 'Informe a senha.' })
  @MaxLength(200)
  senha: string;
}
