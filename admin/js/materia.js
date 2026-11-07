document.addEventListener("DOMContentLoaded", function () {

    const formulario = $("formMateria");
    const tabla      = $("tablaCuerpo");
    const buscar     = $("buscarMateria");
    const btnGuardar = $("btnGuardarMateria");

    let materias = [];
    let idEditando = null;      // id_materia en edición (null = creando)

    // ---------- CARGAR Y PINTAR ----------
    async function cargarMaterias() {
        try {
            const r = await api("materias/read.php");
            materias = Array.isArray(r) ? r : [];
            pintar();
        } catch (err) {
            if (err.message !== "No autorizado") {
                mostrarAlerta("Error", err.message, "error");
            }
        }
    }

    function pintar() {
        const texto = buscar.value.toLowerCase().trim();
        const lista = materias.filter(m =>
            (m.codigo + " " + m.nombre).toLowerCase().includes(texto));

        if (!lista.length) {
            tabla.innerHTML = `<tr><td colspan="5">No hay materias para mostrar</td></tr>`;
            return;
        }

        tabla.innerHTML = lista.map(m => `
            <tr>
                <td>${esc(m.codigo)}</td>
                <td>${esc(m.nombre)}</td>
                <td>${esc(m.creditos)}</td>
                <td>${m.activa == 1 ? "Activa" : "Inactiva"}</td>
                <td>
                    <button type="button" class="btn-tabla" data-accion="editar" data-id="${m.id_materia}">Editar</button>
                    <button type="button" class="btn-tabla" data-accion="estado" data-id="${m.id_materia}">
                        ${m.activa == 1 ? "Desactivar" : "Activar"}
                    </button>
                    <button type="button" class="btn-tabla" data-accion="eliminar" data-id="${m.id_materia}">Eliminar</button>
                </td>
            </tr>`).join("");
    }

    // ---------- GUARDAR / ACTUALIZAR ----------
    formulario.addEventListener("submit", async function (evento) {
        evento.preventDefault();

        const codigo      = $("codigoMateria").value.trim();
        const nombre      = $("nombreMateria").value.trim();
        const creditos    = $("creditos").value;
        const descripcion = $("descripcion").value.trim();
        const activa      = $("materiaActiva").value;

        if (codigo === "" || nombre === "" || creditos === "") {
            mostrarAlerta("Campos incompletos", "Complete código, nombre y créditos.", "advertencia");
            return;
        }
        if (!/^[A-Za-z0-9-]+$/.test(codigo)) {
            mostrarAlerta("Código inválido", "Solo letras, números y guiones.", "advertencia");
            return;
        }
        if (!Number.isInteger(Number(creditos)) || Number(creditos) < 1 || Number(creditos) > 20) {
            mostrarAlerta("Créditos inválidos", "Los créditos deben estar entre 1 y 20.", "advertencia");
            return;
        }

        const datos = { codigo, nombre, creditos: Number(creditos), descripcion, activa: Number(activa) };
        if (idEditando !== null) datos.id_materia = idEditando;

        btnGuardar.disabled = true;
        try {
            const r = await api(
                idEditando !== null ? "materias/update.php" : "materias/create.php", datos);

            if (r.ok) {
                mostrarAlerta(
                    idEditando !== null ? "Materia actualizada" : "Materia registrada",
                    nombre, "exito");
                limpiar();
                cargarMaterias();
            } else {
                mostrarAlerta("No se pudo guardar", r.error, "error");
            }
        } catch (err) {
            if (err.message !== "No autorizado") {
                mostrarAlerta("Error de conexión", err.message, "error");
            }
        } finally {
            btnGuardar.disabled = false;
        }
    });

    // ---------- ACCIONES DE LA TABLA ----------
    tabla.addEventListener("click", async function (evento) {
        const boton = evento.target.closest("button");
        if (!boton) return;

        const id = Number(boton.dataset.id);
        const materia = materias.find(m => m.id_materia == id);
        if (!materia) return;

        if (boton.dataset.accion === "editar") {
            idEditando = id;
            $("codigoMateria").value = materia.codigo;
            $("nombreMateria").value = materia.nombre;
            $("creditos").value      = materia.creditos;
            $("descripcion").value   = materia.descripcion ?? "";
            $("materiaActiva").value = String(materia.activa == 1 ? 1 : 0);
            $("tituloFormulario").textContent = "Editando: " + materia.nombre;
            btnGuardar.textContent = "Actualizar Materia";
            window.scrollTo({ top: 0, behavior: "smooth" });
        }

        if (boton.dataset.accion === "estado") {
            const r = await api("materias/update.php", {
                id_materia:  materia.id_materia,
                codigo:      materia.codigo,
                nombre:      materia.nombre,
                creditos:    Number(materia.creditos),
                descripcion: materia.descripcion ?? "",
                activa:      materia.activa == 1 ? 0 : 1
            });
            if (!r.ok) mostrarAlerta("Error", r.error, "error");
            cargarMaterias();
        }

        if (boton.dataset.accion === "eliminar") {
            if (!confirm("¿Eliminar la materia " + materia.nombre + "?")) return;
            const r = await api("materias/eliminate.php", { id_materia: id });
            if (r.ok) {
                mostrarAlerta("Materia eliminada", materia.nombre, "exito");
                if (idEditando === id) limpiar();
            } else {
                mostrarAlerta("No se pudo eliminar", r.error, "error");
            }
            cargarMaterias();
        }
    });

    // ---------- DESCARTAR / BUSCAR ----------
    $("btnDescartar").addEventListener("click", function () {
        if (confirm("¿Desea descartar la información ingresada?")) limpiar();
    });

    buscar.addEventListener("input", pintar);

    function limpiar() {
        formulario.reset();
        idEditando = null;
        $("tituloFormulario").textContent = "Datos de la Asignatura";
        btnGuardar.textContent = "Guardar Materia";
    }

    cargarMaterias();
});