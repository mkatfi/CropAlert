# Dockerfile (backend)
# Use an official Node.js runtime as a parent image
FROM node:latest

# Set the working directory
WORKDIR /app



# Copy package.json and package-lock.json
COPY ./backend/package.json ./backend/tsconfig.json ./backend/tsconfig.build.json  ./


# Copy the rest of the application code
# COPY ./backend .

# Install dependencies
RUN npm install

# Build the NestJS app
# RUN npm run build

# Expose port 3001 (or whatever port your NestJS app runs on)
EXPOSE 3001

# Start the NestJS app
CMD ["npm", "run", "start:dev"]