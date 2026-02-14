package com.stockcheck.service;

import com.stockcheck.model.StockLevel;
import com.stockcheck.repository.StockLevelRepository;
import org.springframework.stereotype.Service;

import java.io.PrintWriter;
import java.util.List;

@Service
public class CsvExportService {

    private final StockLevelRepository stockLevelRepository;

    public CsvExportService(StockLevelRepository stockLevelRepository) {
        this.stockLevelRepository = stockLevelRepository;
    }

    public void exportStockLevels(PrintWriter writer) {
        List<StockLevel> levels = stockLevelRepository.findAll();

        writer.println("Product ID,Product Name,SKU,Location ID,Location Name,Quantity,Last Updated");

        for (StockLevel sl : levels) {
            writer.printf("%d,\"%s\",\"%s\",%d,\"%s\",%d,%s%n",
                    sl.getProduct().getId(),
                    escapeCsv(sl.getProduct().getName()),
                    escapeCsv(sl.getProduct().getSku()),
                    sl.getLocation().getId(),
                    escapeCsv(sl.getLocation().getName()),
                    sl.getQuantity(),
                    sl.getUpdatedAt() != null ? sl.getUpdatedAt().toString() : "");
        }

        writer.flush();
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        return value.replace("\"", "\"\"");
    }
}
