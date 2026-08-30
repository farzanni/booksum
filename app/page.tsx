import Link from "next/link";
import { books } from "@/data/books";

export default function HomePage() {
  return (
    <main className="container">
      <header className="site-header">
        <h1>خلاصه‌کتاب</h1>
        <p>۱۰ کتاب برتر جهان — خلاصهٔ فارسی</p>
      </header>

      <section className="grid">
        {books.map((book) => (
          <Link key={book.slug} className="card" href={`/books/${book.slug}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="cover" src={book.cover} alt={`${book.titleFa} اثر ${book.author}`} loading="lazy" />
            <div className="meta">
              <div className="title" lang="fa">{book.titleFa}</div>
              <div className="author" lang="fa">{book.author}</div>
              <div className="title-en">{book.title}</div>
            </div>
          </Link>
        ))}
      </section>

      <footer className="footer">
        ساخته‌شده با عشق — زیربنایی برای یک کتابخانهٔ بزرگ‌تر
      </footer>
    </main>
  );
}
