package com.stockcheck.service;

import com.stockcheck.dto.LowStockAlert;
import com.stockcheck.dto.StockLevelUpdateRequest;
import com.stockcheck.model.AlertThreshold;
import com.stockcheck.model.Location;
import com.stockcheck.model.Product;
import com.stockcheck.model.StockLevel;
import com.stockcheck.repository.AlertThresholdRepository;
import com.stockcheck.repository.LocationRepository;
import com.stockcheck.repository.ProductRepository;
import com.stockcheck.repository.StockLevelRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class StockLevelService {

    private final StockLevelRepository stockLevelRepository;
    private final ProductRepository productRepository;
    private final LocationRepository locationRepository;
    private final AlertThresholdRepository alertThresholdRepository;

    public StockLevelService(StockLevelRepository stockLevelRepository,
                             ProductRepository productRepository,
                             LocationRepository locationRepository,
                             AlertThresholdRepository alertThresholdRepository) {
        this.stockLevelRepository = stockLevelRepository;
        this.productRepository = productRepository;
        this.locationRepository = locationRepository;
        this.alertThresholdRepository = alertThresholdRepository;
    }

    public List<StockLevel> getAllStockLevels() {
        return stockLevelRepository.findAll();
    }

    public List<StockLevel> getStockByLocation(Long locationId) {
        return stockLevelRepository.findByLocationId(locationId);
    }

    public List<StockLevel> getStockByProduct(Long productId) {
        return stockLevelRepository.findByProductId(productId);
    }

    public StockLevel updateStockLevel(StockLevelUpdateRequest request) {
        StockLevel stockLevel = stockLevelRepository
                .findByProductIdAndLocationId(request.getProductId(), request.getLocationId())
                .orElseGet(() -> {
                    Product product = productRepository.findById(request.getProductId())
                            .orElseThrow(() -> new RuntimeException("Product not found: " + request.getProductId()));
                    Location location = locationRepository.findById(request.getLocationId())
                            .orElseThrow(() -> new RuntimeException("Location not found: " + request.getLocationId()));
                    StockLevel sl = new StockLevel();
                    sl.setProduct(product);
                    sl.setLocation(location);
                    return sl;
                });

        stockLevel.setQuantity(request.getQuantity());
        return stockLevelRepository.save(stockLevel);
    }

    public List<LowStockAlert> getLowStockAlerts() {
        List<LowStockAlert> alerts = new ArrayList<>();
        List<AlertThreshold> thresholds = alertThresholdRepository.findAll();

        for (AlertThreshold threshold : thresholds) {
            stockLevelRepository
                    .findByProductIdAndLocationId(
                            threshold.getProduct().getId(),
                            threshold.getLocation().getId())
                    .ifPresent(stockLevel -> {
                        if (stockLevel.getQuantity() <= threshold.getMinQuantity()) {
                            alerts.add(new LowStockAlert(
                                    stockLevel.getProduct().getId(),
                                    stockLevel.getProduct().getName(),
                                    stockLevel.getProduct().getSku(),
                                    stockLevel.getLocation().getId(),
                                    stockLevel.getLocation().getName(),
                                    stockLevel.getQuantity(),
                                    threshold.getMinQuantity()
                            ));
                        }
                    });
        }

        return alerts;
    }
}
