import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import AuthenticatedRequest from '../../authentication/interface/authenticatedRequest.interface';
 
@Injectable()
export default class EmailConfirmationGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ) {
    const request: AuthenticatedRequest = context.switchToHttp().getRequest();
 
    if (!request.user?.isEmailConfirmed) {
      throw new UnauthorizedException('Confirm your email first');
    }
 
    return true;
  }
}