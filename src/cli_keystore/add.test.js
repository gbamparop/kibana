/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

const mockKeystoreData =
  '1:IxR0geiUTMJp8ueHDkqeUJ0I9eEw4NJPXIJi22UDyfGfJSy4mH' +
  'BBuGPkkAix/x/YFfIxo4tiKGdJ2oVTtU8LgKDkVoGdL+z7ylY4n3myatt6osqhI4lzJ9M' +
  'Ry21UcAJki2qFUTj4TYuvhta3LId+RM5UX/dJ2468hQ==';

jest.mock('fs', () => ({
  readFileSync: jest.fn().mockImplementation((path) => {
    if (!path.includes('nonexistent')) {
      return JSON.stringify(mockKeystoreData);
    }

    throw { code: 'ENOENT' };
  }),
  existsSync: jest.fn().mockImplementation((path) => {
    return !path.includes('nonexistent');
  }),
  writeFileSync: jest.fn(),
}));

import sinon from 'sinon';
import { PassThrough } from 'stream';

import { Keystore } from '../cli/keystore';
import { add } from './add';
import { Logger } from '../cli/logger';
import * as prompt from '../cli/keystore/utils/prompt';

describe('Kibana keystore', () => {
  describe('add', () => {
    const sandbox = sinon.createSandbox();

    beforeEach(() => {
      sandbox.stub(prompt, 'confirm');
      sandbox.stub(prompt, 'question');

      sandbox.stub(Logger.prototype, 'log');
      sandbox.stub(Logger.prototype, 'error');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('returns an error for a nonexistent keystore', async () => {
      const keystore = new Keystore('/data/nonexistent.keystore');
      const message = "ERROR: Kibana keystore not found. Use 'create' command to create one.";

      await add(keystore, 'foo');

      sinon.assert.calledOnce(Logger.prototype.error);
      sinon.assert.calledWith(Logger.prototype.error, message);
    });

    it('does not attempt to create a keystore', async () => {
      const keystore = new Keystore('/data/nonexistent.keystore');
      sandbox.stub(keystore, 'save');

      await add(keystore, 'foo');

      sinon.assert.notCalled(keystore.save);
    });

    it('prompts for existing key', async () => {
      prompt.confirm.returns(Promise.resolve(true));
      prompt.question.returns(Promise.resolve('bar'));

      const keystore = new Keystore('/data/test.keystore');
      await add(keystore, 'a2');

      sinon.assert.calledOnce(prompt.confirm);
      sinon.assert.calledOnce(prompt.question);

      const { args } = prompt.confirm.getCall(0);

      expect(args[0]).toEqual('Setting a2 already exists. Overwrite?');
    });

    it('aborts if overwrite is denied', async () => {
      prompt.confirm.returns(Promise.resolve(false));

      const keystore = new Keystore('/data/test.keystore');
      await add(keystore, 'a2');

      sinon.assert.notCalled(prompt.question);

      sinon.assert.calledOnce(Logger.prototype.log);
      sinon.assert.calledWith(Logger.prototype.log, 'Exiting without modifying keystore.');
    });

    it('overwrites without prompt if force is supplied', async () => {
      prompt.question.returns(Promise.resolve('bar'));

      const keystore = new Keystore('/data/test.keystore');
      sandbox.stub(keystore, 'save');

      await add(keystore, 'a2', { force: true });

      sinon.assert.notCalled(prompt.confirm);
      sinon.assert.calledOnce(keystore.save);
    });

    it('trims value', async () => {
      prompt.question.returns(Promise.resolve('bar\n'));

      const keystore = new Keystore('/data/test.keystore');
      sandbox.stub(keystore, 'save');

      await add(keystore, 'foo');

      expect(keystore.data.foo).toEqual('bar');
    });

    it('parses JSON values', async () => {
      prompt.question.returns(Promise.resolve('["bar"]\n'));

      const keystore = new Keystore('/data/test.keystore');
      sandbox.stub(keystore, 'save');

      await add(keystore, 'foo');

      expect(keystore.data.foo).toEqual(['bar']);
    });

    it('persists updated keystore', async () => {
      prompt.question.returns(Promise.resolve('bar\n'));

      const keystore = new Keystore('/data/test.keystore');
      sandbox.stub(keystore, 'save');

      await add(keystore, 'foo');

      sinon.assert.calledOnce(keystore.save);
    });

    it('accepts stdin', async () => {
      const keystore = new Keystore('/data/test.keystore');
      sandbox.stub(keystore, 'save');

      const stdin = new PassThrough();
      process.nextTick(() => {
        stdin.write('kibana\n');
        stdin.end();
      });

      await add(keystore, 'foo', { stdin: true, stdinStream: stdin });

      expect(keystore.data.foo).toEqual('kibana');
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });
});
