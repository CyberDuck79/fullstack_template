import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export default class PrivateUserInfos {
	@ApiProperty()
  id: number;

  @ApiPropertyOptional()
  id42?: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;
}