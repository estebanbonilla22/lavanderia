package com.lavanderia.order.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class LaundryServiceDto {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private Integer durationHours;
    private boolean active;
}
