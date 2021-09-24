import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude, Expose, Transform } from 'class-transformer';

@Entity()
@Exclude()
export default class User {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Column({ unique: true, nullable: true })
  @Expose({ groups: ['private'] })
  @Transform(({ value }) => {
    if (value !== null) {
      return value;
    }
  })
  id42?: number;

  @Column({ unique: true })
  @Expose()
  name: string;

  @Column({ unique: true })
  @Expose({ groups: ['private'] })
  email: string;

  @Column()
  password: string;

  @Column("text", { array: true, default: [] })
  public hashedRefreshTokens: string[];
}