# Use an official Node.js runtime as a parent image
FROM node:latest

# Set the working directory
WORKDIR /app

# Copy package.json, package-lock.json, and other necessary config files
COPY ./frontend/package.json ./frontend/package-lock.json ./frontend/tailwind.config.js ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY ./frontend .

# Expose port 3000
EXPOSE 3000

# Start the Next.js app in development mode
CMD ["npm", "start"]