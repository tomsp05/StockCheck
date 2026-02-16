package com.stockcheck;

import com.stockcheck.controller.*;
import com.stockcheck.repository.DataStore;
import com.stockcheck.repository.DatabaseManager; // Added import
import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.sql.SQLException; // Added import

public class StockCheckApplication {

    public static void main(String[] args) throws Exception, SQLException { // Added SQLException
        int port = 8080;
        if (args.length > 0) {
            port = Integer.parseInt(args[0]);
        }

        DatabaseManager dbManager = new DatabaseManager();

        // Retry connecting to the database (allows time for Render PostgreSQL to be reachable)
        int maxRetries = 30;
        for (int i = 1; i <= maxRetries; i++) {
            try {
                dbManager.initializeSchema();
                break;
            } catch (Exception e) {
                if (i == maxRetries) {
                    System.err.println("Failed to connect to database after " + maxRetries + " attempts.");
                    throw e;
                }
                System.out.println("Database not ready, retrying in 3s... (" + i + "/" + maxRetries + ")");
                Thread.sleep(3000);
            }
        }

        DataStore dataStore = new DataStore();
        dataStore.loadOrInitialize();

        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);

        new LocationController(dataStore).register(server);
        new ProductController(dataStore).register(server);
        new CategoryController(dataStore).register(server);
        new StockLevelController(dataStore).register(server);
        new AlertThresholdController(dataStore).register(server);
        new ExportController(dataStore).register(server);

        server.setExecutor(null);
        server.start();
        System.out.println("StockCheck API server running on http://localhost:" + port);
    }
}
