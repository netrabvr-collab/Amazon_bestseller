import "./Banner.css";

function Banner({book}) {

    if(!book) return null;

    return (
        <header
            className="banner"
            style={{
                backgroundImage:`url(${book.image})`,
            }}
        >
            <div className="banner-content">
                <h1>{book.title}</h1>
                <p>{"⭐".repeat(Math.round(book.rating))}</p>
            </div>
        </header>
    );
}

export default Banner;
