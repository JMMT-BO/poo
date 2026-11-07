<?php
require_once '../conexion.php';
header('Content-Type: application/json');

$resultado = $conexion->query("SELECT * FROM materias");
$materias = [];

while ($row = $resultado->fetch_assoc()) {
    $materias[] = $row;
}

echo json_encode($materias);
?>