import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PropertyFeaturesService } from './property-features.service';
// import { CreatePropertyFeatureDto } from './dto/create-property-feature.dto';
// import { UpdatePropertyFeatureDto } from './dto/update-property-feature.dto';

@Controller('property-features')
export class PropertyFeaturesController {
  constructor(private readonly propertyFeaturesService: PropertyFeaturesService) {}

  // @Post()
  // create(@Body() createPropertyFeatureDto: CreatePropertyFeatureDto) {
  //   return this.propertyFeaturesService.create(createPropertyFeatureDto);
  // }

  // @Get()
  // findAll() {
  //   return this.propertyFeaturesService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.propertyFeaturesService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updatePropertyFeatureDto: UpdatePropertyFeatureDto) {
  //   return this.propertyFeaturesService.update(+id, updatePropertyFeatureDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.propertyFeaturesService.remove(+id);
  // }
}
