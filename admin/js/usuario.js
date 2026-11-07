document.addEventListener("DOMContentLoaded", function () {

    const formulario   = $("formUsuario");
    const btnRegistrar = $("btnRegistrar");
    const btnDescartar = $("btnDescartar");

    // El semestre solo aplica a estudiantes
    function ajustarPerfil() {
        const esEstudiante =
            document.querySelector('input[name="tipoPerfil"]:checked').value === "estudiante";

        $("bloqueSemestre").style.display = esEstudiante ? "" : "none";
        $("labelPrograma").textContent =
            esEstudiante ? "Programa / Carrera *" : "Especialidad / Área *";
    }

    document.querySelectorAll('input[name="tipoPerfil"]').forEach(function (radio) {
        radio.addEventListener("change", ajustarPerfil);
    });
    ajustarPerfil();

    // ---------- REGISTRAR ----------
    formulario.addEventListener("submit", async function (evento) {
        evento.preventDefault();

        const esEstudiante =
            document.querySelector('input[name="tipoPerfil"]:checked').value === "estudiante";

        const nombres    = $("nombres").value.trim();
        const apellidos  = $("apellidos").value.trim();
        const correo     = $("correoInstitucional").value.trim();
        const contrasena = $("contrasena").value;
        const selPrograma = $("programa");
        const programa   = selPrograma.value;
        const semestre   = $("semestre").value;

        if (nombres === "" || apellidos === "" || correo === "" ||
            contrasena === "" || programa === "" || (esEstudiante && semestre === "")) {
            mostrarAlerta("Campos incompletos", "Complete todos los campos obligatorios.", "advertencia");
            return;
        }
        if (!correo.includes("@")) {
            mostrarAlerta("Correo inválido", "Ingrese un correo institucional válido.", "advertencia");
            return;
        }
        if (contrasena.length < 6) {
            mostrarAlerta("Contraseña débil", "La contraseña debe tener mínimo 6 caracteres.", "advertencia");
            return;
        }

        btnRegistrar.disabled = true;
        try {
            const r = await api("usuarios/create.php", {
                nombre:   nombres + " " + apellidos,
                correo:   correo,
                password: contrasena,
                rol:      esEstudiante ? "estudiante" : "profesor",   // en la base se llama "profesor"
                programa: programa,
                semestre: esEstudiante ? semestre : null
            });

            if (r.ok) {
                mostrarAlerta("Usuario registrado", "Código asignado: " + r.codigo, "exito");
                formulario.reset();
                ajustarPerfil();
            } else {
                mostrarAlerta("No se pudo registrar", r.error, "error");
            }
        } catch (err) {
            if (err.message !== "No autorizado") {
                mostrarAlerta("Error de conexión", err.message, "error");
            }
        } finally {
            btnRegistrar.disabled = false;
        }
    });

    // ---------- DESCARTAR ----------
    btnDescartar.addEventListener("click", function () {
        if (confirm("¿Desea descartar el registro actual?")) {
            formulario.reset();
            ajustarPerfil();
            mostrarAlerta("Registro descartado", "El formulario quedó limpio.", "info");
        }
    });
});