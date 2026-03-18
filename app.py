from flask import Flask, request, jsonify
from flask_cors import CORS
from model import hybrid_recommend,get_top_rated

app = Flask(__name__)
CORS(app)

@app.route("/recommend", methods=["GET"])
def recommend():
    book_name = request.args.get("book")   # ✅ FIX HERE
    return jsonify({
        "recommended" : hybrid_recommend(book_name),
        "trending" : get_top_rated()
    })

if __name__ == "__main__":
    app.run(debug=True)