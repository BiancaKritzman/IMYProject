# IMY220_D1

https://github.com/BiancaKritzman/IMY220_D1.git

# Commands to build and run Docker

# Build images
docker build -t frontend-app ./frontend
docker build -t backend-app ./backend

# Run containers
docker run -d -p 3000:3000 --name frontend-container frontend-app
docker run -d -p 5000:5000 --name backend-container backend-app

# Directory structure
/frontend/src
/backend/server.js
/backend/db.js
/backend/models.js