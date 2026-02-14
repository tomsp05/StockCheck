package com.stockcheck.model;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

public class Location {
    private long id;
    private String name;
    private String address;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Location() {}

    public Location(long id, String name, String address) {
        this.id = id;
        this.name = name;
        this.address = address;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public void touch() { this.updatedAt = LocalDateTime.now(); }

    public Map<String, Object> toMap() {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", id);
        m.put("name", name);
        m.put("address", address);
        m.put("createdAt", createdAt != null ? createdAt.toString() : null);
        m.put("updatedAt", updatedAt != null ? updatedAt.toString() : null);
        return m;
    }
}
