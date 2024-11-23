from discord import Intents, Client, Message
import asyncio
from quart import Quart, request, session, render_template, redirect, flash
from dotenv import load_dotenv
import os
import pyrebase
import firebase_admin
from firebase_admin import firestore, credentials
from werkzeug.utils import secure_filename
import file_handler as fh



load_dotenv()



# App setup
app = Quart(__name__)
app.secret_key = os.getenv("APP_KEY")
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024 * 1024



# Firebase
config = {
    "apiKey": os.getenv("apiKey"),
    "authDomain": os.getenv("authDomain"),
    "projectId": os.getenv("projectId"),
    "storageBucket": os.getenv("storageBucket"),
    "messagingSenderId": os.getenv("messagingSenderId"),
    "appId": os.getenv("appId"),
    "measurementId": os.getenv("measurementId"),
    "databaseURL": ""
}
firebase = pyrebase.initialize_app(config)
firebase_admin.initialize_app(credentials.Certificate("credentials.json"))
auth = firebase.auth()
db = firestore.client()



# Bot setup
intents = Intents.default()
intents.message_content = True
client = Client(intents=intents)

@client.event
async def on_ready() -> None:
    print(f"{client.user} is now running!")



# Start app
@app.before_serving
async def before_serving():
    loop = asyncio.get_event_loop()
    await client.login(os.getenv("TOKEN"))
    loop.create_task(client.connect())




# Routes

# Home
@app.route("/")
async def home():
    if ("user" in session):
        return await render_template("main.html", user_email=session["user"])

    return await render_template("home.html")

@app.route("/", methods=["POST", "GET"])
async def upload_file():
    file = (await request.files).get("file")
    filename = secure_filename(file.filename)
    if filename != "":
        mtd_id = await fh.upload_chunks(file, filename, request.content_length, client.get_channel(1199731999531876364))
        db.collection("userinfo").document(session["user"]).set({filename: str(mtd_id)}, merge=True)
        await flash("Uploaded file successfully.", "message")
    else:
        await flash("Error: filename incorrect.", "error")

    return redirect("/")

# Sign up
@app.route("/signup", methods=["POST", "GET"])
async def signup():

    if request.method == "POST":
        email = (await request.form).get("email")
        password = (await request.form).get("password")
        cf_password = (await request.form).get("cf_password")
        if str.__len__(password) >= 6 and password == cf_password:
            try:
                db.collection("userinfo").document(email).set({})
                auth.create_user_with_email_and_password(email, password)
                session["user"] = email
                return redirect("/")
            except:
                flash("Failed to create new user.", "error")
                return redirect("/signup")
        else:
            flash("Error with passwords.", "error")
            return redirect("/signup")

    return await render_template("signup.html")

# Login
@app.route("/login", methods=["POST", "GET"])
async def login():

    if request.method == "POST":
        email = (await request.form).get("email")
        password = (await request.form).get("password")
        try:
            auth.sign_in_with_email_and_password(email, password)
            session["user"] = email
            return redirect("/")
        except:
            flash("Failed to login user.", "error")
            return redirect("/login")
    
    return await render_template("login.html")

# Logout
@app.route("/logout")
async def logout():
    if ("user" in session):
        session.pop("user")
        
    return redirect("/")



# Start program
if __name__ == "__main__":
    app.run(debug=True)