import {
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GenerateProductKeyDto, SignInDto, SignUpDto } from './dtos/auth.dto';
import { UserType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { User, UserInfo } from '../decorators/user.decorators';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup/:userType')
  async signUp(
    @Body() body: SignUpDto,
    @Param('userType', new ParseEnumPipe(UserType)) userType: UserType,
  ) {
    if (userType !== UserType.BUYER) {
      if (!body.productKey) {
        throw new UnauthorizedException();
      }

      const validProductKey = `${body.email}-${userType}-${process.env.PRODUCT_KEY_SECRET}`;

      const isValidProduct = await bcrypt.compare(
        validProductKey,
        body.productKey,
      );

      if (!isValidProduct) {
        throw new UnauthorizedException();
      }
    }

    return this.authService.signUp(body, userType);
  }

  @Post('/signin')
  signIn(@Body() body: SignInDto) {
    return this.authService.signIn(body);
  }

  @Post('/key')
  generateProductKey(@Body() { email, userType }: GenerateProductKeyDto) {
    return this.authService.generateProductKey(email, userType);
  }

  @Get('/me')
  me(@User() user: UserInfo) {
    return user;
  }
}
