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
import { CareersService } from './careers.service';
import { CreateCareerDto, createCareerSchema } from './dto/create-career.dto';
import { UpdateCareerDto } from './dto/update-career.dto';
import { NotFoundException } from 'src/exceptions/notfound.exception';
import { JoiValidationPipe } from 'src/validation/joi.validation';
import { ConflictException } from 'src/exceptions/conflict.exception';
import type { ICareersQuery } from './interface/query-filter.interface';
import {
  CreateCareerSwagger,
  DeleteCareerSwagger,
  FindAllCareersSwagger,
  FindOneCareerSwagger,
  UpdateCareerSwagger,
} from './docs/career.docs';
import { CareersInterceptor } from './interceptor/careers.interceptor';
import { CareerInterceptor } from './interceptor/career.interceptor';

@Controller('careers')
export class CareersController {
  constructor(private readonly careersService: CareersService) {}

  @Post()
  @CreateCareerSwagger()
  @UseInterceptors(CareerInterceptor)
  async create(
    @Body(new JoiValidationPipe(createCareerSchema))
    createCareerDto: CreateCareerDto,
  ) {
    const career = await this.careersService.findOne({
      title: createCareerDto.title,
      status: 'open',
    });

    if (career) throw new ConflictException('Job title already exists');

    return this.careersService.create(createCareerDto);
  }

  @Get()
  @FindAllCareersSwagger()
  @UseInterceptors(CareersInterceptor)
  findAll(@Query() query: ICareersQuery) {
    return this.careersService.find(query);
  }

  @Get(':id')
  @UseInterceptors(CareerInterceptor)
  @FindOneCareerSwagger()
  findOne(@Param('id') id: string) {
    return this.careersService.findById(id);
  }

  @Patch(':id')
  @UseInterceptors(CareerInterceptor)
  @UpdateCareerSwagger()
  async update(
    @Param('id') id: string,
    @Body() updateCareerDto: UpdateCareerDto,
  ) {
    const career = await this.careersService.findById(id);

    if (!career) throw new NotFoundException('Job does not exist');

    return this.careersService.update(career, updateCareerDto);
  }

  @Delete(':id')
  @DeleteCareerSwagger()
  remove(@Param('id') id: string) {
    return this.careersService.remove({ id });
  }
}
