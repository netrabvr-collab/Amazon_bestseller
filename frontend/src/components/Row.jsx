import "./Row.css";

function Row({ title, books, onLike }) {   // ✅ add onLike

  return (
    <div className="row">
      <h2>{title}</h2>

      <div className="row-posters">
        {books.map((book, index) => (
          <div
            key={`${book.book_id || "noid"}-${book.title}-${index}`}
            className="poster-container"
          >
            <img
              src={book.image}
              alt={book.title}
              className="poster"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/150x220?text=No+Cover";
              }}
            />

            {/* ❤️ HEART BUTTON */}
            {onLike && (
              <button 
                className="like-btn"
                onClick={() => onLike(book)}
              >
                ❤️
              </button>
            )}

            <p className="poster-title">{book.title}</p>

            <div className="hover-content">
              <p>Title: {book.title}</p>
              <p>Author: {book.author}</p>
              <p>Rating: {"⭐".repeat(Math.round(book.rating))}</p>

              {/* show reason if exists */}
              {book.reason && (
                <p className="reason">
                  Because you like {book.reason}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Row;