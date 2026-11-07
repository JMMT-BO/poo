<?php
$host = "localhost";
$usuario = "root";
$password = "";
$base_datos = "sga_universitario";

$conexion = new mysqli($host, $usuario, $password, $base_datos);

if ($conexion->connect_error) {
    header('Content-Type: application/json');
    echo json_encode(["ok" => false, "error" => "Error de conexión a la BD: " . $conexion->connect_error]);
    exit;
}

$conexion->set_charset("utf8mb4");
?>