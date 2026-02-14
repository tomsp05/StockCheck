package com.stockcheck.repository;

import com.stockcheck.model.AlertThreshold;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AlertThresholdRepository extends JpaRepository<AlertThreshold, Long> {
    Optional<AlertThreshold> findByProductIdAndLocationId(Long productId, Long locationId);
    List<AlertThreshold> findByProductId(Long productId);
    List<AlertThreshold> findByLocationId(Long locationId);
}
