package com.stockcheck.model;

import java.util.LinkedHashMap;
import java.util.Map;

public class AlertThreshold {
    private long id;
    private long productId;
    private long locationId;
    private int minQuantity;

    public AlertThreshold() {}

    public AlertThreshold(long id, long productId, long locationId, int minQuantity) {
        this.id = id;
        this.productId = productId;
        this.locationId = locationId;
        this.minQuantity = minQuantity;
    }

    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    public long getProductId() { return productId; }
    public void setProductId(long productId) { this.productId = productId; }

    public long getLocationId() { return locationId; }
    public void setLocationId(long locationId) { this.locationId = locationId; }

    public int getMinQuantity() { return minQuantity; }
    public void setMinQuantity(int minQuantity) { this.minQuantity = minQuantity; }

    public Map<String, Object> toMap(Product product, Location location) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", id);
        m.put("product", product != null ? product.toMap() : null);
        m.put("location", location != null ? location.toMap() : null);
        m.put("minQuantity", minQuantity);
        return m;
    }
}
