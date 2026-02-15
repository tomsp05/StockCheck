package com.stockcheck.repository;

import com.stockcheck.model.*;
import com.stockcheck.util.Json;
import java.sql.*;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

public class DataStore {

    private final DatabaseManager dbManager;

    public DataStore() {
        this.dbManager = new DatabaseManager();
    }

    public DataStore(DatabaseManager dbManager) {
        this.dbManager = dbManager;
    }

    public void loadOrInitialize() {
        try (Connection conn = dbManager.getConnection()) {
            try (Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM categories")) {
                if (rs.next() && rs.getLong(1) == 0) {
                    System.out.println("Seeding initial data...");

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

    public Location addLocation(String name, String address) throws SQLException {
        String sql = "INSERT INTO locations (name, address) VALUES (?, ?) RETURNING id, created_at, updated_at";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, name);
            pstmt.setString(2, address);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    Location newLocation = new Location(rs.getLong("id"), name, address);
                    newLocation.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
                    newLocation.setUpdatedAt(rs.getTimestamp("updated_at").toLocalDateTime());
                    return newLocation;
                }
            }
        }
        throw new SQLException("Failed to insert location");
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
                    return getLocation(id);
                }
            }
        } catch (SQLException e) {
            System.err.println("Error updating location: " + e.getMessage());
            e.printStackTrace();
        }
        return null;
    }

    public boolean deleteLocation(long id) {
        String sql = "DELETE FROM locations WHERE id = ?";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setLong(1, id);
            return pstmt.executeUpdate() > 0;
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
        location.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        location.setUpdatedAt(rs.getTimestamp("updated_at").toLocalDateTime());
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
        } catch (SQLException e) {
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
        } catch (SQLException e) {
            System.err.println("Error getting product by ID: " + e.getMessage());
            e.printStackTrace();
        }
        return null;
    }

    public Product addProduct(String name, String sku, String description, Long categoryId, Map<String, String> attributeValues) throws SQLException {
        String sql = "INSERT INTO products (name, sku, description, category_id, attribute_values) VALUES (?, ?, ?, ?, ?) RETURNING id, created_at, updated_at";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, name);
            pstmt.setString(2, sku);
            pstmt.setString(3, description);
            if (categoryId != null) {
                pstmt.setLong(4, categoryId);
            } else {
                pstmt.setNull(4, Types.BIGINT);
            }
            pstmt.setString(5, serializeStringMap(attributeValues));
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    Product newProduct = new Product(rs.getLong("id"), name, sku, description);
                    newProduct.setCategoryId(categoryId);
                    newProduct.setAttributeValues(attributeValues);
                    newProduct.setCreatedAt(rs.getTimestamp("created_at").toInstant());
                    newProduct.setUpdatedAt(rs.getTimestamp("updated_at").toInstant());
                    return newProduct;
                }
            }
        }
        throw new SQLException("Failed to insert product");
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
                pstmt.setNull(4, Types.BIGINT);
            }
            pstmt.setString(5, serializeStringMap(attributeValues));
            pstmt.setLong(6, id);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return getProduct(id);
                }
            }
        } catch (SQLException e) {
            System.err.println("Error updating product: " + e.getMessage());
            e.printStackTrace();
        }
        return null;
    }

    public boolean deleteProduct(long id) {
        String sql = "DELETE FROM products WHERE id = ?";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setLong(1, id);
            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error deleting product: " + e.getMessage());
            e.printStackTrace();
        }
        return false;
    }

    private String serializeStringMap(Map<String, String> map) {
        if (map == null) return null;
        Map<String, Object> objMap = new LinkedHashMap<>(map);
        return Json.toJson(objMap);
    }

    private Map<String, String> deserializeStringMap(String json) {
        if (json == null || json.isEmpty()) return new LinkedHashMap<>();
        Map<String, Object> parsed = Json.parseObject(json);
        Map<String, String> result = new LinkedHashMap<>();
        for (Map.Entry<String, Object> e : parsed.entrySet()) {
            result.put(e.getKey(), e.getValue() != null ? e.getValue().toString() : null);
        }
        return result;
    }

    private Product mapResultSetToProduct(ResultSet rs) throws SQLException {
        Product product = new Product(
                rs.getLong("id"),
                rs.getString("name"),
                rs.getString("sku"),
                rs.getString("description")
        );
        product.setCategoryId(rs.getObject("category_id", Long.class));
        product.setAttributeValues(deserializeStringMap(rs.getString("attribute_values")));
        product.setCreatedAt(rs.getTimestamp("created_at").toInstant());
        product.setUpdatedAt(rs.getTimestamp("updated_at").toInstant());
        return product;
    }

    // ── Categories ──

    public List<Category> getAllCategories() {
        List<Category> categories = new ArrayList<>();
        String sql = "SELECT id, name, attributes, created_at, updated_at FROM categories ORDER BY name";
        try (Connection conn = dbManager.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                categories.add(mapResultSetToCategory(rs));
            }
        } catch (SQLException e) {
            System.err.println("Error getting all categories: " + e.getMessage());
            e.printStackTrace();
        }
        return categories;
    }

    public Category getCategory(long id) {
        String sql = "SELECT id, name, attributes, created_at, updated_at FROM categories WHERE id = ?";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setLong(1, id);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToCategory(rs);
                }
            }
        } catch (SQLException e) {
            System.err.println("Error getting category by ID: " + e.getMessage());
            e.printStackTrace();
        }
        return null;
    }

    public Category addCategory(String name, List<AttributeDefinition> attributes) throws SQLException {
        String sql = "INSERT INTO categories (name, attributes) VALUES (?, ?) RETURNING id, created_at, updated_at";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, name);
            pstmt.setString(2, serializeAttributes(attributes));
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    Category c = new Category(rs.getLong("id"), name, attributes);
                    c.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
                    c.setUpdatedAt(rs.getTimestamp("updated_at").toLocalDateTime());
                    return c;
                }
            }
        }
        throw new SQLException("Failed to insert category");
    }

    public Category updateCategory(long id, String name, List<AttributeDefinition> attributes) {
        String sql = "UPDATE categories SET name = ?, attributes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING updated_at";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, name);
            pstmt.setString(2, serializeAttributes(attributes));
            pstmt.setLong(3, id);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return getCategory(id);
                }
            }
        } catch (SQLException e) {
            System.err.println("Error updating category: " + e.getMessage());
            e.printStackTrace();
        }
        return null;
    }

    public boolean deleteCategory(long id) {
        String updateSql = "UPDATE products SET category_id = NULL, attribute_values = NULL, updated_at = CURRENT_TIMESTAMP WHERE category_id = ?";
        String deleteSql = "DELETE FROM categories WHERE id = ?";
        try (Connection conn = dbManager.getConnection()) {
            try (PreparedStatement pstmt = conn.prepareStatement(updateSql)) {
                pstmt.setLong(1, id);
                pstmt.executeUpdate();
            }
            try (PreparedStatement pstmt = conn.prepareStatement(deleteSql)) {
                pstmt.setLong(1, id);
                return pstmt.executeUpdate() > 0;
            }
        } catch (SQLException e) {
            System.err.println("Error deleting category: " + e.getMessage());
            e.printStackTrace();
        }
        return false;
    }

    private String serializeAttributes(List<AttributeDefinition> attributes) {
        if (attributes == null) return null;
        List<Map<String, Object>> list = attributes.stream()
                .map(AttributeDefinition::toMap)
                .collect(Collectors.toList());
        return Json.toJsonArray(list);
    }

    @SuppressWarnings("unchecked")
    private List<AttributeDefinition> deserializeAttributes(String json) {
        if (json == null || json.isEmpty()) return new ArrayList<>();
        List<Object> list = Json.parseArray(json);
        List<AttributeDefinition> attrs = new ArrayList<>();
        for (Object item : list) {
            Map<String, Object> m = (Map<String, Object>) item;
            String attrName = (String) m.get("name");
            String type = (String) m.get("type");
            List<String> options = null;
            if (m.get("options") instanceof List) {
                List<Object> rawOptions = (List<Object>) m.get("options");
                options = rawOptions.stream().map(Object::toString).collect(Collectors.toList());
            }
            attrs.add(new AttributeDefinition(attrName, type, options));
        }
        return attrs;
    }

    private Category mapResultSetToCategory(ResultSet rs) throws SQLException {
        Category category = new Category(
                rs.getLong("id"),
                rs.getString("name"),
                deserializeAttributes(rs.getString("attributes"))
        );
        category.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        category.setUpdatedAt(rs.getTimestamp("updated_at").toLocalDateTime());
        return category;
    }

    // ── Stock Levels ──

    public List<StockLevel> getAllStockLevels() {
        List<StockLevel> stockLevels = new ArrayList<>();
        String sql = "SELECT id, product_id, location_id, quantity, updated_at FROM stock_levels ORDER BY id";
        try (Connection conn = dbManager.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                stockLevels.add(mapResultSetToStockLevel(rs));
            }
        } catch (SQLException e) {
            System.err.println("Error getting all stock levels: " + e.getMessage());
            e.printStackTrace();
        }
        return stockLevels;
    }

    public List<StockLevel> getStockByLocation(long locationId) {
        List<StockLevel> stockLevels = new ArrayList<>();
        String sql = "SELECT id, product_id, location_id, quantity, updated_at FROM stock_levels WHERE location_id = ?";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setLong(1, locationId);
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    stockLevels.add(mapResultSetToStockLevel(rs));
                }
            }
        } catch (SQLException e) {
            System.err.println("Error getting stock by location: " + e.getMessage());
            e.printStackTrace();
        }
        return stockLevels;
    }

    public List<StockLevel> getStockByProduct(long productId) {
        List<StockLevel> stockLevels = new ArrayList<>();
        String sql = "SELECT id, product_id, location_id, quantity, updated_at FROM stock_levels WHERE product_id = ?";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setLong(1, productId);
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    stockLevels.add(mapResultSetToStockLevel(rs));
                }
            }
        } catch (SQLException e) {
            System.err.println("Error getting stock by product: " + e.getMessage());
            e.printStackTrace();
        }
        return stockLevels;
    }

    public StockLevel addOrUpdateStockLevel(long productId, long locationId, int quantity) {
        String sql = "INSERT INTO stock_levels (product_id, location_id, quantity) VALUES (?, ?, ?) " +
                     "ON CONFLICT (product_id, location_id) DO UPDATE SET quantity = ?, updated_at = CURRENT_TIMESTAMP " +
                     "RETURNING id, product_id, location_id, quantity, updated_at";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setLong(1, productId);
            pstmt.setLong(2, locationId);
            pstmt.setInt(3, quantity);
            pstmt.setInt(4, quantity);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToStockLevel(rs);
                }
            }
        } catch (SQLException e) {
            System.err.println("Error adding/updating stock level: " + e.getMessage());
            e.printStackTrace();
        }
        return null;
    }

    private StockLevel mapResultSetToStockLevel(ResultSet rs) throws SQLException {
        StockLevel sl = new StockLevel(
                rs.getLong("id"),
                rs.getLong("product_id"),
                rs.getLong("location_id"),
                rs.getInt("quantity")
        );
        sl.setUpdatedAt(rs.getTimestamp("updated_at").toLocalDateTime());
        return sl;
    }

    // ── Alert Thresholds ──

    public List<AlertThreshold> getAllThresholds() {
        List<AlertThreshold> thresholds = new ArrayList<>();
        String sql = "SELECT id, product_id, location_id, min_quantity FROM alert_thresholds ORDER BY id";
        try (Connection conn = dbManager.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                thresholds.add(mapResultSetToThreshold(rs));
            }
        } catch (SQLException e) {
            System.err.println("Error getting all thresholds: " + e.getMessage());
            e.printStackTrace();
        }
        return thresholds;
    }

    public AlertThreshold setThreshold(long productId, long locationId, int minQuantity) {
        String sql = "INSERT INTO alert_thresholds (product_id, location_id, min_quantity) VALUES (?, ?, ?) " +
                     "ON CONFLICT (product_id, location_id) DO UPDATE SET min_quantity = ?, updated_at = CURRENT_TIMESTAMP " +
                     "RETURNING id, product_id, location_id, min_quantity";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setLong(1, productId);
            pstmt.setLong(2, locationId);
            pstmt.setInt(3, minQuantity);
            pstmt.setInt(4, minQuantity);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToThreshold(rs);
                }
            }
        } catch (SQLException e) {
            System.err.println("Error setting threshold: " + e.getMessage());
            e.printStackTrace();
        }
        return null;
    }

    public boolean deleteThreshold(long id) {
        String sql = "DELETE FROM alert_thresholds WHERE id = ?";
        try (Connection conn = dbManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setLong(1, id);
            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error deleting threshold: " + e.getMessage());
            e.printStackTrace();
        }
        return false;
    }

    private AlertThreshold mapResultSetToThreshold(ResultSet rs) throws SQLException {
        return new AlertThreshold(
                rs.getLong("id"),
                rs.getLong("product_id"),
                rs.getLong("location_id"),
                rs.getInt("min_quantity")
        );
    }

    // ── Alerts ──

    public List<Map<String, Object>> getLowStockAlerts() {
        List<Map<String, Object>> alerts = new ArrayList<>();
        String sql = "SELECT sl.product_id, p.name AS product_name, p.sku, " +
                     "sl.location_id, l.name AS location_name, " +
                     "sl.quantity AS current_quantity, at.min_quantity AS threshold " +
                     "FROM alert_thresholds at " +
                     "JOIN stock_levels sl ON sl.product_id = at.product_id AND sl.location_id = at.location_id " +
                     "JOIN products p ON p.id = sl.product_id " +
                     "JOIN locations l ON l.id = sl.location_id " +
                     "WHERE sl.quantity <= at.min_quantity " +
                     "ORDER BY sl.quantity ASC";
        try (Connection conn = dbManager.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                Map<String, Object> alert = new LinkedHashMap<>();
                alert.put("productId", rs.getLong("product_id"));
                alert.put("productName", rs.getString("product_name"));
                alert.put("sku", rs.getString("sku"));
                alert.put("locationId", rs.getLong("location_id"));
                alert.put("locationName", rs.getString("location_name"));
                alert.put("currentQuantity", rs.getInt("current_quantity"));
                alert.put("threshold", rs.getInt("threshold"));
                alerts.add(alert);
            }
        } catch (SQLException e) {
            System.err.println("Error getting low stock alerts: " + e.getMessage());
            e.printStackTrace();
        }
        return alerts;
    }
}
