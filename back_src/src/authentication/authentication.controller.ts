import { Body, Req, Controller, HttpCode, Post, UseGuards, Res } from '@nestjs/common';
import AuthenticationService from './authentication.service';
import RegisterDto from './dto/register.dto';
import RequestWithUser from './interface/requestWithUser.interface';
import PasswordAuthenticationGuard from './guard/password.guard';
import { Request } from 'express';
import AuthenticationData from './interface/authenticationData.interface';
import JwtAuthenticationGuard from './guard/jwt.guard';
import { ApiBearerAuth, ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('authentication')
@Controller('authentication')
export default class AuthenticationController {
  constructor(
    private readonly authenticationService: AuthenticationService
  ) {}

  @ApiOperation({ summary: "register a user" })
  @ApiResponse({ status: 201, description: 'The user has been successfully registered' })
  @ApiResponse({ status: 400, description: 'Invalid informations provided' })
  @Post('register')
  async register(@Body() registrationData: RegisterDto, @Req() request: Request): Promise<AuthenticationData> {
    const user = await this.authenticationService.register(registrationData);
    const {
      authentication,
      refresh,
      accessTokenCookie,
      refreshTokenCookie,
      accessTokenExpiration,
      refreshTokenExpiration
    } = this.authenticationService.generateTokensForUser(user)
    request.res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);
    // add refresh to database
    return {
      authentication,
      refresh,
      accessTokenExpiration,
      refreshTokenExpiration
    };
  }
 
  @HttpCode(200)
  @UseGuards(PasswordAuthenticationGuard)
  @ApiOperation({ summary: "return authentication data" })
  @ApiResponse({ status: 200, description: 'The user has been successfully logged' })
  @ApiResponse({ status: 400, description: 'Wrong credentials provided' })
  @Post('login')
  logIn(@Req() request: RequestWithUser): AuthenticationData {
    const { user } = request;
    const {
      authentication,
      refresh,
      accessTokenCookie,
      refreshTokenCookie,
      accessTokenExpiration,
      refreshTokenExpiration
    } = this.authenticationService.generateTokensForUser(user)
    request.res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);
    // add refresh to database
    return {
      authentication,
      refresh,
      accessTokenExpiration,
      refreshTokenExpiration
    };
  }

  @HttpCode(200)
  @UseGuards(JwtAuthenticationGuard)
  @ApiOperation({ summary: "Delete cookies and invalidate tokens" })
  @ApiBearerAuth('bearer-authentication')
  @ApiCookieAuth('cookie-authentication')
  @ApiResponse({ status: 200, description: 'The user has been successfully logged out' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post('logout')
  async logOut(@Req() request: RequestWithUser) {
    request.res.setHeader('Set-Cookie', this.authenticationService.getCookiesForLogOut());
    // delete refresh from database
  }
}