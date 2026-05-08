package com.lavanderia.laundry.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;

@Configuration
public class RenderDataSourceConfiguration {

    @Bean
    @Primary
    public DataSource dataSource(
            @Value("${SPRING_DATASOURCE_URL:jdbc:postgresql://localhost:5432/lavanderia}") String url,
            @Value("${SPRING_DATASOURCE_USERNAME:postgres}") String username,
            @Value("${SPRING_DATASOURCE_PASSWORD:postgres}") String password,
            @Value("${RENDER_JDBC_SSLMODE:require}") String sslMode) {

        String jdbcUrl = url;
        if (jdbcUrl.startsWith("postgresql://") || jdbcUrl.startsWith("postgres://")) {
            jdbcUrl = PostgresJdbcUrlConverter.toJdbcUrl(jdbcUrl, sslMode);
        }

        HikariDataSource ds = new HikariDataSource();
        ds.setJdbcUrl(jdbcUrl);
        ds.setUsername(username);
        ds.setPassword(password);
        ds.setDriverClassName("org.postgresql.Driver");
        ds.setMaximumPoolSize(5);
        return ds;
    }
}
