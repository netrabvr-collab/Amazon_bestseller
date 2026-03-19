import { useState, useEffect } from "react";
import "./Navbar.css";

function Navbar({ onSearch }) {
  const [query, setQuery] = useState("");
  const [titles, setTitles] = useState([]);
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/titles")
      .then((res) => res.json())
      .then((data) => setTitles(data));
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    const results = titles
      .filter((title) =>
        title.toLowerCase().includes(value.toLowerCase())
      )
      .slice(0, 5);

    setFiltered(results);
  };

  const handleClick = (title) => {
    setQuery(title);
    setFiltered([]);
    onSearch(title);
  };

  return (
    <div className="nav">
      <h1 className="logo">BookFlix</h1>

      <div className="search-bar">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Search books..."
        />

        {filtered.length > 0 && (
          <div className="dropdown">
            {filtered.map((title, index) => (
              <div
                key={`${title}-${index}`}
                onClick={() => handleClick(title)}
              >
                {title}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Navbar;