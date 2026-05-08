package com.lavanderia.order.client;

import com.lavanderia.order.dto.LaundryServiceDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;

import static org.springframework.http.HttpStatus.BAD_GATEWAY;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Component
public class LaundryServiceClient {

    private final WebClient webClient;

    public LaundryServiceClient(@Value("${services.laundry.base-url:http://localhost:8082}") String baseUrl) {
        this.webClient = WebClient.builder().baseUrl(baseUrl).build();
    }

    public LaundryServiceDto getById(Long serviceId, String bearerToken) {
        try {
            return webClient.get()
                    .uri("/services/{id}", serviceId)
                    .header("Authorization", "Bearer " + bearerToken)
                    .retrieve()
                    .bodyToMono(LaundryServiceDto.class)
                    .timeout(Duration.ofSeconds(8))
                    .block();
        } catch (org.springframework.web.reactive.function.client.WebClientResponseException ex) {
            if (ex.getStatusCode().value() == 404) {
                throw new ResponseStatusException(NOT_FOUND, "Servicio de lavandería no encontrado");
            }
            throw new ResponseStatusException(BAD_GATEWAY,
                    "Error al consultar laundry-service: " + ex.getStatusCode());
        } catch (Exception ex) {
            throw new ResponseStatusException(BAD_GATEWAY,
                    "No se pudo contactar al laundry-service: " + ex.getMessage());
        }
    }
}
