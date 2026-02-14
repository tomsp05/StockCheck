package com.stockcheck.service;

import com.stockcheck.dto.AlertThresholdRequest;
import com.stockcheck.model.AlertThreshold;
import com.stockcheck.model.Location;
import com.stockcheck.model.Product;
import com.stockcheck.repository.AlertThresholdRepository;
import com.stockcheck.repository.LocationRepository;
import com.stockcheck.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AlertThresholdService {

    private final AlertThresholdRepository alertThresholdRepository;
    private final ProductRepository productRepository;
    private final LocationRepository locationRepository;

    public AlertThresholdService(AlertThresholdRepository alertThresholdRepository,
                                 ProductRepository productRepository,
                                 LocationRepository locationRepository) {
        this.alertThresholdRepository = alertThresholdRepository;
        this.productRepository = productRepository;
        this.locationRepository = locationRepository;
    }

    public List<AlertThreshold> getAllThresholds() {
        return alertThresholdRepository.findAll();
    }

    public AlertThreshold setThreshold(AlertThresholdRequest request) {
        AlertThreshold threshold = alertThresholdRepository
                .findByProductIdAndLocationId(request.getProductId(), request.getLocationId())
                .orElseGet(() -> {
                    Product product = productRepository.findById(request.getProductId())
                            .orElseThrow(() -> new RuntimeException("Product not found: " + request.getProductId()));
                    Location location = locationRepository.findById(request.getLocationId())
                            .orElseThrow(() -> new RuntimeException("Location not found: " + request.getLocationId()));
                    AlertThreshold t = new AlertThreshold();
                    t.setProduct(product);
                    t.setLocation(location);
                    return t;
                });

        threshold.setMinQuantity(request.getMinQuantity());
        return alertThresholdRepository.save(threshold);
    }

    public void deleteThreshold(Long id) {
        alertThresholdRepository.deleteById(id);
    }
}
