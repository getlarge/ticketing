import FastifyMultipart from '@fastify/multipart';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import * as FormData from 'form-data';
import { createReadStream } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { AppController } from './app.controller';

// eslint-disable-next-line max-lines-per-function
describe('Fastify File Upload', () => {
  let app: NestFastifyApplication;
  beforeEach(async () => {
    const modRef = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();
    app = modRef.createNestApplication(new FastifyAdapter());

    await app.register(FastifyMultipart);

    await app.init();
  });

  afterEach(async () => {
    await app?.close();
  });

  it('should upload a single file', async () => {
    const form = new FormData();
    form.append('file', await readFile(join(process.cwd(), 'package.json')), {
      contentType: 'application/json',
      filename: 'package.json',
    });
    //
    const response = await app.inject({
      method: 'POST',
      url: '/single',
      body: form.getBuffer(),
      headers: form.getHeaders(),
    });
    //
    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual({ success: true });
  });

  it('should upload multiple files', async () => {
    const form = new FormData();
    form.append('file', createReadStream(join(process.cwd(), 'package.json')));
    form.append(
      'file',
      createReadStream(join(process.cwd(), '.eslintrc.json')),
    );
    form.append('nonFile', 'Hello World!');
    //
    const response = await app.inject({
      method: 'POST',
      url: '/multiple',
      payload: form,
      headers: form.getHeaders(),
    });
    //
    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual({ success: true, fileCount: 2 });
  });

  it('should upload any files', async () => {
    const form = new FormData();
    form.append('fil', createReadStream(join(process.cwd(), 'package.json')));
    form.append('field', 'Hello World!');
    //
    const response = await app.inject({
      method: 'POST',
      url: '/any',
      payload: form,
      headers: form.getHeaders(),
    });
    //
    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual({ success: true, fileCount: 1 });
  });

  it('should upload single file fields', async () => {
    const form = new FormData();
    form.append(
      'profile',
      createReadStream(join(process.cwd(), 'package.json')),
    );
    //
    const response = await app.inject({
      method: 'POST',
      url: '/fields',
      payload: form,
      headers: form.getHeaders(),
    });
    //
    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual({ success: true, fileCount: 1 });
  });

  it('should upload multiple file fields', async () => {
    const form = new FormData();
    form.append(
      'profile',
      createReadStream(join(process.cwd(), 'package.json')),
    );
    form.append(
      'avatar',
      createReadStream(join(process.cwd(), '.eslintrc.json')),
    );
    //
    const response = await app.inject({
      method: 'POST',
      url: '/fields',
      payload: form,
      headers: form.getHeaders(),
    });
    //
    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual({ success: true, fileCount: 2 });
  });

  it('should upload a single file to stream', async () => {
    const form = new FormData();
    const file = await readFile(join(process.cwd(), 'package.json'));
    form.append('file', file);
    //
    const response = await app.inject({
      method: 'POST',
      url: '/single-stream',
      payload: form,
      headers: form.getHeaders(),
    });
    //
    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual(file.toString());
  });

  it('should upload a single file to disk', async () => {
    const form = new FormData();
    form.append('file', createReadStream(join(process.cwd(), 'package.json')));
    //
    const response = await app.inject({
      method: 'POST',
      url: '/single-disk',
      payload: form,
      headers: form.getHeaders(),
    });
    //
    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual({
      success: true,
      filepath: expect.any(String),
    });
  });
});
