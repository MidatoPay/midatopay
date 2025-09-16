-- Script de inicialización de la base de datos
-- Este archivo se ejecuta automáticamente cuando se crea el contenedor de PostgreSQL

-- Crear base de datos si no existe
SELECT 'CREATE DATABASE midatopay'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'midatopay')\gexec

-- Conectar a la base de datos
\c midatopay;

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear usuario si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'midatopay') THEN
        CREATE ROLE midatopay WITH LOGIN PASSWORD 'midatopay123';
    END IF;
END
$$;

-- Otorgar permisos
GRANT ALL PRIVILEGES ON DATABASE midatopay TO midatopay;
GRANT ALL PRIVILEGES ON SCHEMA public TO midatopay;
