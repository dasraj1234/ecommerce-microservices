package com.ecommerce.gateway.filter;
//improvements 14th june
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Component
public class CorrelationIdFilter
        implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(
            ServerWebExchange exchange,
            GatewayFilterChain chain) {

        String requestId =
                UUID.randomUUID().toString();

        ServerWebExchange modified =
                exchange.mutate()
                        .request(
                                exchange.getRequest()
                                        .mutate()
                                        .header(
                                                "X-Request-Id",
                                                requestId
                                        )
                                        .build()
                        )
                        .build();

        return chain.filter(modified);
    }

    @Override
    public int getOrder() {
        return 0;
    }
}