import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

interface SignUpParams {
  email: string;
  password: string;
  name: string;
  phone: string;
}
@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  signUp({ email }: SignUpParams) {
    const userExists = this.prismaService.user.findUnique({
      where: { email },
    });

    if (userExists) {
      throw new ConflictException();
    }
  }
}
