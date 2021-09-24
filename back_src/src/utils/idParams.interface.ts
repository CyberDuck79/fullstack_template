import { IsNumberString } from 'class-validator';
 
export default class idParams {
  @IsNumberString()
  id: string;
}