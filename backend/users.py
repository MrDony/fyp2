# users.py

from flask import Blueprint, request, jsonify
import mysql.connector

# Create a Blueprint for the users-related endpoints
users_bp = Blueprint('users', __name__)

# Configure MySQL connection (same as in app.py)
db_config = {
    "host": "127.0.0.1",  # Change this to your MySQL host
    "port": 3306,  # Change this to your MySQL port
    "user": "root",  # Change this to your MySQL username
    "password": "rootpassword",  # Change this to your MySQL password
    "database": "LegalBotDB",  # Change this to your database name
}

# Create a MySQL connection (same as in app.py)
db = mysql.connector.connect(**db_config)

# Create a cursor object (same as in app.py)
cursor = db.cursor()

@users_bp.route('/users', methods=['POST'])
def create_user():
    try:
        data = request.get_json()
        username = data['username']
        email = data['email']
        password = data['password']
        print('creating user',data)

        # Insert a new user into the 'users' table
        insert_query = "INSERT INTO users (username, email, password) VALUES (%s, %s, %s)"
        cursor.execute(insert_query, (username, email, password))
        db.commit()

        return jsonify(message="User created successfully", result = True), 201
    except Exception as e:
        return jsonify(error=str(e)), 400

@users_bp.route('/users/<string:username>', methods=['GET'])
def get_user(username):
    try:
        # Retrieve a user by username from the 'users' table
        select_query = "SELECT * FROM users WHERE username = %s"
        cursor.execute(select_query, (username,))
        user = cursor.fetchone()

        if user:
            user_data = {
                "username": user[0],
                "email": user[1],
                "registration_date": user[3].strftime("%Y-%m-%d %H:%M:%S")
            }
            return jsonify(user_data)
        else:
            return jsonify(message="User not found"), 404
    except Exception as e:
        return jsonify(error=str(e)), 500

@users_bp.route('/users/authenticate', methods=['POST'])
def authenticate_user():
    try:
        data = request.get_json()
        username = data['username']
        password = data['password']
        print('authenticating user',data)

        # Check if the user exists with the given username and password
        select_query = "SELECT * FROM users WHERE username = %s AND password = %s"
        cursor.execute(select_query, (username, password))
        user = cursor.fetchone()

        if user:
            user_data = {
                "username": user[0],
                "email": user[1],
                "registration_date": user[3].strftime("%Y-%m-%d %H:%M:%S")
            }
            return jsonify(result=True, user=user_data)
        else:
            return jsonify(result=False, message="User not found or invalid credentials")
    except Exception as e:
        return jsonify(error=str(e)), 500

@users_bp.route('/users/<string:username>', methods=['PUT'])
def update_user(username):
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        # Update user information in the 'users' table
        update_query = "UPDATE users SET email = %s, password = %s WHERE username = %s"
        cursor.execute(update_query, (email, password, username))
        db.commit()

        return jsonify(message="User updated successfully"), 200
    except Exception as e:
        return jsonify(error=str(e)), 500

@users_bp.route('/users/<string:username>', methods=['DELETE'])
def delete_user(username):
    try:
        # Delete a user from the 'users' table
        delete_query = "DELETE FROM users WHERE username = %s"
        cursor.execute(delete_query, (username,))
        db.commit()

        return jsonify(message="User deleted successfully"), 200
    except Exception as e:
        return jsonify(error=str(e)), 500
"""
<div class="input-field">
                    <p class="input-field-label">
                        Email
                    </p>
                    <input value="email" type="email">
                </div>

"""