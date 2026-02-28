const { test, describe } = require('node:test');
const assert = require('node:assert');
const { convert } = require('./converter.js');

// Helper to stringify tokens back into the legacy string output for testing backward compatibility.
const stringify = (tokens) => tokens.map(t => t.word).join('');

describe('Burushaski Number Converter (Tokenized)', () => {
    test('converts units correctly', () => {
        assert.strictEqual(stringify(convert(1)), 'hik');
        assert.strictEqual(stringify(convert(5)), 'číndi');
        assert.strictEqual(stringify(convert(9)), 'huntí');
    });

    test('converts tens correctly', () => {
        assert.strictEqual(stringify(convert(10)), 'torimi');
        assert.strictEqual(stringify(convert(15)), 'turma-číndi');
        assert.strictEqual(stringify(convert(20)), 'altar');
        assert.strictEqual(stringify(convert(30)), 'altar-torimi');
        assert.strictEqual(stringify(convert(40)), 'alto-altar');
        assert.strictEqual(stringify(convert(50)), 'alto-altar-torimi');
        assert.strictEqual(stringify(convert(60)), 'iski-altar');
        assert.strictEqual(stringify(convert(99)), 'walti-altar-turma-huntí');
    });

    test('converts hundreds correctly', () => {
        assert.strictEqual(stringify(convert(100)), 'hik tha');
        assert.strictEqual(stringify(convert(105)), 'hik tha ke číndi');
        assert.strictEqual(stringify(convert(200)), 'altó tha');
        assert.strictEqual(stringify(convert(350)), 'iskí tha ke alto-altar-torimi');
    });

    test('converts thousands correctly', () => {
        assert.strictEqual(stringify(convert(1000)), 'hik saas');
        assert.strictEqual(stringify(convert(1020)), 'hik saas ke altar');
        assert.strictEqual(stringify(convert(1100)), 'hik saas ke hik tha');
        assert.strictEqual(stringify(convert(2000)), 'altó saas');
        assert.strictEqual(stringify(convert(15000)), 'turma-číndi saas');
    });

    test('converts exactly 1,000,000', () => {
        assert.strictEqual(stringify(convert(1000000)), 'saas-tha');
    });

    test('handles invalid inputs gracefully', () => {
        assert.throws(() => convert(-5), /does not define zero or negative numbers/);
        assert.throws(() => convert(0), /does not define zero or negative numbers/);
        assert.throws(() => convert(1000001), /Maximum allowed value/);
        assert.throws(() => convert(1.5), /Input must be a valid integer/);
        assert.throws(() => convert("abc"), /Input must be a valid integer/);
    });

    test('handles empty inputs', () => {
        const emptyResult = convert("");
        assert.ok(Array.isArray(emptyResult));
        assert.strictEqual(emptyResult.length, 0);
    });

    test('produces correct token metadata for math', () => {
        const tokens87 = convert(87);
        // "wálti" (multiplier), "-", "altar" (base), "-", "thalé" (remainder)
        assert.strictEqual(tokens87[0].type, 'multiplier');
        assert.strictEqual(tokens87[0].val, 4);
        assert.strictEqual(tokens87[2].type, 'base');
        assert.strictEqual(tokens87[2].val, 20);
        assert.strictEqual(tokens87[4].type, 'remainder');
        assert.strictEqual(tokens87[4].val, 7);
    });
});
