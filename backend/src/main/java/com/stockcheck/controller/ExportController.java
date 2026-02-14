package com.stockcheck.controller;

import com.stockcheck.model.*;
import com.stockcheck.repository.DataStore;
import com.stockcheck.util.HttpHelper;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.util.List;

public class ExportController {

    private final DataStore dataStore;

    public ExportController(DataStore dataStore) {
        this.dataStore = dataStore;
    }

    public void register(HttpServer server) {
        server.createContext("/api/export", this::handle);
    }

    private void handle(HttpExchange exchange) throws IOException {
        try {
            String method = exchange.getRequestMethod();

            if ("OPTIONS".equals(method)) {
                HttpHelper.handleCors(exchange);
                return;
            }

            if ("GET".equals(method)) {
                StringBuilder csv = new StringBuilder();
                csv.append("Product ID,Product Name,SKU,Location ID,Location Name,Quantity,Last Updated\n");

                List<StockLevel> levels = dataStore.getAllStockLevels();
                for (StockLevel sl : levels) {
                    Product product = dataStore.getProduct(sl.getProductId());
                    Location location = dataStore.getLocation(sl.getLocationId());
                    csv.append(String.format("%d,\"%s\",\"%s\",%d,\"%s\",%d,%s\n",
                            sl.getProductId(),
                            escapeCsv(product != null ? product.getName() : ""),
                            escapeCsv(product != null ? product.getSku() : ""),
                            sl.getLocationId(),
                            escapeCsv(location != null ? location.getName() : ""),
                            sl.getQuantity(),
                            sl.getUpdatedAt() != null ? sl.getUpdatedAt().toString() : ""));
                }

                HttpHelper.sendCsv(exchange, csv.toString(), "stock-levels.csv");
            } else {
                HttpHelper.sendError(exchange, 405, "Method not allowed");
            }
        } catch (Exception e) {
            HttpHelper.sendError(exchange, 500, e.getMessage());
        }
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        return value.replace("\"", "\"\"");
    }
}
