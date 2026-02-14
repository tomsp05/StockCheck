package com.stockcheck.controller;

import com.stockcheck.dto.AlertThresholdRequest;
import com.stockcheck.model.AlertThreshold;
import com.stockcheck.service.AlertThresholdService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/thresholds")
public class AlertThresholdController {

    private final AlertThresholdService alertThresholdService;

    public AlertThresholdController(AlertThresholdService alertThresholdService) {
        this.alertThresholdService = alertThresholdService;
    }

    @GetMapping
    public List<AlertThreshold> getAll() {
        return alertThresholdService.getAllThresholds();
    }

    @PutMapping
    public AlertThreshold setThreshold(@Valid @RequestBody AlertThresholdRequest request) {
        return alertThresholdService.setThreshold(request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        alertThresholdService.deleteThreshold(id);
    }
}
