import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NEWS, NEWS_UI, newestNews, unseenCount } from '../news.js';
import { PIECES } from '../pieces/index.js';

const L4 = ['en', 'zh', 'es', 'pt'];
test('8–12 stories, each from an official news page, dated, in four languages', () => {
  assert.ok(NEWS.length >= 8 && NEWS.length <= 12);
  const ids = new Set(NEWS.map(n => n.id)); assert.equal(ids.size, NEWS.length);
  for (const n of NEWS) {
    assert.match(n.source.url, /^https:\/\/(www\.)?(nasa\.gov|science\.nasa\.gov|jpl\.nasa\.gov|esa\.int|esawebb\.org|esahubble\.org|eso\.org|noirlab\.edu|stsci\.edu)\//, n.id);
    assert.match(n.date, /^2026-(0[89]|1[01])-\d{2}$/, n.id + ' within the last ~3 months');
    for (const k of ['title', 'summary']) for (const l of L4) assert.ok(n[k][l]?.trim(), `${n.id}.${k}.${l}`);
  }
  assert.ok(new Set(NEWS.map(n => n.source.name)).size >= 4, 'at least four sources');
  for (const [k, v] of Object.entries(NEWS_UI)) for (const l of L4) assert.ok(v[l]?.trim(), k + ' ' + l);
});
test('"Fly there" targets exist in CosmoVerse', () => {
  const pieces = new Set(PIECES.map(p => p.id)), planets = ['sun', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
  for (const n of NEWS) if (n.fly) assert.ok(n.fly.startsWith('P:') ? pieces.has(n.fly.slice(2)) : planets.includes(n.fly), n.id + ' → ' + n.fly);
});
test('newest first; "new since your last visit" counts stories after the last seen date', () => {
  const s = newestNews(); for (let i = 1; i < s.length; i++) assert.ok(s[i - 1].date >= s[i].date);
  assert.equal(unseenCount(null), NEWS.length);
  assert.equal(unseenCount(s[0].date), 0);
  assert.equal(unseenCount('2026-10-01'), NEWS.filter(n => n.date > '2026-10-01').length);
});
