import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-oauth2';
import UsersService from 'src/users/users.service';

@Injectable()
export default class oauth42Strategy extends PassportStrategy(Strategy, '42')
{
	constructor(
		private readonly configService: ConfigService,
		private usersService: UsersService,
		private http: HttpService
	) {
		super({
			authorizationURL: `${configService.get('OAUTH_42_URL')}authorize?client_id=${configService.get('OAUTH_42_CLIENT_ID')}&redirect_uri=${configService.get('OAUTH_42_CALLBACK_URL')}&response_type=code`,
			tokenURL        : `${configService.get('OAUTH_42_URL')}token`,
			clientID        : configService.get('OAUTH_42_CLIENT_ID'),
			clientSecret    : configService.get('OAUTH_42_CLIENT_SECRET'),
			callbackURL     : configService.get('OAUTH_42_CALLBACK_URL'),
			scope           : configService.get('OAUTH_42_SCOPE'),
		});
	}

	async validate(accessToken: string): Promise<any> {
		const { data } = await this.http.get(this.configService.get('OAUTH_42_ME_URL'), {
			headers: { Authorization: `Bearer ${ accessToken }` },
		})
		.toPromise();
		const user = await this.usersService.getBy42Id(data.id);
		if (user) {
			return user;
		}
		return this.usersService.create({
			id42: data.id,
			email: data.email,
			name: data.login
		});
	}
}