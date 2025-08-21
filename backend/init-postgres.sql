-- Script de inicialización para PostgreSQL
-- Plataforma de Reservas de Hotel

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    rol VARCHAR(20) DEFAULT 'usuario' CHECK (rol IN ('usuario', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de tipos de habitación
CREATE TABLE IF NOT EXISTS tipos_habitacion (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    capacidad INT NOT NULL
);

-- Tabla de habitaciones
CREATE TABLE IF NOT EXISTS habitaciones (
    id SERIAL PRIMARY KEY,
    numero VARCHAR(10) UNIQUE NOT NULL,
    tipo_id INT REFERENCES tipos_habitacion(id),
    estado VARCHAR(20) DEFAULT 'disponible' CHECK (estado IN ('disponible', 'ocupada', 'mantenimiento')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de reservas
CREATE TABLE IF NOT EXISTS reservas (
    id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES usuarios(id),
    habitacion_id INT REFERENCES habitaciones(id),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmada', 'cancelada')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar tipos de habitación básicos
INSERT INTO tipos_habitacion (nombre, descripcion, precio, capacidad) VALUES
    ('Individual', 'Habitación individual con cama de matrimonio', 50.00, 2),
    ('Doble', 'Habitación doble con dos camas individuales', 75.00, 2),
    ('Suite', 'Suite de lujo con jacuzzi y vista panorámica', 150.00, 4)
ON CONFLICT DO NOTHING;

-- Insertar habitaciones básicas
INSERT INTO habitaciones (numero, tipo_id, estado) VALUES
    ('101', 1, 'disponible'),
    ('102', 1, 'disponible'),
    ('201', 2, 'disponible'),
    ('202', 2, 'disponible'),
    ('301', 3, 'disponible'),
    ('302', 3, 'disponible')
ON CONFLICT DO NOTHING;

-- Insertar usuario administrador (password: password)
INSERT INTO usuarios (nombre, correo, contrasena, rol) VALUES
    ('Admin', 'admin@hotel.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
    ('Usuario Test', 'usuario@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'usuario')
ON CONFLICT DO NOTHING;

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_usuarios_correo ON usuarios(correo);
CREATE INDEX IF NOT EXISTS idx_reservas_fechas ON reservas(fecha_inicio, fecha_fin);
CREATE INDEX IF NOT EXISTS idx_habitaciones_estado ON habitaciones(estado);

-- Comentarios de las tablas
COMMENT ON TABLE usuarios IS 'Tabla de usuarios del sistema';
COMMENT ON TABLE tipos_habitacion IS 'Tipos de habitación disponibles';
COMMENT ON TABLE habitaciones IS 'Habitaciones del hotel';
COMMENT ON TABLE reservas IS 'Reservas de habitaciones por usuarios';
