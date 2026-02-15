FROM eclipse-temurin:17-jdk-jammy
WORKDIR /app

# Download the PostgreSQL JDBC driver
RUN mkdir -p lib && \
    curl -L -o lib/postgresql.jar https://jdbc.postgresql.org/download/postgresql-42.7.3.jar

# Copy the entire backend source code into the container
COPY . .

# Make the build script executable and compile
RUN chmod +x build.sh && ./build.sh

EXPOSE 8080

# Run the application with compiled classes and the PostgreSQL driver on the classpath
CMD ["java", "-cp", "out:lib/*", "com.stockcheck.StockCheckApplication"]
