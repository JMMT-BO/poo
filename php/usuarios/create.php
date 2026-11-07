<?php
require_once '../conexion.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["ok" => false, "error" => "No se recibieron datos"]);
    exit;
}

$nombre = $conexion->real_escape_string($data['nombre'] ?? '');
$correo = $conexion->real_escape_string($data['correo'] ?? '');
$passwordBruta = $data['password'] ?? '';
$rol = $conexion->real_escape_string($data['rol'] ?? 'estudiante');
$programa = $conexion->real_escape_string($data['programa'] ?? '');
$semestre = isset($data['semestre']) ? intval($data['semestre']) : null;

if (empty($nombre) || empty($correo) || empty($passwordBruta)) {
    echo json_encode(["ok" => false, "error" => "Complete los campos obligatorios de acceso"]);
    exit;
}

// Cifrar contraseña de forma segura
$password = password_hash($passwordBruta, PASSWORD_DEFAULT);

$sql = "INSERT INTO usuarios (nombre, correo, password, rol, programa, semestre) 
        VALUES ('$nombre', '$correo', '$password', '$rol', '$programa', " . ($semestre !== null ? $semestre : "NULL") . ")";

if ($conexion->query($sql)) {
    $nuevoId = $conexion->insert_id;
    $codigoAsignado = strtoupper(substr($rol, 0, 3)) . "-" . $nuevoId;
    
    echo json_encode([
        "ok" => true, 
        "codigo" => $codigoAsignado
    ]);
} else {
    echo json_encode(["ok" => false, "error" => "El correo ya está registrado o hubo un fallo: " . $conexion->error]);
}
?>