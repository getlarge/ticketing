/* tslint:disable */
/* eslint-disable */
import { OryIdentityTraitDto } from './ory-identity-trait-dto';
export interface OryIdentityDto {
  created_at?: string;
  credentials?: {};
  id: string;
  metadata_admin?: {};
  metadata_public?: {};
  recovery_addresses?: {};
  schema_id: string;
  schema_url: string;
  state?: {};
  state_changed_at?: string;

  /**
   * The identity traits
   */
  traits: OryIdentityTraitDto;
  updated_at?: string;
  verifiable_addresses?: {};
}
