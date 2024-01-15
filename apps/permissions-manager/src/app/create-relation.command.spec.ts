import {
  OryRelationshipsModule,
  OryRelationshipsService,
} from '@getlarge/keto-client-wrapper';
import {
  createRelationQuery,
  RelationTuple,
} from '@getlarge/keto-relations-parser';
import { jest } from '@jest/globals';
import { MockOryRelationshipsService } from '@ticketing/microservices/shared/testing';
import { CommandTestFactory } from 'nest-commander-testing';

import { CreateRelationCommand } from './create-relation.command';

describe('CreateRelationCommand', () => {
  let service: CreateRelationCommand;
  const mockOryRelationshipsService = new MockOryRelationshipsService();

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
      .useValue(mockOryRelationshipsService)
      .compile();

    service = app.get<CreateRelationCommand>(CreateRelationCommand);
  });

  describe('run', () => {
    it('should process tuple and create relationship', async () => {
      const tuple: RelationTuple = {
        namespace: 'Group',
        object: 'admin',
        relation: 'members',
        subjectIdOrSet: {
          namespace: 'User',
          object: '1',
        },
      };
      const expectedQuery = createRelationQuery(tuple).unwrapOrThrow();
      mockOryRelationshipsService.createRelationship = jest
        .fn(() => Promise.resolve(true))
        .mockResolvedValue(true);

      await expect(
        service.run(['--tuple', 'Group:admin#members@User:1'], {
          tuple: expectedQuery,
        }),
      ).resolves.toBeUndefined();
      expect(mockOryRelationshipsService.createRelationship).toBeCalledWith({
        createRelationshipBody: expectedQuery,
      });
    });
  });
});
