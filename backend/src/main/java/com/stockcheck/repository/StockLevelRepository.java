package com.stockcheck.repository;

import com.stockcheck.model.StockLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StockLevelRepository extends JpaRepository<StockLevel, Long> {
    List<StockLevel> findByLocationId(Long locationId);
    List<StockLevel> findByProductId(Long productId);
    Optional<StockLevel> findByProductIdAndLocationId(Long productId, Long locationId);
}
