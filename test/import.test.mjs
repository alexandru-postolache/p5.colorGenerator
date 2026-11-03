import assert from 'node:assert/strict';
import test from 'node:test';
import ColorGenerator, { ColorGenerator as named } from '../p5.colorGenerator.mjs';

test('esm entry exports the constructor', () => {
  assert.equal(typeof ColorGenerator, 'function');
  assert.equal(named, ColorGenerator);
});
