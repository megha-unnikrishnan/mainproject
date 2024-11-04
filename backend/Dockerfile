



# # Use the official Python image from Docker Hub
# FROM python:3.8

# # Set environment variables to prevent Python from writing .pyc files and to ensure stdout/stderr is logged
# ENV PYTHONDONTWRITEBYTECODE 1
# ENV PYTHONUNBUFFERED 1

# # Set the working directory in the container
# WORKDIR /app



# # Install dependencies
# COPY requirements.txt /app/
# RUN pip install --upgrade pip && pip install -r requirements.txt

# # Copy the Django project code into the Docker image
# COPY . /app

# # Start the Django server
# CMD ["python3", "manage.py", "runserver", "0.0.0.0:8000"]



# Use the official Python image
FROM python:3.8

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt /app/
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy the Django project code into the Docker image
COPY . /app

# Use Gunicorn as the WSGI server
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "backend.wsgi:application"]
