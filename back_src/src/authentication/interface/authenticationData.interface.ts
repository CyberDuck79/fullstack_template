import { ApiProperty } from '@nestjs/swagger';

export default class AuthenticationData {
  @ApiProperty()
	authentication: string;

  @ApiProperty()
  refresh: string;

  @ApiProperty()
  accessTokenExpiration: Date;

  @ApiProperty()
  refreshTokenExpiration: Date;
}