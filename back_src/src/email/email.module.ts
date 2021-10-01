import { Module } from '@nestjs/common';
import EmailService from './email.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import EmailConfirmationService from './emailConfirmation.service';
import UsersModule from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import EmailConfirmationController from './emailConfirmation.controller';
 
@Module({
  imports: [
	  ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_VERIFICATION_SECRET'),
        signOptions: {
          expiresIn: `${configService.get('JWT_VERIFICATION_EXPIRATION_TIME')}s`,
        },
      }),
    }),
    UsersModule
  ],
  controllers: [EmailConfirmationController],
  providers: [EmailService, EmailConfirmationService],
  exports: [EmailService, EmailConfirmationService]
})
export class EmailModule {}