// Generates data/books.ts and downloads covers into public/covers/.
// Covers are served from our OWN domain (Vercel) so they load in Iran —
// we never reference external cover URLs at runtime.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "..", "blinkist-books"); // ~/dev/blinkist-books
const OUT = path.join(ROOT, "data");
const COVERS = path.join(ROOT, "public", "covers");

// slug -> display + Open Library search query (used only at build time to fetch the image)
const BOOKS = [
  { slug: "man-s-search-for-meaning", title: "Man's Search for Meaning", titleFa: "در جستجوی معنا", author: "Viktor Frankl", authorFa: "ویکتور فرانکل", ol: "mans search for meaning frankl" },
  { slug: "the-alchemist", title: "The Alchemist", titleFa: "کیمیاگر", author: "Paulo Coelho", authorFa: "پائولو کوئلیو", ol: "the alchemist paulo coelho" },
  { slug: "the-art-of-war", title: "The Art of War", titleFa: "هنر جنگ", author: "Sun Tzu", authorFa: "سون‌تزو", ol: "art of war sun tzu" },
  { slug: "meditations", title: "Meditations", titleFa: "تأملات", author: "Marcus Aurelius", authorFa: "مارکوس اورلیوس", ol: "meditations marcus aurelius" },
  { slug: "sapiens", title: "Sapiens", titleFa: "ساپینس", author: "Yuval Noah Harari", authorFa: "یووال نوح هراری", ol: "sapiens a brief history of humankind harari" },
  { slug: "1984", title: "1984", titleFa: "۱۹۸۴", author: "George Orwell", authorFa: "جورج اورول", ol: "1984 george orwell" },
  { slug: "the-little-prince", title: "The Little Prince", titleFa: "شازده کوچولو", author: "Antoine de Saint-Exupéry", authorFa: "آنتوان دو سنت‌اگزوپری", ol: "the little prince saint exupery" },
  { slug: "don-quixote", title: "Don Quixote", titleFa: "دون کیشوت", author: "Miguel de Cervantes", authorFa: "میگل ده سروانتس", ol: "don quixote cervantes" },
  { slug: "one-hundred-years-of-solitude", title: "One Hundred Years of Solitude", titleFa: "صد سال تنهایی", author: "Gabriel García Márquez", authorFa: "گابریل گارسیا مارکز", ol: "one hundred years of solitude garcia marquez" },
  { slug: "the-republic", title: "The Republic", titleFa: "جمهوری", author: "Plato", authorFa: "افلاطون", ol: "republic plato" },
];

function readPersian(slug) {
  const p = path.join(SRC, "persian", `${slug}.fa.txt`);
  if (!fs.existsSync(p)) return null;
  const text = fs.readFileSync(p, "utf8");
  const lines = text.split("\n").filter((l) => !l.startsWith("# ") && !l.startsWith("===CHUNK"));
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

// Returns an Open Library cover URL (fetched only at build time on this machine).
async function fetchCoverUrl(query) {
  try {
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=1&fields=cover_i,cover_edition_key`;
    const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
    if (!res.ok) return null;
    const j = await res.json();
    const doc = j?.docs?.[0];
    if (!doc) return null;
    const id = doc.cover_i || doc.cover_edition_key;
    if (!id) return null;
    return `https://covers.openlibrary.org/b/id/${id}-L.jpg`;
  } catch {
    return null;
  }
}

async function downloadImage(url, dest) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return false;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 500) return false; // tiny/empty guard
    fs.writeFileSync(dest, buf);
    return true;
  } catch {
    return false;
  }
}

// Self-contained Persian SVG cover (no network, no copyright) used when a real cover can't be fetched.
function writeSvgCover(dest, titleFa, authorFa) {
  const wrap = (text, max) => {
    const words = text.split(" ");
    const lines = [];
    let cur = "";
    for (const w of words) {
      if (cur && (cur + " " + w).length > max) {
        lines.push(cur);
        cur = w;
      } else {
        cur = (cur + " " + w).trim();
      }
    }
    if (cur) lines.push(cur);
    return lines;
  };
  const lines = wrap(titleFa, 14);
  const fs2 = 30 - Math.min(10, (lines.length - 1) * 4);
  const lh = fs2 + 10;
  const totalH = lines.length * lh;
  const startY = 300 - totalH / 2 + fs2;
  const titleSvg = lines
    .map((ln, i) => `<text x="200" y="${startY + i * lh}" fill="#f5d38b" font-size="${fs2}" font-family="serif" font-weight="bold" text-anchor="middle" direction="rtl" unicode-bidi="embed">${ln}</text>`)
    .join("\n  ");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600" dir="rtl">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#1e293b"/><stop offset="1" stop-color="#0f172a"/></linearGradient></defs>
  <rect width="400" height="600" fill="url(#g)"/>
  <rect x="22" y="22" width="356" height="556" fill="none" stroke="#f5d38b" stroke-width="2" rx="6"/>
  ${titleSvg}
  <text x="200" y="${startY + totalH / 2 + 34}" fill="#cbd5e1" font-size="16" font-family="sans-serif" text-anchor="middle" direction="rtl" unicode-bidi="embed">${authorFa}</text>
</svg>`;
  fs.writeFileSync(dest, svg);
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  fs.mkdirSync(COVERS, { recursive: true });
  const out = [];
  for (const b of BOOKS) {
    const fa = readPersian(b.slug);
    if (!fa) {
      console.error(`MISSING persian for ${b.slug}`);
      continue;
    }
    const jpgDest = path.join(COVERS, `${b.slug}.jpg`);
    const svgDest = path.join(COVERS, `${b.slug}.svg`);
    const url = await fetchCoverUrl(b.ol);
    let cover;
    if (url && (await downloadImage(url, jpgDest))) {
      cover = `/covers/${b.slug}.jpg`;
      console.log(`OK ${b.slug} (cover: local JPG)`);
    } else {
      writeSvgCover(svgDest, b.titleFa, b.authorFa);
      cover = `/covers/${b.slug}.svg`;
      console.log(`OK ${b.slug} (cover: local SVG fallback)`);
    }
    out.push({
      slug: b.slug,
      title: b.title,
      titleFa: b.titleFa,
      author: b.author,
      authorFa: b.authorFa,
      cover,
      persian: fa,
    });
  }
  const ts =
    `// AUTO-GENERATED by scripts/gen-data.mjs — do not edit by hand.\n` +
    `export type Book = {\n  slug: string;\n  title: string;\n  titleFa: string;\n  author: string;\n  authorFa: string;\n  cover: string;\n  persian: string;\n};\n\n` +
    `export const books: Book[] = ${JSON.stringify(out, null, 2)};\n\n` +
    `export function getBook(slug: string): Book | undefined {\n  return books.find((b) => b.slug === slug);\n}\n`;
  fs.writeFileSync(path.join(OUT, "books.ts"), ts);
  console.log(`\nWrote data/books.ts with ${out.length} books.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
