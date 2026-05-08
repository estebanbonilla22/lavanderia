package com.lavanderia.order.config;

import com.lavanderia.order.model.OrderEntity;
import com.lavanderia.order.model.OrderStatus;
import com.lavanderia.order.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.util.List;

@Configuration
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final OrderRepository repository;

    @Value("${seed.enabled:true}")
    private boolean enabled;

    public DataSeeder(OrderRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... args) {
        if (!enabled || repository.count() > 0) {
            return;
        }

        List<OrderEntity> orders = List.of(
                OrderEntity.builder()
                        .userId(2L)
                        .username("user")
                        .serviceId(1L)
                        .serviceName("Lavado básico")
                        .servicePrice(new BigDecimal("15.00"))
                        .quantity(2)
                        .totalPrice(new BigDecimal("30.00"))
                        .status(OrderStatus.PENDIENTE)
                        .notes("Orden de prueba 1")
                        .build(),
                OrderEntity.builder()
                        .userId(2L)
                        .username("user")
                        .serviceId(2L)
                        .serviceName("Lavado premium")
                        .servicePrice(new BigDecimal("28.00"))
                        .quantity(1)
                        .totalPrice(new BigDecimal("28.00"))
                        .status(OrderStatus.EN_PROCESO)
                        .notes("Orden de prueba 2")
                        .build()
        );

        repository.saveAll(orders);
        log.info("Seed: {} órdenes de prueba creadas", orders.size());
    }
}
