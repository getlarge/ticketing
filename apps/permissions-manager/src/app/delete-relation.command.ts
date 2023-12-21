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

@Command({ name: 'delete', description: 'Delete relationship on Ory Keto' })
export class DeleteRelationCommand extends CommandRunner {
  readonly logger = new Logger(DeleteRelationCommand.name);

  constructor(private readonly oryPermissionsService: OryPermissionsService) {
    super();
  }
  async run(passedParams: string[], options?: CommandOptions): Promise<void> {
    const { tuple } = options;
    const isDeleted = await this.oryPermissionsService.deleteRelation(tuple);
    if (!isDeleted) {
      throw new Error('Failed to delete relation');
    }
    this.logger.debug('Deleted relation', tuple);
  }

  @Option({
    flags: '-t, --tuple [string]',
    description: 'Relationship tuple to delete, using Zanzibar notation',
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
