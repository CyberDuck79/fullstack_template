import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import AuthenticationService from '../authentication.service';
import User from '../../users/user.entity';
 
@Injectable()
export default class PasswordStrategy extends PassportStrategy(Strategy, 'password') {
  constructor(private authenticationService: AuthenticationService) {
    super({
      usernameField: 'email'
    });
  }
  async validate(email: string, password: string): Promise<User> {
    return this.authenticationService.getAuthenticatedUser(email, password);
  }
}