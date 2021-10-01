import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from '@hapi/joi';
import { APP_FILTER } from '@nestjs/core';
import DatabaseModule from './database/database.module';
import UsersModule from './users/users.module';
import ExceptionsLoggerFilter from './utils/exceptionsLogger.filter';
import AuthenticationModule from './authentication/authentication.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION_TIME: Joi.string().required(),
        JWT_REFRESH_SECRET: Joi.string().required(),
        JWT_REFRESH_EXPIRATION_TIME: Joi.string().required(),
        OAUTH_42_URL: Joi.string().required(),
        OAUTH_42_CLIENT_ID: Joi.string().required(),
        OAUTH_42_CLIENT_SECRET: Joi.string().required(),
        OAUTH_42_CALLBACK_URL: Joi.string().required(),
        OAUTH_42_SCOPE: Joi.string().required(),
        OAUTH_42_ME_URL: Joi.string().required(),
        SMTP_HOST: Joi.string().required(),
        SMTP_PORT: Joi.string().required(),
        SMTP_USER: Joi.string().required(),
        SMTP_PASSWORD: Joi.string().required(),
        SMTP_SENDER: Joi.string().required(),
        JWT_VERIFICATION_SECRET: Joi.string().required(),
        JWT_VERIFICATION_EXPIRATION_TIME: Joi.string().required(),
        EMAIL_CONFIRMATION_URL: Joi.string().required(),
      })
    }),
    DatabaseModule,
    UsersModule,
    AuthenticationModule,
    EmailModule
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ExceptionsLoggerFilter,
    }
  ],
})
export class AppModule {}
