package com.bizu.portal.commerce.api;

import com.bizu.portal.commerce.application.CouponService;
import com.bizu.portal.commerce.domain.Coupon;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Coupon>> getAll() {
        return ResponseEntity.ok(couponService.findAll());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Coupon> create(@RequestBody Coupon coupon) {
        return ResponseEntity.ok(couponService.create(coupon));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        couponService.delete(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/validate")
    public ResponseEntity<Coupon> validate(@RequestParam String code) {
        return ResponseEntity.ok(couponService.validateCoupon(code));
    }
}
