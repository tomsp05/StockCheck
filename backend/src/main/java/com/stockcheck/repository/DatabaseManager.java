package com.stockcheck.repository;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

public class DatabaseManager {

    private static final String DB_URL = System.getenv("JDBC_DATABASE_URL");
    private static final String DB_USER = System.getenv("JDBC_DATABASE_USER");
    private static final String DB_PASSWORD = System.getenv("JDBC_DATABASE_PASSWORD");

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
