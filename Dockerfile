FROM postgres
ENV POSTGRES_PASSWORD password
ENV POSTGRES_DB grit
COPY db.sql /docker-entrypoint-initdb.d/