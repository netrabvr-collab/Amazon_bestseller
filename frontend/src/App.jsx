import { useEffect, useState, useMemo } from 'react';
import Row from "./components/Row";
import Banner from "./components/Banner";
import Navbar from "./components/Navbar";
import "./App.css";

const API = "http://127.0.0.1:5000";

function App() {
  const [data, setData] = useState({
    recommended: [],
    trending: []
  });

  const [randomBooks, setRandomBooks] = useState([]);
  const [favorites, setFavorites] = useState(() => {
    return JSON.parse(localStorage.getItem("favorites")) || [];
  });

  useEffect(() => {
    localStorage.setItem("favorites",JSON.stringify(favorites));
  },[favorites]);

  const toggleFavorite = (book) => {
    setFavorites(prev => {
      const exists = prev.find(b => b.book_id === book.book_id);
      
      if(exists) {
        return prev.filter(b => b.book_id !== book.book_id);
      }
      else {
        return [...prev,book];
      }
    });
  };
  
  const fetchAll = (title = "") => {
  const url = title
    ? `${API}/recommend?book=${encodeURIComponent(title)}`
    : `${API}/recommend`;   // ✅ no book → cold start

  fetch(url)
    .then(res => res.json())
    .then(data => setData(data))
    .catch(err => console.error(err));

  fetch(`${API}/random`)
    .then(res => res.json())
    .then(data => setRandomBooks(data))
    .catch(err => console.error(err));
};
  // initial load
  useEffect(() => {
    fetchAll();
  }, []);

  // 🔹 Banner book
  const bannerBook = data.recommended?.[0] || data.trending?.[0];

  // 🔹 Remove banner from recommended row
  const filteredRecommended = data.recommended.filter(
    (book) => book.book_id !== bannerBook?.book_id
  );

  // 🔹 Remove duplicates helper
  function removeDuplicates(baseList, excludeList) {
    const excludeIds = new Set(excludeList.map(b => b.book_id));
    return baseList.filter(book => !excludeIds.has(book.book_id));
  }

  // 🔹 Clean trending (no overlap with recommended)
  const cleanTrending = removeDuplicates(data.trending, filteredRecommended);

  // 🔹 Shuffle helper
  function shuffleBooks(books) {
    return [...books].sort(() => Math.random() - 0.5);
  }

  // 🔹 Top Picks (random + no duplicates)
  const randomTopPicks = useMemo(() => {
    const noOverlap = removeDuplicates(randomBooks, [
      ...filteredRecommended,
      ...cleanTrending
    ]);

    return shuffleBooks(noOverlap);
  }, [randomBooks, filteredRecommended, cleanTrending]);

  // 🔹 Search handler
  const handleSearch = (title) => {
    fetchAll(title);
  };

  function getTagBasedRow(recommended) {
  const tagMap = {};

  recommended.forEach(book => {
    if (!book.reason) return;

    // split string by comma to make array
    const tags = book.reason.split(",").map(tag => tag.trim());

    tags.forEach(tag => {
      if (!tagMap[tag]) tagMap[tag] = [];
      tagMap[tag].push(book);
    });
  });

  // pick the most common tag
  let bestTag = null;
  let maxCount = 0;
  for (let tag in tagMap) {
    if (tagMap[tag].length > maxCount) {
      bestTag = tag;
      maxCount = tagMap[tag].length;
    }
  }

  if (!bestTag) return { title: "", books: [] };

  return {
    title: `Because you like ${bestTag}`,
    books: tagMap[bestTag].slice(0, 15)
  };
}
  const tagRow = useMemo(() => {
  if (!data.recommended.length) return { title: "", books: [] };
  return getTagBasedRow(data.recommended);
}, [data.recommended]);

  return (
    <div className="app">
      <Navbar onSearch={handleSearch} />

      <Banner book={bannerBook || {}} />

      <Row title="Recommended for You" books={filteredRecommended} onLike = {toggleFavorite} />
      {tagRow.books.length > 0 && (
      <Row title={tagRow.title} books={tagRow.books} onLike = {toggleFavorite} />
      )}

      <Row title="Trending Now" books={cleanTrending} onLike = {toggleFavorite} />

      <Row title="Discover Something New" books={randomTopPicks} onLike = {toggleFavorite} />
    </div>
  );
}

export default App;