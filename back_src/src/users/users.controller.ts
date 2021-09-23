import { Body, Controller, Get, Put, Req, SerializeOptions, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import AuthenticatedRequest from '../authentication/interface/authenticatedRequest.interface';
import JwtAuthenticationGuard from '../authentication/guard/jwt.guard';
import UpdateUserDto from './dto/updateUser.dto';
import UsersService from './users.service';

@SerializeOptions({
  groups: ['private']
})
@ApiTags('users')
@Controller('users')
export default class UsersController {
  constructor(
    private readonly userService: UsersService
  ) {}
  
  @UseGuards(JwtAuthenticationGuard)
  @ApiOperation({ summary: "return user associated with the authentication token" })
  @ApiBearerAuth('bearer-authentication')
  @ApiCookieAuth('cookie-authentication')
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('me')
  getById(@Req() request: AuthenticatedRequest) {
    const { user } = request;
    return this.userService.getById(user.id);
  }

  @UseGuards(JwtAuthenticationGuard)
  @ApiOperation({ summary: "Update user associated with the authentication token" })
  @ApiBearerAuth('bearer-authentication')
  @ApiCookieAuth('cookie-authentication')
  @ApiResponse({ status: 200, description: 'User updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Put('me')
  updateById(@Req() request: AuthenticatedRequest, @Body() userData: UpdateUserDto) {
    const { user } = request;
    return this.userService.updateUser(user.id, userData);
  }
}