from flask import Flask, render_template, request
import pandas as pd
import matplotlib.pyplot as plt

app = Flask(__name__)

@app.route("/",methods = ['GET','POST'])
def dashboard():
    df = pd.read_csv('bestsellers.csv')
    df.drop_duplicates(subset=['Name'],inplace = True)
    genres = df['Genre'].unique()
    recommend = None
    selected_genre = None

    if request.method == 'POST':
        selected_genre = request.form.get('genres')
        filtered = df[df['Genre'] == selected_genre]
        recommend = filtered.sort_values(by='User Rating',ascending = False).head(5)

        recommend = recommend[['Name','Author','User Rating','Price']]
        recommend = recommend.to_dict(orient='records')
    return render_template(
        'dashboard.html',
        genres = genres,
        recommend = recommend,
        selected_genre = selected_genre
    )

if __name__ == "__main__":
    app.run(debug=True)
