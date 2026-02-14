package com.stockcheck.model;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

public class Product {
    private long id;
    private String name;
    private String sku;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Product() {}

    public Product(long id, String name, String sku, String description) {
        this.id = id;
        this.name = name;
        this.sku = sku;
        this.description = description;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public void touch() { this.updatedAt = LocalDateTime.now(); }

    public Map<String, Object> toMap() {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", id);
        m.put("name", name);
        m.put("sku", sku);
        m.put("description", description);
        m.put("createdAt", createdAt != null ? createdAt.toString() : null);
        m.put("updatedAt", updatedAt != null ? updatedAt.toString() : null);
        return m;
    }
}
