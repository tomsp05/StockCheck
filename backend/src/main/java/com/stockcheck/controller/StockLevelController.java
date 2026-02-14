package com.stockcheck.controller;

import com.stockcheck.dto.LowStockAlert;
import com.stockcheck.dto.StockLevelUpdateRequest;
import com.stockcheck.model.StockLevel;
import com.stockcheck.service.StockLevelService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock")
public class StockLevelController {

    private final StockLevelService stockLevelService;

    public StockLevelController(StockLevelService stockLevelService) {
        this.stockLevelService = stockLevelService;
    }

    @GetMapping
    public List<StockLevel> getAll() {
        return stockLevelService.getAllStockLevels();
    }

    @GetMapping("/location/{locationId}")
    public List<StockLevel> getByLocation(@PathVariable Long locationId) {
        return stockLevelService.getStockByLocation(locationId);
    }

    @GetMapping("/product/{productId}")
    public List<StockLevel> getByProduct(@PathVariable Long productId) {
        return stockLevelService.getStockByProduct(productId);
    }

    @PutMapping
    public StockLevel updateStock(@Valid @RequestBody StockLevelUpdateRequest request) {
        return stockLevelService.updateStockLevel(request);
    }

    @GetMapping("/alerts")
    public List<LowStockAlert> getLowStockAlerts() {
        return stockLevelService.getLowStockAlerts();
    }
}
