import { Body, Controller } from '@nestjs/common';

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

import { EventPattern } from '@nestjs/microservices';
import { UsersService } from './users.service';

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @EventPattern('get_all_user')
  async findAll() {
    return await this.usersService.findAll();
  }

  @EventPattern('get_user_by_email')
  async findOneByEmail(@Body() getUserByEmailDto: GetUserByEmailDto) {
    return await this.usersService.findByEmail(getUserByEmailDto);
  }

  @EventPattern('get_user_id')
  async findOne(@Body() getUserById: GetUserByIdDto) {
    return await this.usersService.findOne(getUserById);
  }

  // @Post('create')
  @EventPattern('create_user')
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @EventPattern('login_user')
  async loginUser(@Body() loginUserDto: LoginUserDto) {
    return await this.usersService.login(loginUserDto);
  }

  @EventPattern('update_user_account')
  async updateUserAccout(@Body() verifyUserAccountDto: VerifyUserAccountDto) {
    return await this.usersService.updateUserAccount(verifyUserAccountDto);
  }

  @EventPattern('update_user_info')
  async update(@Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(updateUserDto);
  }

  @EventPattern('change_password')
  async changePassword(@Body() changePasswordDto: ChangePasswordDto) {
    return await this.usersService.changePassword(changePasswordDto);
  }

  @EventPattern('change_forgeted_password')
  async changeForgetedPassword(@Body() forgetPasswordDto: ForgetPasswordDto) {
    return await this.usersService.forgetPassword(forgetPasswordDto);
  }

  @EventPattern('delete_user_by_id')
  async remove(@Body() getUserById: GetUserByIdDto) {
    return await this.usersService.remove(getUserById);
  }
}
