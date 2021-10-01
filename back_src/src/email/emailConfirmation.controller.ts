import {
Controller,
Post,
Body,
UseGuards,
Req,
Get,
} from '@nestjs/common';
import ConfirmEmailDto from './dto/confirmEmail.dto';
import EmailConfirmationService from './emailConfirmation.service';
import JwtAuthenticationGuard from '../authentication/guard/jwt.guard';
import AuthenticatedRequest from '../authentication/interface/authenticatedRequest.interface';
import EmailConfirmationGuard from './guard/emailConfirmation.guard';
import { ApiBearerAuth, ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Email confirmation')
@Controller('email-confirmation')
export default class EmailConfirmationController {
	constructor(
	  private readonly emailConfirmationService: EmailConfirmationService
	) {}

  @ApiOperation({ summary: "Confirm a mail" })
  @ApiResponse({
    status: 201,
    description: 'Email confirmed'
  })
  @ApiResponse({
    status: 400,
    description: 'Email confirmation token expired'
  })
  @ApiResponse({
    status: 400,
    description: 'Bad confirmation token'
  })
  @ApiResponse({
    status: 400,
    description: 'Email already confirmed'
  })
	@Post('confirm')
	async confirm(@Body() confirmationData: ConfirmEmailDto) {
	  const email = await this.emailConfirmationService.decodeConfirmationToken(confirmationData.token);
	  await this.emailConfirmationService.confirmEmail(email);
	}

  @ApiOperation({ summary: "Resend confirmation email" })
  @ApiBearerAuth('bearer-authentication')
  @ApiCookieAuth('cookie-authentication')
  @ApiResponse({
    status: 201,
    description: 'Confirmation link send'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized'
  })
  @UseGuards(JwtAuthenticationGuard)
	@Post('resend-confirmation-link')
	async resendConfirmationLink(@Req() request: AuthenticatedRequest) {
		await this.emailConfirmationService.resendConfirmationLink(request.user.id);
	}

  @ApiOperation({ summary: "Test email confirmation feature" })
  @ApiBearerAuth('bearer-authentication')
  @ApiCookieAuth('cookie-authentication')
  @ApiResponse({
    status: 200,
    description: 'Email is confirmed'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized'
  })
  @ApiResponse({
    status: 401,
    description: 'Confirm your email first'
  })
  @UseGuards(EmailConfirmationGuard)
  @UseGuards(JwtAuthenticationGuard)
  @Get()
  async getCreditCards(@Req() request: AuthenticatedRequest) {
    return
  }
}