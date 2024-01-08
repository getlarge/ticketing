/**
 * types copied from node_modules/redlock/dist/index.d.ts
 * our TS config triggers an error  when importing from node_modules
 * @see https://typescript.tv/errors/#ts7016
 **/
declare module 'redlock' {
  /// <reference types="node" />
  import { EventEmitter } from 'events';
  import { Redis as IORedisClient, Cluster as IORedisCluster } from 'ioredis';
  type Client = IORedisClient | IORedisCluster;
  export type ClientExecutionResult =
    | {
        client: Client;
        vote: 'for';
        value: number;
      }
    | {
        client: Client;
        vote: 'against';
        error: Error;
      };
  export type ExecutionStats = {
    readonly membershipSize: number;
    readonly quorumSize: number;
    readonly votesFor: Set<Client>;
    readonly votesAgainst: Map<Client, Error>;
  };
  export type ExecutionResult = {
    attempts: ReadonlyArray<Promise<ExecutionStats>>;
  };
  /**
   *
   */
  export interface Settings {
    readonly driftFactor: number;
    readonly retryCount: number;
    readonly retryDelay: number;
    readonly retryJitter: number;
    readonly automaticExtensionThreshold: number;
  }
  export class ResourceLockedError extends Error {
    readonly message: string;
    constructor(message: string);
  }
  export class ExecutionError extends Error {
    readonly message: string;
    readonly attempts: ReadonlyArray<Promise<ExecutionStats>>;
    constructor(
      message: string,
      attempts: ReadonlyArray<Promise<ExecutionStats>>,
    );
  }
  export class Lock {
    readonly redlock: Redlock;
    readonly resources: string[];
    readonly value: string;
    readonly attempts: ReadonlyArray<Promise<ExecutionStats>>;
    expiration: number;
    constructor(
      redlock: Redlock,
      resources: string[],
      value: string,
      attempts: ReadonlyArray<Promise<ExecutionStats>>,
      expiration: number,
    );
    release(): Promise<ExecutionResult>;
    extend(duration: number): Promise<Lock>;
  }
  export type RedlockAbortSignal = AbortSignal & {
    error?: Error;
  };
  /**
   * A redlock object is instantiated with an array of at least one redis client
   * and an optional `options` object. Properties of the Redlock object should NOT
   * be changed after it is first used, as doing so could have unintended
   * consequences for live locks.
   */
  export default class Redlock extends EventEmitter {
    readonly clients: Set<Client>;
    readonly settings: Settings;
    readonly scripts: {
      readonly acquireScript: {
        value: string;
        hash: string;
      };
      readonly extendScript: {
        value: string;
        hash: string;
      };
      readonly releaseScript: {
        value: string;
        hash: string;
      };
    };
    constructor(
      clients: Iterable<Client>,
      settings?: Partial<Settings>,
      scripts?: {
        readonly acquireScript?: string | ((script: string) => string);
        readonly extendScript?: string | ((script: string) => string);
        readonly releaseScript?: string | ((script: string) => string);
      },
    );
    /**
     * Generate a sha1 hash compatible with redis evalsha.
     */
    private _hash;
    /**
     * Generate a cryptographically random string.
     */
    private _random;
    /**
     * This method runs `.quit()` on all client connections.
     */
    quit(): Promise<void>;
    /**
     * This method acquires a locks on the resources for the duration specified by
     * the `duration`.
     */
    acquire(
      resources: string[],
      duration: number,
      settings?: Partial<Settings>,
    ): Promise<Lock>;
    /**
     * This method unlocks the provided lock from all servers still persisting it.
     * It will fail with an error if it is unable to release the lock on a quorum
     * of nodes, but will make no attempt to restore the lock in the case of a
     * failure to release. It is safe to re-attempt a release or to ignore the
     * error, as the lock will automatically expire after its timeout.
     */
    release(lock: Lock, settings?: Partial<Settings>): Promise<ExecutionResult>;
    /**
     * This method extends a valid lock by the provided `duration`.
     */
    extend(
      existing: Lock,
      duration: number,
      settings?: Partial<Settings>,
    ): Promise<Lock>;
    /**
     * Execute a script on all clients. The resulting promise is resolved or
     * rejected as soon as this quorum is reached; the resolution or rejection
     * will contains a `stats` property that is resolved once all votes are in.
     */
    private _execute;
    private _attemptOperation;
    private _attemptOperationOnClient;
    /**
     * Wrap and execute a routine in the context of an auto-extending lock,
     * returning a promise of the routine's value. In the case that auto-extension
     * fails, an AbortSignal will be updated to indicate that abortion of the
     * routine is in order, and to pass along the encountered error.
     *
     * @example
     * ```ts
     * await redlock.using([senderId, recipientId], 5000, { retryCount: 5 }, async (signal) => {
     *   const senderBalance = await getBalance(senderId);
     *   const recipientBalance = await getBalance(recipientId);
     *
     *   if (senderBalance < amountToSend) {
     *     throw new Error("Insufficient balance.");
     *   }
     *
     *   // The abort signal will be true if:
     *   // 1. the above took long enough that the lock needed to be extended
     *   // 2. redlock was unable to extend the lock
     *   //
     *   // In such a case, exclusivity can no longer be guaranteed for further
     *   // operations, and should be handled as an exceptional case.
     *   if (signal.aborted) {
     *     throw signal.error;
     *   }
     *
     *   await setBalances([
     *     {id: senderId, balance: senderBalance - amountToSend},
     *     {id: recipientId, balance: recipientBalance + amountToSend},
     *   ]);
     * });
     * ```
     */
    using<T>(
      resources: string[],
      duration: number,
      settings: Partial<Settings>,
      routine?: (signal: RedlockAbortSignal) => Promise<T>,
    ): Promise<T>;
    using<T>(
      resources: string[],
      duration: number,
      routine: (signal: RedlockAbortSignal) => Promise<T>,
    ): Promise<T>;
  }
  export {};
}
