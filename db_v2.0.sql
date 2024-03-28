CREATE DATABASE IF NOT EXISTS LegalBotDB;
USE LegalBotDB;

DROP PROCEDURE IF EXISTS SetChatDeletedFlag;
DROP PROCEDURE IF EXISTS AddPromptAndResponseToChat;
DROP PROCEDURE IF EXISTS GetEntireChatByUsernameAndChatID;
DROP PROCEDURE IF EXISTS GetFirstPromptsByUserID;
DROP PROCEDURE IF EXISTS GetChatByUsernameAndChatID;
DROP TABLE IF EXISTS activity_log;
DROP TABLE IF EXISTS admin_users;
DROP TABLE IF EXISTS responses;
DROP TABLE IF EXISTS prompts;
DROP TABLE IF EXISTS chats;
DROP TABLE IF EXISTS users;

-- Create a table to store user information
CREATE TABLE users (
    username VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create a table to store chats
CREATE TABLE chats(
	chat_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    first_prompt_id INT DEFAULT NULL,
    starting_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (username) REFERENCES users(username)
);

-- Create a table to store user prompts
CREATE TABLE prompts (
    prompt_id INT AUTO_INCREMENT PRIMARY KEY,
    prompt_text TEXT NOT NULL,
    chat_id INT NOT NULL,
    prompt_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chat_id) REFERENCES chats(chat_id)
);

-- Create a table to store responses to user prompts
CREATE TABLE responses (
    response_id INT AUTO_INCREMENT PRIMARY KEY,
    prompt_id INT NOT NULL,
    response_text TEXT NOT NULL,
    response_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prompt_id) REFERENCES prompts(prompt_id)
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
CREATE PROCEDURE GetChatByUsernameAndChatID(
    IN p_username VARCHAR(255),
    IN p_chat_id INT
)
BEGIN
    SELECT c.chat_id, c.username, p.prompt_text AS first_prompt, c.starting_date
    FROM chats c
    JOIN prompts p ON c.first_prompt_id = p.prompt_id
    WHERE c.username = p_username AND c.chat_id = p_chat_id;
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE GetFirstPromptsByUserID(
    IN p_username VARCHAR(255)
)
BEGIN
    SELECT c.chat_id, p.prompt_text AS first_prompt, c.starting_date
    FROM chats c
    LEFT JOIN prompts p ON c.first_prompt_id = p.prompt_id
    WHERE c.username = p_username;
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE GetEntireChatByUsernameAndChatID(
    IN p_username VARCHAR(255),
    IN p_chat_id INT
)
BEGIN
    -- Declare variables
    DECLARE done INT DEFAULT FALSE;
    DECLARE current_prompt_id INT;
    
    -- Cursor declaration
    DECLARE cur CURSOR FOR
        SELECT p.prompt_id
        FROM prompts p
        WHERE p.chat_id = p_chat_id
        ORDER BY p.prompt_date;
        
    -- Declare handlers
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- Create temporary table to hold chat details
    CREATE TEMPORARY TABLE temp_chat (
        prompt_id INT,
        prompt_text TEXT,
        response_text TEXT,
        prompt_date TIMESTAMP,
        response_date TIMESTAMP
    );
    
    -- Open cursor
    OPEN cur;
    
    -- Loop through prompts
    read_loop: LOOP
        FETCH cur INTO current_prompt_id;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Insert prompt and corresponding response into temporary table
        INSERT INTO temp_chat (prompt_id, prompt_text, response_text, prompt_date, response_date)
        SELECT p.prompt_id, p.prompt_text, r.response_text, p.prompt_date, r.response_date
        FROM prompts p
        LEFT JOIN responses r ON p.prompt_id = r.prompt_id
        WHERE p.prompt_id = current_prompt_id;
    END LOOP;
    
    -- Close cursor
    CLOSE cur;
    
    -- Select the entire chat from the temporary table
    SELECT * FROM temp_chat ORDER BY prompt_date;
    
    -- Drop temporary table
    DROP TEMPORARY TABLE IF EXISTS temp_chat;
    
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE AddPromptAndResponseToChat(
    IN p_chat_id INT,
    IN p_username VARCHAR(50),
    IN p_prompt_text TEXT,
    IN p_response_text TEXT
)
BEGIN
    DECLARE v_prompt_id INT;
    
    -- Insert prompt into prompts table
    INSERT INTO prompts (prompt_text, chat_id)
    VALUES (p_prompt_text, p_chat_id);
    
    -- Get the ID of the inserted prompt
    SET v_prompt_id = LAST_INSERT_ID();
    
    -- Insert response into responses table
    INSERT INTO responses (prompt_id, response_text)
    VALUES (v_prompt_id, p_response_text);
    
    -- Update first_prompt_id in chats table if it's not set
    IF NOT EXISTS (SELECT 1 FROM chats WHERE chat_id = p_chat_id AND first_prompt_id IS NOT NULL) THEN
        UPDATE chats SET first_prompt_id = v_prompt_id WHERE chat_id = p_chat_id;
    END IF;
    
END //
DELIMITER ;


DELIMITER //

CREATE PROCEDURE SetChatDeletedFlag(
    IN p_chat_id INT,
    IN p_username VARCHAR(50)
)
BEGIN
    UPDATE chats
    SET deleted = TRUE
    WHERE chat_id = p_chat_id AND username = p_username;
END //

DELIMITER ;