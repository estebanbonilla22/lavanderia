package com.lavanderia.order.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.util.HashMap;
import java.util.Map;

/**
 * Render's {@code fromDatabase.connectionString} is {@code postgresql://...} (libpq).
 * Spring JDBC expects {@code jdbc:postgresql://...}.
 * <p>
 * Uses a lenient parser (not {@link java.net.URI}) so passwords with special chars do not break startup.
 * SSL: default {@code prefer} works for most Render internal DB URLs; override with {@code RENDER_JDBC_SSLMODE}.
 */
public class RenderPostgresUrlEnvironmentPostProcessor implements EnvironmentPostProcessor {

    private static final String PROP_URL = "SPRING_DATASOURCE_URL";
    private static final String PROP_SSL = "RENDER_JDBC_SSLMODE";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String url = environment.getProperty(PROP_URL);
        if (url == null || url.isBlank() || url.startsWith("jdbc:")) {
            return;
        }
        String normalized = url;
        if (normalized.startsWith("postgres://")) {
            normalized = "postgresql://" + normalized.substring("postgres://".length());
        }
        if (!normalized.startsWith("postgresql://")) {
            return;
        }
        String sslMode = environment.getProperty(PROP_SSL, "prefer");
        String jdbc = toJdbcUrl(normalized, sslMode);
        Map<String, Object> map = new HashMap<>();
        map.put(PROP_URL, jdbc);
        environment.getPropertySources().addFirst(new MapPropertySource("renderPostgresJdbcUrl", map));
        System.err.println("[render] Converted " + PROP_URL + " to jdbc:postgresql://... (sslmode=" + sslMode + ")");
    }

    static String toJdbcUrl(String postgresUrl, String sslMode) {
        String rest = postgresUrl.substring("postgresql://".length());

        int at = rest.indexOf('@');
        String hostPart = at >= 0 ? rest.substring(at + 1) : rest;

        int slash = hostPart.indexOf('/');
        String hostAndPort = slash >= 0 ? hostPart.substring(0, slash) : hostPart;
        String dbAndQuery = slash >= 0 ? hostPart.substring(slash + 1) : "";

        String database = dbAndQuery;
        String existingQuery = null;
        int q = database.indexOf('?');
        if (q >= 0) {
            existingQuery = database.substring(q + 1);
            database = database.substring(0, q);
        }

        String host;
        int port = 5432;
        int colon = hostAndPort.lastIndexOf(':');
        if (colon > 0 && hostAndPort.indexOf(']') < 0) {
            try {
                port = Integer.parseInt(hostAndPort.substring(colon + 1));
                host = hostAndPort.substring(0, colon);
            } catch (NumberFormatException e) {
                host = hostAndPort;
            }
        } else {
            host = hostAndPort;
        }

        StringBuilder sb = new StringBuilder();
        sb.append("jdbc:postgresql://").append(host).append(":").append(port).append("/").append(database);

        boolean hasSsl = false;
        if (existingQuery != null && !existingQuery.isBlank()) {
            sb.append("?").append(existingQuery);
            hasSsl = existingQuery.contains("sslmode=");
            if (!hasSsl) {
                sb.append("&sslmode=").append(sslMode);
            }
        } else {
            sb.append("?sslmode=").append(sslMode);
        }
        return sb.toString();
    }
}
