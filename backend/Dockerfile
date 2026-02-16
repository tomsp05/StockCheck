# Use a standard Java image that includes the JDK for compiling and running
FROM eclipse-temurin:17-jdk-jammy
WORKDIR /app

# Copy the entire backend source code into the container first
# This includes lib/postgresql-42.7.3.jar already in the repo
COPY . .

# Compile the Java source code
RUN chmod +x build.sh && ./build.sh

# Expose the default port (Render overrides via PORT env var)
EXPOSE 8080

# Use shell form so the glob (lib/*) expands and $PORT is substituted
CMD java -cp "out:lib/*" com.stockcheck.StockCheckApplication ${PORT:-8080}
