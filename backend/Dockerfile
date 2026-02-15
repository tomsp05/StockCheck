# Use a standard Java image that includes the JDK for compiling and running
FROM eclipse-temurin:17-jdk-jammy
WORKDIR /app

# Copy the entire backend source code into the container first
COPY . .

# Now, execute all build steps in a single RUN command for efficiency and robustness
RUN set -e && \
    # 1. Ensure the lib directory exists and add the PostgreSQL JDBC driver
    mkdir -p lib && \
    curl -L -o lib/postgresql.jar https://repo1.maven.org/maven2/org/postgresql/postgresql/42.7.3/postgresql-42.7.3.jar && \
    # 2. Make the build script executable
    chmod +x build.sh && \
    # 3. Run the build script to compile the code
    ./build.sh

# Expose the port the application runs on
EXPOSE 8080

# Command to run the application. The classpath includes the compiled code in 'out'
# and all .jar files in 'lib', including the H2 driver we downloaded.
CMD ["java", "-cp", "out:lib/*", "com.stockcheck.StockCheckApplication"]
