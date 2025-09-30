FROM haproxy:3.2-alpine

# Switch to root to install packages
USER root

# Install socat for admin socket communication
RUN apk add --no-cache socat

# Create runtime directory with correct permissions
RUN mkdir -p /var/run/haproxy && \
    chown haproxy:haproxy /var/run/haproxy && \
    chmod 755 /var/run/haproxy

# Switch back to haproxy user for security
USER haproxy

# Use default haproxy entrypoint and command