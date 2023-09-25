# Use node as the base image for building both frontend and backend
FROM node:18.17 AS builder

# Set working directory
WORKDIR /app/frontend

# Build the frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Build the backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ .

# Use Apache to serve the frontend and proxy to the backend
FROM httpd:2.4

# Install Node.js in the Apache stage
RUN apt-get update && \
    apt-get install -y curl && \
    curl -sL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy frontend build output to Apache's htdocs
COPY --from=builder /app/frontend/dist/ /usr/local/apache2/htdocs/

# Copy the backend to a directory inside the container
COPY --from=builder /app/backend/ /usr/local/api/

# Set up reverse proxy with .htaccess
RUN echo 'RewriteEngine On'\
    '\nRewriteRule ^/api(.*) http://localhost:3000/$1 [P]'\
    '\nHeader set Access-Control-Allow-Origin "*"'\
    > /usr/local/apache2/htdocs/.htaccess

# Copy Apache conf to allow .htaccess
COPY ./docker/my-httpd.conf /usr/local/apache2/conf/httpd.conf

# Expose port 80
EXPOSE 80

# Start the backend API and Apache
CMD ["/bin/bash", "-c", "node /usr/local/api/app.js"]
# CMD ["/bin/bash", "-c", "httpd-foreground"]
