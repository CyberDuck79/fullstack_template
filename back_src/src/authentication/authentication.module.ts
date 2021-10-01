import { Module } from '@nestjs/common';
import AuthenticationService from './authentication.service';
import UsersModule from '../users/users.module';
import AuthenticationController from './authentication.controller';
import { PassportModule } from '@nestjs/passport';
import PasswordStrategy from './strategy/password.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import JwtStrategy from './strategy/jwt.strategy';
import JwtRefreshTokenStrategy from './strategy/jwtRefresh.strategy';
import { HttpModule } from '@nestjs/axios';
import oauth42Strategy from './strategy/oauth42.strategy';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [
	  UsersModule,
	  PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: `${configService.get('JWT_EXPIRATION_TIME')}s`,
        },
      }),
    }),
    HttpModule,
    EmailModule
	],
  providers: [AuthenticationService, PasswordStrategy, JwtStrategy, JwtRefreshTokenStrategy, oauth42Strategy],
  controllers: [AuthenticationController]
})
export default class AuthenticationModule {}