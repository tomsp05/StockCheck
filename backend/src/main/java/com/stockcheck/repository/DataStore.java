package com.stockcheck.repository;

import com.stockcheck.model.*;
import java.util.*;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

public class DataStore {

    private final List<Location> locations = Collections.synchronizedList(new ArrayList<>());
    private final List<Product> products = Collections.synchronizedList(new ArrayList<>());
    private final List<StockLevel> stockLevels = Collections.synchronizedList(new ArrayList<>());
    private final List<AlertThreshold> thresholds = Collections.synchronizedList(new ArrayList<>());

    private final AtomicLong locationSeq = new AtomicLong(0);
    private final AtomicLong productSeq = new AtomicLong(0);
    private final AtomicLong stockLevelSeq = new AtomicLong(0);
    private final AtomicLong thresholdSeq = new AtomicLong(0);

    public void loadOrInitialize() {
        Location warehouse = addLocation("Main Warehouse", "1 Industrial Park, London");
        Location shopfront = addLocation("High Street Store", "42 High Street, London");

        Product widget = addProduct("Widget A", "WGT-001", "Standard widget");
        Product gadget = addProduct("Gadget B", "GDG-002", "Premium gadget");

        addOrUpdateStockLevel(widget.getId(), warehouse.getId(), 150);
        addOrUpdateStockLevel(widget.getId(), shopfront.getId(), 30);
        addOrUpdateStockLevel(gadget.getId(), warehouse.getId(), 75);
        addOrUpdateStockLevel(gadget.getId(), shopfront.getId(), 5);

        setThreshold(widget.getId(), warehouse.getId(), 20);
        setThreshold(gadget.getId(), shopfront.getId(), 10);
    }

    // ── Locations ──

    public List<Location> getAllLocations() { return new ArrayList<>(locations); }

    public Location getLocation(long id) {
        return locations.stream().filter(l -> l.getId() == id).findFirst().orElse(null);
    }

    public Location addLocation(String name, String address) {
        Location loc = new Location(locationSeq.incrementAndGet(), name, address);
        locations.add(loc);
        return loc;
    }

    public Location updateLocation(long id, String name, String address) {
        Location loc = getLocation(id);
        if (loc == null) return null;
        loc.setName(name);
        loc.setAddress(address);
        loc.touch();
        return loc;
    }

    public boolean deleteLocation(long id) {
        return locations.removeIf(l -> l.getId() == id);
    }

    // ── Products ──

    public List<Product> getAllProducts() { return new ArrayList<>(products); }

    public Product getProduct(long id) {
        return products.stream().filter(p -> p.getId() == id).findFirst().orElse(null);
    }

    public Product addProduct(String name, String sku, String description) {
        Product p = new Product(productSeq.incrementAndGet(), name, sku, description);
        products.add(p);
        return p;
    }

    public Product updateProduct(long id, String name, String sku, String description) {
        Product p = getProduct(id);
        if (p == null) return null;
        p.setName(name);
        p.setSku(sku);
        p.setDescription(description);
        p.touch();
        return p;
    }

    public boolean deleteProduct(long id) {
        return products.removeIf(p -> p.getId() == id);
    }

    // ── Stock Levels ──

    public List<StockLevel> getAllStockLevels() { return new ArrayList<>(stockLevels); }

    public List<StockLevel> getStockByLocation(long locationId) {
        return stockLevels.stream().filter(s -> s.getLocationId() == locationId).collect(Collectors.toList());
    }

    public List<StockLevel> getStockByProduct(long productId) {
        return stockLevels.stream().filter(s -> s.getProductId() == productId).collect(Collectors.toList());
    }

    public StockLevel addOrUpdateStockLevel(long productId, long locationId, int quantity) {
        Optional<StockLevel> existing = stockLevels.stream()
                .filter(s -> s.getProductId() == productId && s.getLocationId() == locationId)
                .findFirst();
        if (existing.isPresent()) {
            existing.get().setQuantity(quantity);
            existing.get().touch();
            return existing.get();
        }
        StockLevel sl = new StockLevel(stockLevelSeq.incrementAndGet(), productId, locationId, quantity);
        stockLevels.add(sl);
        return sl;
    }

    // ── Alert Thresholds ──

    public List<AlertThreshold> getAllThresholds() { return new ArrayList<>(thresholds); }

    public AlertThreshold setThreshold(long productId, long locationId, int minQuantity) {
        Optional<AlertThreshold> existing = thresholds.stream()
                .filter(t -> t.getProductId() == productId && t.getLocationId() == locationId)
                .findFirst();
        if (existing.isPresent()) {
            existing.get().setMinQuantity(minQuantity);
            return existing.get();
        }
        AlertThreshold t = new AlertThreshold(thresholdSeq.incrementAndGet(), productId, locationId, minQuantity);
        thresholds.add(t);
        return t;
    }

    public boolean deleteThreshold(long id) {
        return thresholds.removeIf(t -> t.getId() == id);
    }

    // ── Alerts ──

    public List<Map<String, Object>> getLowStockAlerts() {
        List<Map<String, Object>> alerts = new ArrayList<>();
        for (AlertThreshold t : thresholds) {
            stockLevels.stream()
                    .filter(s -> s.getProductId() == t.getProductId() && s.getLocationId() == t.getLocationId())
                    .findFirst()
                    .ifPresent(sl -> {
                        if (sl.getQuantity() <= t.getMinQuantity()) {
                            Product product = getProduct(sl.getProductId());
                            Location location = getLocation(sl.getLocationId());
                            Map<String, Object> alert = new LinkedHashMap<>();
                            alert.put("productId", sl.getProductId());
                            alert.put("productName", product != null ? product.getName() : "Unknown");
                            alert.put("sku", product != null ? product.getSku() : "");
                            alert.put("locationId", sl.getLocationId());
                            alert.put("locationName", location != null ? location.getName() : "Unknown");
                            alert.put("currentQuantity", sl.getQuantity());
                            alert.put("threshold", t.getMinQuantity());
                            alerts.add(alert);
                        }
                    });
        }
        return alerts;
    }
}
