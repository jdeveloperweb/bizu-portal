ALTER TABLE admin.system_settings 
ADD COLUMN infinitepay_handle VARCHAR(255),
ADD COLUMN preferred_payment_gateway VARCHAR(50) DEFAULT 'MERCADO_PAGO';
