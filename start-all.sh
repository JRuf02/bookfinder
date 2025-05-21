#!/bin/sh
# Install Python dependencies
python3 -m venv /workspaces/isbn-scanner/.venv && . /workspaces/isbn-scanner/.venv/bin/activate
cd /workspaces/isbn-scanner/server
pip install -r requirements.txt

# Start Python server in background
python app.py &
SERVER_PID=$!

# Start React app
cd /workspaces/isbn-scanner
npm run dev &
REACT_PID=$!

# Wait for both to exit
wait $SERVER_PID $REACT_PID