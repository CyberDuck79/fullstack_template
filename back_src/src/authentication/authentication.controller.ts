import { Body, Req, Controller, HttpCode, Post, UseGuards, Get } from '@nestjs/common';
import AuthenticationService from './authentication.service';
import RegisterDto from './dto/register.dto';
import AuthenticatedRequest from './interface/authenticatedRequest.interface';
import PasswordAuthenticationGuard from './guard/password.guard';
import AuthenticationData from './interface/authenticationData.interface';
import { ApiBearerAuth, ApiCookieAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import JwtRefreshGuard from './guard/jwtRefresh.guard';
import oauth42AuthenticationGuard from './guard/oauth42.guard';
import EmailConfirmationService from '../email/emailConfirmation.service';
import CredentialsDto from './dto/credentials.dto';

@ApiTags('authentication')
@Controller('authentication')
export default class AuthenticationController {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly emailConfirmationService: EmailConfirmationService
  ) {}

  @ApiOperation({ summary: "Register a user" })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully registered'
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid informations provided'
  })
  @Post('register')
  async register(@Body() registrationData: RegisterDto) {
    await this.authenticationService.register(registrationData);
    await this.emailConfirmationService.sendVerificationLink(registrationData.email, registrationData.name);
  }

  @ApiOperation({ summary: "Create and authenticate user with 42 oauth code" })
  @ApiQuery({name: 'code', type: String, description: '42 oauth code'})
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully authenticated.',
    type: AuthenticationData
  })
  @ApiResponse({ status: 401, description: '42 Oauth token invalid.'})
  @UseGuards(oauth42AuthenticationGuard)
  @Get('oauth')
  async oauth(@Req() request: AuthenticatedRequest): Promise<AuthenticationData> {
    const { user, res } = request;
    const {
      authentication,
      refresh,
      accessTokenCookie,
      refreshTokenCookie,
      accessTokenExpiration,
      refreshTokenExpiration
    } = this.authenticationService.generateTokensForUser(user)
    res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);
    await this.authenticationService.saveRefreshToken(refresh, user.id);
    return {
      authentication,
      refresh,
      accessTokenExpiration,
      refreshTokenExpiration
    };
  }
  
  @ApiOperation({ summary: "Return authentication data" })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully logged',
    type: AuthenticationData
  })
  @ApiResponse({
    status: 400,
    description: 'Wrong credentials provided'
  })
  @HttpCode(200)
  @UseGuards(PasswordAuthenticationGuard)
  @Post('login')
  async logIn(@Body() _: CredentialsDto, @Req() request: AuthenticatedRequest): Promise<AuthenticationData> {
    const { user, res } = request;
    const {
      authentication,
      refresh,
      accessTokenCookie,
      refreshTokenCookie,
      accessTokenExpiration,
      refreshTokenExpiration
    } = this.authenticationService.generateTokensForUser(user)
    res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);
    await this.authenticationService.saveRefreshToken(refresh, user.id);
    return {
      authentication,
      refresh,
      accessTokenExpiration,
      refreshTokenExpiration
    };
  }

  @ApiOperation({summary: "Refresh the tokens"})
  @ApiBearerAuth('bearer-refresh')
  @ApiCookieAuth('cookie-refresh')
  @ApiResponse({
    status: 200,
    description: 'The tokens has been successfully refreshed',
    type: AuthenticationData
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized'
  })
  @UseGuards(JwtRefreshGuard)
  @Get('refresh')
  async refresh(@Req() request: AuthenticatedRequest): Promise<AuthenticationData> {
    const { user, cookies, headers, res } = request;
    let refreshToken = cookies?.Refresh;
    if (!refreshToken) {
      refreshToken = headers?.authorization?.split(' ')[1] as string
    }
    await this.authenticationService.deleteRefreshToken(refreshToken, user.id);
    const {
      authentication,
      refresh,
      accessTokenCookie,
      refreshTokenCookie,
      accessTokenExpiration,
      refreshTokenExpiration
    } = this.authenticationService.generateTokensForUser(user)
    res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);
    await this.authenticationService.saveRefreshToken(refresh, user.id);
    return {
      authentication,
      refresh,
      accessTokenExpiration,
      refreshTokenExpiration
    };
  }

  @ApiOperation({ summary: "Delete cookies and invalidate tokens" })
  @ApiBearerAuth('bearer-authentication')
  @ApiCookieAuth('cookie-authentication')
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully logged out'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized'
  })
  @HttpCode(200)
  @UseGuards(JwtRefreshGuard)
  @Post('logout')
  async logOut(@Req() request: AuthenticatedRequest) {
    const { user, cookies, headers, res } = request;
    let refreshToken = cookies?.Refresh;
    if (!refreshToken) {
      refreshToken = headers?.authorization?.split(' ')[1] as string
    }
    await this.authenticationService.deleteRefreshToken(refreshToken, user.id);
    res.setHeader('Set-Cookie', this.authenticationService.getCookiesForLogOut());
  }
}