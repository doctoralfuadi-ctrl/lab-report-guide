// MyMemory-based dynamic translation service.
// - Free, no API key. Per-string GET requests with localStorage caching.
// - Source text MUST be English (the canonical strings live in i18n.js → messages.en).
// - We translate every string leaf of a (possibly nested) object tree in parallel
//   with limited concurrency, then return a fully translated mirror of the input.

import { MYMEMORY_CODE } from "../data/languages";

const CACHE_KEY = "midscope_translations_v1";
const MAX_CHARS = 480; // MyMemory hard-limits ~500; stay safely under it
const CONCURRENCY = 8;

function loadCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}"); }
  catch { return {}; }
}

function saveCache(cache) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); }
  catch { /* quota exceeded — silently drop */ }
}

const cache = loadCache();
let savePending = false;
function schedulePersist() {
  if (savePending) return;
  savePending = true;
  setTimeout(() => { saveCache(cache); savePending = false; }, 300);
}

// Heuristic: should we even attempt to translate this string?
// Skip URLs, pure numbers/punctuation, and very long blobs (split or pass through).
function shouldTranslate(text) {
  if (typeof text !== "string") return false;
  const trimmed = text.trim();
  if (trimmed.length === 0) return false;
  if (/^https?:\/\//i.test(trimmed)) return false;
  if (/^[\d\s\W_]+$/.test(trimmed)) return false;          // numbers/punct only
  if (/^[\d.,\s$£€¥%]+$/.test(trimmed)) return false;       // currency
  if (trimmed.length > MAX_CHARS) return false;             // too long for MyMemory
  return true;
}

async function translateOne(text, targetLang) {
  if (!shouldTranslate(text)) return text;

  const tgt = MYMEMORY_CODE[targetLang] || targetLang;
  const key = `${tgt}::${text}`;
  if (cache[key]) return cache[key];

  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${tgt}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return text;
    const data = await res.json();
    const translated = data?.responseData?.translatedText;
    if (typeof translated === "string" && translated.length > 0 && !translated.startsWith("MYMEMORY WARNING")) {
      // MyMemory sometimes returns the source text with .toUpperCase() on quota
      const looksGood = translated.toLowerCase() !== text.toLowerCase() || tgt === "en";
      const out = looksGood ? translated : text;
      cache[key] = out;
      schedulePersist();
      return out;
    }
    return text;
  } catch {
    return text;
  }
}

/**
 * Recursively translate every string-leaf in `obj`, preserving structure.
 * Keys starting with "_" (e.g. _locale, _voiceLocale) are passed through unchanged.
 * Calls onProgress(done, total) as work completes.
 */
export async function translateObject(obj, targetLang, onProgress) {
  if (targetLang === "en") return obj;

  // 1) Walk the object, collect all (path, text) pairs
  const queue = [];
  function walk(node, path) {
    if (typeof node === "string") {
      queue.push({ path: [...path], text: node });
    } else if (Array.isArray(node)) {
      node.forEach((v, i) => walk(v, [...path, i]));
    } else if (node && typeof node === "object") {
      for (const k of Object.keys(node)) {
        if (k.startsWith("_")) continue;     // skip metadata keys
        walk(node[k], [...path, k]);
      }
    }
  }
  walk(obj, []);

  const total = queue.length;
  let done = 0;
  const results = new Array(total);

  // 2) Translate with bounded concurrency
  async function worker(startIdx) {
    for (let i = startIdx; i < total; i += CONCURRENCY) {
      const item = queue[i];
      results[i] = await translateOne(item.text, targetLang);
      done += 1;
      if (onProgress) onProgress(done, total);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, (_, i) => worker(i)));

  // 3) Reconstruct: deep-clone obj and set translated values at each path
  const out = JSON.parse(JSON.stringify(obj));
  for (let i = 0; i < total; i += 1) {
    const { path } = queue[i];
    let target = out;
    for (let p = 0; p < path.length - 1; p += 1) target = target[path[p]];
    target[path[path.length - 1]] = results[i];
  }
  return out;
}

export function clearTranslationCache() {
  try { localStorage.removeItem(CACHE_KEY); } catch { /* noop */ }
  for (const k of Object.keys(cache)) delete cache[k];
}

export function getCacheStats() {
  return { entries: Object.keys(cache).length };
}
