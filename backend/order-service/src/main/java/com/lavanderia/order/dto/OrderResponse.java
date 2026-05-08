package com.lavanderia.order.dto;

import com.lavanderia.order.model.OrderEntity;
import com.lavanderia.order.model.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private Long userId;
    private String username;
    private Long serviceId;
    private String serviceName;
    private BigDecimal servicePrice;
    private Integer quantity;
    private BigDecimal totalPrice;
    private OrderStatus status;
    private String notes;
    private Instant createdAt;
    private Instant updatedAt;

    public static OrderResponse from(OrderEntity o) {
        return OrderResponse.builder()
                .id(o.getId())
                .userId(o.getUserId())
                .username(o.getUsername())
                .serviceId(o.getServiceId())
                .serviceName(o.getServiceName())
                .servicePrice(o.getServicePrice())
                .quantity(o.getQuantity())
                .totalPrice(o.getTotalPrice())
                .status(o.getStatus())
                .notes(o.getNotes())
                .createdAt(o.getCreatedAt())
                .updatedAt(o.getUpdatedAt())
                .build();
    }
}
