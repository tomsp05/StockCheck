package com.stockcheck.dto;

public class LowStockAlert {

    private Long productId;
    private String productName;
    private String sku;
    private Long locationId;
    private String locationName;
    private int currentQuantity;
    private int threshold;

    public LowStockAlert(Long productId, String productName, String sku,
                         Long locationId, String locationName,
                         int currentQuantity, int threshold) {
        this.productId = productId;
        this.productName = productName;
        this.sku = sku;
        this.locationId = locationId;
        this.locationName = locationName;
        this.currentQuantity = currentQuantity;
        this.threshold = threshold;
    }

    public Long getProductId() { return productId; }
    public String getProductName() { return productName; }
    public String getSku() { return sku; }
    public Long getLocationId() { return locationId; }
    public String getLocationName() { return locationName; }
    public int getCurrentQuantity() { return currentQuantity; }
    public int getThreshold() { return threshold; }
}
