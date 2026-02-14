package com.stockcheck.controller;

import com.stockcheck.model.*;
import com.stockcheck.repository.DataStore;
import com.stockcheck.util.*;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

public class StockLevelController {

    private final DataStore dataStore;

    public StockLevelController(DataStore dataStore) {
        this.dataStore = dataStore;
    }

    public void register(HttpServer server) {
        server.createContext("/api/stock", this::handle);
    }

    private void handle(HttpExchange exchange) throws IOException {
        try {
            String method = exchange.getRequestMethod();
            String path = exchange.getRequestURI().getPath();

            if ("OPTIONS".equals(method)) {
                HttpHelper.handleCors(exchange);
                return;
            }

            if ("GET".equals(method) && path.equals("/api/stock")) {
                List<Map<String, Object>> list = enrichStockLevels(dataStore.getAllStockLevels());
                HttpHelper.sendJson(exchange, 200, Json.toJsonArray(list));
            } else if ("GET".equals(method) && path.startsWith("/api/stock/location/")) {
                long locationId = Long.parseLong(path.substring("/api/stock/location/".length()));
                List<Map<String, Object>> list = enrichStockLevels(dataStore.getStockByLocation(locationId));
                HttpHelper.sendJson(exchange, 200, Json.toJsonArray(list));
            } else if ("GET".equals(method) && path.startsWith("/api/stock/product/")) {
                long productId = Long.parseLong(path.substring("/api/stock/product/".length()));
                List<Map<String, Object>> list = enrichStockLevels(dataStore.getStockByProduct(productId));
                HttpHelper.sendJson(exchange, 200, Json.toJsonArray(list));
            } else if ("GET".equals(method) && path.equals("/api/stock/alerts")) {
                List<Map<String, Object>> alerts = dataStore.getLowStockAlerts();
                HttpHelper.sendJson(exchange, 200, Json.toJsonArray(alerts));
            } else if ("PUT".equals(method) && path.equals("/api/stock")) {
                Map<String, Object> body = Json.parseObject(HttpHelper.readBody(exchange));
                long productId = Json.getLong(body, "productId");
                long locationId = Json.getLong(body, "locationId");
                int quantity = Json.getInt(body, "quantity", 0);
                StockLevel sl = dataStore.addOrUpdateStockLevel(productId, locationId, quantity);
                Product product = dataStore.getProduct(sl.getProductId());
                Location location = dataStore.getLocation(sl.getLocationId());
                HttpHelper.sendJson(exchange, 200, Json.toJson(sl.toMap(product, location)));
            } else {
                HttpHelper.sendError(exchange, 405, "Method not allowed");
            }
        } catch (Exception e) {
            HttpHelper.sendError(exchange, 500, e.getMessage());
        }
    }

    private List<Map<String, Object>> enrichStockLevels(List<StockLevel> levels) {
        return levels.stream().map(sl -> {
            Product product = dataStore.getProduct(sl.getProductId());
            Location location = dataStore.getLocation(sl.getLocationId());
            return sl.toMap(product, location);
        }).collect(Collectors.toList());
    }
}
