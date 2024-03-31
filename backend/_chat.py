# chat_v2.0.py
# This code is meant to work with db_v2.0.sql
# The code should contain the following capabilities
# 1. Create a chat for a user given a username
# 2. Add a prompt and its response given a username, prompt_text and chat_id
# 3. Get all chats of a user given a username, and for each chat get the chat_id and the first prompt
# 4. Get a complete chat given username and chat_id
# 5. Delete a chat given username and chat_id

from flask import Blueprint, request, jsonify
import mysql.connector
import requests
import time

chat_bp = Blueprint('chat', __name__)

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

# Endpoint to create a chat for a user given a username
@chat_bp.route('/chat', methods=['POST'])
def create_chat():
    try:
        data = request.get_json()
        print('create chat:',data)
        username = data['username']

        # Insert a new user into the 'users' table
        insert_query = "INSERT INTO chats (username) VALUES (%s)"
        cursor.execute(insert_query, ([username]))
        db.commit()
        chat_id = cursor.lastrowid

        return jsonify(message="Chat created successfully",chat_id = chat_id), 201
    except Exception as e:
        return jsonify(error=str(e)), 400
    

def __get_response_to_prompt(prompt_text,context):
    return "response to prompt"
def __testing_prompt_from_file(prompt_text,context):
    # Load the JSON data
    import json
    import random
    with open('questions_and_answers.json', 'r') as file:
        data = json.load(file)
        # Pick a random entry from the data
        random_entry = data[random.randint(0,len(data)-1)]
        print(random_entry['answer'])
        return random_entry['answer']
    return "response to prompt"
# Function to get response from API
def get_response_from_api(question,context):
    api_url = "https://a8bd-34-142-158-208.ngrok-free.app"

    print("getting resp")
    body = {
        "question": question,
        #"context": context
    }
    headers = {
        "Content-Type": "application/json"
    }
    response = requests.get(api_url, json=body, headers=headers)
    print("response got", response.json())
    return response.json()['answer']  # Assuming the API returns JSON data
# Endpoint to add a prompt and its response given a username, prompt_text and chat_id
@chat_bp.route('/chat/<int:chat_id>', methods=['POST'])
def add_prompt_and_response(chat_id):
    try:
        data = request.get_json()
        username = request.args.get('username')
        prompt_text = data['prompt_text']
        context = data['context']
        print('adding to', username, ' ', chat_id, ' ', prompt_text)

        # Execute SQL statements to add prompt and response
        cursor.execute("""
            INSERT INTO prompts (prompt_text, chat_id)
            VALUES (%s, %s)
        """, (prompt_text, chat_id))

        #time.sleep(5)

        # Get the ID of the inserted prompt
        v_prompt_id = cursor.lastrowid

        # Get response to the prompt
        response_text = get_response_from_api(prompt_text,context)
        
        if response_text=="":
            response_text = "Some error occured with the model. Please try again later."
        # Insert response into responses table
        cursor.execute("""
            INSERT INTO responses (prompt_id, response_text)
            VALUES (%s, %s)
        """, (v_prompt_id, response_text))

        # Get the ID of the inserted prompt
        v_response_id = cursor.lastrowid
        
        # Update first_prompt_id in chats table if it's not set
        cursor.execute("""
            SELECT 1 FROM chats WHERE chat_id = %s AND first_prompt_id IS NOT NULL
        """, (chat_id,))
        if not cursor.fetchone():
            cursor.execute("""
                UPDATE chats SET first_prompt_id = %s WHERE chat_id = %s
            """, (v_prompt_id, chat_id))
        
        cursor.execute("SELECT * FROM prompts WHERE prompt_id = %s", (v_prompt_id,))
        v_prompt = cursor.fetchone()
        # Fetch column names
        prompt_column_names = [column[0] for column in cursor.description]

        # Construct dictionary for prompt
        prompt_dict = {}
        for i, column_name in enumerate(prompt_column_names):
            prompt_dict[column_name] = v_prompt[i]
        cursor.execute("SELECT * FROM responses WHERE response_id = %s", (v_response_id,))
        v_response = cursor.fetchone()
        # Fetch column names
        response_column_names = [column[0] for column in cursor.description]

        # Construct dictionary for response
        response_dict = {}
        for i, column_name in enumerate(response_column_names):
            response_dict[column_name] = v_response[i]

        # Commit the transaction
        db.commit()
        # Construct JSON response
        response_data = {
            'prompt': prompt_dict,
            'response': response_dict,
            'result': True
        }
        print(v_prompt_id, v_response_id)
        return jsonify(response_data)

    except Exception as e:
        return jsonify(error=str(e)), 400

# Endpoint to get all chats of a user given a username, and for each chat get the chat_id and the first prompt
@chat_bp.route('/chat', methods=['GET'])
def get_chats_and_first_prompts():
    try:
        print('getting chats', request.args)
        # Get the username from query parameters
        username = request.args.get('username')

        # Define SQL query to fetch chats and first prompts
        sql_query = """
        SELECT c.chat_id, p.prompt_text AS first_prompt, c.starting_date
        FROM chats c
        LEFT JOIN prompts p ON c.first_prompt_id = p.prompt_id
        WHERE c.username = %s AND c.deleted = 0
        ORDER BY c.starting_date DESC
        """

        # Execute SQL query
        cursor.execute(sql_query, (username,))

        # Fetch all results
        result = cursor.fetchall()

        # Construct response JSON
        response = []
        for row in result:
            chat_id, first_prompt, starting_date = row
            response.append({
                'chat_id': chat_id,
                'first_prompt': first_prompt,
                'starting_date': starting_date
            })

        return jsonify(response)

    except Exception as e:
        return jsonify(error=str(e)), 400
    
# Endpoint to get a complete chat given username and chat_id
@chat_bp.route('/chat/<int:chat_id>', methods=['GET'])
def get_chat(chat_id):
    try:
        # Get the username and chat_id from query parameters
        username = request.args.get('username')
        print('getting chat', username, chat_id)

        # Define SQL query to get the entire chat
        sql_query = """
        SELECT p.prompt_id, r.response_id, p.prompt_text, r.response_text, p.prompt_date, r.response_date, r.rating
        FROM prompts p
        LEFT JOIN responses r ON p.prompt_id = r.prompt_id
        WHERE p.chat_id = %s
        ORDER BY p.prompt_date
        """

        # Execute SQL query
        cursor.execute(sql_query, (chat_id,))

        # Fetch all results
        result = cursor.fetchall()
        print('result', result)
        # Construct response JSON
        response = []
        for row in result:
            prompt_id, response_id, prompt_text, response_text, prompt_date, response_date, rating = row
            response.append({
                'prompt_id': prompt_id,
                'response_id': response_id,
                'prompt_text': prompt_text.split("\n"),
                'response_text': response_text.split("\n"),
                'prompt_date': prompt_date,
                'response_date': response_date,
                'response_rating':rating
            })

        return jsonify(response)
    except Exception as e:
        print(e)
        return jsonify(error=str(e)), 400

# Endpoint to delete a chat given username and chat_id
@chat_bp.route('/chat/<int:chat_id>', methods=['DELETE'])
def delete_chat(chat_id):
    try:
       # Get the username from query parameters
        username = request.args.get('username')
        print('deleting chat', username, chat_id)

        # Define SQL query to set deleted flag
        sql_query = """
        UPDATE chats
        SET deleted = TRUE
        WHERE chat_id = %s AND username = %s
        """

        # Execute SQL query
        cursor.execute(sql_query, (chat_id, username))

        # Commit the transaction
        db.commit()

        return jsonify(message="Chat deleted successfully",result=True)
    except Exception as e:
        return jsonify(error=str(e)), 400
    
# Endpoint to add a rating to a response given a response_id
@chat_bp.route('/chat/rating', methods=['POST'])
def add_rating():
    try:
        data = request.get_json()
        print('adding rating', data)
        response_id = data['response_id']
        rating = data['rating']

        # Define SQL query to set rating of a response
        sql_query = """
            UPDATE responses SET rating = %s WHERE response_id = %s
        """
        # Execute SQL query
        cursor.execute(sql_query, (rating, response_id))

        # Commit the transaction
        db.commit()
        response = jsonify(message="Rating added successfully", result=True)
        response.headers.add('Access-Control-Allow-Origin', '*')
        # Add http status ok
        response.status_code = 200
        return response
    except Exception as e:
        print(e)
        return jsonify(error=str(e)), 400