import os
import requests
from flask import Flask, render_template, request, jsonify, session
from dotenv import load_dotenv
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
app.secret_key = os.urandom(24)
CORS(app)

BLACKBOX_API_KEY = os.getenv("BLACKBOX_API_KEY")

API_URL = "https://api.blackbox.ai/v1/chat/completions"


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()

    user_message = data.get("message", "").strip()
    model = data.get("model")

    if not user_message:
        return jsonify({"reply": "Message cannot be empty."}), 400

    if not model:
        return jsonify({"reply": "Model not selected."}), 400

    if "history" not in session:
        session["history"] = []

    session["history"].append({
        "role": "user",
        "content": user_message
    })

    try:
        response = requests.post(
            API_URL,
            headers={
                "Authorization": f"Bearer {BLACKBOX_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": model,
                "messages": session["history"]
            },
            timeout=120
        )

        response.raise_for_status()
        result = response.json()

        ai_message = result["choices"][0]["message"]["content"]

    except Exception as e:
        return jsonify({"reply": f"API Error: {str(e)}"}), 500

    session["history"].append({
        "role": "assistant",
        "content": ai_message
    })

    session.modified = True

    return jsonify({"reply": ai_message})


@app.route("/reset", methods=["POST"])
def reset():
    session.pop("history", None)
    return jsonify({"status": "reset"})


if __name__ == "__main__":
    app.run(debug=True)
