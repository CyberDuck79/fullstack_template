import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import User from './user.entity';
import CreateUser from './interface/createUser.interface';
import UpdateUserDto from './dto/updateUser.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export default class UsersService {
	constructor(
		@InjectRepository(User)
		private usersRepository: Repository<User>,
	) {}

  async getById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ id });
    if (user) {
      return user;
    }
    throw new HttpException('User with this id does not exist', HttpStatus.NOT_FOUND);
  }

  async getByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({ email });
    if (user) {
      return user;
    }
    throw new HttpException('User with this email does not exist', HttpStatus.NOT_FOUND);
  }

  async getBy42Id(id42: number): Promise<User> {
    const user = await this.usersRepository.findOne({ id42 });
    if (user) {
      return user;
    }
    throw new HttpException('User with this 42id does not exist', HttpStatus.NOT_FOUND);
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ id });
    const isRefreshTokenValid = user.hashedRefreshTokens.find(async (hashedRefreshToken) => {
      await bcrypt.compare(
        hashedRefreshToken,
        refreshToken
      );
    });
    if (isRefreshTokenValid) {
      return user;
    }
  }

  async create(userData: CreateUser): Promise<User> {
    const newUser = this.usersRepository.create(userData);
    await this.usersRepository.save(newUser);
    return newUser;
  }

  async updateUser(id: number, userData: UpdateUserDto): Promise<User> {
    await this.usersRepository.update(id, userData);
    const updatedUser = await this.getById(id);
    if (updatedUser) {
      return updatedUser;
    }
    throw new HttpException('User not found', HttpStatus.NOT_FOUND);
  }

  async updateRefreshTokens(id: number, hashedRefreshTokens: string[]) {
    await this.usersRepository.update(id, { hashedRefreshTokens });
  }
}