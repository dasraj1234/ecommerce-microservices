package com.ecommerce.productorder.common.util;

import com.fasterxml.jackson.databind.ObjectMapper;

public class JsonUtil {

    private static final ObjectMapper mapper =
            new ObjectMapper();

    public static String toJson(Object obj) {

        try {

            return mapper.writeValueAsString(obj);

        } catch (Exception e) {

            return "{}";
        }
    }
}