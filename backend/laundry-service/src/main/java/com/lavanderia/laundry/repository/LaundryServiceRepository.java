package com.lavanderia.laundry.repository;

import com.lavanderia.laundry.model.LaundryService;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LaundryServiceRepository extends JpaRepository<LaundryService, Long> {
    List<LaundryService> findByActiveTrue();
    boolean existsByNameIgnoreCase(String name);
}
