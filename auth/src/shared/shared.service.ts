import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { RESPONSE_MESSAGE } from 'utils/enums';
import { ObjectType } from 'utils/types';

import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { RpcException } from '@nestjs/microservices';

export interface JWTPayload {
  id: string;
  name: string;
  email: string;
  image: string;
}

@Injectable()
export class SharedService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly ConfigService: ConfigService,
  ) {}

  // minute to converte millisecond
  minuteToMillisecond(minute: number = 1): number {
    return 1000 * 60 * minute;
  }

  // Genared JWT Access Token
  async signAccessToken(payload: ObjectType): Promise<string> {
    try {
      const token = jwt.sign(
        payload,
        this.ConfigService.get('access_token_secret'),
        {
          expiresIn: this.ConfigService.get('access_token_expiresIn'),
          issuer: this.ConfigService.get('token_issuer'),
        },
      );

      return token;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  // verify access token
  accessTokenVerify(token: string): boolean {
    try {
      const verify = jwt.verify(
        token,
        this.ConfigService.get('access_token_secret'),
      );
      return verify ? true : false;
    } catch (error) {
      if (error?.name === 'TokenExpiredError') {
        throw new RpcException(RESPONSE_MESSAGE.JWT_TOKEN_EXPIRED);
      }

      throw new RpcException(RESPONSE_MESSAGE.INVALID_JWT_TOKEN);
    }
  }

  // Genared JWT Access Token
  async signRefreshToken(
    user_id: string,
    payload: ObjectType,
  ): Promise<string> {
    try {
      const token = jwt.sign(
        payload,
        this.ConfigService.get('refresh_token_secret'),
        {
          expiresIn: this.ConfigService.get('refresh_token_expiresIn'),
          issuer: this.ConfigService.get('token_issuer'),
        },
      );

      const hoursToMinute = 60 * 24; // 24 hours converted to minutes
      const ttl = this.minuteToMillisecond(hoursToMinute);
      await this.cacheManager.set(user_id, token, ttl);

      return token;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  // verify access token
  async decodeRefreshToken(token: string): Promise<any> {
    try {
      const decoded = jwt.decode(
        token,
        this.ConfigService.get('refresh_token_secret'),
      );

      return decoded;
    } catch (error) {
      if (error?.name === 'TokenExpiredError') {
        throw new RpcException(RESPONSE_MESSAGE.JWT_TOKEN_EXPIRED);
      }

      throw new RpcException(RESPONSE_MESSAGE.INVALID_JWT_TOKEN);
    }
  }
  // verify access token
  async refreshTokenVerify(user_id: string, token: string): Promise<boolean> {
    try {
      const findToken = await this.cacheManager.get(user_id);

      if (!findToken) {
        return false;
      }

      const match_token = findToken === token;
      if (!match_token) {
        return false;
      }

      const verify = jwt.verify(
        token,
        this.ConfigService.get('refresh_token_secret'),
      );
      return verify ? true : false;
    } catch (error) {
      if (error?.name === 'TokenExpiredError') {
        throw new RpcException(RESPONSE_MESSAGE.JWT_TOKEN_EXPIRED);
      }

      throw new RpcException(RESPONSE_MESSAGE.INVALID_JWT_TOKEN);
    }
  }

  // get refresh token
  async getRefreshToken(user_id: string): Promise<any> {
    try {
      const token = await this.cacheManager.get(user_id);
      return token;
    } catch (error) {
      return null;
    }
  }

  // delete refresh token
  async deleteRefreshToken(userId: string): Promise<boolean> {
    try {
      await this.cacheManager.del(userId);
      return true;
    } catch (error) {
      return false;
    }
  }

  // generate OTP and cache data
  async generateOTP(email: string): Promise<number> {
    try {
      const min = 100000;
      const max = 999999;

      const OTPCode = Math.floor(Math.random() * (max - min + 1)) + min;

      const ttl = this.minuteToMillisecond(5);
      await this.cacheManager.set(email, OTPCode, ttl);

      return OTPCode;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  // generate OTP and cache data
  async verifyOTPCode(email: string, otp_code: number): Promise<boolean> {
    try {
      const getOTPCode = await this.cacheManager.get(email);
      if (!getOTPCode) return false;

      const match_OTP_code = getOTPCode === otp_code;
      if (match_OTP_code) {
        await this.deleteOTPCode(email);
        return true;
      }

      return false;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  // get OTP Code
  async getOTPCode(email: string): Promise<any> {
    try {
      const otp = await this.cacheManager.get(email);
      return otp;
    } catch (error) {
      return null;
    }
  }

  // delete OTP Code
  async deleteOTPCode(email: string): Promise<boolean> {
    try {
      await this.cacheManager.del(email);
      return true;
    } catch (error) {
      return false;
    }
  }
}
