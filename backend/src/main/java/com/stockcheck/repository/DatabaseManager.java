package com.stockcheck.repository;

import java.net.URI;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

public class DatabaseManager {

    private static final String[] DB_CONFIG = parseDbConfig();
    private static final String DB_URL = DB_CONFIG[0];
    private static final String DB_USER = DB_CONFIG[1];
    private static final String DB_PASSWORD = DB_CONFIG[2];

    // Render provides postgres://user:pass@host:port/db URLs.
    // JDBC cannot parse credentials in the URL, so we extract them separately.
    private static String[] parseDbConfig() {
        String url = System.getenv("JDBC_DATABASE_URL");
        String user = System.getenv("JDBC_DATABASE_USER");
        String password = System.getenv("JDBC_DATABASE_PASSWORD");

        if (url != null && (url.startsWith("postgres://") || url.startsWith("postgresql://"))) {
            try {
                // Parse the postgres:// URL to extract components
                URI uri = new URI(url);
                String host = uri.getHost();
                int port = uri.getPort();
                String dbName = uri.getPath();
                if (dbName != null && dbName.startsWith("/")) {
                    dbName = dbName.substring(1);
                }

                // Extract credentials from the URL if not provided separately
                String userInfo = uri.getUserInfo();
                if (userInfo != null) {
                    String[] parts = userInfo.split(":", 2);
                    if (user == null) user = parts[0];
                    if (password == null && parts.length > 1) password = parts[1];
                }

                // Build a clean JDBC URL (host:port/db only, no credentials)
                String jdbcUrl = "jdbc:postgresql://" + host;
                if (port > 0) jdbcUrl += ":" + port;
                jdbcUrl += "/" + dbName + "?sslmode=require";

                return new String[]{jdbcUrl, user, password};
            } catch (Exception e) {
                System.err.println("Failed to parse database URL: " + e.getMessage());
            }
        }

        // Already a JDBC URL or local development
        return new String[]{url, user, password};
    }

    public DatabaseManager() {
        try {
            Class.forName("org.postgresql.Driver");
        } catch (ClassNotFoundException e) {
            System.err.println("PostgreSQL JDBC Driver not found. Make sure the JAR is in the classpath.");
            e.printStackTrace();
            throw new RuntimeException("Failed to load JDBC driver", e);
        }
    }

    public Connection getConnection() throws SQLException {
        if (DB_URL == null || DB_USER == null || DB_PASSWORD == null) {
            System.err.println("Database environment variables (JDBC_DATABASE_URL, JDBC_DATABASE_USER, JDBC_DATABASE_PASSWORD) are not set.");
            throw new SQLException("Database configuration missing.");
        }
        return DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD);
    }

    public void initializeSchema() {
        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement()) {

            System.out.println("Initializing database schema...");

            // --- Categories Table ---
            stmt.execute("CREATE TABLE IF NOT EXISTS categories (" +
                         "id BIGSERIAL PRIMARY KEY," +
                         "name VARCHAR(255) NOT NULL," +
                         "attributes TEXT," + // Storing as JSON string
                         "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP," +
                         "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
                         ");");

            // --- Locations Table ---
            stmt.execute("CREATE TABLE IF NOT EXISTS locations (" +
                         "id BIGSERIAL PRIMARY KEY," +
                         "name VARCHAR(255) NOT NULL," +
                         "address TEXT," +
                         "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP," +
                         "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
                         ");");

            // --- Products Table ---
            stmt.execute("CREATE TABLE IF NOT EXISTS products (" +
                         "id BIGSERIAL PRIMARY KEY," +
                         "name VARCHAR(255) NOT NULL," +
                         "sku VARCHAR(255) UNIQUE NOT NULL," +
                         "description TEXT," +
                         "category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL," +
                         "attribute_values TEXT," + // Storing as JSON string
                         "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP," +
                         "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
                         ");");

            // --- StockLevels Table ---
            stmt.execute("CREATE TABLE IF NOT EXISTS stock_levels (" +
                         "id BIGSERIAL PRIMARY KEY," +
                         "product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE," +
                         "location_id BIGINT NOT NULL REFERENCES locations(id) ON DELETE CASCADE," +
                         "quantity INTEGER NOT NULL," +
                         "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP," +
                         "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP," +
                         "UNIQUE (product_id, location_id)" +
                         ");");

            // --- AlertThresholds Table ---
            stmt.execute("CREATE TABLE IF NOT EXISTS alert_thresholds (" +
                         "id BIGSERIAL PRIMARY KEY," +
                         "product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE," +
                         "location_id BIGINT NOT NULL REFERENCES locations(id) ON DELETE CASCADE," +
                         "min_quantity INTEGER NOT NULL," +
                         "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP," +
                         "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP," +
                         "UNIQUE (product_id, location_id)" +
                         ");");

            System.out.println("Database schema initialized successfully.");

        } catch (SQLException e) {
            System.err.println("Error initializing database schema: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to initialize database schema", e);
        }
    }
}
