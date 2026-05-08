package com.lavanderia.order.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

/**
 * Render's {@code fromDatabase.connectionString} is {@code postgresql://...} (libpq).
 * Spring JDBC expects {@code jdbc:postgresql://...}. Converts at startup.
 */
public class RenderPostgresUrlEnvironmentPostProcessor implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String url = environment.getProperty("SPRING_DATASOURCE_URL");
        if (url == null || url.isBlank() || url.startsWith("jdbc:")) {
            return;
        }
        if (url.startsWith("postgresql://")) {
            String jdbc = toJdbcUrl(url);
            Map<String, Object> map = new HashMap<>();
            map.put("SPRING_DATASOURCE_URL", jdbc);
            environment.getPropertySources().addFirst(
                    new MapPropertySource("renderPostgresJdbcUrl", map));
        }
    }

    private static String toJdbcUrl(String postgresUrl) {
        URI uri = URI.create(postgresUrl);
        String host = uri.getHost();
        if (host == null || host.isBlank()) {
            return postgresUrl;
        }
        int port = uri.getPort();
        if (port == -1) {
            port = 5432;
        }
        String path = uri.getPath();
        if (path == null || path.isBlank() || "/".equals(path)) {
            path = "";
        } else if (path.startsWith("/")) {
            path = path.substring(1);
        }
        StringBuilder sb = new StringBuilder();
        sb.append("jdbc:postgresql://").append(host).append(":").append(port).append("/").append(path);

        String query = uri.getRawQuery();
        if (query != null && !query.isBlank()) {
            sb.append("?").append(query);
            if (!query.contains("sslmode=")) {
                sb.append("&sslmode=require");
            }
        } else {
            sb.append("?sslmode=require");
        }
        return sb.toString();
    }
}
