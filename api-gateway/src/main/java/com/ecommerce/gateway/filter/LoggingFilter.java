//improvements 14th june

package com.ecommerce.gateway;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;

import org.springframework.core.Ordered;
import org.springframework.stereotype.Component;

import org.springframework.web.server.ServerWebExchange;

import reactor.core.publisher.Mono;

@Component
public class LoggingFilter
        implements GlobalFilter, Ordered {

    private static final Logger LOGGER =
            LoggerFactory.getLogger(
                    LoggingFilter.class
            );

    @Override
    public Mono<Void> filter(
            ServerWebExchange exchange,
            GatewayFilterChain chain) {

       LOGGER.info(
    "REQUEST_ID={} METHOD={} URI={}",
    exchange.getRequest()
            .getHeaders()
            .getFirst("X-Request-Id"),
    exchange.getRequest()
            .getMethod(),
    exchange.getRequest()
            .getURI()
);

        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {

        return 1;
    }
}