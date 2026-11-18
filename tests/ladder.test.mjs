// Scale ladder (side menu) rows and click targets · 尺度阶梯
import test from 'node:test';
import assert from 'node:assert/strict';
import { ladderRows, ladderTarget, LEVEL_IDS, UI, LANG4 } from '../journey.js';
import { PIECES } from '../pieces/index.js';

const bodies = ['sun', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'].map(id => ({ id, color: '#fff', names: { en: id, zh: id, es: id, pt: id } }));
const st = o => ({ level: 'solar-system', piece: null, body: null, pieces: PIECES, bodies, ...o });

test('every level, biggest first, and the planets are always listed', () => {
  for (const level of LEVEL_IDS) {
    const rows = ladderRows(st({ level }));
    assert.deepEqual(rows.filter(r => r.depth === 0).map(r => r.id.slice(2)), LEVEL_IDS);
    assert.equal(rows.filter(r => r.id.startsWith('B:')).length, 9, level);
    assert.equal(rows.filter(r => r.here).length, 1);
    assert.ok(rows.find(r => r.here).id === 'L:' + level);
  }
});
test('only the current level shows its pieces; a piece named like its level has no row', () => {
  const g = ladderRows(st({ level: 'galaxy' })).filter(r => r.id.startsWith('P:')).map(r => r.id);
  assert.deepEqual(g.sort(), ['P:milky-way', 'P:sgr-a-star']);
  const lg = ladderRows(st({ level: 'local-group' })).filter(r => r.id.startsWith('P:')).map(r => r.id);
  assert.deepEqual(lg, ['P:andromeda']);
  assert.ok(!ladderRows(st({ level: 'universe' })).some(r => r.id === 'P:observable-universe'));
  assert.equal(ladderRows(st()).filter(r => r.id.startsWith('P:')).length, 0);
});
test('the highlighted row follows the open piece or planet', () => {
  const on = o => ladderRows(st(o)).filter(r => r.on).map(r => r.id);
  assert.deepEqual(on({ level: 'galaxy' }), ['L:galaxy']);
  assert.deepEqual(on({ level: 'galaxy', piece: 'sgr-a-star' }), ['P:sgr-a-star']);
  assert.deepEqual(on({ level: 'local-group', piece: 'local-group' }), ['L:local-group']);
  assert.deepEqual(on({ body: 'saturn' }), ['B:saturn']);
});
test('click targets: jump any distance, with the right direction', () => {
  assert.deepEqual(ladderTarget('L:universe', st()), { go: 'universe', dir: 'up' });
  assert.deepEqual(ladderTarget('L:galaxy', st({ level: 'universe' })), { go: 'galaxy', dir: 'down' });
  assert.deepEqual(ladderTarget('B:earth', st({ level: 'universe' })), { select: 'earth' });
  assert.deepEqual(ladderTarget('P:andromeda', st({ level: 'local-group' })), { open: 'andromeda' });
  // same level again: open its twin piece, close an open piece, or nothing · 同一层级
  assert.deepEqual(ladderTarget('L:universe', st({ level: 'universe' })), { open: 'observable-universe' });
  assert.deepEqual(ladderTarget('L:universe', st({ level: 'universe', piece: 'observable-universe' })), { close: true });
  assert.deepEqual(ladderTarget('L:galaxy', st({ level: 'galaxy', piece: 'sgr-a-star' })), { close: true });
  assert.equal(ladderTarget('L:galaxy', st({ level: 'galaxy' })), null);
  assert.equal(ladderTarget('L:nowhere', st()), null);
});
test('ladder text exists in all four languages', () => {
  for (const k of ['ladder', 'goTo', 'ladderShort', 'ladderHint', 'vrMenu']) for (const l of LANG4) assert.ok(UI[k][l], k + ' ' + l);
});
