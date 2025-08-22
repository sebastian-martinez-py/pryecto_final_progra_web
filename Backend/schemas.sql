-- 1) Crear y usar tu base de datos
CREATE DATABASE IF NOT EXISTS proyecto_web
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE proyecto_web;

-- 2) Tabla RAW (la que ya usa tu CRUD)
CREATE TABLE IF NOT EXISTS items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  image_url VARCHAR(512) NOT NULL
);

-- 3) Tabla CLEANED (resultado del pipeline)
CREATE TABLE IF NOT EXISTS items_cleaned (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  image_url VARCHAR(512) NOT NULL
);


-- 5) Verifica que existan las tablas
SHOW TABLES;

-- 6) Ver datos de RAW (y luego de CLEANED cuando corras el pipeline)
SELECT * FROM items;
SELECT * FROM items_cleaned;
