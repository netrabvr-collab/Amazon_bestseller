import { useEffect,useState } from 'react';
import Row from "./components/Row";
import Banner from "./components/Banner";
import Navbar from "./components/Navbar";
import "./App.css";

const API = "http://127.0.0.1:5000"

function App() {
  const [data,setData] = useState({
    recommended:[],
    trending:[]
  });

  useEffect(() => {
  fetch(`${API}/recommend?book=${encodeURIComponent("The Witches")}`)
    .then(res => res.json())
    .then(data => setData(data));
}, []);
  const bannerBook = data.recommended[0];

  const filteredBooks = data.recommended.filter(
    (book) => book.book_id !== bannerBook?.book_id
  );

  const handleSearch = (title) => {
  fetch(`${API}/recommend?book=${encodeURIComponent(title)}`)
    .then(res => res.json())
    .then(data => setData(data));
  };

  return (
    <div className="app">

      <Navbar onSearch={handleSearch}/>
      <Banner book={bannerBook || {}}/>

      <Row title="Recommended for You" books={filteredBooks}/>
      <Row title="Trending Now" books={data.trending}/>
      <Row title="Top Picks" books={filteredBooks.slice(10,20)}/>
    </div>
  );
}

export default App;
