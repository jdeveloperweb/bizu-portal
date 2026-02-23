package com.bizu.portal.commerce.application;

import com.bizu.portal.commerce.domain.Coupon;
import com.bizu.portal.commerce.infrastructure.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;

    @Transactional(readOnly = true)
    public List<Coupon> findAll() {
        return couponRepository.findAll();
    }

    @Transactional
    public Coupon create(Coupon coupon) {
        coupon.setCode(coupon.getCode().toUpperCase());
        return couponRepository.save(coupon);
    }

    @Transactional
    public void delete(UUID id) {
        couponRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Coupon validateCoupon(String code) {
        Coupon coupon = couponRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new RuntimeException("Cupom não encontrado"));
        
        if (!coupon.isValid()) {
            throw new RuntimeException("Cupom inválido ou expirado");
        }
        
        return coupon;
    }

    @Transactional
    public void incrementUsage(String code) {
        Coupon coupon = couponRepository.findByCode(code.toUpperCase())
                .orElse(null);
        if (coupon != null) {
            coupon.setUsedCount(coupon.getUsedCount() + 1);
            couponRepository.save(coupon);
        }
    }
}
