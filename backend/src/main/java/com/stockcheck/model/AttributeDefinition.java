package com.stockcheck.model;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class AttributeDefinition {
    private String name;
    private String type; // "text", "number", "dropdown"
    private List<String> options; // only for dropdown type

    public AttributeDefinition() {}

    public AttributeDefinition(String name, String type, List<String> options) {
        this.name = name;
        this.type = type;
        this.options = options;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public List<String> getOptions() { return options; }
    public void setOptions(List<String> options) { this.options = options; }

    public Map<String, Object> toMap() {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("name", name);
        m.put("type", type);
        m.put("options", options);
        return m;
    }
}
