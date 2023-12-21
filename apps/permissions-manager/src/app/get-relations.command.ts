import { Logger } from '@nestjs/common';
import { Relationship } from '@ory/client';
import { OryPermissionsService } from '@ticketing/microservices/ory-client';
import { type RelationTuple } from '@ticketing/microservices/shared/relation-tuple-parser';
import { Command, CommandRunner, Option } from 'nest-commander';

interface CommandOptions {
  namespace: string;
  object?: string;
  relation?: string;
  subjectNamespace?: string;
  subjectObject?: string;
  subjectRelation?: string;
}

@Command({ name: 'get', description: 'Get relationships on Ory Keto' })
export class GetRelationsCommand extends CommandRunner {
  readonly logger = new Logger(GetRelationsCommand.name);

  constructor(private readonly oryPermissionsService: OryPermissionsService) {
    super();
  }

  async run(passedParams: string[], options: CommandOptions): Promise<void> {
    const {
      namespace,
      object,
      relation,
      subjectNamespace,
      subjectObject,
      subjectRelation,
    } = options;
    const tuple: Partial<RelationTuple> = {
      namespace,
      object,
      relation,
      ...(!!subjectNamespace || !!subjectObject || !!subjectRelation
        ? {
            subjectIdOrSet: {
              namespace: subjectNamespace,
              object: subjectObject,
              relation: subjectRelation,
            },
          }
        : {}),
    };
    const result: Relationship[] = [];
    for await (const { relationships } of this.fetchPaginatedRelationships(
      tuple,
    )) {
      result.push(...relationships);
    }
    this.logger.debug('Found relationships');
    this.logger.log(result);
  }

  private async *fetchPaginatedRelationships(
    tuple: Partial<RelationTuple>,
    options: { pageToken?: string; pageSize?: number } = { pageSize: 50 },
  ): AsyncIterable<{ relationships: Relationship[]; pageToken: string }> {
    const { relation_tuples, next_page_token } =
      await this.oryPermissionsService.getRelations(tuple);
    yield { relationships: relation_tuples, pageToken: next_page_token };

    if (next_page_token) {
      return this.fetchPaginatedRelationships(
        {
          ...tuple,
        },
        { pageToken: next_page_token, pageSize: options.pageSize },
      );
    }
  }

  @Option({
    flags: '-n, --namespace [string]',
    description: 'namespace of the relationship tuple to get relations from',
    required: true,
  })
  parseNamespace(val: string): string {
    return val;
  }

  @Option({
    flags: '-o, --object [string]',
    description: 'object of the relationship tuple to get relations from',
    required: false,
  })
  parseObject(val: string): string {
    return val;
  }

  @Option({
    flags: '-r, --relation [string]',
    description: 'relation of the relationship tuple to get relations from',
    required: false,
  })
  parseRelation(val: string): string {
    return val;
  }

  @Option({
    flags: '-sn, --subject-namespace [string]',
    description:
      'namespace of the subject of the relationship tuple to get relations from',
    required: false,
  })
  parseSubjectNamespace(val: string): string {
    return val;
  }

  @Option({
    flags: '-so, --subject-object [string]',
    description:
      'object of the subject of the relationship tuple to get relations from',
    required: false,
  })
  parseSubjectObject(val: string): string {
    return val;
  }

  @Option({
    flags: '-sr, --subject-relation [string]',
    description:
      'relation of the subject of the relationship tuple to get relations from',
    required: false,
  })
  parseSubjectRelation(val: string): string {
    return val;
  }
}
