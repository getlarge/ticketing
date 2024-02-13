'created_at';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Identity, IdentityState } from '@ory/client';
import { Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNotEmptyObject,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class OryIdentityTraitDto {
  @Expose()
  @IsString()
  @ApiProperty()
  email: string;
}

/* eslint-disable @typescript-eslint/naming-convention */
export class OryIdentityDto implements Identity {
  @Expose()
  @IsUUID()
  @ApiProperty()
  id: string;

  @Expose()
  @IsString()
  @ApiProperty()
  schema_id: string;

  @Expose()
  @IsString()
  @ApiProperty()
  schema_url: string;

  @Expose()
  @IsNotEmptyObject()
  @Type(() => OryIdentityTraitDto)
  @ValidateNested()
  @ApiProperty({
    description: 'The identity traits',
    type: OryIdentityTraitDto,
  })
  traits: OryIdentityTraitDto;

  @Expose()
  @IsOptional()
  @IsString()
  @IsIn(['active', 'inactive'])
  @ApiPropertyOptional()
  state?: IdentityState;

  @Expose()
  @IsArray()
  @IsObject({ each: true })
  @IsOptional()
  @ApiPropertyOptional()
  recovery_addresses?: Identity['recovery_addresses'];

  @Expose()
  @IsArray()
  @IsObject({ each: true })
  @IsOptional()
  @ApiPropertyOptional()
  verifiable_addresses?: Identity['verifiable_addresses'];

  @Expose()
  @IsArray()
  @IsObject({ each: true })
  @IsOptional()
  @ApiPropertyOptional()
  credentials?: Identity['credentials'];

  @Expose()
  @IsObject()
  @IsOptional()
  @ApiPropertyOptional()
  metadata_public?: Identity['metadata_public'];

  @Expose()
  @IsObject()
  @IsOptional()
  @ApiPropertyOptional()
  metadata_admin?: Identity['metadata_admin'];

  @Expose()
  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  created_at?: string;

  @Expose()
  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  updated_at?: string;

  @Expose()
  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  state_changed_at?: string;
}

/* eslint-enable @typescript-eslint/naming-convention */

export class OnOrySignUpDto {
  @Type(() => OryIdentityDto)
  @ValidateNested()
  @ApiProperty({
    description: 'The identity created by Ory',
    type: OryIdentityDto,
  })
  identity: OryIdentityDto;
}

export class OnOrySignInDto {
  @Type(() => OryIdentityDto)
  @ValidateNested()
  @ApiProperty({
    description: 'The identity logged in Ory',
    type: OryIdentityDto,
  })
  identity: OryIdentityDto;
}
