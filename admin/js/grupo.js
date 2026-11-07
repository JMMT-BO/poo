document.addEventListener("DOMContentLoaded", function () {
    const formulario = $("formGrupo");
    const btnGuardar = $("btnGuardarGrupo");
    const tabla      = $("tablaGrupos");

    async function cargarOpciones() {
        try {
            const o = await api("grupos/opciones.php");

            $("materia").innerHTML =
                `<option value="">Seleccione una materia</option>` +
                o.materias.map(m => `<option value="${m.id_materia}">${esc(m.codigo)} - ${esc(m.nombre)}</option>`).join("");

            $("docente").innerHTML =
                `<option value="">Seleccione un docente</option>` +
                o.profesores.map(p => `<option value="${p.id_profesor}">${esc(p.nombre)}</option>`).join("");

            if (!o.materias.length || !o.profesores.length) {
                mostrarAlerta(
                    "Faltan datos",
                    "Para crear un grupo necesita al menos una materia activa y un docente registrado.",
                    "advertencia");
            }
        } catch (err) {
            if (err.message !== "No autorizado") mostrarAlerta("Error", err.message, "error");
        }
    }

    async function cargarGrupos() {
        try {
            const grupos = await api("grupos/read.php");

            if (!Array.isArray(grupos) || !grupos.length) {
                tabla.innerHTML = `<tr><td colspan="6">Aún no hay grupos registrados</td></tr>`;
                return;
            }

            tabla.innerHTML = grupos.map(g => `
                <tr>
                    <td>${esc(g.codigo)} - ${esc(g.materia)}</td>
                    <td>${esc(g.codigo_grupo)}</td>
                    <td>${esc(g.periodo)}</td>
                    <td>${esc(g.profesor)}</td>
                    <td>${esc(g.inscritos)} / ${esc(g.cupo)}</td>
                    <td>
                        <button type="button" class="btn-tabla" data-id="${g.id_grupo}">Eliminar</button>
                    </td>
                </tr>`).join("");
        } catch (err) {
            if (err.message !== "No autorizado") mostrarAlerta("Error", err.message, "error");
        }
    }

    formulario.addEventListener("submit", async function (evento) {
        evento.preventDefault();

        const codigoGrupo = $("codigoGrupo").value.trim();
        const periodo     = $("periodo").value;
        const idMateria   = $("materia").value;
        const idProfesor  = $("docente").value;
        const cupo        = $("capacidad").value;

        if (codigoGrupo === "" || periodo === "" || idMateria === "" ||
            idProfesor === "" || cupo === "") {
            mostrarAlerta("Campos incompletos", "Complete todos los campos obligatorios.", "advertencia");
            return;
        }
        if (Number(cupo) <= 0) {
            mostrarAlerta("Capacidad inválida", "La capacidad debe ser mayor que cero.", "advertencia");
            return;
        }

        btnGuardar.disabled = true;
        try {
            const r = await api("grupos/create.php", {
                codigo_grupo: codigoGrupo,
                periodo:      periodo,
                id_materia:   Number(idMateria),
                id_profesor:  Number(idProfesor),
                cupo:         Number(cupo)
            });

            if (r.ok) {
                mostrarAlerta("Grupo guardado", "El grupo quedó registrado correctamente.", "exito");
                formulario.reset();
                if($("capacidad")) $("capacidad").value = 35;
                cargarGrupos();
            } else {
                mostrarAlerta("No se pudo guardar", r.error, "error");
            }
        } catch (err) {
            if (err.message !== "No autorizado") mostrarAlerta("Error de conexión", err.message, "error");
        } finally {
            btnGuardar.disabled = false;
        }
    });

    tabla.addEventListener("click", async function (evento) {
        const boton = evento.target.closest("button");
        if (!boton) return;
        if (!confirm("¿Eliminar este grupo?")) return;

        const r = await api("grupos/eliminate.php", { id_grupo: Number(boton.dataset.id) });
        if (r.ok) {
            mostrarAlerta("Grupo eliminado", "El grupo fue eliminado.", "exito");
        } else {
            mostrarAlerta("No se pudo eliminar", r.error, "error");
        }
        cargarGrupos();
    });

    cargarOpciones();
    cargarGrupos();
});