from flask import Flask
from users import users_bp
from _chat import chat_bp
from flask_cors import CORS

app = Flask(__name__)

cors = CORS(app,origins='*')

# Register the users_bp Blueprint under a specific URL prefix
app.register_blueprint(users_bp, url_prefix='/api')

app.register_blueprint(chat_bp, url_prefix='/api')

if __name__ == '__main__':
    app.run(debug=True)
