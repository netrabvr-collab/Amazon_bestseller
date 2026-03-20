from flask import Flask, request, jsonify
from flask_cors import CORS
from model import hybrid_recommend,get_top_rated,books_list,get_random_books

app = Flask(__name__)
CORS(app)

@app.route("/recommend", methods=["GET"])
def recommend():
    book_name = request.args.get("book")

    # ✅ COLD START: no book searched
    if not book_name:
        return jsonify({
            "recommended": get_random_books(),
            "trending": get_top_rated()
        })

    return jsonify({
        "recommended": hybrid_recommend(book_name),
        "trending": get_top_rated()
    })

@app.route("/titles")
def get_titles():
    return jsonify(books_list)

@app.route("/random")
def random_books():
    return jsonify(get_random_books())
     
if __name__ == "__main__":
    app.run(debug=True)