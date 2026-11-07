document.addEventListener("DOMContentLoaded", function () {
    const buscar = $("buscar");
    let resumen = null;

    function badge(activo) {
        return activo == 1
            ? `<span class="estado activo-estado">ACTIVO</span>`
            : `<span class="estado inactivo-estado">INACTIVO</span>`;
    }

    async function cargar() {
        try {
            resumen = await api("admin/resumen.php");

            $("statMaterias").textContent = resumen.materias_activas;
            $("statUsuarios").textContent = resumen.usuarios;
            $("statUsuariosDetalle").textContent =
                resumen.estudiantes + " estudiantes · " + resumen.docentes + " docentes";
            $("statGrupos").textContent = resumen.grupos;
            $("statPeriodo").textContent =
                resumen.periodo ? "Último período: " + resumen.periodo : "Sin grupos aún";

            pintarTablas();
        } catch (err) {
            if (err.message !== "No autorizado") {
                mostrarAlerta("Error", err.message, "error");
            }
        }
    }

    function pintarTablas() {
        if (!resumen) return;
        const texto = buscar.value.toLowerCase().trim();

        const materias = resumen.materias.filter(m =>
            (m.codigo + " " + m.nombre).toLowerCase().includes(texto));
        const docentes = resumen.lista_docentes.filter(d =>
            (d.codigo_docente + " " + d.nombre).toLowerCase().includes(texto));

        $("tablaMaterias").innerHTML = materias.length
            ? materias.map(m => `
                <tr>
                    <td>${esc(m.codigo)}</td>
                    <td>${esc(m.nombre)}</td>
                    <td>${badge(m.activa)}</td>
                </tr>`).join("")
            : `<tr><td colspan="3">Sin materias para mostrar</td></tr>`;

        $("tablaDocentes").innerHTML = docentes.length
            ? docentes.map(d => `
                <tr>
                    <td>${esc(d.codigo_docente)}</td>
                    <td>${esc(d.nombre)}</td>
                    <td>${badge(d.activo)}</td>
                </tr>`).join("")
            : `<tr><td colspan="3">Sin docentes para mostrar</td></tr>`;
    }

    buscar.addEventListener("input", pintarTablas);

    $("btnReporte").addEventListener("click", function () {
        if (!resumen) return;
        mostrarAlerta(
            "Reporte rápido",
            resumen.materias_activas + " materias activas · " +
            resumen.estudiantes + " estudiantes · " +
            resumen.docentes + " docentes · " +
            resumen.grupos + " grupos",
            "info");
    });

    $("btnSincronizar").addEventListener("click", async function () {
        await cargar();
        mostrarAlerta("Datos sincronizados", "La información se actualizó desde la base de datos.", "exito");
    });

    cargar();
});