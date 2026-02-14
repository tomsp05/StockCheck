package com.stockcheck.controller;

import com.stockcheck.model.Product;
import com.stockcheck.repository.DataStore;
import com.stockcheck.util.*;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

public class ProductController {

    private final DataStore dataStore;

    public ProductController(DataStore dataStore) {
        this.dataStore = dataStore;
    }

    public void register(HttpServer server) {
        server.createContext("/api/products", this::handle);
    }

    private void handle(HttpExchange exchange) throws IOException {
        try {
            String method = exchange.getRequestMethod();
            String path = exchange.getRequestURI().getPath();

            if ("OPTIONS".equals(method)) {
                HttpHelper.handleCors(exchange);
                return;
            }

            Long id = HttpHelper.pathId(path, "/api/products");

            if ("GET".equals(method) && id == null) {
                List<Map<String, Object>> list = dataStore.getAllProducts().stream()
                        .map(Product::toMap).collect(Collectors.toList());
                HttpHelper.sendJson(exchange, 200, Json.toJsonArray(list));
            } else if ("GET".equals(method) && id != null) {
                Product p = dataStore.getProduct(id);
                if (p == null) { HttpHelper.sendError(exchange, 404, "Product not found"); return; }
                HttpHelper.sendJson(exchange, 200, Json.toJson(p.toMap()));
            } else if ("POST".equals(method)) {
                Map<String, Object> body = Json.parseObject(HttpHelper.readBody(exchange));
                Product p = dataStore.addProduct(
                        Json.getString(body, "name"),
                        Json.getString(body, "sku"),
                        Json.getString(body, "description"));
                HttpHelper.sendJson(exchange, 201, Json.toJson(p.toMap()));
            } else if ("PUT".equals(method) && id != null) {
                Map<String, Object> body = Json.parseObject(HttpHelper.readBody(exchange));
                Product p = dataStore.updateProduct(id,
                        Json.getString(body, "name"),
                        Json.getString(body, "sku"),
                        Json.getString(body, "description"));
                if (p == null) { HttpHelper.sendError(exchange, 404, "Product not found"); return; }
                HttpHelper.sendJson(exchange, 200, Json.toJson(p.toMap()));
            } else if ("DELETE".equals(method) && id != null) {
                dataStore.deleteProduct(id);
                HttpHelper.sendNoContent(exchange);
            } else {
                HttpHelper.sendError(exchange, 405, "Method not allowed");
            }
        } catch (Exception e) {
            HttpHelper.sendError(exchange, 500, e.getMessage());
        }
    }
}
