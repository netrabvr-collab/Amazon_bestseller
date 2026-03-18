import numpy as np
import pandas as pd
from sklearn.decomposition import TruncatedSVD
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from add_covers import get_google_cover

# =========================
# LOAD DATA
# =========================

books = pd.read_csv("data/books_with_covers.csv")
ratings = pd.read_csv("data/ratings.csv")
book_tags = pd.read_csv("data/book_tags.csv")
tags = pd.read_csv("data/tags.csv")
title_to_book_ids = books.groupby("title")["book_id"].apply(list).to_dict()
book_id_to_data = books.set_index("book_id").to_dict("index")
books["image_url"] = books["image_url"].str.replace("http://", "https://", regex=False)

# =========================
# COLLABORATIVE FILTERING
# =========================

combined_books_data = pd.merge(ratings, books, on="book_id")

rating_utility_matrix = combined_books_data.pivot_table(
    values="rating",
    index="user_id",
    columns="title",
    fill_value=0
)

X = rating_utility_matrix.T

SVD = TruncatedSVD(n_components=30, random_state=42)
matrix = SVD.fit_transform(X)

corr_matrix = cosine_similarity(matrix)

books_list = list(rating_utility_matrix.columns)

# =========================
# CONTENT BASED FILTERING
# =========================

book_tags_combined = pd.merge(book_tags, tags, on="tag_id")

# rename column
if "goodreads_book_id" in book_tags_combined.columns:
    book_tags_combined.rename(columns={"goodreads_book_id": "book_id"}, inplace=True)

# remove useless tags
bad_tags = [
    "to-read","currently-reading","favorites","owned-books",
    "books-i-own","my-library","default","library",
    "wish-list","ebooks","kindle","general",
    "bookshelf","home-library","1001-books","school","my-books","tbr","read-in-2015","i-own","owned","novel","re-read","books","personal-library",
    "to-buy","own-it","1001-books-to-read-before-you-die","audio","favourite","favs","ebook","novels","1001","audiobook","my-favorites","favorite-books",
    "book-club","audiobooks","read-in-2014"
]

book_tags_combined = book_tags_combined[
    ~book_tags_combined["tag_name"].str.lower().isin(bad_tags)
]

# combine tags
content_data = book_tags_combined.groupby("book_id")["tag_name"].apply(
    lambda x: " ".join(x)
).reset_index()

# keep tag list for explanations
tag_lists = book_tags_combined.groupby("book_id")["tag_name"].apply(list).reset_index()
content_data["tags_list"] = tag_lists["tag_name"]

# map title
book_id_to_title = books.set_index("book_id")["title"].to_dict()
content_data["title"] = content_data["book_id"].map(book_id_to_title)

# keep only books present in collaborative model
content_data = content_data[content_data["title"].isin(books_list)]
content_data = content_data.reset_index(drop=True)

# TFIDF
tfidf = TfidfVectorizer(stop_words="english")
tfidf_matrix = tfidf.fit_transform(content_data["tag_name"])

content_sim = cosine_similarity(tfidf_matrix)

# index mapping
indices = pd.Series(content_data.index, index=content_data["title"]).drop_duplicates()


# =========================
# HYBRID RECOMMENDER
# =========================

def hybrid_recommend(book_name):

    if book_name not in books_list:
        print("Book not found")
        return []

    book_index = books_list.index(book_name)
    corr_score = corr_matrix[book_index]

    if book_name not in indices:
        print("Content data not found")
        return []

    idx = indices[book_name]

    if isinstance(idx, pd.Series):
        idx = idx.iloc[0]

    base_tags = set(content_data.iloc[idx]["tags_list"])

    hybrid_scores = []

    for i, title in enumerate(books_list):

        collab = corr_score[i]

        if title in indices:

            content_idx = indices[title]

            if isinstance(content_idx, pd.Series):
                content_idx = content_idx.iloc[0]

            content = content_sim[idx][content_idx]

            tags2 = set(content_data.iloc[content_idx]["tags_list"])
            shared_tags = list(base_tags.intersection(tags2))[:3]

        else:
            content = 0
            shared_tags = []

        score = (0.6 * collab) + (0.4 * content)

        hybrid_scores.append((i, score, shared_tags))

    recommended = sorted(
        hybrid_scores,
        key=lambda x: x[1],
        reverse=True
    )[1:15]

    results = []

    for rec in recommended:

        index, score, shared_tags = rec

        title = books_list[index]   

        book_ids = title_to_book_ids[title]
        book_id = book_ids[0]  

        book_data = book_id_to_data[book_id]

        author = book_data["authors"]
        rating = book_data["average_rating"]
        image = book_data.get("image_url", "https://via.placeholder.com/150")
        
        results.append({
            "book_id": book_id,
            "title": title,
            "author": author,
            "rating": rating,
            "image": book_data.get("cover_url"),
            "reason": shared_tags if shared_tags else ["popular among similar users"]
    })

    return results

def get_top_rated(n=20):
    top_books = books.sort_values(by="average_rating",ascending=False)

    results = []

    for _, row in top_books.head(n).iterrows():
        results.append({
            "book_id": row["book_id"],
            "title": row["title"],
            "author": row["authors"],
            "rating": row["average_rating"],
            "image": row["cover_url"]
        })

    return results

titles = books["title"].dropna().unique()
print(titles)
pd.Series(titles).to_csv("data/all_titles.csv", index=False)
# =========================
# RUN
# =======================
