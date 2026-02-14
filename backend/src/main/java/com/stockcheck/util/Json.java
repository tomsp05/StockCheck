package com.stockcheck.util;

import java.util.*;
import java.util.regex.*;

/**
 * Minimal JSON parser and serializer.
 * Handles the subset of JSON used by this application (objects, arrays, strings, numbers, booleans, null).
 */
public class Json {

    // ── Serialization ──

    public static String toJson(Map<String, Object> map) {
        StringBuilder sb = new StringBuilder("{");
        boolean first = true;
        for (Map.Entry<String, Object> e : map.entrySet()) {
            if (!first) sb.append(",");
            sb.append("\"").append(escape(e.getKey())).append("\":");
            sb.append(valueToJson(e.getValue()));
            first = false;
        }
        sb.append("}");
        return sb.toString();
    }

    public static String toJsonArray(List<Map<String, Object>> list) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < list.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append(toJson(list.get(i)));
        }
        sb.append("]");
        return sb.toString();
    }

    private static String valueToJson(Object val) {
        if (val == null) return "null";
        if (val instanceof Number) return val.toString();
        if (val instanceof Boolean) return val.toString();
        if (val instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, Object> m = (Map<String, Object>) val;
            return toJson(m);
        }
        if (val instanceof List) {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> l = (List<Map<String, Object>>) val;
            return toJsonArray(l);
        }
        return "\"" + escape(val.toString()) + "\"";
    }

    private static String escape(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }

    // ── Parsing ──

    public static Map<String, Object> parseObject(String json) {
        json = json.trim();
        if (!json.startsWith("{")) throw new IllegalArgumentException("Expected JSON object");
        return (Map<String, Object>) parseValue(new int[]{0}, json);
    }

    @SuppressWarnings("unchecked")
    private static Object parseValue(int[] pos, String json) {
        skipWhitespace(pos, json);
        char c = json.charAt(pos[0]);
        if (c == '{') return parseObj(pos, json);
        if (c == '[') return parseArr(pos, json);
        if (c == '"') return parseString(pos, json);
        if (c == 't' || c == 'f') return parseBool(pos, json);
        if (c == 'n') return parseNull(pos, json);
        return parseNumber(pos, json);
    }

    private static Map<String, Object> parseObj(int[] pos, String json) {
        Map<String, Object> map = new LinkedHashMap<>();
        pos[0]++; // skip {
        skipWhitespace(pos, json);
        if (json.charAt(pos[0]) == '}') { pos[0]++; return map; }
        while (true) {
            skipWhitespace(pos, json);
            String key = parseString(pos, json);
            skipWhitespace(pos, json);
            pos[0]++; // skip :
            Object value = parseValue(pos, json);
            map.put(key, value);
            skipWhitespace(pos, json);
            if (json.charAt(pos[0]) == '}') { pos[0]++; return map; }
            pos[0]++; // skip ,
        }
    }

    private static List<Object> parseArr(int[] pos, String json) {
        List<Object> list = new ArrayList<>();
        pos[0]++; // skip [
        skipWhitespace(pos, json);
        if (json.charAt(pos[0]) == ']') { pos[0]++; return list; }
        while (true) {
            list.add(parseValue(pos, json));
            skipWhitespace(pos, json);
            if (json.charAt(pos[0]) == ']') { pos[0]++; return list; }
            pos[0]++; // skip ,
        }
    }

    private static String parseString(int[] pos, String json) {
        pos[0]++; // skip opening "
        StringBuilder sb = new StringBuilder();
        while (json.charAt(pos[0]) != '"') {
            if (json.charAt(pos[0]) == '\\') {
                pos[0]++;
                char esc = json.charAt(pos[0]);
                switch (esc) {
                    case '"': sb.append('"'); break;
                    case '\\': sb.append('\\'); break;
                    case 'n': sb.append('\n'); break;
                    case 'r': sb.append('\r'); break;
                    case 't': sb.append('\t'); break;
                    default: sb.append(esc);
                }
            } else {
                sb.append(json.charAt(pos[0]));
            }
            pos[0]++;
        }
        pos[0]++; // skip closing "
        return sb.toString();
    }

    private static Object parseNumber(int[] pos, String json) {
        int start = pos[0];
        boolean isDouble = false;
        if (json.charAt(pos[0]) == '-') pos[0]++;
        while (pos[0] < json.length() && (Character.isDigit(json.charAt(pos[0])) || json.charAt(pos[0]) == '.')) {
            if (json.charAt(pos[0]) == '.') isDouble = true;
            pos[0]++;
        }
        String num = json.substring(start, pos[0]);
        if (isDouble) return Double.parseDouble(num);
        long val = Long.parseLong(num);
        if (val >= Integer.MIN_VALUE && val <= Integer.MAX_VALUE) return (int) val;
        return val;
    }

    private static Boolean parseBool(int[] pos, String json) {
        if (json.startsWith("true", pos[0])) { pos[0] += 4; return true; }
        pos[0] += 5; return false;
    }

    private static Object parseNull(int[] pos, String json) {
        pos[0] += 4;
        return null;
    }

    private static void skipWhitespace(int[] pos, String json) {
        while (pos[0] < json.length() && Character.isWhitespace(json.charAt(pos[0]))) {
            pos[0]++;
        }
    }

    // ── Helpers ──

    public static String getString(Map<String, Object> map, String key) {
        Object val = map.get(key);
        return val == null ? null : val.toString();
    }

    public static Long getLong(Map<String, Object> map, String key) {
        Object val = map.get(key);
        if (val == null) return null;
        if (val instanceof Number) return ((Number) val).longValue();
        return Long.parseLong(val.toString());
    }

    public static int getInt(Map<String, Object> map, String key, int defaultVal) {
        Object val = map.get(key);
        if (val == null) return defaultVal;
        if (val instanceof Number) return ((Number) val).intValue();
        return Integer.parseInt(val.toString());
    }
}
