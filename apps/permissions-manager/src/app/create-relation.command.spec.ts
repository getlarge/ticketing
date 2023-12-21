import { jest } from '@jest/globals';
import {
  OryPermissionsModule,
  OryPermissionsService,
} from '@ticketing/microservices/ory-client';
import { RelationTuple } from '@ticketing/microservices/shared/relation-tuple-parser';
import { MockOryPermissionService } from '@ticketing/microservices/shared/testing';
import { CommandTestFactory } from 'nest-commander-testing';

import { CreateRelationCommand } from './create-relation.command';

describe('CreateRelationCommand', () => {
  let service: CreateRelationCommand;

  beforeAll(async () => {
    const app = await CommandTestFactory.createTestingCommand({
      imports: [
        OryPermissionsModule.forRootAsync({
          useFactory: () => ({
            ketoPublicApiPath: 'http://localhost:4466',
            ketoAdminApiPath: 'http://localhost:4467',
            ketoAccessToken: '',
          }),
        }),
      ],
      providers: [CreateRelationCommand],
    })
      .overrideProvider(OryPermissionsService)
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
