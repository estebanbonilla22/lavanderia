package com.lavanderia.laundry.service;

import com.lavanderia.laundry.dto.LaundryServiceRequest;
import com.lavanderia.laundry.dto.LaundryServiceResponse;
import com.lavanderia.laundry.model.LaundryService;
import com.lavanderia.laundry.repository.LaundryServiceRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class LaundryServiceManager {

    private final LaundryServiceRepository repository;

    public LaundryServiceManager(LaundryServiceRepository repository) {
        this.repository = repository;
    }

    public List<LaundryServiceResponse> findAll(boolean onlyActive) {
        List<LaundryService> services = onlyActive
                ? repository.findByActiveTrue()
                : repository.findAll();
        return services.stream().map(LaundryServiceResponse::from).toList();
    }

    public LaundryServiceResponse findById(Long id) {
        return LaundryServiceResponse.from(getOrThrow(id));
    }

    public LaundryServiceResponse create(LaundryServiceRequest request) {
        if (repository.existsByNameIgnoreCase(request.getName())) {
            throw new ResponseStatusException(BAD_REQUEST, "Ya existe un servicio con ese nombre");
        }
        LaundryService entity = LaundryService.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .durationHours(request.getDurationHours())
                .active(request.getActive() == null ? true : request.getActive())
                .build();
        return LaundryServiceResponse.from(repository.save(entity));
    }

    public LaundryServiceResponse update(Long id, LaundryServiceRequest request) {
        LaundryService entity = getOrThrow(id);
        entity.setName(request.getName());
        entity.setDescription(request.getDescription());
        entity.setPrice(request.getPrice());
        entity.setDurationHours(request.getDurationHours());
        entity.setActive(request.getActive() == null ? entity.isActive() : request.getActive());
        return LaundryServiceResponse.from(repository.save(entity));
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(NOT_FOUND, "Servicio no encontrado");
        }
        repository.deleteById(id);
    }

    private LaundryService getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Servicio no encontrado"));
    }
}
