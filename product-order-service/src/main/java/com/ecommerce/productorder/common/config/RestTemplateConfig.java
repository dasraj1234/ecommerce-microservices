package com.ecommerce.productorder.common.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5_000);   // 5 s — fail fast if payment-wallet is down
        factory.setReadTimeout(15_000);     // 15 s — wallet debit + DB write can take a moment
        return new RestTemplate(factory);
    }
}
