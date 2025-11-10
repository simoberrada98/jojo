/**
 * Script: synthesize-reviews-from-serpapi.ts
 *
 * Reads two CSV sources:
 *  - data/serpapi_amazon_data_rows.csv (Amazon search results by GTIN)
 *  - data/serpapi_responses_rows.csv (SerpAPI responses, including amazon_reviews where available)
 *
 * Produces an enriched reviews CSV at data/product_reviews_rows.csv with:
 *  - Product identifiers (GTIN, ASIN)
 *  - Original and processed review text
 *  - Individual rating and aggregated rating
 *  - Date and helpfulness metrics
 *  - Synthesized sentiment score
 *  - Key feature mentions
 *  - Source metadata (provider, engine, request info)
 *  - Clear indication of synthesized vs original data
 */

import fs from 'fs';
import path from 'path';
import type { SerpApiResult } from '@/lib/services/serpapi.service';

type RowObj = Record<string, string>;

// Robust CSV parser: quoted fields, embedded commas, newlines, escaped quotes
function parseCsv(content: string): { headers: string[]; rows: string[][] } {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let wasInQuotes = false;

  const pushField = () => {
    const v = wasInQuotes ? field.replace(/""/g, '"') : field;
    row.push(v);
    field = '';
    wasInQuotes = false;
  };

  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    if (inQuotes) {
      if (ch === '"') {
        const next = content[i + 1];
        if (next === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
          wasInQuotes = true;
        }
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        pushField();
      } else if (ch === '\r') {
        // ignore CR (handle CRLF in \n)
      } else if (ch === '\n') {
        pushField();
        rows.push(row);
        row = [];
      } else {
        field += ch;
      }
    }
  }

  if (field.length > 0 || row.length > 0) {
    pushField();
    rows.push(row);
  }

  if (rows.length === 0) return { headers: [], rows: [] };
  const headers = rows[0];
  const dataRows = rows.slice(1);
  return { headers, rows: dataRows };
}

function toObjects(headers: string[], rows: string[][]): RowObj[] {
  return rows.map((r) => {
    const o: RowObj = {};
    headers.forEach((h, i) => (o[h] = r[i] ?? ''));
    return o;
  });
}

function escapeCsvField(field: unknown): string {
  if (field === null || field === undefined) return '';
  const str = String(field);
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

// Basic text cleaning/normalization while preserving an original copy elsewhere
function cleanText(input: string): string {
  let s = input || '';
  // Decode a few common HTML entities
  s = s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  // Normalize whitespace
  s = s.replace(/\s+/g, ' ').trim();
  // Strip control characters
  s = s.replace(/[\u0000-\u001F\u007F]/g, '');
  return s;
}

// Simple sentiment analysis (lexicon-based) returning score in [-1, 1]
const POSITIVE_WORDS = new Set([
  'good','great','excellent','amazing','awesome','fantastic','love','loved','like','liked','positive','fast','quiet','powerful','efficient','easy','recommend','recommended','best','happy','satisfied','quality','reliable','solid','worth','value'
]);
const NEGATIVE_WORDS = new Set([
  'bad','poor','terrible','awful','hate','hated','dislike','disliked','negative','slow','noisy','loud','weak','inefficient','hard','difficult','bug','broken','worst','unhappy','unsatisfied','cheap','unreliable','fragile','waste','overpriced'
]);
function sentimentScore(text: string): number {
  if (!text) return 0;
  const words = text.toLowerCase().match(/[a-z']+/g) || [];
  let pos = 0, neg = 0;
  for (const w of words) {
    if (POSITIVE_WORDS.has(w)) pos++;
    else if (NEGATIVE_WORDS.has(w)) neg++;
  }
  const total = pos + neg;
  if (total === 0) return 0;
  const score = (pos - neg) / total; // [-1,1]
  return Math.max(-1, Math.min(1, score));
}

// Keyword extraction for key features
const STOPWORDS = new Set([
  'the','a','an','and','or','but','if','on','in','to','for','of','with','this','that','it','is','are','was','were','be','been','by','at','from','as','not','no','very','so','too','just','also','can','could','should','would','will','about','into','than','then','up','down','out','over','under','again','more','most','some','such','only','own','same','any','both','each','few','other'
]);
const DOMAIN_FEATURE_HINTS = new Set([
  'performance','noise','power','setup','shipping','packaging','quality','support','warranty','temperature','efficiency','hash','rate','algorithm','fan','psu','voltage','noise','durability','reliability','cost','value'
]);
function extractKeyFeatures(text: string, limit = 6): string[] {
  if (!text) return [];
  const words = (text.toLowerCase().match(/[a-z0-9]+/g) || []).filter(
    (w) => w.length > 3 && !STOPWORDS.has(w)
  );
  const freq = new Map<string, number>();
  for (const w of words) {
    const scoreBoost = DOMAIN_FEATURE_HINTS.has(w) ? 2 : 1;
    freq.set(w, (freq.get(w) || 0) + scoreBoost);
  }
  const sorted = [...freq.entries()].sort((a, b) => b[1] - a[1]);
  return sorted.slice(0, limit).map(([w]) => w);
}

function safeJsonParse<T>(s: string): T | null {
  try { return JSON.parse(s); } catch { return null; }
}

function extractAsinFromLink(link?: string): string | null {
  if (!link) return null;
  const m = link.match(/\/dp\/([A-Z0-9]{8,10})/i) || link.match(/asin=([A-Z0-9]{8,10})/i);
  return m ? m[1].toUpperCase() : null;
}

function extractAsinFromSearch(raw: SerpApiResult): string | null {
  const organic = raw?.organic_results || [];
  for (const r of organic) {
    if (r.asin && typeof r.asin === 'string') return String(r.asin).toUpperCase();
    const l = r.link_clean || r.link;
    const asin = extractAsinFromLink(l);
    if (asin) return asin;
  }
  return null;
}

function normalizeRating(n: number): number | null {
  if (!isFinite(n) || n <= 0) return null;
  // Clamp to 1-5
  const v = Math.max(1, Math.min(5, Math.round(n * 10) / 10));
  return v;
}

function summarizeInsights(reviews: string[]): string {
  const all = cleanText(reviews.join(' \n '));
  const feats = extractKeyFeatures(all, 8);
  const s = sentimentScore(all);
  const tone = s > 0.25 ? 'mostly positive' : s < -0.25 ? 'mostly negative' : 'mixed';
  const parts = [] as string[];
  if (all.length > 0) parts.push(`Overall tone: ${tone} (score ${s.toFixed(2)}).`);
  if (feats.length > 0) parts.push(`Common themes: ${feats.join(', ')}.`);
  return parts.join(' ');
}

type ReviewOut = {
  gtin: string;
  asin: string | null;
  source: string; // 'amazon-serpapi'
  provider: string; // 'serpapi'
  engine: string; // 'amazon_reviews' or 'amazon'
  external_id: string | null;
  title: string | null;
  comment_original: string;
  comment_processed: string;
  rating: number | null;
  aggregated_rating: number | null;
  helpful_count: number | null;
  date: string | null;
  is_verified_purchase: boolean | null;
  is_approved: boolean;
  sentiment_score: number;
  key_feature_mentions: string[];
  summary_insights: string;
  collected_at: string | null;
  request_id: string | null;
  request_url: string | null;
  response_size_bytes: string | null;
  fetch_duration_ms: string | null;
  status_code: string | null;
  raw_response_reference: string; // truncated marker or id
  is_synthesized: boolean;
};

function buildExternalId(asin: string | null, title: string | null, date: string | null): string | null {
  if (!asin && !title && !date) return null;
  const base = `${asin ?? ''}|${cleanText(title ?? '')}|${date ?? ''}`;
  // Simple hash
  let h = 0;
  for (let i = 0; i < base.length; i++) h = (h * 31 + base.charCodeAt(i)) >>> 0;
  return `serpapi-${asin ?? 'unknown'}-${h.toString(16)}`;
}

async function main() {
  const root = process.cwd();
  const amazonSearchCsvPath = path.resolve(root, 'data', 'serpapi_amazon_data_rows.csv');
  const responsesCsvPath = path.resolve(root, 'data', 'serpapi_responses_rows.csv');
  const outCsvPath = path.resolve(root, 'data', 'product_reviews_rows.csv');

  const amazonSearchRaw = fs.readFileSync(amazonSearchCsvPath, 'utf8');
  const responsesRaw = fs.readFileSync(responsesCsvPath, 'utf8');

  const { headers: searchHeaders, rows: searchRows } = parseCsv(amazonSearchRaw);
  const { headers: respHeaders, rows: respRows } = parseCsv(responsesRaw);

  const searchObjs = toObjects(searchHeaders, searchRows);
  const respObjs = toObjects(respHeaders, respRows);

  // Map GTIN -> ASIN inferred from Amazon search raw_response
  const asinByGtin = new Map<string, string>();
  for (const r of searchObjs) {
    const raw = safeJsonParse<SerpApiResult>(r['raw_response']);
    const asin = raw ? extractAsinFromSearch(raw) : null;
    if (asin) asinByGtin.set(r['gtin'], asin);
  }

  // Collect reviews grouped per product (gtin or asin)
  const reviewsByProduct = new Map<string, ReviewOut[]>();

  for (const r of respObjs) {
    const engine = r['engine'];
    const provider = r['provider'];
    const gtin = r['gtin'] || r['query'] || '';
    const status = r['status_code'];
    const raw = safeJsonParse<SerpApiResult>(r['raw_response']);
    const asinFromUrl = extractAsinFromLink(r['request_url']);
    const asin = asinFromUrl || asinByGtin.get(gtin) || null;

    if (engine !== 'amazon_reviews' || status !== '200' || !raw) {
      // Skip non-review responses here; we'll add synthesized rows later from search file if needed
      continue;
    }

    const reviews =
      raw?.reviews_results || raw?.product_results?.reviews || raw?.reviews || [];

    const outs: ReviewOut[] = [];
    for (const rv of reviews) {
      const title: string | null = rv.title ?? null;
      const original = (rv.snippet ?? rv.body ?? '') as string;
      const processed = cleanText(original);
      const rating = normalizeRating(Number(rv.rating ?? 0));
      const helpful = Number(rv.helpful_count ?? 0) || null;
      const date = rv.date ? new Date(rv.date).toISOString() : null;
      const verified = !!(typeof rv.source === 'string' && /verified/i.test(rv.source));
      const sent = sentimentScore(processed);
      const feats = extractKeyFeatures(processed);
      const extId = buildExternalId(asin, title, date);

      outs.push({
        gtin,
        asin,
        source: 'amazon-serpapi',
        provider,
        engine,
        external_id: extId,
        title,
        comment_original: original,
        comment_processed: processed,
        rating,
        aggregated_rating: null, // fill after grouping
        helpful_count: helpful,
        date,
        is_verified_purchase: verified,
        is_approved: true,
        sentiment_score: sent,
        key_feature_mentions: feats,
        summary_insights: '', // fill after grouping
        collected_at: r['collected_at'] || null,
        request_id: r['request_id'] || null,
        request_url: r['request_url'] || null,
        response_size_bytes: r['response_size_bytes'] || null,
        fetch_duration_ms: r['fetch_duration_ms'] || null,
        status_code: r['status_code'] || null,
        raw_response_reference: 'serpapi_responses_rows.raw_response',
        is_synthesized: false,
      });
    }

    if (outs.length > 0) {
      const key = asin || gtin;
      const list = reviewsByProduct.get(key) || [];
      reviewsByProduct.set(key, list.concat(outs));
    }
  }

  // For products with search data but no review rows, add synthesized placeholder rows
  for (const s of searchObjs) {
    const gtin = s['gtin'];
    const raw = safeJsonParse<SerpApiResult>(s['raw_response']);
    const asin = raw ? extractAsinFromSearch(raw) : null;
    const key = asin || gtin;
    if (!key) continue;
    if (!reviewsByProduct.has(key)) {
      const title = raw?.organic_results?.[0]?.title || null;
      const summary = 'No Amazon review content available via SerpAPI; insights synthesized from search metadata.';
      const feats = extractKeyFeatures(cleanText(String(title ?? '')));

      const synthesized: ReviewOut = {
        gtin,
        asin: asin || null,
        source: 'amazon-serpapi',
        provider: 'serpapi',
        engine: 'amazon',
        external_id: buildExternalId(asin || null, title, null),
        title,
        comment_original: '',
        comment_processed: '',
        rating: null,
        aggregated_rating: null,
        helpful_count: null,
        date: null,
        is_verified_purchase: null,
        is_approved: true,
        sentiment_score: 0,
        key_feature_mentions: feats,
        summary_insights: summary,
        collected_at: s['last_fetched_at'] || null,
        request_id: null,
        request_url: null,
        response_size_bytes: null,
        fetch_duration_ms: null,
        status_code: null,
        raw_response_reference: 'serpapi_amazon_data_rows.raw_response',
        is_synthesized: true,
      };
      reviewsByProduct.set(key, [synthesized]);
    }
  }

  // Compute aggregated rating and summary per product
  for (const [key, list] of reviewsByProduct.entries()) {
    const ratings = list.map((r) => r.rating).filter((v): v is number => typeof v === 'number');
    const aggregated = ratings.length > 0
      ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
      : null;
    const texts = list.map((r) => r.comment_processed).filter(Boolean);
    const summary = summarizeInsights(texts);
    for (const r of list) {
      r.aggregated_rating = aggregated;
      r.summary_insights = summary;
    }
  }

  // Flatten and write output CSV
  const outHeaders = [
    'gtin',
    'asin',
    'source',
    'provider',
    'engine',
    'external_id',
    'title',
    'comment_original',
    'comment_processed',
    'rating',
    'aggregated_rating',
    'helpful_count',
    'date',
    'is_verified_purchase',
    'is_approved',
    'sentiment_score',
    'key_feature_mentions',
    'summary_insights',
    'collected_at',
    'request_id',
    'request_url',
    'response_size_bytes',
    'fetch_duration_ms',
    'status_code',
    'raw_response_reference',
    'is_synthesized',
  ];

  const lines: string[] = [];
  lines.push(outHeaders.join(','));
  for (const list of reviewsByProduct.values()) {
    for (const r of list) {
      const row = [
        escapeCsvField(r.gtin),
        escapeCsvField(r.asin),
        escapeCsvField(r.source),
        escapeCsvField(r.provider),
        escapeCsvField(r.engine),
        escapeCsvField(r.external_id),
        escapeCsvField(r.title),
        escapeCsvField(r.comment_original),
        escapeCsvField(r.comment_processed),
        escapeCsvField(r.rating),
        escapeCsvField(r.aggregated_rating),
        escapeCsvField(r.helpful_count),
        escapeCsvField(r.date),
        escapeCsvField(r.is_verified_purchase),
        escapeCsvField(r.is_approved),
        escapeCsvField(r.sentiment_score.toFixed(2)),
        escapeCsvField(r.key_feature_mentions.join('|')),
        escapeCsvField(r.summary_insights),
        escapeCsvField(r.collected_at),
        escapeCsvField(r.request_id),
        escapeCsvField(r.request_url),
        escapeCsvField(r.response_size_bytes),
        escapeCsvField(r.fetch_duration_ms),
        escapeCsvField(r.status_code),
        escapeCsvField(r.raw_response_reference),
        escapeCsvField(r.is_synthesized),
      ];
      lines.push(row.join(','));
    }
  }

  fs.writeFileSync(outCsvPath, lines.join('\n'), 'utf8');
  console.log(`✅ Wrote ${outCsvPath} with ${lines.length - 1} rows`);
}

main().catch((err) => {
  console.error('❌ Failed to synthesize reviews from SerpAPI CSVs:', err);
  process.exit(1);
});

