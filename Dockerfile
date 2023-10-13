# Use node as the base image for building both frontend and backend
FROM node:18.17 AS builder

# TODO: Get git project version and save to environment variable and file
# Set working directory
WORKDIR /app

# Copy the git project to the working directory
COPY .git/ .git/

# Get the git project version and set it as an environment variable
RUN VERSION=$(git describe --tags --always HEAD)
# Save git version to an environment variable
ARG GIT_VERSION=$(VERSION)

# Set working directory
WORKDIR /app/frontend

# Build the frontend
# Set the environment variable for the frontend
ENV VUE_APP_GIT_VERSION=$GIT_VERSION
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Build the backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ .
RUN cd ../ && git describe --tags --always HEAD > backend/version

# Use Apache to serve the frontend and proxy to the backend
FROM httpd:2.4

# Install Node.js, curl, and git in the Apache stage
RUN apt-get update && \
    apt-get install -y curl git && \
    curl -sL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy frontend build output to Apache's htdocs
COPY --from=builder /app/frontend/dist/ /usr/local/apache2/htdocs/

# Copy the backend to a directory inside the container
COPY --from=builder /app/backend/ /usr/local/api/

# Set up reverse proxy with .htaccess
COPY ./docker/.htaccess /usr/local/apache2/htdocs/.htaccess

# Copy Apache conf to allow .htaccess
COPY ./docker/my-httpd.conf /usr/local/apache2/conf/httpd.conf

# Copy the entrypoint script
COPY ./docker/entrypoint.sh /usr/local/bin/entrypoint.sh

# Make the entrypoint script executable
RUN chmod +x /usr/local/bin/entrypoint.sh

# Set the entrypoint script as the entrypoint
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

# Expose port 80
EXPOSE 80

# Start Apache
CMD ["httpd-foreground"]
