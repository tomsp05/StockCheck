package com.stockcheck.model;

import java.time.Instant; // Added import
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

public class Product {
    private long id;
    private String name;
    private String sku;
    private String description;
    private Long categoryId;
    private Map<String, String> attributeValues;
    private Instant createdAt; // Changed to Instant
    private Instant updatedAt; // Changed to Instant

    public Product() {}

    public Product(long id, String name, String sku, String description) {
        this.id = id;
        this.name = name;
        this.sku = sku;
        this.description = description;
        // createdAt and updatedAt will be set by the database
    }

    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public Map<String, String> getAttributeValues() { return attributeValues; }
    public void setAttributeValues(Map<String, String> attributeValues) { this.attributeValues = attributeValues; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    // Removed touch() method as updated_at is handled by the database

    public Map<String, Object> toMap() {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", id);
        m.put("name", name);
        m.put("sku", sku);
        m.put("description", description);
        m.put("categoryId", categoryId);
        Map<String, Object> attrMap = new LinkedHashMap<>();
        if (attributeValues != null) {
            attrMap.putAll(attributeValues);
        }
        m.put("attributeValues", attrMap);
        m.put("createdAt", createdAt != null ? createdAt.toString() : null);
        m.put("updatedAt", updatedAt != null ? updatedAt.toString() : null);
        return m;
    }
}
