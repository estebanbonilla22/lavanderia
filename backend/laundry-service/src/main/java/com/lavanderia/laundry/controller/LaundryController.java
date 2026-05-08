package com.lavanderia.laundry.controller;

import com.lavanderia.laundry.dto.LaundryServiceRequest;
import com.lavanderia.laundry.dto.LaundryServiceResponse;
import com.lavanderia.laundry.service.LaundryServiceManager;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/services")
public class LaundryController {

    private final LaundryServiceManager service;

    public LaundryController(LaundryServiceManager service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<LaundryServiceResponse>> list(
            @RequestParam(value = "onlyActive", defaultValue = "false") boolean onlyActive) {
        return ResponseEntity.ok(service.findAll(onlyActive));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LaundryServiceResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<LaundryServiceResponse> create(
            @Valid @RequestBody LaundryServiceRequest request) {
        return ResponseEntity.ok(service.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LaundryServiceResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody LaundryServiceRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
