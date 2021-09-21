import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
@Exclude()
export default class User {
  @PrimaryGeneratedColumn()
  @Expose({ groups: ['private'] })
  @ApiProperty()
  id: number;

  @Column({ unique: true, nullable: true })
  @Expose({ groups: ['private'] })
  @ApiProperty()
  id42: number;

  @Column({ unique: true })
  @Expose({ groups: ['private'] })
  @ApiProperty()
  email: string;

  @Column()
  password: string;

  @Column({ unique: true })
  @Expose()
  @ApiProperty()
  name: string;
}