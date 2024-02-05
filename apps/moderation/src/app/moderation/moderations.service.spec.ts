/* eslint-disable max-lines-per-function */
/* eslint-disable max-nested-callbacks */
import { OryRelationshipsService } from '@getlarge/keto-client-wrapper';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { beforeEach, describe, it, jest } from '@jest/globals';
import { getQueueToken } from '@nestjs/bullmq';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { AcceptableError } from '@ticketing/shared/errors';
import {
  Moderation,
  ModerationStatus,
  ModerationTicket,
  TicketStatus,
} from '@ticketing/shared/models';
import { Queue } from 'bullmq';
import { Cache } from 'cache-manager';
import { ClientSession, Document, Model, Types } from 'mongoose';

import {
  TICKET_APPROVED_EVENT,
  TICKET_REJECTED_EVENT,
  TicketCreatedEvent,
} from '../shared/events';
import { QueueNames } from '../shared/queues';
import { ModerationsService } from './moderations.service';
import { Moderation as ModerationSchema, ModerationDocument } from './schemas';

// for some reason the polyfill is missing when running with Jest
Object.defineProperty(Symbol, 'asyncDispose', {
  value: Symbol('Symbol.asyncDispose'),
});

describe('ModerationsService', () => {
  let service: ModerationsService;
  let moderationModel: DeepMocked<Model<ModerationDocument>>;
  let cacheManager: DeepMocked<Cache>;
  let moderationQueue: DeepMocked<Queue>;
  let eventEmitter: DeepMocked<EventEmitter2>;
  let oryRelationshipsService: DeepMocked<OryRelationshipsService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ModerationsService],
    })
      .useMocker((token) => {
        if (typeof token === 'string' || typeof token === 'symbol') {
          switch (token) {
            case `${Moderation.name}Model`:
              return createMock<Model<ModerationDocument>>();
            case `BullQueue_${QueueNames.MODERATE_TICKET}`:
              return createMock<Queue>();
            case 'CACHE_MANAGER':
              return createMock<Cache>();
            default:
              return null;
          }
        }
        if (typeof token === 'function') {
          return createMock<typeof token>();
        }
      })
      .compile();

    service = module.get(ModerationsService);
    moderationModel = module.get(getModelToken(Moderation.name));
    moderationQueue = module.get(getQueueToken(QueueNames.MODERATE_TICKET));
    eventEmitter = module.get(EventEmitter2);
    oryRelationshipsService = module.get(OryRelationshipsService);
    cacheManager = module.get(CACHE_MANAGER);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(moderationModel).toBeDefined();
    expect(moderationQueue).toBeDefined();
    expect(eventEmitter).toBeDefined();
    expect(oryRelationshipsService).toBeDefined();
    expect(cacheManager).toBeDefined();
  });

  describe('find', () => {
    it('should return a list of moderations', async () => {
      const result: Moderation[] = [];
      moderationModel.find.mockResolvedValueOnce(result);
      expect(await service.find()).toEqual(result);
    });
  });

  describe('findById', () => {
    it('should return a moderation if it exists', async () => {
      const result = {
        id: '1',
        status: ModerationStatus.Approved,
      };
      cacheManager.wrap.mockResolvedValueOnce(result);
      //
      expect(await service.findById('1')).toEqual(result);
    });

    it('should throw an error if the moderation does not exist', async () => {
      cacheManager.wrap.mockRejectedValueOnce(new NotFoundException());
      await expect(service.findById('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateById', () => {
    it('should update a moderation and return the updated moderation', async () => {
      const expectedStatus = ModerationStatus.Approved;
      const result = { ...createMock<Moderation>() };
      result.id = '1';
      result.status = expectedStatus;
      const doc = createMock<ModerationSchema & Document>();
      doc.save.mockResolvedValueOnce(doc);
      doc.toJSON.mockReturnValueOnce(result);
      moderationModel.findOne.mockResolvedValueOnce(doc);
      //
      expect(await service.updateById('1', { status: expectedStatus })).toEqual(
        result,
      );
      expect(moderationModel.findOne).toHaveBeenCalledWith({ _id: '1' });
      expect(doc.set).toHaveBeenCalledWith({
        status: ModerationStatus.Approved,
      });
      expect(doc.save).toHaveBeenCalled();
    });
  });

  describe('approveById', () => {
    it('should approve a moderation and return the approved moderation', async () => {
      const result = { ...createMock<Moderation>() };
      result.id = '1';
      result.status = ModerationStatus.Approved;
      jest.spyOn(service, 'findById').mockResolvedValueOnce(result);
      eventEmitter.emitAsync.mockResolvedValueOnce(undefined);
      //
      expect(await service.approveById('1')).toEqual(result);
      expect(eventEmitter.emitAsync).toHaveBeenCalledWith(
        TICKET_APPROVED_EVENT,
        {
          moderation: result,
          ticket: { ...result.ticket, status: TicketStatus.Approved },
          ctx: {},
        },
      );
    });
  });

  describe('rejectById', () => {
    it('should reject a moderation and return the rejected moderation', async () => {
      const rejectionReason = 'reason';
      const result = { ...createMock<Moderation>() };
      result.id = '1';
      result.status = ModerationStatus.Rejected;
      result.rejectionReason = rejectionReason;
      jest.spyOn(service, 'findById').mockResolvedValueOnce(result);
      eventEmitter.emitAsync.mockResolvedValueOnce(undefined);
      //
      expect(await service.rejectById('1', rejectionReason)).toEqual(result);
      expect(eventEmitter.emitAsync).toHaveBeenCalledWith(
        TICKET_REJECTED_EVENT,
        {
          moderation: result,
          ticket: { ...result.ticket, status: TicketStatus.Rejected },
          ctx: {},
        },
      );
    });
  });

  describe('onTicketCreated', () => {
    it('should throw when a moderation is already pending', async () => {
      const ticketCreationEvent = {
        ...createMock<TicketCreatedEvent>(),
        ticket: { ...createMock<ModerationTicket>(), id: '1' },
      };
      const existingModeration = createMock<ModerationSchema & Document>();
      const mockedSession = createMock<ClientSession>();
      mockedSession.withTransaction.mockImplementationOnce(async (fn) => {
        await fn(mockedSession);
        return Promise.resolve(existingModeration);
      });
      moderationModel.startSession.mockResolvedValueOnce(mockedSession);
      moderationModel
        .findOne({
          'ticket.$id': ticketCreationEvent.ticket.id,
        })
        .session.mockResolvedValueOnce(existingModeration);
      //
      await expect(
        service.onTicketCreated(ticketCreationEvent),
      ).rejects.toThrow(AcceptableError);
      expect(moderationModel.startSession).toHaveBeenCalled();
      expect(moderationModel.findOne).toHaveBeenCalledWith({
        'ticket.$id': ticketCreationEvent.ticket.id,
      });
      expect(
        moderationModel.findOne({ 'ticket.$id': ticketCreationEvent.ticket.id })
          .session,
      ).toHaveBeenCalledWith(mockedSession);
    });

    it('should create a moderation, relations with the admin group and a background inside a mongo transaction', async () => {
      const ticketCreationEvent = {
        ...createMock<TicketCreatedEvent>(),
        ticket: {
          ...createMock<ModerationTicket>(),
          id: new Types.ObjectId().toHexString(),
        },
      };
      const createdModerationDoc = createMock<ModerationSchema & Document>();
      const createdModeration = { ...createMock<Moderation>() };
      createdModeration.id = '1';
      const mockedSession = createMock<ClientSession>();
      mockedSession.withTransaction.mockImplementationOnce(async (fn) => {
        await fn(mockedSession);
        return Promise.resolve(createdModerationDoc);
      });
      moderationModel.startSession.mockResolvedValueOnce(mockedSession);
      moderationModel
        .findOne({
          'ticket.$id': ticketCreationEvent.ticket.id,
        })
        .session.mockResolvedValueOnce(undefined);
      moderationModel.create.mockResolvedValueOnce([
        createdModerationDoc,
      ] as never);
      createdModerationDoc.toJSON.mockReturnValueOnce(createdModeration);
      //
      await service.onTicketCreated(ticketCreationEvent);
      expect(moderationModel.create).toHaveBeenCalledWith(
        [
          {
            ticket: Types.ObjectId.createFromHexString(
              ticketCreationEvent.ticket.id,
            ),
            status: ModerationStatus.Pending,
          },
        ],
        { session: mockedSession },
      );
      expect(oryRelationshipsService.createRelationship).toHaveBeenCalled();
      expect(moderationQueue.add).toHaveBeenCalledWith(
        'moderate-ticket',
        {
          ticket: ticketCreationEvent.ticket,
          ctx: ticketCreationEvent.ctx,
          moderation: createdModeration,
        },
        {
          attempts: 2,
          delay: 1000,
          jobId: createdModeration.id,
          removeOnComplete: true,
          removeOnFail: true,
        },
      );
    });
  });
});
