package com.stockcheck.model;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

public class StockLevel {
    private long id;
    private long productId;
    private long locationId;
    private int quantity;
    private LocalDateTime updatedAt;

    public StockLevel() {}

    public StockLevel(long id, long productId, long locationId, int quantity) {
        this.id = id;
        this.productId = productId;
        this.locationId = locationId;
        this.quantity = quantity;
        this.updatedAt = LocalDateTime.now();
    }

    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    public long getProductId() { return productId; }
    public void setProductId(long productId) { this.productId = productId; }

    public long getLocationId() { return locationId; }
    public void setLocationId(long locationId) { this.locationId = locationId; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public void touch() { this.updatedAt = LocalDateTime.now(); }

    public Map<String, Object> toMap(Product product, Location location) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", id);
        m.put("product", product != null ? product.toMap() : null);
        m.put("location", location != null ? location.toMap() : null);
        m.put("quantity", quantity);
        m.put("updatedAt", updatedAt != null ? updatedAt.toString() : null);
        return m;
    }
}
