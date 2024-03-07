import pymysql

# Database connection details (replace with your actual database details)
host = 'localhost'
user = 'root'
password = 'rootpassword'
db = 'LegalBotDB'

# Parameters for the stored procedure
username = 'ammar_haider'
chat_id = 2

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
        
        # Print the results
        print("Results from Stored Procedure:")
        for row in results:
            print(row)

finally:
    # Close the connection
    connection.close()
