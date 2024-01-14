import {
  OryRelationshipsModule,
  OryRelationshipsService,
} from '@getlarge/keto-client-wrapper';
import { RelationTuple } from '@getlarge/keto-relations-parser';
import { jest } from '@jest/globals';
import { MockOryPermissionService } from '@ticketing/microservices/shared/testing';
import { CommandTestFactory } from 'nest-commander-testing';

import { CreateRelationCommand } from './create-relation.command';

describe('CreateRelationCommand', () => {
  let service: CreateRelationCommand;

  beforeAll(async () => {
    const app = await CommandTestFactory.createTestingCommand({
      imports: [
        OryRelationshipsModule.forRootAsync({
          useFactory: () => ({
            basePath: 'http://localhost:4467',
            accessToken: '',
          }),
        }),
      ],
      providers: [CreateRelationCommand],
    })
      .overrideProvider(OryRelationshipsService)
      .useClass(MockOryPermissionService)
      .compile();

    service = app.get<CreateRelationCommand>(CreateRelationCommand);
  });

  describe('run', () => {
    it('should process tuple and create relationship', async () => {
      const expectedTuple: RelationTuple = {
        namespace: 'Group',
        object: 'admin',
        relation: 'members',
        subjectIdOrSet: {
          namespace: 'User',
          object: '1',
        },
      };
      service['oryPermissionsService'].createRelation = jest
        .fn(() => Promise.resolve(true))
        .mockResolvedValue(true);

      await expect(
        service.run(['--tuple', 'Group:admin#members@User:1'], {
          tuple: expectedTuple,
        }),
      ).resolves.toBeUndefined();
      expect(service['oryPermissionsService'].createRelation).toBeCalledWith(
        expectedTuple,
      );
    });
  });
});
