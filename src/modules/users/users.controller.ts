import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, createUserSchema } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JoiValidationPipe } from 'src/validation/joi.validation';
import { ConflictException } from 'src/exceptions/conflict.exception';
import { NotFoundException } from 'src/exceptions/notfound.exception';
import type { IUsersQuery } from './interface/query-filter';
import { UsersInterceptor } from './interceptor/users.interceptor';
import { UserInterceptor } from './interceptor/user.interceptor';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseInterceptors(UserInterceptor)
  async create(
    @Body(new JoiValidationPipe(createUserSchema)) createUserDto: CreateUserDto,
  ) {
    const userExist = await this.usersService.findOne({
      email: createUserDto.email,
    });

    if (userExist) throw new ConflictException('User exist');

    const user = await this.usersService.create(createUserDto);

    return user;
  }

  @Get()
  @UseInterceptors(UsersInterceptor)
  findAll(@Query() query: IUsersQuery) {
    return this.usersService.find(query);
  }

  @Get(':id')
  @UseInterceptors(UserInterceptor)
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  @UseInterceptors(UserInterceptor)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.usersService.findById(id);

    if (!user) throw new NotFoundException('User not found');

    return this.usersService.update(user, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove({ id });
  }
}
