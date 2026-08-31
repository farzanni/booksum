import Link from "next/link";
import { notFound } from "next/navigation";
import { books, getBook } from "@/data/books";

export function generateStaticParams() {
  return books.map((b) => ({ slug: b.slug }));
}

export default async function BookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const book = getBook(slug);
  if (!book) notFound();

  return (
    <main className="detail">
      <Link className="back" href="/">
        ← بازگشت به فهرست
      </Link>

      <div className="detail-head">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={book.cover} alt={`${book.titleFa} اثر ${book.authorFa}`} />
        <div className="info">
          <h1 lang="fa">{book.titleFa}</h1>
          <div className="author" lang="fa">{book.authorFa}</div>
          <div className="title-en">{book.title} — {book.author}</div>
        </div>
      </div>

      <article className="detail-body">{book.persian}</article>

      <footer className="footer">خلاصهٔ فارسی · {book.title}</footer>
    </main>
  );
}
