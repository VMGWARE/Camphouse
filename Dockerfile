# Use node as the base image for building both frontend and backend
FROM node:18 AS builder

# Set working directory
WORKDIR /app

# Build the frontend
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN rm -rf node_modules
RUN export NODE_OPTIONS=--max_old_space_size=4096
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
    '\nProxyPassReverse /api http://localhost:3000/'\
    '\nHeader set Access-Control-Allow-Origin "*"'\
    > /usr/local/apache2/htdocs/.htaccess

# Copy Apache conf to allow .htaccess
COPY ./my-httpd.conf /usr/local/apache2/conf/httpd.conf

# Update the Apache conf to load the prefork MPM
RUN echo 'LoadModule mpm_prefork_module modules/mod_mpm_prefork.so' >> /usr/local/apache2/conf/httpd.conf

# Start the backend API and Apache
CMD ["/bin/bash", "-c", "node /usr/local/api/server.js & httpd-foreground"]
