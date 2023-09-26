#!/bin/bash

# Start the api server
node backend/app.js &

# Navigate to frontend directory and start the app
cd frontend
npm run serve
