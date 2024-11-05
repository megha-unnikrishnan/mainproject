



# Use Node.js image (non-Alpine) to avoid compatibility issues with npm
FROM node:20 AS build

# Install build dependencies (for image processing, etc., if needed)
RUN apt-get update && apt-get install -y \
    python3 \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
 && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json files first to cache npm install step
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the React project files
COPY . .

# Build the app
RUN npm run build

# Use a lightweight server to serve the static files
FROM nginx:alpine

# Copy the built React app from the previous stage
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80 for the Nginx server
EXPOSE 80

# Start the Nginx server
CMD ["nginx", "-g", "daemon off;"]
