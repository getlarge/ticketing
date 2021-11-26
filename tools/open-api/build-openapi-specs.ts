import { validate as validateSpecs } from '@apidevtools/swagger-parser';
import { OpenAPI } from 'openapi-types';
import { Swagger } from 'atlassian-openapi';
import { promises as fs } from 'fs';
import { join, resolve } from 'path';
import { merge } from 'openapi-merge';
import { DOCS_BASE_PATH, SERVICES } from './constants';
import { version } from '../../package.json';

async function mergeAPIs(openApis: Swagger.SwaggerV3[]): Promise<void> {
  const inputs = openApis.map((openapi) => ({ oas: openapi }));
  const mergeResult = merge(inputs);
  if ('type' in mergeResult && 'message' in mergeResult) {
    return Promise.reject(new Error(mergeResult.message));
  }

  const info = mergeResult.output.info;
  const output: OpenAPI.Document = {
    ...mergeResult.output,
    info: {
      title: 'Ticketing API',
      description: 'Microservices bundled APIs',
      version: info && info.version ? mergeResult.output.info.version : version,
      contact: info.contact || {},
    },
    servers: [{ url: 'http://ticketing.dev' }, { url: 'http://localhost' }],
    externalDocs: {
      description: 'Ticketings docs',
      url: 'https://github.com/getlarge/ticketing',
    },
  } as OpenAPI.Document;

  const openApi = await validateSpecs(output, {
    dereference: {
      circular: true,
    },
    validate: {
      schema: true,
      spec: true,
    },
  });
  const basePath = resolve(process.cwd(), DOCS_BASE_PATH);
  const filePath = join(basePath, 'openapi.json');
  await fs.writeFile(filePath, JSON.stringify(openApi, null, 2));
}

function cleanupSpecs(specs: Swagger.SwaggerV3): Swagger.SwaggerV3 {
  // remove unneeded, duplicate path
  delete specs.paths['/'];
  return specs;
}

function readOpenAPI(service: string): Promise<Swagger.SwaggerV3> {
  const basePath = process.cwd();
  const filePath = join(basePath, `apps/${service}/openapi.json`);
  return fs
    .readFile(filePath, 'utf-8')
    .then((file) => cleanupSpecs(JSON.parse(file)));
}

function readOpenAPIs(services: string[]): Promise<Swagger.SwaggerV3[]> {
  return Promise.all(services.map((service) => readOpenAPI(service)));
}

(async function (argv) {
  try {
    const openApis = await readOpenAPIs(SERVICES);
    await mergeAPIs(openApis);
    console.log(`OpenAPI specs generated`);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})(process.argv);
