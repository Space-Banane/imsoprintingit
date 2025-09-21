FROM nginx:alpine

# Install curl and unzip
RUN apk add --no-cache curl unzip

# Copy download script
COPY download-latest.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/download-latest.sh

# Download and extract latest release
RUN /usr/local/bin/download-latest.sh

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
