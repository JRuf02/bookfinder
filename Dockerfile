# Use Alpine-based Node.js image for smaller size and fewer vulnerabilities
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies (Alpine needs a few extra packages sometimes)
# (Uncomment if you run into problems with native modules or fonts, etc.)
# RUN apk add --no-cache libc6-compat

# Copy package.json and lock file
COPY package*.json ./

# Install npm packages
RUN npm install

# Copy the rest of the app
COPY . .

# Expose the port
EXPOSE 3000

# Run static server to serve the front-end
CMD ["npx", "serve", "public", "-l", "3000"]
