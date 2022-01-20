import { OpenAPIObject } from '@nestjs/swagger';

import axios from 'axios';
import { execSync } from 'child_process';
import path from 'path';
import { promises as fs } from 'fs';

import config from './generate-ng-openapi.json';

const dataDirectoryPath = path.join(__dirname);
const rootDir = path.join(__dirname, '../../');

function getOpenAPISpecs(source: {
  type: string;
  value: string;
}): Promise<OpenAPIObject> {
  if (source.type === 'file') {
    const filePath = path.join(process.cwd(), source.value);
    return fs.readFile(filePath, 'utf-8').then((data) => JSON.parse(data));
  } else if (source.type === 'url') {
    return axios({
      method: 'get',
      url: source.value,
      responseType: 'json',
    }).then(({ data }) => data);
  }
}

Promise.all(
  config.map((link) =>
    getOpenAPISpecs(link.source).then(async (data) => {
      const customPath = link.source.value.replaceAll('/', '-');
      const filePath = `${dataDirectoryPath}/${customPath}-tmp.json`;
      await fs.writeFile(filePath, JSON.stringify(data));
      const outputPath = path.join(rootDir, link.output);
      const command = `ng-openapi-gen --input ${filePath} --output ${outputPath}`;
      execSync(command);
      await fs.rm(filePath);
    })
  )
);

