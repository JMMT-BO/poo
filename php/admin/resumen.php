<?php
require_once '../conexion.php';
header('Content-Type: application/json');

try {
    // 1. Contar materias activas
    $resMateriasActivas = $conexion->query("SELECT COUNT(*) as total FROM materias WHERE activa = 1");
    $materias_activas = $resMateriasActivas->fetch_assoc()['total'];

    // 2. Contar estudiantes y docentes
    $resEstudiantes = $conexion->query("SELECT COUNT(*) as total FROM usuarios WHERE rol = 'estudiante'");
    $estudiantes = $resEstudiantes->fetch_assoc()['total'];

    $resDocentes = $conexion->query("SELECT COUNT(*) as total FROM usuarios WHERE rol = 'profesor'");
    $docentes = $resDocentes->fetch_assoc()['total'];
    
    $usuarios = $estudiantes + $docentes;

    // 3. Contar grupos y último período
    $resGrupos = $conexion->query("SELECT COUNT(*) as total, MAX(periodo) as ultimo_periodo FROM grupos");
    $rowGrupo = $resGrupos->fetch_assoc();
    $grupos = $rowGrupo['total'];
    $periodo = $rowGrupo['ultimo_periodo'];

    // 4. Obtener listado de materias
    $resListaMat = $conexion->query("SELECT id_materia, codigo, nombre, creditos, activa, descripcion FROM materias");
    $materias = [];
    while($m = $resListaMat->fetch_assoc()) {
        $materias[] = $m;
    }

    // 5. Obtener listado de docentes (en la BD se guardan con rol 'profesor')
    $resListaDoc = $conexion->query("SELECT id AS id_profesor, CONCAT('DOC-', id) AS codigo_docente, nombre, 1 AS activo FROM usuarios WHERE rol = 'profesor'");
    $lista_docentes = [];
    while($d = $resListaDoc->fetch_assoc()) {
        $lista_docentes[] = $d;
    }

    echo json_encode([
        "materias_activas" => (int)$materias_activas,
        "usuarios" => (int)$usuarios,
        "estudiantes" => (int)$estudiantes,
        "docentes" => (int)$docentes,
        "grupos" => (int)$grupos,
        "periodo" => $periodo,
        "materias" => $materias,
        "lista_docentes" => $lista_docentes
    ]);

} catch (Exception $e) {
    echo json_encode(["ok" => false, "error" => $e->getMessage()]);
}
?>