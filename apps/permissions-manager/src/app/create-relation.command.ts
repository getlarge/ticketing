import { Logger } from '@nestjs/common';
import { OryPermissionsService } from '@ticketing/microservices/ory-client';
import {
  type RelationTuple,
  parseRelationTuple,
} from '@ticketing/microservices/shared/relation-tuple-parser';
import { Command, CommandRunner, Option } from 'nest-commander';

interface CommandOptions {
  tuple?: RelationTuple;
}

@Command({ name: 'create', description: 'Create relationship on Ory Keto' })
export class CreateRelationCommand extends CommandRunner {
  readonly logger = new Logger(CreateRelationCommand.name);

  constructor(private readonly oryPermissionsService: OryPermissionsService) {
    super();
  }
  async run(passedParams: string[], options?: CommandOptions): Promise<void> {
    const { tuple } = options;
    this.logger.debug('Creating relation', passedParams);
    const isCreated = await this.oryPermissionsService.createRelation(tuple);
    if (!isCreated) {
      throw new Error('Failed to create relation');
    }
    this.logger.debug('Created relation', tuple);
  }

  @Option({
    flags: '-t, --tuple [string]',
    description: 'Relationship tuple to create, using Zanzibar notation',
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