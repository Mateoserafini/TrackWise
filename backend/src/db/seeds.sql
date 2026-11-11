-- =======================================================
-- TrackWise MVP - Categorías por Defecto del Sistema (Seeds)
-- Paleta moderna de alto contraste (sin tonos opacos/naranjas)
-- =======================================================

INSERT INTO categories (name, icon, color, type, is_default, user_id)
SELECT 'Comida', 'Utensils', '#D2F865', 'EXPENSE', TRUE, NULL
WHERE NOT EXISTS (
    SELECT 1 FROM categories WHERE name = 'Comida' AND is_default = TRUE AND user_id IS NULL
);

INSERT INTO categories (name, icon, color, type, is_default, user_id)
SELECT 'Transporte', 'Bus', '#3E63F6', 'EXPENSE', TRUE, NULL
WHERE NOT EXISTS (
    SELECT 1 FROM categories WHERE name = 'Transporte' AND is_default = TRUE AND user_id IS NULL
);

INSERT INTO categories (name, icon, color, type, is_default, user_id)
SELECT 'Vivienda / Alquiler', 'Home', '#6366F1', 'EXPENSE', TRUE, NULL
WHERE NOT EXISTS (
    SELECT 1 FROM categories WHERE name = 'Vivienda / Alquiler' AND is_default = TRUE AND user_id IS NULL
);

INSERT INTO categories (name, icon, color, type, is_default, user_id)
SELECT 'Servicios', 'Zap', '#F9D976', 'EXPENSE', TRUE, NULL
WHERE NOT EXISTS (
    SELECT 1 FROM categories WHERE name = 'Servicios' AND is_default = TRUE AND user_id IS NULL
);

INSERT INTO categories (name, icon, color, type, is_default, user_id)
SELECT 'Ocio / Entretenimiento', 'Gamepad2', '#EC4899', 'EXPENSE', TRUE, NULL
WHERE NOT EXISTS (
    SELECT 1 FROM categories WHERE name = 'Ocio / Entretenimiento' AND is_default = TRUE AND user_id IS NULL
);

INSERT INTO categories (name, icon, color, type, is_default, user_id)
SELECT 'Salud', 'HeartPulse', '#FF4D2D', 'EXPENSE', TRUE, NULL
WHERE NOT EXISTS (
    SELECT 1 FROM categories WHERE name = 'Salud' AND is_default = TRUE AND user_id IS NULL
);

INSERT INTO categories (name, icon, color, type, is_default, user_id)
SELECT 'Salario / Sueldo', 'Briefcase', '#10B981', 'INCOME', TRUE, NULL
WHERE NOT EXISTS (
    SELECT 1 FROM categories WHERE name = 'Salario / Sueldo' AND is_default = TRUE AND user_id IS NULL
);

INSERT INTO categories (name, icon, color, type, is_default, user_id)
SELECT 'Otros', 'Tag', '#94A3B8', 'BOTH', TRUE, NULL
WHERE NOT EXISTS (
    SELECT 1 FROM categories WHERE name = 'Otros' AND is_default = TRUE AND user_id IS NULL
);
