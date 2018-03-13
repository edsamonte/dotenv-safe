'use strict';

const chai = require('chai');
const assert = chai.assert;
const dotenv = require('../index.js');
const MissingEnvVarsError = dotenv.MissingEnvVarsError;
const fs = require('fs-extra');
const clone = require('lodash.clonedeep');

describe('dotenv-safe', () => {
    let originalEnvironment;
    let originalCWD;

    before(done => {
        originalCWD = process.cwd();
        process.chdir('./test');
        assert.equal(process.env.HELLO, 'fromTheOtherSide');
        originalEnvironment = clone(process.env);
        fs.mkdirs('envs', done);
    });

    beforeEach(done => {
        process.env = clone(originalEnvironment);
        fs.copy('original', 'envs', done);
    });

    afterEach(done => {
        fs.emptyDir('envs', done);
    });

    after(done => {
        fs.remove('envs', done);
        originalCWD = process.cwd(originalCWD);
    });

    it('does not throw error when all is well', () => {
        assert.isOk(dotenv.load({
            example: 'envs/.env.success.yml',
            path: 'envs/.env.yml'
        }));
    });

    it('does not throw error when variable exists but is empty and allowEmptyValues option is true', () => {
        assert.isOk(dotenv.load({
            example: 'envs/.env.allowEmpty.yml',
            path: 'envs/.env.yml',
            allowEmptyValues: true
        }));
    });

    it('does not throw error when .env is missing but variables exist', () => {
        process.env.HELLO = 'WORLD';

        assert.isOk(dotenv.load({
            example: 'envs/.env.noDotEnv.yml'
        }));
    });

    it('throws error when a variable is missing', () => {
        assert.throws(() => {
            dotenv.load({
                example: 'envs/.env.fail.yml',
                path: 'envs/.env.yml'
            });
        }, MissingEnvVarsError);
    });

    it('throws error when a variable exists but is empty and allowEmptyValues option is false', () => {
        assert.throws(() => {
            dotenv.load({
                example: 'envs/.env.allowEmpty.yml',
                path: 'envs/.env.yml',
                allowEmptyValues: false
            });
        }, MissingEnvVarsError);
    });

    it('throws error when a variable does not exist and allowEmptyValues option is true', () => {
        assert.throws(() => {
            dotenv.load({
                example: 'envs/.env.fail.yml',
                path: 'envs/.env.yml',
                allowEmptyValues: true
            });
        }, MissingEnvVarsError);
    });

    it('returns an object with parsed .env.yml', () => {
        const result = dotenv.load({
            example: 'envs/.env.allowEmpty.yml',
            path: 'envs/.env.yml',
            allowEmptyValues: true
        });
        assert.deepEqual({
            parsed: { HELLO: 'world', EMPTY: null },
            required: { EMPTY: null }
        }, result);
    });

    it('returns an object with values from process.env in case when .env.yml does not exist', () => {
        const result = dotenv.load({
            example: 'envs/.env.noDotEnv.yml'
        });
        assert.deepEqual({}, result.parsed);
        assert.deepEqual({ HELLO: 'fromTheOtherSide' }, result.required);
        assert.equal('ENOENT', result.error.code);
    });

    it('does not overwrite externally set environment variables', () => {
        const result = dotenv.load({
            example: 'envs/.env.success.yml',
            path: 'envs/.env.yml'
        });
        assert.equal(process.env.HELLO, 'fromTheOtherSide');
        assert.deepEqual({
            parsed: { HELLO: 'world', EMPTY: null },
            required: { HELLO: 'fromTheOtherSide' }
        }, result);
    });

    it('has stack traces that list which variables are missing', () => {
        try {
            throw new MissingEnvVarsError(false, '.env.yml', '.env.example.yml', ['FOO', 'BAR'], null);
        } catch (e) {
            assert.include(e.stack, 'FOO');
            assert.include(e.stack, 'BAR');
        }
    });
});
