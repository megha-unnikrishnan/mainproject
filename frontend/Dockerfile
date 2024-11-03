# FROM node:20-alpine

# # Set the working directory
# WORKDIR /app

# # Copy the package.json and package-lock.json files
# COPY package*.json ./

# # Install dependencies
# RUN npm install

# # Copy the React project files
# COPY . .

# # Expose the port
# EXPOSE 3000

# # Start the React app
# CMD ["npm","start"]





FROM node:20-alpine

# Install Python and build tools
RUN apk add --no-cache \
    python3 \
    python3-dev \
    build-base \
    cairo-dev \
    pango-dev \
    jpeg-dev \
    giflib-dev \
    librsvg-dev

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the React project files
COPY . .

# Expose the port
EXPOSE 3000

# Start the React app
CMD ["npm", "start"]
