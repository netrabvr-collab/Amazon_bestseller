import "./Row.css";

function Row({ title, books }) {
  return (
    <div className="row">
      <h2>{title}</h2>

      <div className="row-posters">
        {books.map((book) => {
        const cleanId = book.book_id?.toString().slice(1); // JS version

    return (
        <div key={cleanId} className="poster-container">
        <img
            src={book.image}
            alt={book.title}
            className="poster"
            onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/150x220?text=No+Cover";
            }}
        />
        <p className="poster-title">{book.title}</p>
        </div>
    );
    })}
      </div>
    </div>
  );
}

export default Row;