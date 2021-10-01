import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
 
export default class ConfirmEmailDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string;
}
