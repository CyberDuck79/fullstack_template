import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
 
@Injectable()
export default class oauth42AuthenticationGuard extends AuthGuard('42') {}