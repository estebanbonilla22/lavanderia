package com.lavanderia.laundry.config;

import com.lavanderia.laundry.model.LaundryService;
import com.lavanderia.laundry.repository.LaundryServiceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.util.List;

@Configuration
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final LaundryServiceRepository repository;

    public DataSeeder(LaundryServiceRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... args) {
        if (repository.count() > 0) {
            return;
        }

        List<LaundryService> services = List.of(
                LaundryService.builder()
                        .name("Lavado básico")
                        .description("Lavado estándar para ropa diaria.")
                        .price(new BigDecimal("15.00"))
                        .durationHours(4)
                        .active(true)
                        .build(),
                LaundryService.builder()
                        .name("Lavado premium")
                        .description("Lavado con suavizante y cuidado especial.")
                        .price(new BigDecimal("28.00"))
                        .durationHours(6)
                        .active(true)
                        .build(),
                LaundryService.builder()
                        .name("Planchado")
                        .description("Planchado profesional por prenda.")
                        .price(new BigDecimal("10.00"))
                        .durationHours(2)
                        .active(true)
                        .build(),
                LaundryService.builder()
                        .name("Lavado en seco")
                        .description("Lavado en seco para prendas delicadas.")
                        .price(new BigDecimal("40.00"))
                        .durationHours(8)
                        .active(true)
                        .build()
        );

        repository.saveAll(services);
        log.info("Seed: {} servicios de lavandería creados", services.size());
    }
}
