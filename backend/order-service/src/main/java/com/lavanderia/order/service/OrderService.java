package com.lavanderia.order.service;

import com.lavanderia.order.client.LaundryServiceClient;
import com.lavanderia.order.dto.CreateOrderRequest;
import com.lavanderia.order.dto.LaundryServiceDto;
import com.lavanderia.order.dto.OrderResponse;
import com.lavanderia.order.dto.UpdateStatusRequest;
import com.lavanderia.order.model.OrderEntity;
import com.lavanderia.order.repository.OrderRepository;
import com.lavanderia.order.security.AuthenticatedUser;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

import static org.springframework.http.HttpStatus.*;

@Service
public class OrderService {

    private final OrderRepository repository;
    private final LaundryServiceClient laundryClient;

    public OrderService(OrderRepository repository, LaundryServiceClient laundryClient) {
        this.repository = repository;
        this.laundryClient = laundryClient;
    }

    public List<OrderResponse> findAll() {
        return repository.findAllByOrderByCreatedAtDesc().stream()
                .map(OrderResponse::from)
                .toList();
    }

    public List<OrderResponse> findMyOrders(Long userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(OrderResponse::from)
                .toList();
    }

    public OrderResponse findById(Long id, AuthenticatedUser current) {
        OrderEntity order = getOrThrow(id);
        ensureCanAccess(order, current);
        return OrderResponse.from(order);
    }

    public OrderResponse create(CreateOrderRequest request,
                                AuthenticatedUser current,
                                String bearerToken) {
        if (current.getUserId() == null) {
            throw new ResponseStatusException(UNAUTHORIZED, "Token sin identificador de usuario");
        }
        LaundryServiceDto serviceDto = laundryClient.getById(request.getServiceId(), bearerToken);
        if (serviceDto == null) {
            throw new ResponseStatusException(NOT_FOUND, "Servicio no encontrado");
        }
        if (!serviceDto.isActive()) {
            throw new ResponseStatusException(BAD_REQUEST, "El servicio no está activo");
        }

        BigDecimal total = serviceDto.getPrice()
                .multiply(BigDecimal.valueOf(request.getQuantity()));

        OrderEntity entity = OrderEntity.builder()
                .userId(current.getUserId())
                .username(current.getUsername())
                .serviceId(serviceDto.getId())
                .serviceName(serviceDto.getName())
                .servicePrice(serviceDto.getPrice())
                .quantity(request.getQuantity())
                .totalPrice(total)
                .notes(request.getNotes())
                .build();

        return OrderResponse.from(repository.save(entity));
    }

    public OrderResponse updateStatus(Long id, UpdateStatusRequest request) {
        OrderEntity order = getOrThrow(id);
        order.setStatus(request.getStatus());
        return OrderResponse.from(repository.save(order));
    }

    public void delete(Long id, AuthenticatedUser current) {
        OrderEntity order = getOrThrow(id);
        ensureCanAccess(order, current);
        repository.delete(order);
    }

    private OrderEntity getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Orden no encontrada"));
    }

    private void ensureCanAccess(OrderEntity order, AuthenticatedUser current) {
        if (current.isAdmin()) {
            return;
        }
        if (!order.getUserId().equals(current.getUserId())) {
            throw new ResponseStatusException(FORBIDDEN, "No puedes acceder a esta orden");
        }
    }
}
