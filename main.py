from flask import Flask, render_template, request
from logic.round import Round

app = Flask(__name__)

@app.route('/')
def index():
    return render_template("index.html")

@app.route("/scoreboard", methods=["GET", "POST"])
def scoreboard():
    if request.method == "POST":
        round_name = request.form["password"]
        r = Round(round_name, ["Team 1", "Team 2", "Team 3"])
        if r.exists():
            r.open_existing()
            print(r.teams)
        else:
            r.create_self()
        return render_template("scoreboard.html", round=r)
    else:
        return render_template("404.html")
        
@app.route('/admin', methods=["GET", "POST"])
def admin():
    if request.method == "POST":
        filename = request.form["password"]
        r = Round(filename)
        if r.exists():
            r.open_existing()
            return render_template("admin.html", method=request.method, teams=r.teams, round_name=r.round_name)
        else:
            return render_template("404.html")
    else:
        return render_template("admin.html", method=request.method)


@app.route("/update-score", methods=["GET", "POST"])
def update():
    if request.method == "POST":
        filename = request.form["password"]
        r = Round(filename)
        if r.exists():
            r.open_existing()
            r.update_from_dict(request.form)
            return render_template("admin.html", method="POST", teams = r.teams, round_name = filename)
        else:
            return render_template("404.html")
    else:
        return render_template("admin.html", method="GET")

@app.route("/get-data-<filename>", methods=["POST"])
def get_data(filename):
    r = Round(filename)
    if r.exists():
        r.open_existing()
        return r.teams

if __name__ == "__main__":
    app.run(debug=True)