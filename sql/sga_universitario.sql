
CREATE DATABASE IF NOT EXISTS sga_universitario
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE sga_universitario;

CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(120) NOT NULL UNIQUE,
    contrasena_hash VARCHAR(255) NOT NULL,
    rol ENUM('estudiante', 'profesor', 'administrador')
        NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE estudiantes (
    id_estudiante INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL UNIQUE,
    codigo_estudiantil VARCHAR(30) NOT NULL UNIQUE,
    programa VARCHAR(100),
    semestre INT,
    FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario),
    CHECK (semestre IS NULL OR semestre BETWEEN 1 AND 20)
);

CREATE TABLE profesores (
    id_profesor INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL UNIQUE,
    codigo_docente VARCHAR(30) NOT NULL UNIQUE,
    especialidad VARCHAR(100),
    FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
);


CREATE TABLE materias (
    id_materia INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    creditos INT NOT NULL,
    descripcion TEXT,
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    CHECK (creditos BETWEEN 1 AND 20)
);


CREATE TABLE grupos (
    id_grupo INT AUTO_INCREMENT PRIMARY KEY,
    id_materia INT NOT NULL,
    id_profesor INT NOT NULL,
    codigo_grupo VARCHAR(20) NOT NULL,
    periodo VARCHAR(20) NOT NULL,
    cupo INT NOT NULL DEFAULT 35,
    FOREIGN KEY (id_materia)
        REFERENCES materias(id_materia),
    FOREIGN KEY (id_profesor)
        REFERENCES profesores(id_profesor),
    UNIQUE (id_materia, codigo_grupo, periodo),
    CHECK (cupo > 0)
);

CREATE TABLE inscripciones (
    id_inscripcion INT AUTO_INCREMENT PRIMARY KEY,
    id_estudiante INT NOT NULL,
    id_grupo INT NOT NULL,
    fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('activa', 'retirada', 'finalizada')
        NOT NULL DEFAULT 'activa',
    FOREIGN KEY (id_estudiante)
        REFERENCES estudiantes(id_estudiante),
    FOREIGN KEY (id_grupo)
        REFERENCES grupos(id_grupo),
    UNIQUE (id_estudiante, id_grupo)
);

CREATE TABLE criterios_evaluacion (
    id_criterio INT AUTO_INCREMENT PRIMARY KEY,
    id_grupo INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    porcentaje DECIMAL(5,2) NOT NULL,
    corte TINYINT NOT NULL,
    FOREIGN KEY (id_grupo)
        REFERENCES grupos(id_grupo),
    UNIQUE (id_grupo, nombre),
    CHECK (porcentaje > 0 AND porcentaje <= 100),
    CHECK (corte BETWEEN 1 AND 3)
);

CREATE TABLE notas (
    id_nota INT AUTO_INCREMENT PRIMARY KEY,
    id_inscripcion INT NOT NULL,
    id_criterio INT NOT NULL,
    calificacion DECIMAL(3,2) NOT NULL,
    observacion VARCHAR(255),
    fecha_actualizacion TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_inscripcion)
        REFERENCES inscripciones(id_inscripcion),
    FOREIGN KEY (id_criterio)
        REFERENCES criterios_evaluacion(id_criterio),
    UNIQUE (id_inscripcion, id_criterio),
    CHECK (calificacion BETWEEN 0 AND 5)
);
