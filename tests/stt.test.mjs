import test from 'node:test'; import assert from 'node:assert/strict';
import { stt, STT_MAX_BYTES } from '../api/stt.js';
test('no key → config (the page then says voice needs the online version)', async () => {
  delete process.env.ELEVENLABS_API_KEY; const r = await stt({ audio: Buffer.alloc(2000), type: 'audio/webm' }); assert.equal(r.json.error, 'config');
});
test('sends model_id, language_code and the audio as multipart to ElevenLabs; returns the text', async () => {
  process.env.ELEVENLABS_API_KEY = 'k'; const f = globalThis.fetch; let url, opts;
  globalThis.fetch = async (u, o) => { url = u; opts = o; return { ok: true, status: 200, json: async () => ({ text: '  go to the galaxy ' }) }; };
  try {
    const r = await stt({ audio: Buffer.alloc(3000, 1), type: 'audio/webm;codecs=opus', lang: 'pt-BR' });
    assert.equal(url, 'https://api.elevenlabs.io/v1/speech-to-text'); assert.equal(opts.headers['xi-api-key'], 'k');
    assert.equal(opts.body.get('model_id'), 'scribe_v2'); assert.equal(opts.body.get('language_code'), 'pt'); assert.equal(opts.body.get('file').size, 3000);
    assert.deepEqual(r, { status: 200, json: { text: 'go to the galaxy' } });
  } finally { globalThis.fetch = f; delete process.env.ELEVENLABS_API_KEY; }
});
test('bad input is refused before calling the API; API errors map to codes', async () => {
  process.env.ELEVENLABS_API_KEY = 'k'; const f = globalThis.fetch; let called = 0;
  globalThis.fetch = async () => { called++; return { ok: false, status: 429, json: async () => ({}) }; };
  try {
    assert.equal((await stt({ audio: Buffer.alloc(0), type: 'audio/webm' })).json.error, 'bad');
    assert.equal((await stt({ audio: Buffer.alloc(STT_MAX_BYTES + 1), type: 'audio/webm' })).json.error, 'bad');
    assert.equal((await stt({ audio: Buffer.alloc(10), type: 'text/html' })).json.error, 'bad');
    assert.equal(called, 0);
    assert.equal((await stt({ audio: Buffer.alloc(10), type: 'audio/mp4' })).json.error, 'rate');
  } finally { globalThis.fetch = f; delete process.env.ELEVENLABS_API_KEY; }
});
