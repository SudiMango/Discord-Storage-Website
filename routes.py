from discord import Intents, Client, Message, utils
import asyncio
from quart import Blueprint, request, session, render_template, redirect, flash, send_file, jsonify
from dotenv import load_dotenv
import os
import pyrebase
import firebase_admin
from firebase_admin import firestore, credentials
from google.cloud.firestore_v1.transforms import DELETE_FIELD
from werkzeug.utils import secure_filename
import file_handler as fh
from datetime import datetime
import pytz

load_dotenv()

routes_bp = Blueprint('routes', __name__)

guild_id = 1199731998403592202
category_id = 1309733902453047316

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
@routes_bp.before_app_serving
async def before_serving():
    loop = asyncio.get_event_loop()
    await client.login(os.getenv("TOKEN"))
    loop.create_task(client.connect())

# Routes

# Home
@routes_bp.route("/")
async def home():
    return await render_template("home.html")




# Main

# Upload section
@routes_bp.route("/upload")
async def upload():
    if not "user" in session:
        return redirect("/")
    
    return await render_template("upload.html", user_email=session["user"])


# Uploading files
@routes_bp.route("/upload", methods=["POST"])
async def upload_file():
    if "files" not in await request.files:
        return jsonify({'error': 'No file part'}), 400
    
    files = request._files.getlist("files")
    for f in files:
        userinfo = db.collection(session["user"]).document("userinfo")
        channel_id = userinfo.get().to_dict().get("channelId")
        num_files = userinfo.get().to_dict().get("numFiles")
        total_storage = userinfo.get().to_dict().get("totalStorage")
        mtd_id = await fh.upload_chunks(f, f.filename, request.content_length, client.get_channel(channel_id))
        timezone = pytz.timezone("America/Vancouver")
        curr_time = datetime.now(timezone)
        db.collection(session["user"]).document("fileinfo").update({
            str(num_files+1): {
                "filename": f.filename,
                "mtd_id": mtd_id,
                "upload_time": curr_time.strftime('%d/%m/%Y %H:%M:%S' + " PST"),
                "file_size": request.content_length
            }
            })
        userinfo.update({"numFiles": (num_files+1)})
        userinfo.update({"totalStorage": total_storage + request.content_length})
    
    return jsonify({'success': True}), 200


# Files view
@routes_bp.route("/files", methods=["GET"])
async def files_view():
    if ("user" in session):
        items = db.collection(session["user"]).document("fileinfo").get().to_dict()
        sorted_items = dict(sorted(items.items(), key=lambda x: int(x[0]), reverse=True))

        return await render_template("files_list.html", items=sorted_items)

    return await render_template("home.html")

# Download or delete file
@routes_bp.route("/files", methods=["POST"])
async def handle_action():
    if not "user" in session:
        return redirect("/")

    payload = await request.json

    if not payload or "action" not in payload:
        return jsonify({'error': 'No payload data recieved. Please try again.'}), 400
    
    action = payload.get("action")
    
    channel_id = db.collection(session["user"]).document("userinfo").get().to_dict()["channelId"]
    if action == "download":
        virtual_file = await fh.download_file(payload.get("mtd_id"), client.get_channel(channel_id))
        return await send_file(virtual_file, as_attachment=True, attachment_filename=payload.get("filename"))
    elif action == "delete":
        await fh.delete_file(payload.get("mtd_id"), client.get_channel(channel_id))
        db.collection(session["user"]).document("fileinfo").update({payload.get("key"): DELETE_FIELD})
        # ADJUST USERINFO ACCORDINGLY
        
    return jsonify({'success': True}), 200

        






# Authentication services


# Sign up
@routes_bp.route("/signup", methods=["POST", "GET"])
async def signup():

    if request.method == "POST":
        email = (await request.form).get("email")
        password = (await request.form).get("password")
        cf_password = (await request.form).get("cf_password")
        if str.__len__(password) >= 6 and password == cf_password:
            try:
                user = auth.create_user_with_email_and_password(email, password)
                category = utils.get(client.get_guild(guild_id).categories, id=category_id)
                channel = await client.get_guild(guild_id).create_text_channel(user["localId"], category=category)
                db.collection(email).document("userinfo").set({"channelId": channel.id, "numFiles": 0, "totalStorage": 0})
                db.collection(email).document("fileinfo").set({})
                session["user"] = email
                return redirect("/")
            except:
                await flash("Failed to create new user.", "error")
                return redirect("/signup")
        else:
            await flash("Error with passwords.", "error")
            return redirect("/signup")

    return await render_template("signup.html")



# Login
@routes_bp.route("/login", methods=["POST", "GET"])
async def login():

    if request.method == "POST":
        email = (await request.form).get("email")
        password = (await request.form).get("password")
        try:
            auth.sign_in_with_email_and_password(email, password)
            session["user"] = email
            return redirect("/")
        except:
            await flash("Failed to login user.", "error")
            return redirect("/login")
    
    return await render_template("login.html")



# Logout
@routes_bp.route("/logout")
async def logout():
    if ("user" in session):
        session.pop("user")
        
    return redirect("/")














"""
# View individual file
@routes_bp.route("/files/<item_key>", methods=["POST", "GET"])
async def ind_file_view(item_key):
    if "user" not in session:
        return redirect("/")
    
    if request.method == "GET":
        try:
            item = db.collection(session["user"]).document("fileinfo").get().to_dict()[item_key]
            return await render_template("file_view.html", 
                                         key=item_key,
                                         file_name=item["filename"], 
                                         upload_time=item["upload_time"], 
                                         file_size=f"{item["file_size"]} bytes")
        except:
            return "File not found", 404
    elif request.method == "POST":
        #action = (await request.form).get("download")

        userinfo = db.collection(session["user"]).document("userinfo")
        channel_id = userinfo.get().to_dict().get("channelId")
        file_info = db.collection(session["user"]).document("fileinfo").get().to_dict()[item_key]

        mtd_id = file_info["mtd_id"]
        filename = file_info["filename"]
        virtual_file = await fh.download_file(mtd_id, client.get_channel(channel_id))
        return await send_file(virtual_file, as_attachment=True, attachment_filename=filename)


    return redirect(f"/files/{item_key}")
"""