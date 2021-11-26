import { promises as fs } from 'fs';
import { convert as convertToPostman } from 'openapi-to-postmanv2';
import { OpenAPI } from 'openapi-types';
import { DOCS_BASE_PATH } from './constants';

function convert(data: string | OpenAPI.Document) {
  const input =
    typeof data === 'string'
      ? { type: 'string', data }
      : { type: 'json', data };

  return new Promise((resolve, reject) => {
    convertToPostman(
      input,
      {
        schemaFaker: true,
        requestNameSource: 'fallback',
        indentCharacter: ' ',
      },
      (
        err: Error,
        result: {
          result?: boolean;
          reason?: string;
          output?: [{ type: 'collection'; data: Record<string, any> }];
        }
      ) => {
        if (err) {
          return reject(err);
        } else if (!result.result && result.reason) {
          return reject(new Error(result.reason));
        }
        const collections = result.output
          .map(({ type, data }) => (type === 'collection' ? data : null))
          .filter((el) => !!el);
        return resolve(collections);
      }
    );
  });
}

(async function (argv) {
  const openApiPath = argv[2] || `${DOCS_BASE_PATH}/openapi.json`;
  const postmanCollectionPath =
    argv[3] || `${DOCS_BASE_PATH}/postman-collection.json`;
  try {
    const openApiString = await fs.readFile(openApiPath, 'utf-8');
    const collections = await convert(openApiString);
    await fs.writeFile(
      postmanCollectionPath,
      JSON.stringify(collections[0], null, 2)
    );

    console.log(`Postman collection generated`);
    process.exit(0);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
})(process.argv);
