import { ClientSession, Model } from 'mongoose';

export const transactionManager = async <Doc extends object>(
  model: Model<Doc>,
): Promise<
  AsyncDisposable & {
    session: ClientSession;
    wrap: <T>(fn: () => Promise<T>) => Promise<T>;
  }
> => {
  const session = await model.startSession();
  return {
    session,
    wrap: async <T>(fn: () => Promise<T>): Promise<T> => {
      session.startTransaction();
      try {
        const result = await fn();
        await session.commitTransaction();
        return result;
      } catch (e) {
        await session.abortTransaction();
        throw e;
      }
    },
    [Symbol.asyncDispose]: async () => {
      await session.endSession();
    },
  };
};
