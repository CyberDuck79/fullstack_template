import { Body, Controller, Get, Put, Req, SerializeOptions, UseGuards } from '@nestjs/common';
import RequestWithUser from 'src/authentication/interface/requestWithUser.interface';
import JwtAuthenticationGuard from '../authentication/guard/jwt.guard';
import UpdateUserDto from './dto/updateUser.dto';
import UsersService from './users.service';

@SerializeOptions({
  groups: ['private']
})
@Controller('users')
export default class UsersController {
  constructor(
    private readonly userService: UsersService
  ) {}
  
  @UseGuards(JwtAuthenticationGuard)
  @Get('me')
  getById(@Req() request: RequestWithUser) {
    const { user } = request;
    return this.userService.getById(user.id);
  }

  @UseGuards(JwtAuthenticationGuard)
  @Put('me')
  updateById(@Req() request: RequestWithUser, @Body() userData: UpdateUserDto) {
    const { user } = request;
    return this.userService.updateUser(user.id, userData);
  }
}