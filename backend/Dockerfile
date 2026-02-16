# Use a standard Java image that includes the JDK for compiling and running
FROM eclipse-temurin:17-jdk-jammy
WORKDIR /app

# Copy the entire backend source code into the container first
COPY . .

# Download the PostgreSQL JDBC driver (*.jar is gitignored so it's not in the repo)
# then compile the Java source code
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/* && \
    mkdir -p lib && \
    curl -L -o lib/postgresql-42.7.3.jar https://repo1.maven.org/maven2/org/postgresql/postgresql/42.7.3/postgresql-42.7.3.jar && \
    chmod +x build.sh && ./build.sh

# Expose the default port (Render overrides via PORT env var)
EXPOSE 8080

# Use shell form so the glob (lib/*) expands and $PORT is substituted
CMD java -cp "out:lib/*" com.stockcheck.StockCheckApplication ${PORT:-8080}
