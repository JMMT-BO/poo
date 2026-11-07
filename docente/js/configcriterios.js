/**
 * ============================================================
 * SISTEMA DE GESTIÓN ACADÉMICA
 * Portal Docente
 *
 * Módulo: Configuración de Criterios
 * Archivo: configcriterios.js
 * ============================================================
 */

document.addEventListener("DOMContentLoaded", () => {
    ConfigCriterios.init();
});

const ConfigCriterios = (() => {

    // ========================================================
    // REFERENCIAS DEL HTML
    // ========================================================

    const DOM = {
        formCriterio: document.getElementById("formCriterio"),
        nombreCriterio: document.getElementById("nombreCriterio"),
        porcentajeCriterio: document.getElementById("porcentajeCriterio"),

        tbodyCriterios: document.getElementById("tbodyCriterios"),
        totalPorcentaje: document.getElementById("totalPorcentaje"),

        tablaNotas: document.getElementById("tablaNotas"),
        encabezadoNotas: document.getElementById("encabezadoNotas"),

        globalSearch: document.getElementById("globalSearch"),

        btnGuardarBorrador: document.getElementById("btnGuardarBorrador"),
        btnExportar: document.getElementById("btnExportar"),
        btnEnviar: document.getElementById("btnEnviar"),

        alerta: document.getElementById("alerta"),
        alertaTitulo: document.getElementById("alertaTitulo"),
        alertaMensaje: document.getElementById("alertaMensaje"),
        alertaIcono: document.getElementById("alertaIcono"),
        cerrarAlerta: document.getElementById("cerrarAlerta"),

        btnCerrarSesion: document.getElementById("btnCerrarSesion")
    };

    const cursoParams = new URLSearchParams(window.location.search);

    const codigoCurso = cursoParams.get("codigo") || "MAT-201";
    const nombreCurso = cursoParams.get("curso") || "Cálculo Diferencial";

    const CLAVE_BORRADOR =
        `sga_config_${codigoCurso}`;

    let tiempoAlerta = null;

    // ========================================================
    // INICIALIZACIÓN
    // ========================================================

    function init() {
        if (!DOM.tbodyCriterios || !DOM.tablaNotas) {
            console.error(
                "No se encontraron los elementos principales de Configuración de Criterios."
            );
            return;
        }

        cargarBorrador();
        configurarEventos();
        actualizarEncabezados();
        recalcularTotalPorcentaje();
    }

    // ========================================================
    // ALERTAS
    // ========================================================

    function mostrarAlerta(titulo, mensaje, tipo = "exito") {
        if (
            !DOM.alerta ||
            !DOM.alertaTitulo ||
            !DOM.alertaMensaje ||
            !DOM.alertaIcono
        ) {
            console.warn(mensaje);
            return;
        }

        DOM.alertaTitulo.textContent = titulo;
        DOM.alertaMensaje.textContent = mensaje;

        if (tipo === "error") {
            DOM.alertaIcono.textContent = "×";
            DOM.alertaIcono.style.background = "#feecec";
            DOM.alertaIcono.style.color = "#d32f2f";
        } else if (tipo === "advertencia") {
            DOM.alertaIcono.textContent = "!";
            DOM.alertaIcono.style.background = "#fff4df";
            DOM.alertaIcono.style.color = "#d97706";
        } else {
            DOM.alertaIcono.textContent = "✓";
            DOM.alertaIcono.style.background = "#e7f5e9";
            DOM.alertaIcono.style.color = "#2e7d32";
        }

        DOM.alerta.classList.add("mostrar");

        clearTimeout(tiempoAlerta);

        tiempoAlerta = setTimeout(() => {
            DOM.alerta.classList.remove("mostrar");
        }, 4000);
    }

    function cerrarAlerta() {
        if (DOM.alerta) {
            DOM.alerta.classList.remove("mostrar");
        }

        clearTimeout(tiempoAlerta);
    }

    // ========================================================
    // OBTENER CRITERIOS
    // ========================================================

    function obtenerCriterios() {
        const filas = DOM.tbodyCriterios.querySelectorAll("tr");

        return Array.from(filas).map(fila => {
            const celdas = fila.querySelectorAll("td");

            return {
                nombre: celdas[0]
                    ? celdas[0].textContent.trim()
                    : "",
                porcentaje: celdas[1]
                    ? parseFloat(celdas[1].textContent.replace("%", "").trim())
                    : 0
            };
        });
    }

    function obtenerPorcentajes() {
        return obtenerCriterios().map(criterio => criterio.porcentaje);
    }

    // ========================================================
    // CALCULAR TOTAL DE PORCENTAJES
    // ========================================================

    function recalcularTotalPorcentaje() {
        const porcentajes = obtenerPorcentajes();

        const total = porcentajes.reduce(
            (acumulado, valor) => acumulado + valor,
            0
        );

        const totalRedondeado = Number(total.toFixed(2));

        if (DOM.totalPorcentaje) {
            DOM.totalPorcentaje.textContent = `${totalRedondeado}%`;

            DOM.totalPorcentaje.style.color =
                totalRedondeado === 100
                    ? "#2e7d32"
                    : "#d32f2f";
        }

        actualizarEncabezados();
        recalcularTodasLasNotas();

        return totalRedondeado;
    }

    // ========================================================
    // ACTUALIZAR ENCABEZADOS
    // ========================================================

    function actualizarEncabezados() {
        if (!DOM.encabezadoNotas) return;

        const criterios = obtenerCriterios();

        const columnas = DOM.encabezadoNotas.querySelectorAll("th");

        criterios.forEach((criterio, indice) => {
            const posicion = indice + 2;
            const columna = columnas[posicion];

            if (!columna) return;

            columna.textContent = "";

            const nombre = document.createElement("span");
            nombre.textContent = criterio.nombre;

            const peso = document.createElement("span");
            peso.className = "peso-columna";
            peso.textContent = `${criterio.porcentaje}%`;

            columna.append(nombre, peso);
        });
    }

    // ========================================================
    // CALCULAR PROMEDIO DE UNA FILA
    // ========================================================

    function calcularPromedioFila(fila) {
        if (!fila) return;

        const inputs = Array.from(
            fila.querySelectorAll(".grade-input")
        );

        const criterios = obtenerCriterios();

        const celdaPromedio =
            fila.querySelector(".promedio-final");

        if (!celdaPromedio) return;

        celdaPromedio.classList.remove(
            "nota-alta",
            "nota-media",
            "nota-baja"
        );

        if (
            criterios.length === 0 ||
            criterios.length !== inputs.length
        ) {
            celdaPromedio.textContent = "-";
            return;
        }

        const totalPorcentajes = criterios.reduce(
            (total, criterio) => total + criterio.porcentaje,
            0
        );

        if (Number(totalPorcentajes.toFixed(2)) !== 100) {
            celdaPromedio.textContent = "-";
            return;
        }

        let promedio = 0;

        for (let i = 0; i < inputs.length; i++) {
            const valor = inputs[i].value.trim();

            if (valor === "") {
                celdaPromedio.textContent = "-";
                return;
            }

            const nota = Number(valor);

            if (!Number.isFinite(nota) || nota < 0 || nota > 100) {
                celdaPromedio.textContent = "-";
                return;
            }

            promedio += nota * (criterios[i].porcentaje / 100);
        }

        promedio = Number(promedio.toFixed(2));

        celdaPromedio.textContent = promedio.toFixed(1);

        if (promedio >= 85) {
            celdaPromedio.classList.add("nota-alta");
        } else if (promedio >= 70) {
            celdaPromedio.classList.add("nota-media");
        } else {
            celdaPromedio.classList.add("nota-baja");
        }
    }

    // ========================================================
    // RECALCULAR TODAS LAS NOTAS
    // ========================================================

    function recalcularTodasLasNotas() {
        const filas = DOM.tablaNotas.querySelectorAll("tbody tr");

        filas.forEach(fila => calcularPromedioFila(fila));
    }

    // ========================================================
    // AGREGAR CRITERIO
    // ========================================================

    function agregarCriterio(evento) {
        evento.preventDefault();

        const nombre = DOM.nombreCriterio.value.trim();
        const porcentaje = Number(DOM.porcentajeCriterio.value);

        if (nombre === "") {
            mostrarAlerta(
                "Datos incompletos",
                "Debes ingresar el nombre del criterio.",
                "advertencia"
            );
            return;
        }

        if (
            !Number.isFinite(porcentaje) ||
            porcentaje <= 0 ||
            porcentaje > 100
        ) {
            mostrarAlerta(
                "Porcentaje inválido",
                "El porcentaje debe estar entre 1 y 100.",
                "advertencia"
            );
            return;
        }

        const criterios = obtenerCriterios();

        const nombreExiste = criterios.some(
            criterio =>
                criterio.nombre.toLowerCase() === nombre.toLowerCase()
        );

        if (nombreExiste) {
            mostrarAlerta(
                "Criterio duplicado",
                "Ya existe un criterio con ese nombre.",
                "advertencia"
            );
            return;
        }

        // Comprobar que exista una columna de nota disponible.
        const primeraFila = DOM.tablaNotas.querySelector("tbody tr");

        if (primeraFila) {
            const cantidadInputs =
                primeraFila.querySelectorAll(".grade-input").length;

            if (criterios.length >= cantidadInputs) {
                mostrarAlerta(
                    "Límite de criterios",
                    "No hay más columnas de calificación disponibles en la tabla.",
                    "advertencia"
                );
                return;
            }
        }

        const totalActual = criterios.reduce(
            (total, criterio) => total + criterio.porcentaje,
            0
        );

        if (totalActual + porcentaje > 100) {
            mostrarAlerta(
                "Porcentaje excedido",
                "La suma de los criterios no puede superar el 100%.",
                "error"
            );
            return;
        }

        const fila = document.createElement("tr");

        const celdaNombre = document.createElement("td");
        celdaNombre.textContent = nombre;

        const celdaPorcentaje = document.createElement("td");
        celdaPorcentaje.textContent = `${porcentaje}%`;

        const celdaAccion = document.createElement("td");

        const botonEliminar = document.createElement("button");
        botonEliminar.type = "button";
        botonEliminar.className = "btn-eliminar";
        botonEliminar.title = "Eliminar criterio";
        botonEliminar.innerHTML =
            '<i class="fa-solid fa-trash"></i>';

        celdaAccion.appendChild(botonEliminar);
        fila.append(celdaNombre, celdaPorcentaje, celdaAccion);

        DOM.tbodyCriterios.appendChild(fila);

        DOM.nombreCriterio.value = "";
        DOM.porcentajeCriterio.value = "";

        recalcularTotalPorcentaje();

        mostrarAlerta(
            "Criterio agregado",
            "El criterio se agregó correctamente.",
            "exito"
        );
    }

    // ========================================================
    // ELIMINAR CRITERIO
    // ========================================================

    function eliminarCriterio(evento) {
        const boton = evento.target.closest(".btn-eliminar");

        if (!boton) return;

        const fila = boton.closest("tr");

        if (!fila) return;

        const nombre = fila.cells[0].textContent.trim();

        fila.remove();

        recalcularTotalPorcentaje();

        mostrarAlerta(
            "Criterio eliminado",
            `Se eliminó el criterio: ${nombre}.`,
            "exito"
        );
    }

    // ========================================================
    // VALIDAR NOTAS
    // ========================================================

    function validarNota(input) {
        const valor = input.value.trim();

        input.classList.remove("nota-baja");

        if (valor === "") return;

        const nota = Number(valor);

        if (!Number.isFinite(nota) || nota < 0 || nota > 100) {
            input.classList.add("nota-baja");
            return;
        }

        if (nota < 70) {
            input.classList.add("nota-baja");
        }
    }

    // ========================================================
    // BUSCAR ESTUDIANTES
    // ========================================================

    function buscarEstudiantes() {
        if (!DOM.globalSearch) return;

        const busqueda = DOM.globalSearch.value
            .toLowerCase()
            .trim();

        const filas = DOM.tablaNotas.querySelectorAll("tbody tr");

        filas.forEach(fila => {
            const contenido = fila.textContent.toLowerCase();

            fila.style.display =
                contenido.includes(busqueda) ? "" : "none";
        });
    }

    // ========================================================
    // OBTENER DATOS DE LA PLANILLA
    // ========================================================

    function obtenerDatosPlanilla() {
        const criterios = obtenerCriterios();

        const filas = DOM.tablaNotas.querySelectorAll("tbody tr");

        const estudiantes = Array.from(filas).map(fila => {
            const celdas = fila.querySelectorAll("td");

            const notas = Array.from(
                fila.querySelectorAll(".grade-input")
            ).map(input => input.value);

            const promedio = fila.querySelector(".promedio-final");

            return {
                estudiante: celdas[0]
                    ? celdas[0].textContent.trim()
                    : "",
                notas,
                promedio: promedio
                    ? promedio.textContent.trim()
                    : "-"
            };
        });

        return {
            codigoCurso,
            nombreCurso,
            criterios,
            estudiantes,
            fecha: new Date().toISOString()
        };
    }

    // ========================================================
    // GUARDAR BORRADOR
    // ========================================================

    function guardarBorrador() {
        try {
            const datos = obtenerDatosPlanilla();

            localStorage.setItem(
                CLAVE_BORRADOR,
                JSON.stringify(datos)
            );

            mostrarAlerta(
                "Borrador guardado",
                "La información se guardó en este navegador.",
                "exito"
            );
        } catch (error) {
            console.error("Error al guardar:", error);

            mostrarAlerta(
                "Error al guardar",
                "No fue posible guardar el borrador en el navegador.",
                "error"
            );
        }
    }

    // ========================================================
    // CARGAR BORRADOR
    // ========================================================

    function cargarBorrador() {
        try {
            const contenido = localStorage.getItem(CLAVE_BORRADOR);

            if (!contenido) return;

            const datos = JSON.parse(contenido);

            if (!datos || !Array.isArray(datos.criterios)) return;

            DOM.tbodyCriterios.innerHTML = "";

            datos.criterios.forEach(criterio => {
                const fila = document.createElement("tr");

                const nombre = document.createElement("td");
                nombre.textContent = criterio.nombre;

                const porcentaje = document.createElement("td");
                porcentaje.textContent = `${criterio.porcentaje}%`;

                const accion = document.createElement("td");

                const boton = document.createElement("button");
                boton.type = "button";
                boton.className = "btn-eliminar";
                boton.title = "Eliminar criterio";
                boton.innerHTML =
                    '<i class="fa-solid fa-trash"></i>';

                accion.appendChild(boton);
                fila.append(nombre, porcentaje, accion);

                DOM.tbodyCriterios.appendChild(fila);
            });

            const filas = DOM.tablaNotas.querySelectorAll("tbody tr");

            filas.forEach((fila, indice) => {
                const estudiante = datos.estudiantes
                    ? datos.estudiantes[indice]
                    : null;

                if (!estudiante || !Array.isArray(estudiante.notas)) return;

                const inputs = fila.querySelectorAll(".grade-input");

                inputs.forEach((input, posicion) => {
                    input.value = estudiante.notas[posicion] ?? "";
                });
            });

        } catch (error) {
            console.error("No se pudo recuperar el borrador:", error);
        }
    }

    // ========================================================
    // EXPORTAR A CSV
    // ========================================================

    function exportarPlanilla() {
        const datos = obtenerDatosPlanilla();

        const encabezados = [
            "Estudiante",
            ...datos.criterios.map(criterio =>
                `${criterio.nombre} (${criterio.porcentaje}%)`
            ),
            "Promedio final"
        ];

        const filas = [encabezados];

        datos.estudiantes.forEach(estudiante => {
            filas.push([
                estudiante.estudiante,
                ...estudiante.notas,
                estudiante.promedio
            ]);
        });

        const contenido = filas
            .map(fila =>
                fila.map(valor =>
                    `"${String(valor).replace(/"/g, '""')}"`
                ).join(";")
            )
            .join("\n");

        const archivo = new Blob(
            ["\uFEFF" + contenido],
            { type: "text/csv;charset=utf-8;" }
        );

        const url = URL.createObjectURL(archivo);

        const enlace = document.createElement("a");
        enlace.href = url;
        enlace.download = `Planilla_${codigoCurso}.csv`;

        document.body.appendChild(enlace);
        enlace.click();
        enlace.remove();

        URL.revokeObjectURL(url);

        mostrarAlerta(
            "Exportación completada",
            "La planilla se descargó en formato CSV, compatible con Excel.",
            "exito"
        );
    }

    // ========================================================
    // VALIDAR Y ENVIAR A COORDINACIÓN
    // ========================================================

    function enviarCoordinacion() {
        const total = recalcularTotalPorcentaje();

        if (total !== 100) {
            mostrarAlerta(
                "No se puede enviar",
                "La suma de los criterios debe ser exactamente 100%.",
                "advertencia"
            );
            return;
        }

        const filas = DOM.tablaNotas.querySelectorAll("tbody tr");

        for (const fila of filas) {
            const inputs = fila.querySelectorAll(".grade-input");

            for (const input of inputs) {
                const valor = input.value.trim();
                const nota = Number(valor);

                if (
                    valor === "" ||
                    !Number.isFinite(nota) ||
                    nota < 0 ||
                    nota > 100
                ) {
                    mostrarAlerta(
                        "Planilla incompleta",
                        "Revisa que todas las notas estén registradas y sean válidas.",
                        "advertencia"
                    );
                    return;
                }
            }
        }

        mostrarAlerta(
            "Planilla validada",
            "La planilla cumple las condiciones. El envío real a Coordinación requiere conectar el backend.",
            "exito"
        );
    }

    // ========================================================
    // EVENTOS
    // ========================================================

    function configurarEventos() {

        if (DOM.formCriterio) {
            DOM.formCriterio.addEventListener("submit", agregarCriterio);
        }

        DOM.tbodyCriterios.addEventListener(
            "click",
            eliminarCriterio
        );

        DOM.tablaNotas.addEventListener("input", evento => {
            if (!evento.target.classList.contains("grade-input")) return;

            validarNota(evento.target);
            calcularPromedioFila(evento.target.closest("tr"));
        });

        if (DOM.globalSearch) {
            DOM.globalSearch.addEventListener("input", buscarEstudiantes);
        }

        if (DOM.btnGuardarBorrador) {
            DOM.btnGuardarBorrador.addEventListener(
                "click",
                guardarBorrador
            );
        }

        if (DOM.btnExportar) {
            DOM.btnExportar.addEventListener(
                "click",
                exportarPlanilla
            );
        }

        if (DOM.btnEnviar) {
            DOM.btnEnviar.addEventListener(
                "click",
                enviarCoordinacion
            );
        }

        if (DOM.cerrarAlerta) {
            DOM.cerrarAlerta.addEventListener(
                "click",
                cerrarAlerta
            );
        }

        const btnNotificaciones =
            document.querySelector('[data-accion="notificaciones"]');

        if (btnNotificaciones) {
            btnNotificaciones.addEventListener("click", () => {
                mostrarAlerta(
                    "Notificaciones",
                    "Tienes 2 notificaciones del sistema docente.",
                    "exito"
                );
            });
        }

        const btnConfiguracion =
            document.querySelector('[data-accion="configuracion"]');

        if (btnConfiguracion) {
            btnConfiguracion.addEventListener("click", () => {
                mostrarAlerta(
                    "Configuración",
                    "Las opciones generales están disponibles desde el portal.",
                    "exito"
                );
            });
        }

        if (DOM.btnCerrarSesion) {
            DOM.btnCerrarSesion.addEventListener("click", evento => {
                evento.preventDefault();

                if (typeof window.cerrarSesion === "function") {
                    window.cerrarSesion();
                } else {
                    sessionStorage.removeItem("rolUsuario");
                    window.location.href = "../../html/registro.html";
                }
            });
        }
    }

    // ========================================================
    // API DEL MÓDULO
    // ========================================================

    return {
        init,
        recalcularTotalPorcentaje,
        guardarBorrador,
        exportarPlanilla
    };

})();