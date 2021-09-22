import { Module } from '@nestjs/common';
import AuthenticationService from './authentication.service';
import UsersModule from '../users/users.module';
import AuthenticationController from './authentication.controller';
import { PassportModule } from '@nestjs/passport';
import PasswordStrategy from './strategy/password.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import JwtStrategy from './strategy/jwt.strategy';

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
	],
  providers: [AuthenticationService, PasswordStrategy, JwtStrategy],
  controllers: [AuthenticationController]
})
export default class AuthenticationModule {}