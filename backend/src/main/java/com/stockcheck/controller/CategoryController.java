package com.stockcheck.controller;

import com.stockcheck.model.AttributeDefinition;
import com.stockcheck.model.Category;
import com.stockcheck.repository.DataStore;
import com.stockcheck.util.*;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

public class CategoryController {

    private final DataStore dataStore;

    public CategoryController(DataStore dataStore) {
        this.dataStore = dataStore;
    }

    public void register(HttpServer server) {
        server.createContext("/api/categories", this::handle);
    }

    private void handle(HttpExchange exchange) throws IOException {
        try {
            String method = exchange.getRequestMethod();
            String path = exchange.getRequestURI().getPath();

            if ("OPTIONS".equals(method)) {
                HttpHelper.handleCors(exchange);
                return;
            }

            Long id = HttpHelper.pathId(path, "/api/categories");

            if ("GET".equals(method) && id == null) {
                List<Map<String, Object>> list = dataStore.getAllCategories().stream()
                        .map(Category::toMap).collect(Collectors.toList());
                HttpHelper.sendJson(exchange, 200, Json.toJsonArray(list));
            } else if ("GET".equals(method) && id != null) {
                Category c = dataStore.getCategory(id);
                if (c == null) { HttpHelper.sendError(exchange, 404, "Category not found"); return; }
                HttpHelper.sendJson(exchange, 200, Json.toJson(c.toMap()));
            } else if ("POST".equals(method)) {
                Map<String, Object> body = Json.parseObject(HttpHelper.readBody(exchange));
                List<AttributeDefinition> attrs = parseAttributes(body);
                Category c = dataStore.addCategory(Json.getString(body, "name"), attrs);
                HttpHelper.sendJson(exchange, 201, Json.toJson(c.toMap()));
            } else if ("PUT".equals(method) && id != null) {
                Map<String, Object> body = Json.parseObject(HttpHelper.readBody(exchange));
                List<AttributeDefinition> attrs = parseAttributes(body);
                Category c = dataStore.updateCategory(id, Json.getString(body, "name"), attrs);
                if (c == null) { HttpHelper.sendError(exchange, 404, "Category not found"); return; }
                HttpHelper.sendJson(exchange, 200, Json.toJson(c.toMap()));
            } else if ("DELETE".equals(method) && id != null) {
                dataStore.deleteCategory(id);
                HttpHelper.sendNoContent(exchange);
            } else {
                HttpHelper.sendError(exchange, 405, "Method not allowed");
            }
        } catch (Exception e) {
            HttpHelper.sendError(exchange, 500, e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    private List<AttributeDefinition> parseAttributes(Map<String, Object> body) {
        List<AttributeDefinition> attrs = new ArrayList<>();
        Object rawAttrs = body.get("attributes");
        if (rawAttrs instanceof List) {
            for (Object item : (List<?>) rawAttrs) {
                if (item instanceof Map) {
                    Map<String, Object> attrMap = (Map<String, Object>) item;
                    String name = Json.getString(attrMap, "name");
                    String type = Json.getString(attrMap, "type");
                    List<String> options = null;
                    Object rawOptions = attrMap.get("options");
                    if (rawOptions instanceof List) {
                        options = new ArrayList<>();
                        for (Object o : (List<?>) rawOptions) {
                            options.add(o != null ? o.toString() : null);
                        }
                    }
                    attrs.add(new AttributeDefinition(name, type, options));
                }
            }
        }
        return attrs;
    }
}
