import { Logger } from '@nestjs/common';
import { OryPermissionsService } from '@ticketing/microservices/ory-client';
import {
  type RelationTuple,
  parseRelationTuple,
} from '@ticketing/microservices/shared/relation-tuple-parser';
import { Command, CommandRunner, Option } from 'nest-commander';

interface CommandOptions {
  tuple: RelationTuple;
}

@Command({ name: 'check', description: 'Check permission on Ory Keto' })
export class CheckPermissionCommand extends CommandRunner {
  readonly logger = new Logger(CheckPermissionCommand.name);

  constructor(private readonly oryPermissionsService: OryPermissionsService) {
    super();
  }
  async run(passedParams: string[], options: CommandOptions): Promise<void> {
    const { tuple } = options;
    const isAllowed = await this.oryPermissionsService.checkPermission(tuple);
    this.logger.log(`Permission ${isAllowed ? 'granted' : 'denied'}`);
  }

  @Option({
    flags: '-t, --tuple [string]',
    description:
      'Relationship tuple to check permission from, using Zanzibar notation',
    required: true,
  })
  parseRelationTuple(val: string): RelationTuple {
    const res = parseRelationTuple(val);
    if (res.hasError()) {
      throw res.error;
    }
    return res.unwrapOrThrow();
  }
}
