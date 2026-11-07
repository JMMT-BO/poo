<?php
require_once '../conexion.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["ok" => false, "error" => "No se recibieron datos"]);
    exit;
}

$codigo = $conexion->real_escape_string($data['codigo'] ?? '');
$nombre = $conexion->real_escape_string($data['nombre'] ?? '');
$creditos = intval($data['creditos'] ?? 0);
$descripcion = $conexion->real_escape_string($data['descripcion'] ?? '');
$activa = intval($data['activa'] ?? 1);

if (empty($codigo) || empty($nombre) || $creditos <= 0) {
    echo json_encode(["ok" => false, "error" => "Faltan campos obligatorios"]);
    exit;
}

$sql = "INSERT INTO materias (codigo, nombre, creditos, descripcion, activa) VALUES ('$codigo', '$nombre', $creditos, '$descripcion', $activa)";

if ($conexion->query($sql)) {
    echo json_encode(["ok" => true]);
} else {
    echo json_encode(["ok" => false, "error" => "Error al registrar en la base de datos: " . $conexion->error]);
}
?>