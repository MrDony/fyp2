CREATE DATABASE IF NOT EXISTS LegalBotDB;
USE LegalBotDB;
DROP PROCEDURE IF EXISTS GetChatPrompts;
DROP TABLE IF EXISTS activity_log;
DROP TABLE IF EXISTS admin_users;
DROP TABLE IF EXISTS chats;
DROP TABLE IF EXISTS responses;
DROP TABLE IF EXISTS prompts;
DROP TABLE IF EXISTS users;
-- Create a table to store user information
CREATE TABLE users (
    username VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create a table to store user prompts
CREATE TABLE prompts (
    prompt_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    prompt_text TEXT NOT NULL,
    previous_prompt_id INT DEFAULT NULL,
    prompt_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (username) REFERENCES users(username)
);

-- Create a table to store responses to user prompts
CREATE TABLE responses (
    response_id INT AUTO_INCREMENT PRIMARY KEY,
    prompt_id INT NOT NULL,
    response_text TEXT NOT NULL,
    response_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prompt_id) REFERENCES prompts(prompt_id)
);

-- Create a table to store chats
CREATE TABLE chats(
	chat_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    final_prompt_id INT DEFAULT NULL,
    starting_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (final_prompt_id) REFERENCES prompts(prompt_id),
    FOREIGN KEY (username) REFERENCES users(username)
);

-- Create a table to store administrative users (for managing the system)
CREATE TABLE admin_users (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Create a table to log system activities (optional for auditing)
CREATE TABLE activity_log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50),
    activity_description TEXT,
    activity_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (username) REFERENCES users(username)
);





DELIMITER //

CREATE PROCEDURE GetChatPrompts(IN p_username VARCHAR(255), IN p_chat_id INT)
BEGIN
    DECLARE done INT DEFAULT 0;
    DECLARE current_prompt_id INT;
    -- Drop the temporary table
    DROP TEMPORARY TABLE IF EXISTS TempChatPrompts;
    -- Create a temporary table to store prompts in reverse order
    CREATE TEMPORARY TABLE TempChatPrompts (
        prompt_id INT,
        prompt_text TEXT,
        prompt_date TIMESTAMP
    );
    
    -- Find the final prompt_id for the given chat_id
    SELECT final_prompt_id INTO current_prompt_id FROM chats WHERE chat_id = p_chat_id;
    
    -- Traverse the linked list to collect prompts in reverse order
    WHILE NOT done DO
        INSERT INTO TempChatPrompts (prompt_id, prompt_text, prompt_date)
        SELECT prompt_id, prompt_text, prompt_date
        FROM prompts
        WHERE username = p_username AND prompt_id = current_prompt_id;
        
        SELECT previous_prompt_id INTO current_prompt_id FROM prompts WHERE prompt_id = current_prompt_id;
        
        IF current_prompt_id IS NULL THEN
            SET done = 1;
        END IF;
    END WHILE;
    
    -- Retrieve prompts in ascending order
    SELECT * FROM TempChatPrompts ORDER BY prompt_date ASC;
    
    
END;
//

DELIMITER ;


CALL GetChatPrompts('ammar_haider', 2);
