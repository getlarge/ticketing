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

@Command({ name: 'create', description: 'Create relationship on Ory Keto' })
export class CreateRelationCommand extends CommandRunner {
  readonly logger = new Logger(CreateRelationCommand.name);

  constructor(
    private readonly oryRelationshipsService: OryRelationshipsService,
  ) {
    super();
  }

  async run(passedParams: string[], options: CommandOptions): Promise<void> {
    const { tuple } = options;
    await this.oryRelationshipsService.createRelationship({
      createRelationshipBody: tuple,
    });
    this.logger.debug('Created relation');
    this.logger.log(tuple);
  }

  @Option({
    flags: '-t, --tuple [string]',
    description: 'Relationship tuple to create, using Zanzibar notation',
    required: true,
  })
  parseRelationTuple(val: string): RelationQuery {
    const res = parseRelationTuple(val);
    if (res.hasError()) {
      throw res.error;
    }
    return createRelationQuery(res.value).unwrapOrThrow();
  }
}
