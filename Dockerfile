# Use node as the base image for building both frontend and backend
FROM node:16 AS builder

# Set working directory
WORKDIR /app

# Build the frontend
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm install
COPY frontend/ .
RUN npm run build

# Build the backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ .

# Use Apache to serve the frontend and proxy to the backend
FROM httpd:2.4

# Copy frontend build output to Apache's htdocs
COPY --from=builder /app/frontend/dist/ /usr/local/apache2/htdocs/

# Copy the backend to a directory inside the container
COPY --from=builder /app/backend/ /usr/local/api/

# Set up reverse proxy with .htaccess
RUN echo 'RewriteEngine On'\
    '\nRewriteRule ^/api(.*) http://localhost:3000/$1 [P]'\
    '\nProxyPassReverse /api http://localhost:3000/'\
    '\nHeader set Access-Control-Allow-Origin "*"'\
    > /usr/local/apache2/htdocs/.htaccess

# Copy Apache conf to allow .htaccess
COPY ./my-httpd.conf /usr/local/apache2/conf/httpd.conf

# Start the backend API and Apache
CMD ["/bin/bash", "-c", "node /usr/local/api/server.js & httpd-foreground"]
