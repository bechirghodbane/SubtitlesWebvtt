# Use a Python base image (you can choose a specific version)
FROM python:3.9-slim-buster

# Set the working directory inside the container
WORKDIR /app

# Copy the Python script into the container
COPY . /app/

# Install Streamlit and any other dependencies
RUN pip install streamlit

# Specify the command to run the Streamlit app when the container starts
CMD ["streamlit", "run", "/app/vtt_parser.py", "--server.port=8501", "--server.address=0.0.0.0"]