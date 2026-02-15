# Stage 1: Build the React application
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the static files with Nginx
FROM nginx:stable-alpine
# Copy the custom Nginx configuration to proxy API requests
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy the built React application from the build stage
COPY --from=build /app/dist /usr/share/nginx/html
# Expose the port Nginx will listen on
EXPOSE 80
# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
