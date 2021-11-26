/* eslint-disable @typescript-eslint/no-explicit-any */

import * as EventEmitter from 'events';

export class MockModel<T> extends EventEmitter {
  // new(doc?: AnyKeys<T> & AnyObject, fields?: any | null, options?: boolean | AnyObject): EnforceDocument<T, TMethods, TVirtuals>;

  public aggregate = jest.fn().mockResolvedValueOnce([]);

  /** Base Mongoose instance the model uses. */
  // base: typeof mongoose;
  base = {};

  baseModelName: string | undefined;

  public bulkWrite = jest.fn().mockResolvedValueOnce({} as T);

  /**
   * Sends multiple `save()` calls in a single `bulkWrite()`. This is faster than
   * sending multiple `save()` calls because with `bulkSave()` there is only one
   * network round trip to the MongoDB server.
   */
  public bulkSave = jest.fn().mockResolvedValueOnce([] as T[]);

  /** Collection the model uses. */
  // collection: Collection;

  /** Creates a `count` query: counts the number of documents that match `filter`. */
  public count = jest.fn().mockResolvedValueOnce(0);

  /** Creates a `countDocuments` query: counts the number of documents that match `filter`. */
  public countDocuments = jest.fn().mockResolvedValueOnce(0);

  /** Creates a new document or documents */
  public create = jest.fn().mockResolvedValueOnce({});

  /**
   * Create the collection for this model. By default, if no indexes are specified,
   * mongoose will not create the collection for the model until any documents are
   * created. Use this method to create the collection explicitly.
   */
  public createCollection = jest.fn().mockResolvedValueOnce({});

  /**
   * Similar to `ensureIndexes()`, except for it uses the [`createIndex`](http://mongodb.github.io/node-mongodb-native/2.2/api/Collection.html#createIndex)
   * function.
   */
  public createIndexes = jest.fn().mockResolvedValueOnce(undefined);

  /** Connection the model uses. */
  // db: Connection;

  /**
   * Deletes all of the documents that match `conditions` from the collection.
   * Behaves like `remove()`, but deletes all documents that match `conditions`
   * regardless of the `single` option.
   */
  public deleteMany = jest.fn().mockReturnValue(undefined);

  /**
   * Deletes the first document that matches `conditions` from the collection.
   * Behaves like `remove()`, but deletes at most one document regardless of the
   * `single` option.
   */
  public deleteOne = jest.fn().mockReturnValue(undefined);

  /**
   * Sends `createIndex` commands to mongo for each index declared in the schema.
   * The `createIndex` commands are sent in series.
   */
  public ensureIndexes = jest.fn().mockResolvedValueOnce(undefined);

  /**
   * Event emitter that reports any errors that occurred. Useful for global error
   * handling.
   */
  // events: EventEmitter;

  /**
   * Finds a single document by its _id field. `findById(id)` is almost*
   * equivalent to `findOne({ _id: id })`. If you want to query by a document's
   * `_id`, use `findById()` instead of `findOne()`.
   */
  public findById = jest.fn().mockReturnValueOnce({});

  /**
   * Shortcut for creating a new Document from existing raw data, pre-saved in the DB.
   * The document returned has no paths marked as modified initially.
   */
  public hydrate = jest.fn().mockReturnValueOnce({});

  /**
   * This function is responsible for building [indexes](https://docs.mongodb.com/manual/indexes/),
   * unless [`autoIndex`](http://mongoosejs.com/docs/guide.html#autoIndex) is turned off.
   * Mongoose calls this function automatically when a model is created using
   * [`mongoose.model()`](/docs/api.html#mongoose_Mongoose-model) or
   * [`connection.model()`](/docs/api.html#connection_Connection-model), so you
   * don't need to call it.
   */
  public init = jest.fn().mockResolvedValueOnce({});

  /** Inserts one or more new documents as a single `insertMany` call to the MongoDB server. */
  public insertMany = jest.fn().mockResolvedValueOnce({});

  /**
   * Lists the indexes currently defined in MongoDB. This may or may not be
   * the same as the indexes defined in your schema depending on whether you
   * use the [`autoIndex` option](/docs/guide.html#autoIndex) and if you
   * build indexes manually.
   */
  public listIndexes = jest.fn().mockReturnValueOnce([]);

  /** The name of the model */
  modelName: string;

  /** Populates document references. */
  public populate = jest.fn().mockResolvedValueOnce({});

  /* Makes the indexes in MongoDB match the indexes defined in this model's
   * schema. This function will drop any indexes that are not defined in
   * the model's schema except the `_id` index, and build any indexes that
   * are in your schema but not in MongoDB.
   */
  public syncIndexes = jest.fn().mockReturnValueOnce([]);

  /**
   * Does a dry-run of Model.syncIndexes(), meaning that
   * the result of this function would be the result of
   * Model.syncIndexes().
   */
  public diffIndexes = jest.fn().mockReturnValueOnce([]);

  /** Casts and validates the given object against this model's schema, passing the given `context` to custom validators. */
  public validate = jest.fn().mockResolvedValueOnce(undefined);

  /** Watches the underlying collection for changes using [MongoDB change streams](https://docs.mongodb.com/manual/changeStreams/). */
  public watch = jest.fn().mockReturnValueOnce({});

  /** Adds a `$where` clause to this query */
  // $where(
  //   argument: string | Function
  // ): QueryWithHelpers<
  //   Array<EnforceDocument<T, TMethods, TVirtuals>>,
  //   EnforceDocument<T, TMethods, TVirtuals>,
  //   TQueryHelpers,
  //   T
  // >;

  /** Registered discriminators for this model. */
  discriminators: { [name: string]: MockModel<any> } | undefined;

  /** Translate any aliases fields/conditions so the final query or document object is pure */
  // translateAliases(raw: any): any;

  /**
   * Returns true if at least one document exists in the database that matches
   * the given `filter`, and false otherwise.
   */
  public exists = jest.fn().mockResolvedValueOnce(true);

  /** Creates a `find` query: gets a list of documents that match `filter`. */
  public find = jest.fn().mockReturnValueOnce([{}]);

  /** Creates a `findByIdAndDelete` query, filtering by the given `_id`. */
  public findByIdAndDelete = jest.fn().mockReturnValueOnce({});

  /** Creates a `findByIdAndRemove` query, filtering by the given `_id`. */
  public findByIdAndRemove = jest.fn().mockReturnValueOnce({});

  /** Creates a `findOneAndUpdate` query, filtering by the given `_id`. */
  public findByIdAndUpdate = jest.fn().mockReturnValueOnce({});

  /** Creates a `findOneAndDelete` query: atomically finds the given document, deletes it, and returns the document as it was before deletion. */
  public findOneAndDelete = jest.fn().mockReturnValueOnce({});

  /** Creates a `findOneAndRemove` query: atomically finds the given document and deletes it. */
  public findOneAndRemove = jest.fn().mockReturnValueOnce({});

  /** Creates a `findOneAndReplace` query: atomically finds the given document and replaces it with `replacement`. */
  public findOneAndReplace = jest.fn().mockReturnValueOnce({});

  /** Creates a `findOneAndUpdate` query: atomically find the first document that matches `filter` and apply `update`. */
  public findOneAndUpdate = jest.fn().mockResolvedValueOnce({});

  public geoSearch = jest.fn().mockResolvedValueOnce({});

  public remove = jest.fn().mockResolvedValueOnce({});

  /** Schema the model uses. */
  // schema: Schema;

  /** Creates a `updateMany` query: updates all documents that match `filter` with `update`. */
  public updateMany = jest.fn().mockReturnValueOnce({});

  /** Creates a `updateOne` query: updates the first document that matches `filter` with `update`. */
  public updateOne = jest.fn().mockReturnValueOnce({});

  /** Creates a Query, applies the passed conditions, and returns the Query. */
  public where = jest.fn().mockResolvedValueOnce({});
}
