import { OryPermissionsService } from '@getlarge/keto-client-wrapper';
import {
  createPermissionCheckQuery,
  parseRelationTuple,
} from '@getlarge/keto-relations-parser';
import { Logger } from '@nestjs/common';
import { PermissionApiCheckPermissionRequest } from '@ory/client';
import { Command, CommandRunner, Option } from 'nest-commander';

interface CommandOptions {
  tuple: PermissionApiCheckPermissionRequest;
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
  parseRelationTuple(val: string): PermissionApiCheckPermissionRequest {
    const res = parseRelationTuple(val);
    if (res.hasError()) {
      throw res.error;
    }
    return createPermissionCheckQuery(res.value).unwrapOrThrow();
  }
}
