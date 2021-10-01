import { ApiProperty } from "@nestjs/swagger";

export default class publicUserInfos {
	@ApiProperty()
	id: number;
  
	@ApiProperty()
	name: string;
}