package com.stockcheck;

import com.stockcheck.controller.*;
import com.stockcheck.repository.DataStore;
import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;

public class StockCheckApplication {

    public static void main(String[] args) throws Exception {
        int port = 8080;
        if (args.length > 0) {
            port = Integer.parseInt(args[0]);
        }

        DataStore dataStore = new DataStore();
        dataStore.loadOrInitialize();

        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);

        new LocationController(dataStore).register(server);
        new ProductController(dataStore).register(server);
        new StockLevelController(dataStore).register(server);
        new AlertThresholdController(dataStore).register(server);
        new ExportController(dataStore).register(server);

        server.setExecutor(null);
        server.start();
        System.out.println("StockCheck API server running on http://localhost:" + port);
    }
}
