import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { compare } from 'bcrypt';
import { Model } from 'mongoose';
import { USER_MODEL, UserDocument } from 'src/models/user';
import { ExceptionService } from 'src/shared/exception.service';
import compare_data from 'utils/data-encrypt/compare-data';
import hash_data from 'utils/data-encrypt/hash-data';
import { ACCOUNT_STATUS, RESPONSE_MESSAGE } from 'utils/enums';
import {
  ChangePasswordDto,
  CreateUserDto,
  ForgetPasswordDto,
  GetUserByEmailDto,
  GetUserByIdDto,
  LoginUserDto,
  UpdateUserDto,
  VerifyUserAccountDto,
} from './dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(USER_MODEL) private readonly userModel: Model<UserDocument>,
    private readonly exceptionService: ExceptionService,
    private readonly ConfigService: ConfigService,
  ) {}

  async findAll() {
    try {
      const findAllUsers = await this.userModel.find();

      return {
        statusCode: 200,
        message: 'Users get successfull',
        data: findAllUsers,
      };
    } catch (error) {
      console.log({ error, function_name: this.findAll.name });
      if (error?.message) {
        return new RpcException(error?.message);
      }
      return new RpcException(error);
    }
  }

  async findOne(getUserById: GetUserByIdDto) {
    try {
      const { id } = getUserById;

      const findUser = await this.userModel.findById(id);
      if (!findUser) {
        return new RpcException(RESPONSE_MESSAGE.USER_NOT_FOUND);
      }

      return {
        statusCode: 200,
        message: 'User get successfull',
        data: findUser,
      };
    } catch (error) {
      console.log({ error, function_name: this.findOne.name });
      if (error?.message) {
        return new RpcException(error?.message);
      }
      return new RpcException(error);
    }
  }

  async findByEmail(getUserByEmailDto: GetUserByEmailDto) {
    try {
      const { email } = getUserByEmailDto;

      const findUser = await this.userModel.findOne({ email });
      if (!findUser) {
        return new RpcException(RESPONSE_MESSAGE.USER_NOT_FOUND);
      }

      return {
        statusCode: 200,
        message: 'User get successfull',
        data: findUser,
      };
    } catch (error) {
      console.log({ error, function_name: this.findByEmail.name });
      if (error?.message) {
        return new RpcException(error?.message);
      }
      return new RpcException(error);
    }
  }
  // create new user
  async create(createUserDto: CreateUserDto) {
    try {
      const { name, email, password } = createUserDto;

      // check this email already exist or not
      const findUser = await this.userModel.findOne({ email });
      console.log({ findUser });
      if (findUser?._id) {
        return new RpcException({
          statusCode: 409,
          message: RESPONSE_MESSAGE.USER_ALREADY_EXIST,
        });
      }

      // make hash user password
      const hashedPassword = await hash_data(password);

      // save new user
      const user = await this.userModel.create({
        name,
        email,
        password: hashedPassword,
      });

      return {
        statusCode: 201,
        message: 'User created successfull',
        data: user,
      };
    } catch (error) {
      console.log({ error, function_name: this.create.name });
      if (error?.message) {
        return new RpcException(error?.message);
      }
      return new RpcException(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    try {
      const { email, password } = loginUserDto;

      const findUser = await this.userModel.findOne({ email }, '+password');

      if (!findUser?._id) {
        return new RpcException('Invalid email or password!');
      }

      // send response depend on account status
      if (findUser?.account_status === ACCOUNT_STATUS.BLOCKED) {
        return new RpcException('Your account has been blocked');
      }

      // match_user_password
      const matchPassword = await compare(password, findUser?.password);

      if (!matchPassword) {
        return new RpcException('Invalid email or password!');
      }

      return findUser;
    } catch (error) {
      console.log({ error, function_name: this.create.name });
      if (error?.message) {
        return new RpcException(error?.message);
      }
      return new RpcException(error);
    }
  }

  async updateUserAccount(verifyUserAccountDto: VerifyUserAccountDto) {
    try {
      const { email, account_status, email_verified } = verifyUserAccountDto;

      // check this email already exist or not
      const findUser = await this.userModel.findOne({ email });
      if (!findUser?._id) {
        return new RpcException({
          statusCode: 404,
          message: RESPONSE_MESSAGE.USER_NOT_FOUND,
        });
      }

      if (
        findUser?.account_status === ACCOUNT_STATUS.ACTIVE &&
        findUser?.email_verified === true
      ) {
        return new RpcException('This account alredy verified');
      }

      const updateUser = await this.userModel.findByIdAndUpdate(
        findUser?._id,
        {
          account_status,
          email_verified,
        },
        { new: true },
      );

      return {
        statusCode: 201,
        message: 'User account update successfull',
        data: updateUser,
      };
    } catch (error) {
      console.log({ error, function_name: this.updateUserAccount.name });
      if (error?.message) {
        return new RpcException(error?.message);
      }
      return new RpcException(error);
    }
  }

  async update(updateUserDto: UpdateUserDto) {
    try {
      const { user_id, ...info } = updateUserDto;

      const findUser = await this.userModel.findById(user_id);
      if (!findUser) {
        return this.exceptionService.sendNotFoundException(
          RESPONSE_MESSAGE.USER_NOT_FOUND,
        );
      }

      const updateUser = await this.userModel.findByIdAndUpdate(user_id, info, {
        new: true,
      });

      return {
        statusCode: 200,
        message: 'User get successfull',
        data: updateUser,
      };
    } catch (error) {
      console.log({ error, function_name: this.update.name });
      if (error?.message) {
        return new RpcException(error?.message);
      }
      return new RpcException(error);
    }
  }

  async changePassword(changePasswordDto: ChangePasswordDto) {
    try {
      const { email, old_password, new_password } = changePasswordDto;

      const findUser = await this.userModel.findOne({ email }, '+password');
      if (!findUser) {
        return this.exceptionService.sendNotFoundException(
          RESPONSE_MESSAGE.USER_NOT_FOUND,
        );
      }

      const password_matched = await compare_data(
        old_password,
        findUser.password,
      );

      if (!password_matched) {
        return this.exceptionService.sendUnauthorizedException(
          'Invalid email or password',
        );
      }

      const hashedPass = await hash_data(new_password);

      const updateUser = await this.userModel.findByIdAndUpdate(
        findUser?._id,
        {
          password: hashedPass,
        },
        { new: true },
      );

      return {
        statusCode: 200,
        message: 'Password change successfull',
        data: updateUser,
      };
    } catch (error) {
      console.log({ error, function_name: this.update.name });
      if (error?.message) {
        return new RpcException(error?.message);
      }
      return new RpcException(error);
    }
  }

  // change forgeted password
  async forgetPassword(forgetPasswordDto: ForgetPasswordDto) {
    try {
      const { email, password } = forgetPasswordDto;

      const findUser = await this.userModel.findOne({ email });
      if (!findUser) {
        return new RpcException(RESPONSE_MESSAGE.USER_NOT_FOUND);
      }

      const hashedPass = await hash_data(password);

      const updateUser = await this.userModel.findByIdAndUpdate(
        findUser?._id,
        {
          password: hashedPass,
        },
        { new: true },
      );

      return {
        statusCode: 200,
        message: 'Password change successfull',
        data: updateUser,
      };
    } catch (error) {
      console.log({ error, function_name: this.forgetPassword.name });
      if (error?.message) {
        return new RpcException(error?.message);
      }
      return new RpcException(error);
    }
  }

  async remove(getUserById: GetUserByIdDto) {
    try {
      const { id } = getUserById;

      const findUser = await this.userModel.findById(id);
      if (!findUser) {
        return new RpcException(RESPONSE_MESSAGE.USER_NOT_FOUND);
      }

      await this.userModel.findByIdAndDelete(id);

      return {
        statusCode: 200,
        message: 'User delete successfull',
      };
    } catch (error) {
      console.log({ error, function_name: this.remove.name });
      if (error?.message) {
        return new RpcException(error?.message);
      }
      return new RpcException(error);
    }
  }
}
