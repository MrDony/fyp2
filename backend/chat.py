# chat.py

from flask import Blueprint, request, jsonify
import mysql.connector

# Create a Blueprint for the users-related endpoints
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

        return jsonify(message="User created successfully",chat_id = chat_id), 201
    except Exception as e:
        return jsonify(error=str(e)), 400


@chat_bp.route('/chat', methods=['GET'])
def get_chat_prompts():
    """
    try:

        # Get the username and chat_id from query parameters
        username = request.args.get('username')
        chat_id = int(request.args.get('chat_id'))
        print('getting chat',username,chat_id)

        # Execute the stored procedure
        print(cursor.callproc('GetChatPrompts', [username, chat_id]))
        # Fetch the results from the stored procedure
        
        print(db.commit())
        print(cursor.column_names)
        results = cursor.fetchall()

        # Define a list to store the prompts
        prompts = []

        print(results)
        # Iterate through the results and create a list of prompts
        for result in results:
            prompt_id, prompt_text, prompt_date = result
            prompts.append({
                "prompt_id": prompt_id,
                "prompt_text": prompt_text,
                "prompt_date": prompt_date.strftime("%Y-%m-%d %H:%M:%S")
            })

        return jsonify(prompts=prompts)
    except Exception as e:
        return jsonify(error=str(e)), 500
    """
    import pymysql
    from datetime import datetime
    # Database connection details (replace with your actual database details)
    host = 'localhost'
    user = 'root'
    password = 'rootpassword'
    db = 'LegalBotDB'

    # Get the username and chat_id from query parameters
    username = request.args.get('username')
    chat_id = int(request.args.get('chat_id'))
    print('getting chat',username,chat_id)

    # Connect to the database
    connection = pymysql.connect(host=host,
                                user=user,
                                port=3306,
                                password=password,
                                db=db,
                                cursorclass=pymysql.cursors.DictCursor)

    try:
        with connection.cursor() as cursor:
            # Call the stored procedure
            cursor.callproc('GetChatPrompts', [username, chat_id])
            
            # Fetch the results
            results = cursor.fetchall()
            
            prompts = []
            # Print the results
            print("Results from Stored Procedure:")
            for row in results:
                prompt_id = row['prompt_id']
                cursor.execute("SELECT * FROM responses WHERE prompt_id = %s", (prompt_id,))
                response = cursor.fetchone()
                if response:
                    response_data = {
                        "response_id": response['response_id'],
                        "response_text": response['response_text'],
                    }
                else:
                    response_data = {
                        "response_id": None,
                        "response_text": None,
                    }
                #prompt_date = datetime.strptime(prompt_date, '%Y-%m-%d %H:%M:%S')  # Convert to datetime
                prompts.append({
                    "prompt_id": row['prompt_id'],
                    "prompt_text": [row['prompt_text']],
                    "prompt_date": row['prompt_date'],
                    "response_id": response_data['response_id'],
                    "response_text": response_data['response_text'].split("\n")
                })
            return jsonify(prompts=prompts)
    except Exception as e:
        return jsonify(error=str(e)), 500
    finally:
        # Close the connection
        connection.close()



@chat_bp.route('/get-chats', methods=['GET'])
def get_chats():
    try:
        username = request.args.get('username')  # Assuming the username is passed as a query parameter

        # Select all chats for the given username from the 'chats' table
        select_query = "SELECT * FROM chats WHERE username = %s"
        cursor.execute(select_query, (username,))
        chats = cursor.fetchall()

        # Prepare a list of chat data
        chat_data = []
        for chat in chats:
            chat_id, username, final_prompt_id, starting_date = chat
            prompt_id = final_prompt_id
            
            cursor.execute("SELECT * FROM prompts WHERE prompt_id = %s", ([prompt_id]))
            response = cursor.fetchone()
            if response:
                response_data = response[2]
            else:
                response_data = None
            chat_data.append({
                "chat_id": chat_id,
                "username": username,
                "final_prompt_id": final_prompt_id,
                "starting_date": starting_date.strftime("%Y-%m-%d %H:%M:%S"),
                "prompt_text":response_data
            })

        return jsonify(chats=chat_data)
    except Exception as e:
        return jsonify(error=str(e)), 500
    

@chat_bp.route('/prompts', methods=['POST'])
def create_prompt():
    try:
        data = request.get_json()
        username = data['username']
        prompt_text = data['prompt_text']
        previous_prompt_id = data.get('previous_prompt_id')  # Optional field

        # Insert a new prompt into the 'prompts' table
        insert_query = "INSERT INTO prompts (username, prompt_text, previous_prompt_id) VALUES (%s, %s, %s)"
        cursor.execute(insert_query, (username, prompt_text, previous_prompt_id))
        db.commit()

        return jsonify(message="Prompt created successfully", result = True), 201
    except Exception as e:
        return jsonify(error=str(e)), 400
    

@chat_bp.route('/prompts/<string:username>/<int:prompt_id>', methods=['GET'])
def get_prompt(username, prompt_id):
    try:
        # Retrieve a prompt by username and prompt_id from the 'prompts' table
        select_query = "SELECT * FROM prompts WHERE username = %s AND prompt_id = %s"
        cursor.execute(select_query, (username, prompt_id))
        prompt = cursor.fetchone()

        if prompt:
            prompt_data = {
                "prompt_id": prompt[0],
                "username": prompt[1],
                "prompt_text": prompt[2].split("\n"),
                "previous_prompt_id": prompt[3],
                "prompt_date": prompt[4].strftime("%Y-%m-%d %H:%M:%S")
            }
            return jsonify(prompt_data)
        else:
            return jsonify(message="Prompt not found for the given username and prompt_id"), 404
    except Exception as e:
        return jsonify(error=str(e)), 500
    
# Function to get reponse from file
def get_response_from_file(question):
    import json
    with open('questions_and_answers.json', 'r') as file:
        data = json.load(file)
        for item in data:
            if item['question'].lower() == question.lower():
                return item['answer']
        return "Sorry, I couldn't find an answer to that question."
    
@chat_bp.route('/resolve-prompt', methods=['POST'])
def resolve_prompt():
    try:
        data = request.get_json()
        prompt = data['prompt']
        username = data['username']
        chat_id = data['chat_id']

        # Create some response to the prompt and save it as response_got
        # For now, let's create a random response of 500 characters
        import random
        import string
        print(prompt)
        response_got = get_response_from_file(prompt)
        # response_got = response_got.replace("\n","<br>")

        # Retrieve the final_prompt_id from the chats table based on chat_id and username
        select_final_prompt_query = "SELECT final_prompt_id FROM chats WHERE chat_id = %s AND username = %s"
        cursor.execute(select_final_prompt_query, (chat_id, username))
        result = cursor.fetchone()

        if result:
            previous_prompt_id = result[0]
        else:
            previous_prompt_id = None

        # Save the prompt in the prompts table
        insert_prompt_query = "INSERT INTO prompts (username, prompt_text, previous_prompt_id) VALUES (%s, %s, %s)"
        cursor.execute(insert_prompt_query, (username, prompt, previous_prompt_id))
        db.commit()

        # Get the saved prompt as prompt_saved
        cursor.execute("SELECT LAST_INSERT_ID()")
        prompt_id = cursor.fetchone()[0]
        cursor.execute("SELECT * FROM prompts WHERE prompt_id = %s", (prompt_id,))
        prompt_saved = cursor.fetchone()

        # Save the response in the responses table
        insert_response_query = "INSERT INTO responses (prompt_id, response_text) VALUES (%s, %s)"
        cursor.execute(insert_response_query, (prompt_id, response_got))
        db.commit()

        # Get the saved response as response_saved
        cursor.execute("SELECT LAST_INSERT_ID()")
        response_id = cursor.fetchone()[0]
        cursor.execute("SELECT * FROM responses WHERE response_id = %s", (response_id,))
        response_saved = cursor.fetchone()

        # Update the chat final_prompt_id to prompt_saved.prompt_id using the chat_id
        update_chat_query = "UPDATE chats SET final_prompt_id = %s WHERE chat_id = %s"
        cursor.execute(update_chat_query, (prompt_id, chat_id))
        db.commit()

        # Return the response and prompt as JSON
        return jsonify(response={
                'response_id': response_saved[0],
                'prompt_id' : response_saved[1],
                'response_text' : response_saved[2].split("\n"),
                'response_date' : response_saved[3]
            }, 
            prompt={
                'prompt_id' : prompt_saved[0],
                'username': prompt_saved[1],
                'prompt_text': prompt_saved[2],
                'previous_prompt_id': prompt_saved[3],
                'prompt_date': prompt_saved[4]
            },
            result = True), 200

    except Exception as e:
        return jsonify(error=str(e)), 400
