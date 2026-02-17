package com.stockcheck.controller;

import com.stockcheck.model.Location;
import com.stockcheck.repository.DataStore;
import com.stockcheck.util.*;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

public class LocationController {

    private final DataStore dataStore;

    public LocationController(DataStore dataStore) {
        this.dataStore = dataStore;
    }

    public void register(HttpServer server) {
        server.createContext("/api/locations", this::handle);
    }

    private void handle(HttpExchange exchange) throws IOException {
        try {
            String method = exchange.getRequestMethod();
            String path = exchange.getRequestURI().getPath();

            if ("OPTIONS".equals(method)) {
                HttpHelper.handleCors(exchange);
                return;
            }

            // Body buffering must be set up before reading the body
            if ("POST".equals(method) || "PUT".equals(method)) {
                exchange.setStreams(null, null);
            }

            Long id = HttpHelper.pathId(path, "/api/locations");

            if ("GET".equals(method) && id == null) {
                List<Map<String, Object>> list = dataStore.getAllLocations().stream()
                        .map(Location::toMap).collect(Collectors.toList());
                HttpHelper.sendJson(exchange, 200, Json.toJsonArray(list));
            } else if ("GET".equals(method) && id != null) {
                Location loc = dataStore.getLocation(id);
                if (loc == null) { HttpHelper.sendError(exchange, 404, "Location not found"); return; }
                HttpHelper.sendJson(exchange, 200, Json.toJson(loc.toMap()));
            } else if ("POST".equals(method)) {
                Map<String, Object> body = Json.parseObject(HttpHelper.readBody(exchange));
                Location loc = dataStore.addLocation(
                        Json.getString(body, "name"),
                        Json.getString(body, "address"));
                HttpHelper.sendJson(exchange, 201, Json.toJson(loc.toMap()));
            } else if ("PUT".equals(method) && id != null) {
                Map<String, Object> body = Json.parseObject(HttpHelper.readBody(exchange));
                Location loc = dataStore.updateLocation(id,
                        Json.getString(body, "name"),
                        Json.getString(body, "address"));
                if (loc == null) { HttpHelper.sendError(exchange, 404, "Location not found"); return; }
                HttpHelper.sendJson(exchange, 200, Json.toJson(loc.toMap()));
            } else if ("DELETE".equals(method) && id != null) {
                dataStore.deleteLocation(id);
                HttpHelper.sendNoContent(exchange);
            } else {
                HttpHelper.sendError(exchange, 405, "Method not allowed");
            }
        } catch (Exception e) {
            HttpHelper.sendError(exchange, 500, e.getMessage());
        }
    }
}
