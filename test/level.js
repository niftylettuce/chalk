const path = require('path');
const test = require('ava');
const execa = require('execa');

// Spoof supports-color
require('./_supports-color')(__dirname);

const m = require('../lib');

test("don't output colors when manually disabled", t => {
  const oldLevel = m.level;
  m.level = 0;
  t.is(m.red('foo'), 'foo');
  m.level = oldLevel;
});

test('enable/disable colors based on chalk enabled not individuals', t => {
  const oldLevel = m.level;
  m.level = 1;
  const { red } = m;
  t.is(red.level, 1);
  m.level = 0;
  t.is(red.level, m.level);
  m.level = oldLevel;
});

test('propagate enable/disable changes from child colors', t => {
  const oldLevel = m.level;
  m.level = 1;
  const { red } = m;
  t.is(red.level, 1);
  t.is(m.level, 1);
  red.level = 0;
  t.is(red.level, 0);
  t.is(m.level, 0);
  m.level = 1;
  t.is(red.level, 1);
  t.is(m.level, 1);
  m.level = oldLevel;
});

test('disable colors if they are not supported', async t => {
  t.is(await execa.stdout('node', [path.join(__dirname, '_fixture')]), 'test');
});
