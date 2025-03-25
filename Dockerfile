# Use a Python base image (you can choose a specific version)
FROM python:3.9-slim-buster

# Set the working directory inside the container
WORKDIR /app

# Copy the Python script into the container
COPY . /app/

# Install any dependencies (in this case, there are none besides Python itself, but if you add any later, this is where they go)
# Example: If you use a library like "beautifulsoup4", you'd add:
# RUN pip install beautifulsoup4

# Specify the command to run when the container starts
CMD ["python", "/app/vtt_parser.py"]