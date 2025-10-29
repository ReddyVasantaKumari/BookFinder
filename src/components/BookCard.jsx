import React from 'react';

// Small reusable card for a book
export default function BookCard({ title, authors, year, coverUrl, onView, openLibraryKey }) {
  return (
    <div className="card-inner">
      <div className="cover">
        {coverUrl ? (
          <img src={coverUrl} alt={`${title} cover`} />
        ) : (
          <div className="no-cover">No cover</div>
        )}
      </div>

      <div className="info">
        <h3>{title}</h3>
        <p className="muted">{authors ? authors.join(', ') : 'Unknown author'}</p>
        <p className="muted small">Year: {year || '—'}</p>

        <div className="card-actions">
          <button onClick={onView} className="btn small">View</button>
          <a className="btn small ghost" href={`https://openlibrary.org${openLibraryKey}`} target="_blank" rel="noreferrer">OpenLibrary</a>
        </div>
      </div>
    </div>
  );
}
