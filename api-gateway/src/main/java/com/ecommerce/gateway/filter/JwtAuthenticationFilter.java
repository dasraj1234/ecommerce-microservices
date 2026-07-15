package com.ecommerce.gateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.server.ServerWebExchange;

import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.util.List;

/**
 * Central auth for the gateway — runs on every request before routing.
 *
 *   1. Authentication: valid JWT required (HS256, same secret as
 *      auth-user-service). Missing/invalid/expired -> 401.
 *   2. Role authorization: admin-only operations reject non-ADMIN -> 403.
 *   3. Ownership (IDOR) check: userId-in-path endpoints must reference the
 *      caller's own userId (from the token) unless the caller is ADMIN -> 403.
 *
 * 401 = "who are you?"; 403 = "known, but not allowed".
 *
 * Reactive GlobalFilter (Spring Cloud Gateway is WebFlux, so this can't be a
 * servlet filter like auth-user-service's).
 */
@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    // Must match auth-user-service JwtUtil exactly (HS256 + this secret).
    private static final String SECRET =
            "mySuperSecretKeyForJwtAuthentication12345";

    private final SecretKey key = Keys.hmacShaKeyFor(SECRET.getBytes());

    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    // Prefixes that bypass authentication entirely. /auth = login;
    // /users/register = signup (a new user has no token yet); /actuator =
    // health/info probes. NOTE: keep this narrow — /users/all, /users/{id}
    // etc. must stay protected, so only the exact register path is public.
    private static final List<String> PUBLIC_PATHS = List.of(
            "/auth",
            "/users/register",
            "/actuator"
    );

    // (method, path) combinations only ADMIN may call. Everything else that
    // carries a valid token is allowed for any authenticated user.
    private record Rule(HttpMethod method, String pattern) {}

    private static final List<Rule> ADMIN_ONLY = List.of(
            new Rule(HttpMethod.POST,   "/products/create"),
            new Rule(HttpMethod.PUT,    "/products/**"),
            new Rule(HttpMethod.DELETE, "/products/**"),
            new Rule(HttpMethod.GET,    "/orders/all"),
            new Rule(HttpMethod.PATCH,  "/orders/*/status"),
            new Rule(HttpMethod.GET,    "/payments/count"),
            new Rule(HttpMethod.GET,    "/payments/all"),
            new Rule(HttpMethod.GET,    "/users/all")
    );

    // GET endpoints whose {userId} path segment must equal the caller's own
    // userId claim (ADMIN exempt). Closes the horizontal-access / IDOR gap
    // where USER-1001 could read USER-1002's data by editing the URL.
    private static final List<String> OWNERSHIP_GET_PATTERNS = List.of(
            "/orders/history/{userId}",
            "/payments/user/{userId}",
            "/wallet/{userId}",
            "/wallet/history/{userId}"
    );

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {

        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();
        HttpMethod method = request.getMethod();

        // CORS preflight carries no Authorization header — let it through.
        if (method == HttpMethod.OPTIONS) {
            return chain.filter(exchange);
        }

        if (isPublic(path)) {
            return chain.filter(exchange);
        }

        // ---- 1. Authentication ------------------------------------------------
        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return unauthorized(exchange);
        }

        Claims claims;
        try {
            claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(authHeader.substring(7))
                    .getPayload();
        } catch (Exception ex) {
            return unauthorized(exchange); // bad signature / expired / malformed
        }

        String role = claims.get("role", String.class);
        String callerUserId = claims.get("userId", String.class);
        boolean isAdmin = "ADMIN".equals(role);

        // ---- 2. Role authorization -------------------------------------------
        if (!isAdmin && matchesAdminOnly(method, path)) {
            return forbidden(exchange);
        }

        // ---- 3. Ownership / IDOR check ---------------------------------------
        if (!isAdmin && method == HttpMethod.GET) {
            for (String pattern : OWNERSHIP_GET_PATTERNS) {
                if (pathMatcher.match(pattern, path)) {
                    String pathUserId = pathMatcher
                            .extractUriTemplateVariables(pattern, path)
                            .get("userId");
                    if (callerUserId == null || !callerUserId.equals(pathUserId)) {
                        return forbidden(exchange);
                    }
                    break;
                }
            }
        }

        // ---- Authorized: forward identity to downstream services -------------
        ServerHttpRequest.Builder builder = request.mutate()
                .header("X-Username", claims.getSubject());
        if (role != null) {
            builder.header("X-User-Role", role);
        }
        if (callerUserId != null) {
            builder.header("X-User-Id", callerUserId);
        }

        return chain.filter(exchange.mutate().request(builder.build()).build());
    }

    private boolean isPublic(String path) {
        return PUBLIC_PATHS.stream().anyMatch(path::startsWith);
    }

    private boolean matchesAdminOnly(HttpMethod method, String path) {
        return ADMIN_ONLY.stream().anyMatch(r ->
                r.method().equals(method) && pathMatcher.match(r.pattern(), path));
    }

    private Mono<Void> unauthorized(ServerWebExchange exchange) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        return exchange.getResponse().setComplete();
    }

    private Mono<Void> forbidden(ServerWebExchange exchange) {
        exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
        return exchange.getResponse().setComplete();
    }

    @Override
    public int getOrder() {
        // Authenticate/authorize early, before routing.
        return -1;
    }
}
