package com.lavanderia.laundry.config;

/**
 * Convierte cadenas tipo {@code postgresql://user:pass@host:port/db} (Render / libpq) a JDBC.
 */
public final class PostgresJdbcUrlConverter {

    private PostgresJdbcUrlConverter() {}

    public static String toJdbcUrl(String postgresUrl, String sslMode) {
        String normalized = postgresUrl;
        if (normalized.startsWith("postgres://")) {
            normalized = "postgresql://" + normalized.substring("postgres://".length());
        }
        if (!normalized.startsWith("postgresql://")) {
            return postgresUrl;
        }
        String rest = normalized.substring("postgresql://".length());
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

        if (existingQuery != null && !existingQuery.isBlank()) {
            sb.append("?").append(existingQuery);
            if (!existingQuery.contains("sslmode=")) {
                sb.append("&sslmode=").append(sslMode);
            }
        } else {
            sb.append("?sslmode=").append(sslMode);
        }
        return sb.toString();
    }
}
