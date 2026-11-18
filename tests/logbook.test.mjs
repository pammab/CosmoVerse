import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RANKS, LOG_UI, streakText, fill, rankOf, nextRank, dayKey, placeOfDay, tomorrowKey, nextStreak, liveStreak, addStamp } from '../logbook.js';

const L4 = ['en', 'zh', 'es', 'pt'];
test('logbook text and ranks in four languages; ranks rise with stamps', () => {
  for (const [k, v] of Object.entries(LOG_UI)) for (const l of L4) assert.ok(v[l]?.trim(), k + ' ' + l);
  for (const r of RANKS) for (const l of L4) assert.ok(r.name[l]);
  assert.equal(rankOf(0).name.en, 'Cadet'); assert.equal(rankOf(6).name.en, 'Navigator'); assert.equal(rankOf(23).name.en, 'Voyager'); assert.equal(rankOf(29).name.en, 'Cosmic Explorer');
  assert.equal(nextRank(5).at, 6); assert.equal(nextRank(30), null);
  assert.deepEqual(fill(LOG_UI.explored, { n: 3, t: 29 }), { en: '3 / 29 explored', zh: '已探索 3 / 29', es: '3 / 29 explorados', pt: '3 / 29 explorados' });
});
test('one stamp per place, dated the first visit; unknown places refused', () => {
  const book = {};
  assert.equal(addStamp(book, 'B:mars', '2026-11-17'), true); assert.equal(addStamp(book, 'B:mars', '2026-11-18'), false);
  assert.equal(book['B:mars'], '2026-11-17'); assert.equal(addStamp(book, 'B:pluto', '2026-11-17', id => id !== 'B:pluto'), false);
});
test('place of the day: same all day, changes daily, visits every place before repeating', () => {
  const places = Array.from({ length: 29 }, (_, i) => 'P:p' + i);
  assert.equal(placeOfDay(places, '2026-11-17'), placeOfDay(places, '2026-11-17'));
  assert.notEqual(placeOfDay(places, '2026-11-17'), placeOfDay(places, '2026-11-18'));
  const seen = new Set(); let k = '2026-11-17'; for (let i = 0; i < 29; i++) { seen.add(placeOfDay(places, k)); k = tomorrowKey(k); }
  assert.equal(seen.size, 29);
  assert.equal(tomorrowKey('2026-12-31'), '2027-01-01'); assert.match(dayKey(new Date(2026, 0, 5)), /^2026-01-05$/);
});
test('streak: +1 on consecutive days, back to 1 after a gap, unchanged twice in a day; shown as 0 once a day is missed', () => {
  let s = nextStreak({}, '2026-11-17'); assert.deepEqual(s, { last: '2026-11-17', streak: 1 });
  s = nextStreak(s, '2026-11-18'); assert.equal(s.streak, 2);
  assert.deepEqual(nextStreak(s, '2026-11-18'), s);
  assert.equal(nextStreak(s, '2026-11-21').streak, 1);
  assert.equal(liveStreak(s, '2026-11-19'), 2); assert.equal(liveStreak(s, '2026-11-20'), 0); assert.equal(liveStreak({}, '2026-11-20'), 0);
});
test('streak wording: none / day 1 / N days', () => { assert.equal(streakText(0).en, 'Start a streak today'); assert.equal(streakText(1).en, 'Day 1 of your streak'); assert.equal(streakText(3).pt, '3 dias seguidos'); });
