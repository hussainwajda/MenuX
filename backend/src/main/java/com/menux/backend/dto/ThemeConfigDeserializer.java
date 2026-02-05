package com.menux.backend.dto;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.Collections;
import java.util.Map;

/**
 * Accepts themeConfig as either a JSON object or a JSON string.
 */
public class ThemeConfigDeserializer extends JsonDeserializer<Map<String, Object>> {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Override
    public Map<String, Object> deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        JsonNode node = p.getCodec().readTree(p);
        if (node == null || node.isNull()) {
            return null;
        }
        if (node.isObject()) {
            return MAPPER.convertValue(node, new TypeReference<Map<String, Object>>() {});
        }
        if (node.isTextual()) {
            String text = node.asText();
            if (text.isBlank()) {
                return null;
            }
            return MAPPER.readValue(text, new TypeReference<Map<String, Object>>() {});
        }
        return Collections.emptyMap();
    }
}
