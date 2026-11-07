/**
 * ============================================================
 * SISTEMA DE GESTIÓN ACADÉMICA
 * Portal Docente
 *
 * Módulo: Calificaciones y Criterios
 * Archivo: calycriterios.js
 * ============================================================
 */

document.addEventListener("DOMContentLoaded", () => {
    CalificacionesModulo.init();
});

const CalificacionesModulo = (() => {

    // ========================================================
    // REFERENCIAS DEL HTML
    // ========================================================

    const DOM = {
        tablaNotas: document.getElementById("tablaNotas"),
        globalSearch: document.getElementById("globalSearch"),
        criteriaList: document.getElementById("criteriaList"),
        totalPercent: document.getElementById("totalPercent"),
        btnCerrarSesion: document.getElementById("btnCerrarSesion")
    };

    const parametros = new URLSearchParams(window.location.search);

    const codigoCurso = parametros.get("codigo") || "MAT-201";
    const nombreCurso = parametros.get("curso") || "Cálculo Diferencial";

    const CLAVE_BORRADOR = `sga_calificaciones_${codigoCurso}`;

    // ========================================================
    // INICIALIZACIÓN
    // ========================================================

    function init() {
        if (!DOM.tablaNotas || !DOM.criteriaList) {
            console.error(
                "No se encontraron los elementos principales de Calificaciones y Criterios."
            );
            return;
        }

        cargarBorrador();
        configurarEventos();
        actualizarEncabezados();
        recalcularCriterios();
    }

    // ========================================================
    // CONVERTIR NOTAS
    // ========================================================

    function parseGrade(valor) {
        if (valor === null || valor === undefined) {
            return null;
        }

        const texto = String(valor).trim();

        if (texto === "" || texto === "-") {
            return null;
        }

        const numero = Number(texto.replace(",", "."));

        if (!Number.isFinite(numero)) {
            return null;
        }

        return numero;
    }

    // ========================================================
    // FORMATEAR NOTAS
    // ========================================================

    function formatGrade(numero) {
        if (numero === null) return "-";

        return numero.toFixed(2);
    }

    // ========================================================
    // OBTENER CRITERIOS
    // ========================================================

    function obtenerCriterios() {
        const cajas = DOM.criteriaList.querySelectorAll(".criterion-box");

        return Array.from(cajas).map(caja => {
            const nombre = caja.querySelector(".crit-name");
            const peso = caja.querySelector(".crit-weight");

            return {
                nombre: nombre ? nombre.value.trim() : "",
                peso: peso ? Number(peso.value) || 0 : 0
            };
        });
    }

    // ========================================================
    // OBTENER PESOS
    // ========================================================

    function obtenerPesos() {
        return obtenerCriterios().map(criterio => criterio.peso / 100);
    }

    // ========================================================
    // ACTUALIZAR ENCABEZADOS DE LA TABLA
    // ========================================================

    function actualizarEncabezados() {
        const encabezado = DOM.tablaNotas.querySelector("thead tr");

        if (!encabezado) return;

        const criterios = obtenerCriterios();

        const columnas = Array.from(encabezado.children);

        criterios.forEach((criterio, indice) => {
            const columna = columnas[indice + 1];

            if (!columna) return;

            const nombre = columna.querySelector(".nombre-criterio");

            const peso = columna.querySelector(".peso-criterio");

            if (nombre) {
                nombre.textContent = criterio.nombre || `Criterio ${indice + 1}`;
            }

            if (peso) {
                peso.textContent = `${criterio.peso}%`;
            }
        });
    }

    // ========================================================
    // CALCULAR UNA FILA
    // ========================================================

    function calcularFila(input) {
        const fila = input.closest("tr");

        if (!fila) return;

        const inputs = Array.from(
            fila.querySelectorAll(".grade-input")
        );

        const celdaFinal = fila.querySelector(".final-grade");

        if (!celdaFinal) return;

        const criterios = obtenerCriterios();

        const pesos = obtenerPesos();

        // Validar notas y aplicar indicador visual.

        inputs.forEach(campo => {
            const nota = parseGrade(campo.value);

            campo.classList.remove("danger-border");

            if (nota !== null && (nota < 0 || nota > 5)) {
                campo.classList.add("danger-border");
            } else if (nota !== null && nota < 3) {
                campo.classList.add("danger-border");
            }
        });

        celdaFinal.classList.add("text-muted");

        if (
            criterios.length === 0 ||
            inputs.length !== criterios.length
        ) {
            celdaFinal.textContent = "-";
            return;
        }

        const totalPesos = criterios.reduce(
            (total, criterio) => total + criterio.peso,
            0
        );

        if (Number(totalPesos.toFixed(2)) !== 100) {
            celdaFinal.textContent = "-";
            return;
        }

        let promedio = 0;

        for (let i = 0; i < inputs.length; i++) {
            const nota = parseGrade(inputs[i].value);

            if (
                nota === null ||
                nota < 0 ||
                nota > 5
            ) {
                celdaFinal.textContent = "-";
                return;
            }

            promedio += nota * pesos[i];
        }

        promedio = Number(promedio.toFixed(2));

        celdaFinal.textContent = formatGrade(promedio);
        celdaFinal.classList.remove("text-muted");

        celdaFinal.classList.remove(
            "nota-alta",
            "nota-media",
            "nota-baja"
        );

        if (promedio >= 4.0) {
            celdaFinal.classList.add("nota-alta");
        } else if (promedio >= 3.0) {
            celdaFinal.classList.add("nota-media");
        } else {
            celdaFinal.classList.add("nota-baja");
        }
    }

    // ========================================================
    // RECALCULAR TODAS LAS FILAS
    // ========================================================

    function recalcularTodasLasNotas() {
        const filas = DOM.tablaNotas.querySelectorAll("tbody tr");

        filas.forEach(fila => {
            const primerInput = fila.querySelector(".grade-input");

            if (primerInput) {
                calcularFila(primerInput);
            }
        });
    }

    // ========================================================
    // RECALCULAR PORCENTAJES
    // ========================================================

    function recalcularCriterios() {
        const criterios = obtenerCriterios();

        const total = criterios.reduce(
            (acumulado, criterio) => acumulado + criterio.peso,
            0
        );

        const totalRedondeado = Number(total.toFixed(2));

        if (DOM.totalPercent) {
            DOM.totalPercent.textContent = `${totalRedondeado}%`;

            DOM.totalPercent.style.color =
                totalRedondeado === 100
                    ? "#0b1a30"
                    : "#d32f2f";
        }

        actualizarEncabezados();
        recalcularTodasLasNotas();

        return totalRedondeado;
    }

    // ========================================================
    // AGREGAR COLUMNA A LA TABLA
    // ========================================================

    function agregarColumnaTabla(nombre) {
        const encabezado = DOM.tablaNotas.querySelector("thead tr");

        if (!encabezado) return false;

        const encabezadoFinal = encabezado.lastElementChild;

        const nuevaColumna = document.createElement("th");

        const nombreCriterio = document.createElement("span");
        nombreCriterio.className = "nombre-criterio";
        nombreCriterio.textContent = nombre;

        const pesoCriterio = document.createElement("span");
        pesoCriterio.className = "peso-criterio";
        pesoCriterio.textContent = "0%";

        nuevaColumna.append(nombreCriterio, pesoCriterio);

        encabezado.insertBefore(nuevaColumna, encabezadoFinal);

        const filas = DOM.tablaNotas.querySelectorAll("tbody tr");

        filas.forEach(fila => {
            const celdaFinal = fila.querySelector(".final-grade");

            if (!celdaFinal) return;

            const nuevaCelda = document.createElement("td");

            const input = document.createElement("input");

            input.type = "number";
            input.className = "grade-input";
            input.min = "0";
            input.max = "5";
            input.step = "0.01";
            input.placeholder = "0.0";

            nuevaCelda.appendChild(input);

            fila.insertBefore(nuevaCelda, celdaFinal);
        });

        return true;
    }

    // ========================================================
    // CREAR CAJA DE CRITERIO
    // ========================================================

    function crearCajaCriterio(nombre = "", peso = 0) {
        const caja = document.createElement("div");

        caja.className = "criterion-box";

        const grupoNombre = document.createElement("div");
        grupoNombre.className = "input-group";

        const etiquetaNombre = document.createElement("label");
        etiquetaNombre.textContent = "Nombre del parámetro";

        const inputNombre = document.createElement("input");
        inputNombre.type = "text";
        inputNombre.className = "crit-name";
        inputNombre.placeholder = "Nombre del criterio";
        inputNombre.value = nombre;

        grupoNombre.append(etiquetaNombre, inputNombre);

        const grupoPeso = document.createElement("div");
        grupoPeso.className = "input-group weight-group";

        const etiquetaPeso = document.createElement("label");
        etiquetaPeso.textContent = "Peso (%)";

        const inputPeso = document.createElement("input");
        inputPeso.type = "number";
        inputPeso.className = "crit-weight";
        inputPeso.min = "0";
        inputPeso.max = "100";
        inputPeso.step = "0.01";
        inputPeso.value = peso;

        grupoPeso.append(etiquetaPeso, inputPeso);

        caja.append(grupoNombre, grupoPeso);

        return caja;
    }

    // ========================================================
    // AGREGAR PARÁMETRO
    // ========================================================

    function agregarParametro() {
        const criterios = obtenerCriterios();

        const primeraFila = DOM.tablaNotas.querySelector("tbody tr");

        if (primeraFila) {
            const cantidadInputs =
                primeraFila.querySelectorAll(".grade-input").length;

            if (criterios.length >= cantidadInputs) {
                mostrarMensaje(
                    "No hay más columnas de notas disponibles. No se puede agregar otro criterio."
                );
                return;
            }
        }

        const nombre = `Nuevo criterio ${criterios.length + 1}`;

        const caja = crearCajaCriterio(nombre, 0);

        DOM.criteriaList.appendChild(caja);

        if (!agregarColumnaTabla(nombre)) {
            caja.remove();

            mostrarMensaje(
                "No se pudo agregar la columna porque no se encontró el encabezado de la tabla."
            );

            return;
        }

        recalcularCriterios();
    }

    // ========================================================
    // VALIDAR PESOS
    // ========================================================

    function validarPeso(input) {
        const valor = Number(input.value);

        if (
            input.value.trim() === "" ||
            !Number.isFinite(valor) ||
            valor < 0 ||
            valor > 100
        ) {
            input.setCustomValidity(
                "El porcentaje debe estar entre 0 y 100."
            );
            input.reportValidity();
            input.classList.add("danger-border");
            return false;
        }

        input.setCustomValidity("");
        input.classList.remove("danger-border");

        return true;
    }

    // ========================================================
    // BUSCAR ESTUDIANTES
    // ========================================================

    function filtrarTablaEstudiantes() {
        if (!DOM.globalSearch) return;

        const consulta = DOM.globalSearch.value
            .toLowerCase()
            .trim();

        const filas = DOM.tablaNotas.querySelectorAll("tbody tr");

        filas.forEach(fila => {
            const contenido = fila.textContent.toLowerCase();

            fila.style.display =
                contenido.includes(consulta) ? "" : "none";
        });
    }

    // ========================================================
    // OBTENER INFORMACIÓN DE LA PLANILLA
    // ========================================================

    function obtenerDatosPlanilla() {
        const criterios = obtenerCriterios();

        const filas = DOM.tablaNotas.querySelectorAll("tbody tr");

        const estudiantes = Array.from(filas).map(fila => {
            const celdas = fila.querySelectorAll("td");

            const notas = Array.from(
                fila.querySelectorAll(".grade-input")
            ).map(input => input.value);

            const promedio = fila.querySelector(".final-grade");

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

            mostrarMensaje(
                "Borrador guardado correctamente en este navegador."
            );

        } catch (error) {
            console.error("Error al guardar el borrador:", error);

            mostrarMensaje(
                "No fue posible guardar la información."
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

            if (
                !datos ||
                !Array.isArray(datos.criterios) ||
                !Array.isArray(datos.estudiantes)
            ) {
                return;
            }

            const cajas = DOM.criteriaList.querySelectorAll(".criterion-box");

            // Recuperar nombres y pesos si coincide la cantidad de criterios.
            if (cajas.length === datos.criterios.length) {
                cajas.forEach((caja, indice) => {
                    const criterio = datos.criterios[indice];

                    const nombre = caja.querySelector(".crit-name");
                    const peso = caja.querySelector(".crit-weight");

                    if (nombre) nombre.value = criterio.nombre;
                    if (peso) peso.value = criterio.peso;
                });
            }

            // Recuperar notas de cada estudiante.
            const filas = DOM.tablaNotas.querySelectorAll("tbody tr");

            filas.forEach((fila, indice) => {
                const estudiante = datos.estudiantes[indice];

                if (!estudiante || !Array.isArray(estudiante.notas)) return;

                const inputs = fila.querySelectorAll(".grade-input");

                inputs.forEach((input, posicion) => {
                    input.value = estudiante.notas[posicion] ?? "";
                });
            });

        } catch (error) {
            console.error("Error al cargar el borrador:", error);
        }
    }

    // ========================================================
    // EXPORTAR PLANILLA
    // ========================================================

    function exportarPlanilla() {
        const datos = obtenerDatosPlanilla();

        const encabezados = [
            "Estudiante",
            ...datos.criterios.map(criterio =>
                `${criterio.nombre} (${criterio.peso}%)`
            ),
            "Nota final"
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
        enlace.download = `Calificaciones_${codigoCurso}.csv`;

        document.body.appendChild(enlace);
        enlace.click();
        enlace.remove();

        URL.revokeObjectURL(url);

        mostrarMensaje(
            "La planilla se exportó correctamente en formato CSV."
        );
    }

    // ========================================================
    // VALIDAR Y ENVIAR A COORDINACIÓN
    // ========================================================

    function enviarCoordinacion() {
        const total = recalcularCriterios();

        if (total !== 100) {
            mostrarMensaje(
                "La suma de los porcentajes debe ser exactamente 100%."
            );
            return;
        }

        const filas = DOM.tablaNotas.querySelectorAll("tbody tr");

        for (const fila of filas) {
            const inputs = fila.querySelectorAll(".grade-input");

            for (const input of inputs) {
                const nota = parseGrade(input.value);

                if (nota === null || nota < 0 || nota > 5) {
                    mostrarMensaje(
                        "Hay notas vacías o inválidas. Revisa la planilla antes de continuar."
                    );
                    return;
                }
            }
        }

        mostrarMensaje(
            "La planilla fue validada. El envío real a Coordinación requiere conexión con el backend."
        );
    }

    // ========================================================
    // MENSAJES
    // ========================================================

    function mostrarMensaje(mensaje) {
        alert(mensaje);
    }

    // ========================================================
    // CERRAR SESIÓN
    // ========================================================

    function cerrarSesion(evento) {
        evento.preventDefault();

        if (typeof window.cerrarSesion === "function") {
            window.cerrarSesion();
        } else {
            sessionStorage.removeItem("rolUsuario");
            window.location.href = "../../html/registro.html";
        }
    }

    // ========================================================
    // EVENTOS
    // ========================================================

    function configurarEventos() {

        // Cambios en los pesos de los criterios.
        DOM.criteriaList.addEventListener("input", evento => {
            if (evento.target.classList.contains("crit-weight")) {
                validarPeso(evento.target);
                recalcularCriterios();
            }

            if (evento.target.classList.contains("crit-name")) {
                actualizarEncabezados();
            }
        });

        // Cambios en las notas.
        DOM.tablaNotas.addEventListener("input", evento => {
            if (!evento.target.classList.contains("grade-input")) return;

            const nota = parseGrade(evento.target.value);

            if (
                nota !== null &&
                (nota < 0 || nota > 5)
            ) {
                evento.target.classList.add("danger-border");
            } else {
                evento.target.classList.remove("danger-border");
            }

            calcularFila(evento.target);
        });

        // Búsqueda.
        if (DOM.globalSearch) {
            DOM.globalSearch.addEventListener(
                "input",
                filtrarTablaEstudiantes
            );
        }

        // Cierre de sesión.
        if (DOM.btnCerrarSesion) {
            DOM.btnCerrarSesion.addEventListener(
                "click",
                cerrarSesion
            );
        }

        // Botones que utilizan identificadores o clases.
        const btnGuardar = document.getElementById("btnGuardarBorrador");
        const btnExportar = document.getElementById("btnExportar");
        const btnEnviar = document.getElementById("btnEnviar");

        if (btnGuardar) {
            btnGuardar.addEventListener("click", guardarBorrador);
        }

        if (btnExportar) {
            btnExportar.addEventListener("click", exportarPlanilla);
        }

        if (btnEnviar) {
            btnEnviar.addEventListener("click", enviarCoordinacion);
        }
    }

    // ========================================================
    // API DEL MÓDULO
    // ========================================================

    return {
        init,
        calcularFila,
        recalcularCriterios,
        agregarParametro,
        filtrarTablaEstudiantes,
        guardarBorrador,
        exportarPlanilla,
        enviarCoordinacion
    };

})();

// ============================================================
// FUNCIONES GLOBALES DE COMPATIBILIDAD
// ============================================================
// Se conservan por si el HTML utiliza onclick="..." o
// oninput="..." directamente en sus elementos.

window.calcularFila = input => CalificacionesModulo.calcularFila(input);

window.recalcularCriterios = () =>
    CalificacionesModulo.recalcularCriterios();

window.agregarParametro = () =>
    CalificacionesModulo.agregarParametro();

window.filtrarTablaEstudiantes = () =>
    CalificacionesModulo.filtrarTablaEstudiantes();

window.guardarBorrador = () =>
    CalificacionesModulo.guardarBorrador();

window.exportarPlanilla = () =>
    CalificacionesModulo.exportarPlanilla();

window.enviarCoordinacion = () =>
    CalificacionesModulo.enviarCoordinacion();