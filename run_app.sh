#!/bin/bash

# Terminal 1: Run the backend server
cd backend && source env/bin/activate && python app.py

# Terminal 2: Run the frontend server
cd frontend && ng serve

# Terminal 3: Start MySQL
mysql -u root -prootpassword