# Stage 1: Build the React application
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the static files with Nginx
FROM nginx:stable-alpine
# Copy the Nginx configuration template. It will be processed on container startup.
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
# Copy the built React application from the build stage
COPY --from=build /app/dist /usr/share/nginx/html
# Expose the port Nginx will listen on
EXPOSE 80
# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
