# Use a lightweight Python image
FROM python:3.9-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the current directory contents into the container
COPY . /app

# Expose port 8000 for the HTTP server
EXPOSE 8000

# Command to run the Python HTTP server
CMD ["python3", "-m", "http.server", "8000"]