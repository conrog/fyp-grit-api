# GRIT API Application

This is the API application submitted with my final year project. 

The front-end application for this project can be found at [https://github.com/conrog/fyp-grit-frontend](https://github.com/conrog/fyp-grit-frontend)

## To Run Locally 

Docker must be installed on your machine.

In root of the project directory perform the following steps:

Create a .env file with the following variables 
```
SERVER_PORT= 8080
JWT_SECRET= 
JWT_EXPIRES_IN = 2h
X_RAPIDAPI_HOST = 
X_RAPIDAPI_KEY = 
PSQL_HOSTNAME = localhost
PSQL_PORT = 5432
PSQL_DB_NAME = grit
PSQL_USER = postgres
PSQL_PASSWORD = password
```

The JWT_SECRET, X_RAPIDAPI_HOST and X_RAPIDAPI_KEY variables values can be obtained from Figure 67 in the Dissertation document.

Install the required npm dependencies by running `npm install`.

Create a Docker image of the required PostgreSQL database from the Dockerfile by running `docker build -t grit-db-image ./`

Once the image has been built, launch the Docker PostgreSQL container by running `docker run -d –name grit-db-container –p 5432:5432 grit-db-image`

Once the dependencies have installed and the Docker container is running you can start the application by running the following command `npm start`

