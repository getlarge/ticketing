import { OryRelationshipsService } from '@getlarge/keto-client-wrapper';
import {
  createRelationQuery,
  parseRelationTuple,
} from '@getlarge/keto-relations-parser';
import { Logger } from '@nestjs/common';
import { RelationQuery } from '@ory/client';
import { Command, CommandRunner, Option } from 'nest-commander';

interface CommandOptions {
  tuple: RelationQuery;
}

@Command({ name: 'delete', description: 'Delete relationship on Ory Keto' })
export class DeleteRelationCommand extends CommandRunner {
  readonly logger = new Logger(DeleteRelationCommand.name);

  constructor(
    private readonly oryRelationshipsService: OryRelationshipsService,
  ) {
    super();
  }

  async run(passedParams: string[], options: CommandOptions): Promise<void> {
    const { tuple } = options;
    await this.oryRelationshipsService.deleteRelationships(tuple);
    this.logger.debug('Deleted relation');
    this.logger.log(tuple);
  }

  @Option({
    flags: '-t, --tuple [string]',
    description: 'Relationship tuple to delete, using Zanzibar notation',
    required: true,
  })
  parseRelationTuple(val: string): RelationQuery {
    const res = parseRelationTuple(val);
    if (res.hasError()) {
      throw res.error;
    }
    const relationQuery = createRelationQuery(res.value);
    return relationQuery.unwrapOrThrow();
  }
}
