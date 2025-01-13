from quart import Quart
from routes import routes_bp
import os

# App setup
app = Quart(__name__)
app.secret_key = os.getenv("APP_KEY")
app.config['MAX_CONTENT_LENGTH'] = 1 * 1024 * 1024 * 1024
app.register_blueprint(routes_bp)


# Start program
if __name__ == "__main__":
    app.run(debug=True)
