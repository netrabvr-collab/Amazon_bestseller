import pandas as pd
import requests
import time

books = pd.read_csv("data/books.csv")
books = books.head(500)

def get_google_cover(title):
    time.sleep(0.1)
    url = f"https://www.googleapis.com/books/v1/volumes?q=intitle:{title}"

    try:
        res = requests.get(url).json()
        if "items" in res:
            book = res["items"][0]["volumeInfo"]

            if "imageLinks" in book:
                return book["imageLinks"].get("thumbnail").replace("zoom=1", "zoom=2")
            
    except:
        pass
    return None

def generate_cover(row):
    # 1. Goodreads image
    if pd.notna(row["image_url"]) and row["image_url"] != "":
        return row["image_url"].replace("http://", "https://")

    # 2. Google Books
    google_cover = get_google_cover(row["title"])
    if google_cover:
        return google_cover

    # 3. Open Library fallback
    if pd.notna(row["isbn"]) and row["isbn"] != "":
        return f"https://covers.openlibrary.org/b/isbn/{row['isbn']}-L.jpg"

    # 4. Placeholder
    return "https://via.placeholder.com/150x220?text=No+Cover"

books["cover_url"] = books.apply(generate_cover, axis=1)

books.to_csv("data/books_with_covers.csv", index=False)