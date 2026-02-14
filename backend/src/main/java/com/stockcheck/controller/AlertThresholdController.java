package com.stockcheck.controller;

import com.stockcheck.model.*;
import com.stockcheck.repository.DataStore;
import com.stockcheck.util.*;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

public class AlertThresholdController {

    private final DataStore dataStore;

    public AlertThresholdController(DataStore dataStore) {
        this.dataStore = dataStore;
    }

    public void register(HttpServer server) {
        server.createContext("/api/thresholds", this::handle);
    }

    private void handle(HttpExchange exchange) throws IOException {
        try {
            String method = exchange.getRequestMethod();
            String path = exchange.getRequestURI().getPath();

            if ("OPTIONS".equals(method)) {
                HttpHelper.handleCors(exchange);
                return;
            }

            Long id = HttpHelper.pathId(path, "/api/thresholds");

            if ("GET".equals(method) && id == null) {
                List<Map<String, Object>> list = dataStore.getAllThresholds().stream()
                        .map(t -> {
                            Product product = dataStore.getProduct(t.getProductId());
                            Location location = dataStore.getLocation(t.getLocationId());
                            return t.toMap(product, location);
                        }).collect(Collectors.toList());
                HttpHelper.sendJson(exchange, 200, Json.toJsonArray(list));
            } else if ("PUT".equals(method)) {
                Map<String, Object> body = Json.parseObject(HttpHelper.readBody(exchange));
                long productId = Json.getLong(body, "productId");
                long locationId = Json.getLong(body, "locationId");
                int minQuantity = Json.getInt(body, "minQuantity", 0);
                AlertThreshold t = dataStore.setThreshold(productId, locationId, minQuantity);
                Product product = dataStore.getProduct(t.getProductId());
                Location location = dataStore.getLocation(t.getLocationId());
                HttpHelper.sendJson(exchange, 200, Json.toJson(t.toMap(product, location)));
            } else if ("DELETE".equals(method) && id != null) {
                dataStore.deleteThreshold(id);
                HttpHelper.sendNoContent(exchange);
            } else {
                HttpHelper.sendError(exchange, 405, "Method not allowed");
            }
        } catch (Exception e) {
            HttpHelper.sendError(exchange, 500, e.getMessage());
        }
    }
}
