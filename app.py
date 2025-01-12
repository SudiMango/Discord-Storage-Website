"""
from quart import Quart
from routes import routes_bp
import os

# App setup
app = Quart(__name__)
app.secret_key = os.getenv("APP_KEY")
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024 * 1024
app.register_blueprint(routes_bp)


# Start program
if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
"""

    
from quart import Quart

# App setup
app = Quart(__name__)

@app.route("/")
async def hello_world():
    print("hello")
    return "Hello world"

# Start the app with Hypercorn
if __name__ == "__main__":
    app.run()
