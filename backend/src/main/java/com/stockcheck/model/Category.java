package com.stockcheck.model;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class Category {
    private long id;
    private String name;
    private List<AttributeDefinition> attributes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Category() {}

    public Category(long id, String name, List<AttributeDefinition> attributes) {
        this.id = id;
        this.name = name;
        this.attributes = attributes;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public List<AttributeDefinition> getAttributes() { return attributes; }
    public void setAttributes(List<AttributeDefinition> attributes) { this.attributes = attributes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public void touch() { this.updatedAt = LocalDateTime.now(); }

    public Map<String, Object> toMap() {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", id);
        m.put("name", name);
        m.put("attributes", attributes != null
                ? attributes.stream().map(AttributeDefinition::toMap).collect(Collectors.toList())
                : null);
        m.put("createdAt", createdAt != null ? createdAt.toString() : null);
        m.put("updatedAt", updatedAt != null ? updatedAt.toString() : null);
        return m;
    }
}
