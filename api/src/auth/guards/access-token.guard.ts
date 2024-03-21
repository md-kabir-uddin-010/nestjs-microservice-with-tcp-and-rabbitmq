import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClientProxy } from '@nestjs/microservices';
import { Request } from 'express';
import { lastValueFrom, timeout } from 'rxjs';
import { RESPONSE_MESSAGE } from '../../utils/enums';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject('AUTH_SERVICE_TCP') private readonly AUTH_SERVICE_TCP: ClientProxy,
    @Inject('AUTH_SERVICE_RMQ') private readonly AUTH_SERVICE_RMQ: ClientProxy,
  ) {}

  async canActivate(context: ExecutionContext): Promise<any> {
    try {
      const request = context.switchToHttp().getRequest();

      const token = this.extractTokenFromBody(request);

      if (!token) {
        return new BadRequestException(
          RESPONSE_MESSAGE.JWT_BEARER_TOKEN_REQUIRED,
        );
      }

      const isVerified = await lastValueFrom(
        this.AUTH_SERVICE_TCP.send('verify_access_token', {
          access_token: token,
        }).pipe(timeout(5000)),
      );

      if (isVerified?.error) {
        throw new BadRequestException(isVerified?.error);
      }

      return isVerified?.authenticated;
    } catch (error) {
      throw error;
    }
  }

  private extractTokenFromBody(request: Request): string {
    const [type, token] = request?.headers?.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
