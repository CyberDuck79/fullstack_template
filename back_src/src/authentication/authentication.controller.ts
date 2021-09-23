import { Body, Req, Controller, HttpCode, Post, UseGuards, Get } from '@nestjs/common';
import AuthenticationService from './authentication.service';
import RegisterDto from './dto/register.dto';
import AuthenticatedRequest from './interface/authenticatedRequest.interface';
import PasswordAuthenticationGuard from './guard/password.guard';
import AuthenticationData from './interface/authenticationData.interface';
import { ApiBearerAuth, ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import JwtRefreshGuard from './guard/jwtRefresh.guard';

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
  async register(@Body() registrationData: RegisterDto) {
    await this.authenticationService.register(registrationData);
  }
 
  @HttpCode(200)
  @UseGuards(PasswordAuthenticationGuard)
  @ApiOperation({ summary: "return authentication data" })
  @ApiResponse({ status: 200, description: 'The user has been successfully logged' })
  @ApiResponse({ status: 400, description: 'Wrong credentials provided' })
  @Post('login')
  async logIn(@Req() request: AuthenticatedRequest): Promise<AuthenticationData> {
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

  @UseGuards(JwtRefreshGuard)
  @Get('refresh')
  @ApiOperation({summary: "Refresh the tokens"})
  @ApiBearerAuth('bearer-refresh')
  @ApiCookieAuth('cookie-refresh')
  @ApiResponse({ status: 200, description: 'The tokens has been successfully refreshed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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

  @HttpCode(200)
  @UseGuards(JwtRefreshGuard)
  @ApiOperation({ summary: "Delete cookies and invalidate tokens" })
  @ApiBearerAuth('bearer-authentication')
  @ApiCookieAuth('cookie-authentication')
  @ApiResponse({ status: 200, description: 'The user has been successfully logged out' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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