import React, { useState, useEffect } from 'react';
import BookCard from './components/BookCard';
import Modal from './components/Modal';

/*
  Book Finder (Create React App version)
  - Uses Open Library Search API (no key)
  - Search by title (required) and optional author
  - Pagination via API `page` param (20 results per page)
  - Shows modal with more details
*/

const OPENLIB_SEARCH = 'https://openlibrary.org/search.json';
const COVER_URL = (cover_i, size = 'M') =>
  cover_i ? `https://covers.openlibrary.org/b/id/${cover_i}-${size}.jpg` : null;

function App() {
  // form state
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');

  // results + UI state
  const [books, setBooks] = useState([]);
  const [numFound, setNumFound] = useState(0);
  const [page, setPage] = useState(1); // Open Library pages start at 1
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('relevance'); // or 'year'
  const [selected, setSelected] = useState(null); // book for modal

  // Build search URL
  const buildUrl = (titleV, authorV, p) => {
    const params = new URLSearchParams();
    if (titleV) params.append('title', titleV);
    if (authorV) params.append('author', authorV);
    params.append('page', p);
    params.append('limit', 20);
    //Example : "https://openlibrary.org/search.json?title=Harry+Potter&author=J.K.+Rowling&page=1&limit=20"
    return `${OPENLIB_SEARCH}?${params.toString()}`;
  };

  // Fetch results (call when searching or page changes)
  async function fetchResults(t, a, p = 1) {
    setLoading(true);
    setError('');
    setBooks([]);
    try {
      const url = buildUrl(t, a, p);
      console.log("url",url)
      const res = await fetch(url);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      setNumFound(data.numFound || 0); //Save total number of found results
      let docs = data.docs || []; //Store list of book result objects

      // local sort option
      if (sortBy === 'year') {
        docs = docs.slice().sort((x, y) => (x.first_publish_year || 0) - (y.first_publish_year || 0));
      }
      setBooks(docs);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  }

  // Handle form submit
  function handleSearch(e) {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a book title to search');
      return;
    }
    setPage(1); //page reset to 1.
    fetchResults(title.trim(), author.trim(), 1);
  }

  // When user changes page
  useEffect(() => {
    if (!title) return;
    fetchResults(title.trim(), author.trim(), page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sortBy]);

  const totalPages = Math.max(1, Math.ceil(numFound / 20));

  return (
    <div className="app-root">
      <header className="header">
        <h1>Book Finder</h1>
        <p className="subtitle">Search Open Library for titles — quick and simple for students.</p>
      </header>

      <main className="container">
        <form className="search-form" onSubmit={handleSearch}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Search by title (e.g., Pride and Prejudice)"
            aria-label="Book title"
            className="input"
          />
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Optional: author (e.g., Austen)"
            aria-label="Author"
            className="input"
          />

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input small">
            <option value="relevance">Sort: Relevance</option>
            <option value="year">Sort: First Publish Year (asc)</option>
          </select>

          <div className="buttons">
            <button type="submit" className="btn primary">Search</button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setTitle('');
                setAuthor('');
                setSortBy('relevance');
                setBooks([]);
                setNumFound(0);
                setError('');
                setPage(1);
              }}
            >
              Clear
            </button>
          </div>
        </form>

        <section className="results">
          {loading && <div className="msg">Loading results…</div>}
          {error && <div className="error">Error: {error}</div>}

          {!loading && !error && books.length === 0 && (
            <div className="msg">No results yet. Try searching for a title above.</div>
          )}

          {!loading && books.length > 0 && (
            <>
              <div className="meta">
                Found <strong>{numFound}</strong> results — page {page} of {totalPages}
              </div>

              <ul className="grid">
                {books.map((book) => (
                  <li key={book.key} className="card">
                    <BookCard
                      title={book.title}
                      authors={book.author_name}
                      year={book.first_publish_year}
                      coverUrl={COVER_URL(book.cover_i)}
                      onView={() => setSelected(book)}
                      openLibraryKey={book.key}
                    />
                  </li>
                ))}
              </ul>

              <div className="pagination">
                <button className="btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                  Previous
                </button>
                <div className="page-info">Page {page}</div>
                <button className="btn" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                  Next
                </button>
              </div>
            </>
          )}
        </section>
      </main>

      <footer className="footer">
        <small>Built with the Open Library Search API</small>
      </footer>

      {selected && (
        <Modal onClose={() => setSelected(null)}>
          <div className="book-detail">
            <div className="left">
              {selected.cover_i ? (
                <img src={COVER_URL(selected.cover_i, 'L')} alt={`${selected.title} cover`} className="large-cover" />
              ) : (
                <div className="no-cover big">No cover</div>
              )}
            </div>
            <div className="right">
              <h2>{selected.title}</h2>
              <p className="muted">By: {selected.author_name ? selected.author_name.join(', ') : 'Unknown'}</p>
              <p className="muted small">First published: {selected.first_publish_year || '—'}</p>
              {selected.subject && <p><strong>Subjects:</strong> {selected.subject.slice(0, 8).join(', ')}</p>}
              {selected.isbn && <p className="muted small">ISBNs: {selected.isbn.slice(0, 6).join(', ')}</p>}
              <p style={{ marginTop: 12 }}>
                <a href={`https://openlibrary.org${selected.key}`} target="_blank" rel="noreferrer" className="btn">
                  Open on OpenLibrary
                </a>
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default App;
