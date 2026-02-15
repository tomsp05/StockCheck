package com.stockcheck.repository;

import com.stockcheck.model.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.sql.*;
import java.util.*;
import java.util.stream.Collectors;

public class DataStore {

    private final DatabaseManager dbManager;
    private final ObjectMapper objectMapper = new ObjectMapper(); // For JSON serialization/deserialization

    public DataStore() {
        this.dbManager = new DatabaseManager(); // Create an instance
    }
    
    // Constructor to allow injection if needed for testing or different setup
    public DataStore(DatabaseManager dbManager) {
        this.dbManager = dbManager;
    }

    public void loadOrInitialize() {
        try (Connection conn = dbManager.getConnection()) {
            // Check if categories table is empty
            try (Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM categories")) {
                if (rs.next() && rs.getLong(1) == 0) {
                    System.out.println("Seeding initial data...");

                    // Seed categories
                    long toysId = addCategory("Toys", Arrays.asList(
                            new AttributeDefinition("Age Range", "dropdown", Arrays.asList("0-3", "3-6", "6-12", "12+")),
                            new AttributeDefinition("Material", "text", null)
                    )).getId();
                    long artSuppliesId = addCategory("Art Supplies", Arrays.asList(
                            new AttributeDefinition("Colour Count", "number", null),
                            new AttributeDefinition("Medium", "dropdown", Arrays.asList("Pencil", "Paint", "Marker", "Crayon"))
                    )).getId();

                    long warehouseId = addLocation("Main Warehouse", "1 Industrial Park, London").getId();
                    long shopfrontId = addLocation("High Street Store", "42 High Street, London").getId();

                    Map<String, String> widgetAttrs = new LinkedHashMap<>();
                    widgetAttrs.put("Age Range", "3-6");
                    widgetAttrs.put("Material", "Plastic");
                    long widgetId = addProduct("Widget A", "WGT-001", "Standard widget", toysId, widgetAttrs).getId();

                    Map<String, String> gadgetAttrs = new LinkedHashMap<>();
                    gadgetAttrs.put("Colour Count", "12");
                    gadgetAttrs.put("Medium", "Pencil");
                    long gadgetId = addProduct("Gadget B", "GDG-002", "Premium gadget", artSuppliesId, gadgetAttrs).getId();

                    addOrUpdateStockLevel(widgetId, warehouseId, 150);
                    addOrUpdateStockLevel(widgetId, shopfrontId, 30);
                    addOrUpdateStockLevel(gadgetId, warehouseId, 75);
                    addOrUpdateStockLevel(gadgetId, shopfrontId, 5);

                    setThreshold(widgetId, warehouseId, 20);
                    setThreshold(gadgetId, shopfrontId, 10);
                    System.out.println("Initial data seeded.");
                } else {
                    System.out.println("Database already contains data, skipping seeding.");
                }
            }
        } catch (SQLException e) {
            System.err.println("Error loading or initializing data: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // ── Locations ──

    public List<Location> getAllLocations() {
        List<Location> locations = new ArrayList<>();
        String sql = "SELECT id, name, address, created_at, updated_at FROM locations ORDER BY name";
        try (Connection conn = dbManager.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                locations.add(mapResultSetToLocation(rs));
            }
        } catch (SQLException e) {
            System.err.println("Error getting all locations: " + e.getMessage());
            e.printStackTrace();
        }
        return locations;
    }

    public Location getLocation(long id) {
        String sql = "SELECT id, name, address, created_at, updated_at FROM locations WHERE id = ?";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setLong(1, id);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToLocation(rs);
                }
            }
        } catch (SQLException e) {
            System.err.println("Error getting location by ID: " + e.getMessage());
            e.printStackTrace();
        }
        return null;
    }

    public Location addLocation(String name, String address) {
        String sql = "INSERT INTO locations (name, address) VALUES (?, ?) RETURNING id, created_at, updated_at";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, name);
            pstmt.setString(2, address);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    long id = rs.getLong("id");
                    Timestamp createdAt = rs.getTimestamp("created_at");
                    Timestamp updatedAt = rs.getTimestamp("updated_at");
                    Location newLocation = new Location(id, name, address);
                    newLocation.setCreatedAt(createdAt.toInstant());
                    newLocation.setUpdatedAt(updatedAt.toInstant());
                    return newLocation;
                }
            }
        } catch (SQLException e) {
            System.err.println("Error adding location: " + e.getMessage());
            e.printStackTrace();
        }
        return null;
    }

    public Location updateLocation(long id, String name, String address) {
        String sql = "UPDATE locations SET name = ?, address = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING updated_at";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, name);
            pstmt.setString(2, address);
            pstmt.setLong(3, id);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    Timestamp updatedAt = rs.getTimestamp("updated_at");
                    Location updatedLocation = getLocation(id); // Re-fetch to get all updated details
                    if (updatedLocation != null) {
                        updatedLocation.setUpdatedAt(updatedAt.toInstant());
                    }
                    return updatedLocation;
                }
            }
        } catch (SQLException e) {
            System.err.println("Error updating location: " + e.getMessage());
            e.printStackTrace();
        }
        return null;
    }

    public boolean deleteLocation(long id) {
        // Deletion of stock_levels and thresholds associated with this location is handled by ON DELETE CASCADE
        String sql = "DELETE FROM locations WHERE id = ?";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setLong(1, id);
            int affectedRows = pstmt.executeUpdate();
            return affectedRows > 0;
        } catch (SQLException e) {
            System.err.println("Error deleting location: " + e.getMessage());
            e.printStackTrace();
        }
        return false;
    }

    private Location mapResultSetToLocation(ResultSet rs) throws SQLException {
        Location location = new Location(
                rs.getLong("id"),
                rs.getString("name"),
                rs.getString("address")
        );
        location.setCreatedAt(rs.getTimestamp("created_at").toInstant());
        location.setUpdatedAt(rs.getTimestamp("updated_at").toInstant());
        return location;
    }

    // ── Products ──

    public List<Product> getAllProducts() {
        List<Product> products = new ArrayList<>();
        String sql = "SELECT id, name, sku, description, category_id, attribute_values, created_at, updated_at FROM products ORDER BY name";
        try (Connection conn = dbManager.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                products.add(mapResultSetToProduct(rs));
            }
        } catch (SQLException | JsonProcessingException e) {
            System.err.println("Error getting all products: " + e.getMessage());
            e.printStackTrace();
        }
        return products;
    }

    public Product getProduct(long id) {
        String sql = "SELECT id, name, sku, description, category_id, attribute_values, created_at, updated_at FROM products WHERE id = ?";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setLong(1, id);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToProduct(rs);
                }
            }
        } catch (SQLException | JsonProcessingException e) {
            System.err.println("Error getting product by ID: " + e.getMessage());
            e.printStackTrace();
        }
        return null;
    }

    public Product addProduct(String name, String sku, String description, Long categoryId, Map<String, String> attributeValues) {
        String sql = "INSERT INTO products (name, sku, description, category_id, attribute_values) VALUES (?, ?, ?, ?, ?) RETURNING id, created_at, updated_at";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, name);
            pstmt.setString(2, sku);
            pstmt.setString(3, description);
            if (categoryId != null) {
                pstmt.setLong(4, categoryId);
            } else {
                pstmt.setNull(4, java.sql.Types.BIGINT);
            }
            pstmt.setString(5, objectMapper.writeValueAsString(attributeValues));
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    long id = rs.getLong("id");
                    Instant createdAt = rs.getTimestamp("created_at").toInstant();
                    Instant updatedAt = rs.getTimestamp("updated_at").toInstant();
                    Product newProduct = new Product(id, name, sku, description);
                    newProduct.setCategoryId(categoryId);
                    newProduct.setAttributeValues(attributeValues);
                    newProduct.setCreatedAt(createdAt);
                    newProduct.setUpdatedAt(updatedAt);
                    return newProduct;
                }
            }
        } catch (SQLException | JsonProcessingException e) {
            System.err.println("Error adding product: " + e.getMessage());
            e.printStackTrace();
        }
        return null;
    }

    public Product updateProduct(long id, String name, String sku, String description, Long categoryId, Map<String, String> attributeValues) {
        String sql = "UPDATE products SET name = ?, sku = ?, description = ?, category_id = ?, attribute_values = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING updated_at";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, name);
            pstmt.setString(2, sku);
            pstmt.setString(3, description);
            if (categoryId != null) {
                pstmt.setLong(4, categoryId);
            } else {
                pstmt.setNull(4, java.sql.Types.BIGINT);
            }
            pstmt.setString(5, objectMapper.writeValueAsString(attributeValues));
            pstmt.setLong(6, id);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    Instant updatedAt = rs.getTimestamp("updated_at").toInstant();
                    Product updatedProduct = getProduct(id); // Re-fetch to get all updated details
                    if (updatedProduct != null) {
                        updatedProduct.setUpdatedAt(updatedAt);
                    }
                    return updatedProduct;
                }
            }
        } catch (SQLException | JsonProcessingException e) {
            System.err.println("Error updating product: " + e.getMessage());
            e.printStackTrace();
        }
        return null;
    }

    public boolean deleteProduct(long id) {
        // Deletion of stock_levels and thresholds associated with this product is handled by ON DELETE CASCADE
        String sql = "DELETE FROM products WHERE id = ?";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setLong(1, id);
            int affectedRows = pstmt.executeUpdate();
            return affectedRows > 0;
        } catch (SQLException e) {
            System.err.println("Error deleting product: " + e.getMessage());
            e.printStackTrace();
        }
        return false;
    }

    private Product mapResultSetToProduct(ResultSet rs) throws SQLException, JsonProcessingException {
        Product product = new Product(
                rs.getLong("id"),
                rs.getString("name"),
                rs.getString("sku"),
                rs.getString("description")
        );
        product.setCategoryId(rs.getObject("category_id", Long.class));
        String attributeValuesJson = rs.getString("attribute_values");
        if (attributeValuesJson != null && !attributeValuesJson.isEmpty()) {
            product.setAttributeValues(objectMapper.readValue(attributeValuesJson, new com.fasterxml.jackson.core.type.TypeReference<Map<String, String>>() {}));
        } else {
            product.setAttributeValues(new LinkedHashMap<>());
        }
        product.setCreatedAt(rs.getTimestamp("created_at").toInstant());
        product.setUpdatedAt(rs.getTimestamp("updated_at").toInstant());
        return product;
    }

    // ── Categories ──

    public List<Category> getAllCategories() { return new ArrayList<>(categories); }

    public Category getCategory(long id) {
        return categories.stream().filter(c -> c.getId() == id).findFirst().orElse(null);
    }

    public Category addCategory(String name, List<AttributeDefinition> attributes) {
        Category c = new Category(categorySeq.incrementAndGet(), name, attributes);
        categories.add(c);
        return c;
    }

    public Category updateCategory(long id, String name, List<AttributeDefinition> attributes) {
        Category c = getCategory(id);
        if (c == null) return null;
        c.setName(name);
        c.setAttributes(attributes);
        c.touch();
        return c;
    }

    public boolean deleteCategory(long id) {
        for (Product p : products) {
            if (p.getCategoryId() != null && p.getCategoryId() == id) {
                p.setCategoryId(null);
                p.setAttributeValues(null);
            }
        }
        return categories.removeIf(c -> c.getId() == id);
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
