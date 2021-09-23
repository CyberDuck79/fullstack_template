import { Request } from 'express';
import User from '../../users/user.entity';
 
export default interface AuthenticatedRequest extends Request {
  user: User;
}