package com.stockcheck.config;

import com.stockcheck.model.Location;
import com.stockcheck.model.Product;
import com.stockcheck.model.StockLevel;
import com.stockcheck.model.AlertThreshold;
import com.stockcheck.repository.LocationRepository;
import com.stockcheck.repository.ProductRepository;
import com.stockcheck.repository.StockLevelRepository;
import com.stockcheck.repository.AlertThresholdRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(
            LocationRepository locationRepo,
            ProductRepository productRepo,
            StockLevelRepository stockLevelRepo,
            AlertThresholdRepository thresholdRepo) {
        return args -> {
            if (locationRepo.count() > 0) {
                return;
            }

            Location warehouse = new Location();
            warehouse.setName("Main Warehouse");
            warehouse.setAddress("1 Industrial Park, London");
            locationRepo.save(warehouse);

            Location shopfront = new Location();
            shopfront.setName("High Street Store");
            shopfront.setAddress("42 High Street, London");
            locationRepo.save(shopfront);

            Product widget = new Product();
            widget.setName("Widget A");
            widget.setSku("WGT-001");
            widget.setDescription("Standard widget");
            productRepo.save(widget);

            Product gadget = new Product();
            gadget.setName("Gadget B");
            gadget.setSku("GDG-002");
            gadget.setDescription("Premium gadget");
            productRepo.save(gadget);

            StockLevel sl1 = new StockLevel();
            sl1.setProduct(widget);
            sl1.setLocation(warehouse);
            sl1.setQuantity(150);
            stockLevelRepo.save(sl1);

            StockLevel sl2 = new StockLevel();
            sl2.setProduct(widget);
            sl2.setLocation(shopfront);
            sl2.setQuantity(30);
            stockLevelRepo.save(sl2);

            StockLevel sl3 = new StockLevel();
            sl3.setProduct(gadget);
            sl3.setLocation(warehouse);
            sl3.setQuantity(75);
            stockLevelRepo.save(sl3);

            StockLevel sl4 = new StockLevel();
            sl4.setProduct(gadget);
            sl4.setLocation(shopfront);
            sl4.setQuantity(5);
            stockLevelRepo.save(sl4);

            AlertThreshold t1 = new AlertThreshold();
            t1.setProduct(widget);
            t1.setLocation(warehouse);
            t1.setMinQuantity(20);
            thresholdRepo.save(t1);

            AlertThreshold t2 = new AlertThreshold();
            t2.setProduct(gadget);
            t2.setLocation(shopfront);
            t2.setMinQuantity(10);
            thresholdRepo.save(t2);
        };
    }
}
