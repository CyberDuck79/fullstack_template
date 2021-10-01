import { Body, Controller, Get, Param, Put, Req, SerializeOptions, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import AuthenticatedRequest from '../authentication/interface/authenticatedRequest.interface';
import JwtAuthenticationGuard from '../authentication/guard/jwt.guard';
import UpdateUserDto from './dto/updateUser.dto';
import UsersService from './users.service';
import PrivateUserInfos from './swagger/privateUserInfos.type'
import idParams from '../utils/idParams.interface';
import publicUserInfos from './swagger/publicUserInfos.type'

@ApiTags('users')
@Controller('users')
export default class UsersController {
  constructor(
    private readonly userService: UsersService
  ) {}
  
  @ApiOperation({ summary: "Get private infos of the authentivated user" })
  @ApiBearerAuth('bearer-authentication')
  @ApiCookieAuth('cookie-authentication')
  @ApiResponse({
    status: 200,
    type: PrivateUserInfos
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @SerializeOptions({
    groups: ['private']
  })
  @UseGuards(JwtAuthenticationGuard)
  @Get('me')
  getAuthenticatedUser(@Req() request: AuthenticatedRequest) {
    const { user } = request;
    return this.userService.getById(user.id);
  }

  @ApiOperation({ summary: "Update user associated with the authentication token" })
  @ApiBearerAuth('bearer-authentication')
  @ApiCookieAuth('cookie-authentication')
  @ApiResponse({
    status: 200,
    description: 'User updated',
    type: PrivateUserInfos
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized'
  })
  @SerializeOptions({
    groups: ['private']
  })
  @UseGuards(JwtAuthenticationGuard)
  @Put('me')
  updateAuthenticatedUser(@Req() request: AuthenticatedRequest, @Body() userData: UpdateUserDto) {
    const { user } = request;
    return this.userService.updateUser(user.id, userData);
  }

  @ApiOperation({ summary: "Get public infos of a user" })
  @ApiParam({ name: 'id', type: Number, description: 'user id' })
  @ApiResponse({
    status: 200,
    type: publicUserInfos
  })
  @ApiResponse({
    status: 404,
    description: 'User not found for this id'
  })
  @Get(':id')
  getById(@Param() { id }: idParams) {
    return this.userService.getById(Number(id));
  }
}