import UsersService from "../users/users.service";
import RegisterDto from "./dto/register.dto";
import * as bcrypt from 'bcrypt';
import PostgresErrorCode from "../database/postgresErrorCodes.enum";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import WebToken from "./interface/webToken.interface";
import TokenPayload from "./interface/tokenPayload.interface";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import User from "../users/user.entity";

@Injectable()
export default class AuthenticationService {
	constructor(
	  private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
	) {}
   
	async register(registrationData: RegisterDto) {
	  const hashedPassword = await bcrypt.hash(registrationData.password, 10);
	  try {
      await this.usersService.create({
        ...registrationData,
        password: hashedPassword
      });
		  return;
	  } catch (error) {
      if (error?.code === PostgresErrorCode.UniqueViolation) {
        const regex = /Key \((.*)\)=/g;
        const key = regex.exec(error.detail)[1];
        throw new HttpException(`User with that ${key} already exists`, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException('Something went wrong', HttpStatus.INTERNAL_SERVER_ERROR);
	  }
	}

  private async verifyPassword(plainTextPassword: string, hashedPassword: string) {
    const isPasswordMatching = await bcrypt.compare(
      hashedPassword,
      plainTextPassword
    );
    if (!isPasswordMatching) {
      throw new HttpException('Wrong credentials provided', HttpStatus.BAD_REQUEST);
    }
  }

  async getAuthenticatedUser(email: string, hashedPassword: string) {
    try {
      const user = await this.usersService.getByEmail(email);
      await this.verifyPassword(user.password, hashedPassword);
      return user;
    } catch (error) {
      throw new HttpException('Wrong credentials provided', HttpStatus.BAD_REQUEST);
    }
  }

  private getAccessToken(userId: number): WebToken {
    const payload: TokenPayload = { userId };
    const expire_time = this.configService.get('JWT_EXPIRATION_TIME');
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: `${expire_time}s`
    });
    return { token, expire_time };
  }

  private getCookieForAccessToken(accessToken: WebToken) {
    const accessTokenExpiration = new Date();
    accessTokenExpiration.setSeconds(accessTokenExpiration.getSeconds() + accessToken.expire_time);
    const accessTokenCookie = `Authentication=${accessToken.token}; HttpOnly; Path=/; Expires=${accessTokenExpiration.toUTCString()}`;
    return { accessTokenCookie, accessTokenExpiration };
  }

  private getRefreshToken(userId: number): WebToken {
    const payload: TokenPayload = { userId };
    const expire_time = this.configService.get('JWT_REFRESH_EXPIRATION_TIME');
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: `${expire_time}s`
    });
    return { token, expire_time };
  }

  private getCookieForRefreshToken(refreshToken: WebToken) {
    const refreshTokenExpiration = new Date();
    refreshTokenExpiration.setSeconds(refreshTokenExpiration.getSeconds() + refreshToken.expire_time);
    const refreshTokenCookie = `Refresh=${refreshToken.token}; HttpOnly; Path=/; Expires=${refreshTokenExpiration.toUTCString()}`;
    return { refreshTokenCookie, refreshTokenExpiration };
  }

  generateTokensForUser(user: User) {
    const accessToken = this.getAccessToken(user.id);
    const { accessTokenCookie, accessTokenExpiration } = this.getCookieForAccessToken(accessToken);
    const refreshToken = this.getRefreshToken(user.id);
    const { refreshTokenCookie, refreshTokenExpiration } = this.getCookieForRefreshToken(refreshToken);
    return {
      authentication: accessToken.token,
      refresh: refreshToken.token,
      accessTokenCookie,
      refreshTokenCookie,
      accessTokenExpiration,
      refreshTokenExpiration
    };
  }

  async saveRefreshToken(refreshToken: string, id: number) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    const { hashedRefreshTokens } = await this.usersService.getById(id);
    hashedRefreshTokens.push(hashedRefreshToken);
    if (hashedRefreshTokens.length > 10) {
      hashedRefreshTokens.shift();
    }
    await this.usersService.updateRefreshTokens(id, hashedRefreshTokens);
  }

  async deleteRefreshToken(refreshToken: string, id: number) {
    const { hashedRefreshTokens } = await this.usersService.getById(id);
    const tokenIndex = hashedRefreshTokens.findIndex(async (hashedRefreshToken) => {
      await bcrypt.compare(
        hashedRefreshToken,
        refreshToken
      );
    });
    if (tokenIndex > -1) {
      hashedRefreshTokens.splice(tokenIndex);
    }
    await this.usersService.updateRefreshTokens(id, hashedRefreshTokens);
  }

  getCookiesForLogOut() {
    return [
      `Authentication=; HttpOnly; Path=/; Max-Age=0`,
      `Refresh=; HttpOnly; Path=/; Max-Age=0`
    ];
  }
}