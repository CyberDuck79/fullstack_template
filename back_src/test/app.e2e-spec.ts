import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from '@hapi/joi';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, Reflector } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import UsersModule from '../src/users/users.module';
import AuthenticationModule from '../src/authentication/authentication.module';
import ExceptionsLoggerFilter from '../src/utils/exceptionsLogger.filter';
import * as request from 'supertest';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          validationSchema: Joi.object({
            POSTGRES_HOST: Joi.string().required(),
            POSTGRES_PORT: Joi.number().required(),
            POSTGRES_USER: Joi.string().required(),
            POSTGRES_PASSWORD: Joi.string().required(),
            POSTGRES_TEST_DB: Joi.string().required(),
            JWT_SECRET: Joi.string().required(),
            JWT_EXPIRATION_TIME: Joi.string().required(),
            JWT_REFRESH_SECRET: Joi.string().required(),
            JWT_REFRESH_EXPIRATION_TIME: Joi.string().required(),
          })
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            type: 'postgres',
            host: configService.get('POSTGRES_HOST'),
            port: configService.get('POSTGRES_PORT'),
            username: configService.get('POSTGRES_USER'),
            password: configService.get('POSTGRES_PASSWORD'),
            database: configService.get('POSTGRES_TEST_DB'),
            entities: [__dirname + '/../**/*.entity{.ts,.js}'],
            synchronize: true,
            dropSchema: true
          })
        }),
        UsersModule,
        AuthenticationModule,
      ],
      //providers: [{ provide: APP_FILTER, useClass: ExceptionsLoggerFilter }],
    }).compile();
    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true
      }),
    );
    app.useGlobalInterceptors(new ClassSerializerInterceptor(
      app.get(Reflector))
    );
    app.use(cookieParser());

    await app.listen(9090);
  });

  afterAll(async () => {
    await app.close();
  });

  const user1 = {
    name: 'cyberduck',
    email: 'flavien.henrion@cyberduck.blog',
    password: 'qwertyuop'
  }
  let user1Cookies: Array<string>;
  let user1Bearers: Array<string>;

  const cookies_regex = /Authentication=.*; HttpOnly; Path=\/; Expires=.*,Refresh=.*; HttpOnly; Path=\/; Expires=.*/;

  describe('/authentication', () => {
    describe('/Registration', () => {
      it('user1 => should returned 201', () => {
        return request(app.getHttpServer())
          .post('/authentication/register')
          .send(user1)
          .expect(201);
      });
      it('duplicate username => should returned 400', () => {
        return request(app.getHttpServer())
          .post('/authentication/register')
          .send({
            ...user1,
            email: 'flavien.henrion@protonmail.com'
          })
          .expect({
            statusCode: 400,
            message: "User with that email already exists"
          })
          .expect(400);
      });
      it('duplicate email => should returned 400', () => {
        return request(app.getHttpServer())
          .post('/authentication/register')
          .send({
            ...user1,
            name: 'flavien'
          })
          .expect({
            statusCode: 400,
            message: "User with that email already exists"
          })
          .expect(400);
      });
      it('password too short => should returned 400', () => {
        return request(app.getHttpServer())
          .post('/authentication/register')
          .send({
            ...user1,
            password: 'test'
          })
          .expect({
            statusCode: 400,
            message: [ 'password must be longer than or equal to 7 characters' ],
            error: 'Bad Request'
          })
          .expect(400);
      });
      it('invalid email => should returned 400', () => {
        return request(app.getHttpServer())
          .post('/authentication/register')
          .send({
            ...user1,
            email: 'flavien'
          })
          .expect({
            statusCode: 400,
            message: [ 'email must be an email' ],
            error: 'Bad Request'
          })
          .expect(400);
      });
    });

    describe('/login', () => {
      it('correct credentials => should return authentication data', async () => {
        const res = await request(app.getHttpServer())
          .post('/authentication/login')
          .send({
            email: user1.email,
            password: user1.password
          })
          .expect((res) => {
            expect(res.body).toEqual({
              authentication: expect.any(String),
              refresh: expect.any(String),
              accessTokenExpiration: expect.any(String),
              refreshTokenExpiration: expect.any(String)
            });
            expect(res.body.authentication).toHaveLength(143);
            expect(res.body.refresh).toHaveLength(143);
            expect(res.body.accessTokenExpiration).toHaveLength(24);
            expect(res.body.refreshTokenExpiration).toHaveLength(24);
          })
          .expect(200)
          .expect('set-cookie', cookies_regex);
        user1Cookies = res.headers['set-cookie'];
        user1Bearers = [res.body.authentication, res.body.refresh];
      });
      it('wrong credentials => should return 400', () => {
        return request(app.getHttpServer())
          .post('/authentication/login')
          .send({
            email: user1.email,
            password: 'ajskhkhadksjhdkjahsk'
          })
          .expect({
            statusCode: 400,
            message: "Wrong credentials provided"
          })
          .expect(400);
      });
    });

    describe('/logout', () => {
      const empty_cookies = 'Authentication=; HttpOnly; Path=/; Max-Age=0,Refresh=; HttpOnly; Path=/; Max-Age=0';
      it('should return empty cookies', async () => {
        const res = await request(app.getHttpServer())
          .post('/authentication/logout')
          .set('cookie', user1Cookies[0])
          .expect(200)
          .expect('set-cookie', empty_cookies);
        user1Cookies = res.headers['set-cookie'];
      });
    });
  });

  describe('/users', () => {
    it('login for tests', async () => {
      const res = await request(app.getHttpServer())
        .post('/authentication/login')
        .send({
          email: user1.email,
          password: user1.password
        })
        .expect(200)
        .expect('set-cookie', cookies_regex);
      user1Cookies = res.headers['set-cookie'];
      user1Bearers = [res.body.authentication, res.body.refresh];
    });
    describe('/me', () => {
      it('without cookie => should return 401', () => {
        return request(app.getHttpServer())
          .get('/users/me')
          .expect({
            statusCode: 401,
            message: "Unauthorized"
          })
          .expect(401);
      });
      it('GET => should return the user', () => {
        return request(app.getHttpServer())
          .get('/users/me')
          .set('cookie', user1Cookies[0])
          .expect((res) => {
            expect(res.body).toEqual({
              id: expect.any(Number),
              id42: null,
              name: user1.name,
              email: user1.email,
            });
          })
          .expect(200);
      });
      it('PUT => should return the updated user', () => {
        return request(app.getHttpServer())
          .put('/users/me')
          .send({
            name: 'flavien'
          })
          .set('cookie', user1Cookies[0])
          .expect((res) => {
            expect(res.body).toEqual({
              id: expect.any(Number),
              id42: null,
              name: 'flavien',
              email: user1.email,
            });
          })
          .expect(200);
      });
    });
  });

});
