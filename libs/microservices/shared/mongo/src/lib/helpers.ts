import { ClientSession, Model } from 'mongoose';

interface TransactionManagerSuccessResponse<T = undefined> {
  value: T;
  error: never;
}

interface TransactionManagerErrorResponse {
  error: Error;
  value: never;
}

type TransactionManagerResponse<T = undefined> =
  | TransactionManagerSuccessResponse<T>
  | TransactionManagerErrorResponse;

export const transactionManager = async <Doc extends object>(
  model: Model<Doc>,
): Promise<
  AsyncDisposable & {
    session: ClientSession;
    wrap: <T>(
      fn: (session: ClientSession) => Promise<T>,
    ) => Promise<TransactionManagerResponse<T>>;
  }
> => {
  const session = await model.startSession();
  return {
    session,
    wrap: <T>(fn: (session: ClientSession) => Promise<T>) => {
      let value: T;
      return session
        .withTransaction(async () => {
          value = await fn(session);
        })
        .then(
          (res) =>
            (res
              ? { value }
              : {
                  error: new Error('Transaction aborted'),
                }) as TransactionManagerResponse<T>,
        );
    },
    [Symbol.asyncDispose]: async () => {
      !session.hasEnded && (await session.endSession());
    },
  };
};
