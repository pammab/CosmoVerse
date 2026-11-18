import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS } from '../events.js';
import { CAL_UI, upcoming, isUpcoming, countdown, fmtDate } from '../calendar.js';

const L4 = ['en', 'zh', 'es', 'pt'];
test('every event: 4 languages, a NASA/ESA source page, a valid date and a place to fly', () => {
  const ids = new Set();
  for (const e of EVENTS) {
    assert.ok(!ids.has(e.id), 'unique ' + e.id); ids.add(e.id);
    for (const k of ['title', 'line']) for (const l of L4) assert.ok(e[k][l]?.trim(), `${e.id}.${k}.${l}`);
    assert.match(e.source.url, /^https:\/\/(science\.nasa\.gov|www\.nasa\.gov|www\.esa\.int)\//, e.id);
    assert.match(e.date, e.precision === 'month' ? /^\d{4}-\d{2}$/ : /^\d{4}-\d{2}-\d{2}$/, e.id);
    assert.ok(['sky', 'mission'].includes(e.kind));
    assert.match(e.fly, /^(sun|mercury|venus|earth|mars|jupiter|saturn|uranus|neptune|L:[a-z-]+)$/, e.id);
  }
  for (const [k, v] of Object.entries(CAL_UI)) for (const l of L4) assert.ok(v[l]?.trim(), k + ' ' + l);
});
test('past events drop off by date; month dates last the whole month; the list is sorted', () => {
  const nov17 = new Date(2026, 10, 17), nov22 = new Date(2026, 10, 22), dec31 = new Date(2026, 11, 31), jan1 = new Date(2027, 0, 1);
  const bepi = EVENTS.find(e => e.id === 'bepicolombo-orbit'), clipper = EVENTS.find(e => e.id === 'europa-clipper-earth');
  assert.ok(isUpcoming(bepi, nov17)); assert.ok(isUpcoming(bepi, new Date(2026, 10, 21, 23))); assert.ok(!isUpcoming(bepi, nov22));
  assert.ok(isUpcoming(clipper, dec31)); assert.ok(!isUpcoming(clipper, jan1));
  const list = upcoming(EVENTS, nov17); assert.equal(list[0].id, 'bepicolombo-orbit');
  for (let i = 1; i < list.length; i++) assert.ok(list[i - 1].date <= list[i].date);
  assert.equal(upcoming(EVENTS, new Date(2028, 0, 1)).length, 0);
  const gem = EVENTS.find(e => e.id === 'geminids-2026');
  assert.ok(isUpcoming(gem, new Date(2026, 11, 14)), 'second peak night still listed'); assert.ok(!isUpcoming(gem, new Date(2026, 11, 15)));
});
test('countdowns and dates in four languages', () => {
  const bepi = EVENTS.find(e => e.id === 'bepicolombo-orbit'), now = new Date(2026, 10, 17);
  assert.deepEqual(countdown(bepi, now), { en: 'in 4 days', zh: '4 天后', es: 'en 4 días', pt: 'em 4 dias' });
  assert.equal(countdown(bepi, new Date(2026, 10, 20)).en, 'tomorrow'); assert.equal(countdown(bepi, new Date(2026, 10, 21)).en, 'today');
  const clipper = EVENTS.find(e => e.id === 'europa-clipper-earth');
  assert.equal(countdown(clipper, now).en, 'next month'); assert.equal(countdown(clipper, new Date(2026, 11, 5)).en, 'this month');
  assert.match(fmtDate(bepi, 'en'), /21 November 2026/); assert.match(fmtDate(bepi, 'pt'), /21 de novembro de 2026/);
  assert.match(fmtDate(clipper, 'es'), /diciembre de 2026/);
});
