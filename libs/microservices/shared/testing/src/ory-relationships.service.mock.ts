import { jest } from '@jest/globals';

export class MockOryRelationshipsService {
  createRelationship = jest.fn();
  deleteRelationships = jest.fn();
  getRelationships = jest.fn();
}
