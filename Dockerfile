FROM nginx:alpine

# Copy the application files to the nginx html directory
COPY . /usr/share/nginx/html

# Remove unnecessary files from the final image
RUN rm -rf /usr/share/nginx/html/node_modules \
    /usr/share/nginx/html/Dockerfile \
    /usr/share/nginx/html/docker-compose.yml \
    /usr/share/nginx/html/.git \
    /usr/share/nginx/html/.github \
    /usr/share/nginx/html/.gitignore

# Configure nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 