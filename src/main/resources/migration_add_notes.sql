-- Migración: Agregar campo 'notes' a workout_exercises
-- Este script se ejecutará automáticamente con Spring Boot,
-- pero lo incluyo por si prefieres hacerlo manualmente

ALTER TABLE workout_exercises ADD COLUMN notes VARCHAR(500) NULL;

