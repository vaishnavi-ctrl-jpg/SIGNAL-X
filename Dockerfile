FROM python:3.11-slim

WORKDIR /app

# Copy all files to the container
COPY . .

# Expose port 8080
EXPOSE 8080

# Start the server
CMD ["python", "server.py"]
