import { PartialType } from '@nestjs/swagger';
import { CreatePropertyFeatureDto } from './create-property-feature.dto';

export class UpdatePropertyFeatureDto extends PartialType(CreatePropertyFeatureDto) {}
