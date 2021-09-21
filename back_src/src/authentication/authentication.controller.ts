import { Body, Req, Controller, HttpCode, Post, UseGuards, Res } from '@nestjs/common';
import AuthenticationService from './authentication.service';
import RegisterDto from './dto/register.dto';
import RequestWithUser from './interface/requestWithUser.interface';
import PasswordAuthenticationGuard from './guard/password.guard';
import { Request, Response } from 'express';
import AuthenticationData from './interface/authenticationData.interface';
import JwtAuthenticationGuard from './guard/jwt.guard';
 
@Controller('authentication')
export default class AuthenticationController {
  constructor(
    private readonly authenticationService: AuthenticationService
  ) {}

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
      name: user.name,
      authentication,
      refresh,
      accessTokenExpiration,
      refreshTokenExpiration
    };
  }
 
  @HttpCode(200)
  @UseGuards(PasswordAuthenticationGuard)
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
      name: user.name,
      authentication,
      refresh,
      accessTokenExpiration,
      refreshTokenExpiration
    };
  }

  @HttpCode(200)
  @UseGuards(JwtAuthenticationGuard)
  @Post('logout')
  async logOut(@Req() request: RequestWithUser, @Res() response: Response) {
    response.setHeader('Set-Cookie', this.authenticationService.getCookiesForLogOut());
    // delete refresh from database
  }
}