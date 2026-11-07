async function cargarGrupos() {
  const grupos = await api("docente/mis_grupos.php");

  if (!grupos.length) {
    $("tablaGrupos").innerHTML = `<tr><td colspan="6">No tienes grupos asignados</td></tr>`;
    return;
  }

  $("tablaGrupos").innerHTML = grupos.map(g => `
    <tr>
      <td>${esc(g.codigo)}</td>
      <td>${esc(g.materia)}</td>
      <td>${esc(g.codigo_grupo)}</td>
      <td>${esc(g.periodo)}</td>
      <td>${g.inscritos} / ${g.cupo}</td>
      <td><button onclick="verEstudiantes(${g.id_grupo}, '${esc(g.materia)} - ${esc(g.codigo_grupo)}')">Ver estudiantes</button></td>
    </tr>`).join("");
}

async function verEstudiantes(idGrupo, titulo) {
  const est = await api("docente/estudiantes_grupo.php?id_grupo=" + idGrupo);
  $("tituloGrupo").textContent = "Estudiantes de " + titulo;

  if (!est.length) {
    $("tablaEstudiantes").innerHTML = `<tr><td colspan="5">Este grupo no tiene estudiantes</td></tr>`;
    return;
  }

  $("tablaEstudiantes").innerHTML = est.map(e => `
    <tr>
      <td>${esc(e.codigo_estudiantil)}</td>
      <td>${esc(e.nombre)}</td>
      <td>${esc(e.correo)}</td>
      <td>${esc(e.programa)} (sem. ${esc(e.semestre)})</td>
      <td>${esc(e.estado)}</td>
    </tr>`).join("");
}

cargarGrupos();

document.addEventListener("DOMContentLoaded", () => {
    GruposModulo.init();
});

const GruposModulo = (() => {

    // ========================================================
    // DATOS DE LOS GRUPOS
    // ========================================================

    const cursos = [
        {
            codigo: "MAT-201",
            nombre: "Cálculo Diferencial",
            grupo: "Grupo 02",
            semestre: "Semestre 2",
            jornada: "Mañana",
            estudiantes: 32,
            horario: "Lun y Mié 08:00 - 10:00",
            aula: "Aula 302 • Edificio B (Campus Central)",
            icono: "fa-sigma",
            estado: "progress",
            avance: 60,
            estadoTexto: "Calificaciones al 60%"
        },
        {
            codigo: "MAT-102",
            nombre: "Álgebra Lineal",
            grupo: "Grupo 01",
            semestre: "Semestre 1",
            jornada: "Mañana",
            estudiantes: 35,
            horario: "Mar y Jue 10:00 - 12:00",
            aula: "Aula 104 • Pabellón A",
            icono: "fa-table-cells",
            estado: "warning",
            estadoTexto: "Planilla sin enviar"
        },
        {
            codigo: "MAT-305",
            nombre: "Métodos Numéricos",
            grupo: "Grupo 03",
            semestre: "Semestre 4",
            jornada: "Tarde",
            estudiantes: 28,
            horario: "Viernes 14:00 - 18:00",
            aula: "Laboratorio C-2 • Centro de Cómputo",
            icono: "fa-laptop-code",
            estado: "success",
            avance: 100,
            estadoTexto: "Actas listas para envío"
        },
        {
            codigo: "MAT-204",
            nombre: "Ecuaciones Diferenciales",
            grupo: "Grupo 01",
            semestre: "Semestre 3",
            jornada: "Tarde",
            estudiantes: 33,
            horario: "Lun y Mié 14:00 - 16:00",
            aula: "Aula 201 • Facultad de Ingeniería",
            icono: "fa-square-root-variable",
            estado: "neutral",
            avance: 80,
            estadoTexto: "Al día"
        }
    ];

    // ========================================================
    // REFERENCIAS DEL HTML
    // ========================================================

    const DOM = {
        courseGrid: document.getElementById("courseGrid"),
        courseSearch: document.getElementById("courseSearch"),
        globalSearch: document.getElementById("globalSearchInput"),
        semestreFilter: document.getElementById("semestreFilter"),
        jornadaFilter: document.getElementById("jornadaFilter"),
        visibleCount: document.getElementById("visibleCount"),
        totalGrupos: document.getElementById("totalGrupos"),
        totalEstudiantes: document.getElementById("totalEstudiantes"),
        syncBtn: document.getElementById("syncBtn"),
        btnSemestre: document.getElementById("btnSemestre"),
        btnAyuda: document.getElementById("btnAyuda"),
        btnNotificaciones: document.getElementById("btnNotificaciones"),
        btnPerfil: document.getElementById("btnPerfil"),
        btnGuia: document.getElementById("btnGuia"),
        btnSoporte: document.getElementById("btnSoporte"),
        btnCerrarSesion: document.getElementById("btnCerrarSesion"),
        actionModal: document.getElementById("actionModal"),
        modalTitle: document.getElementById("modalTitle"),
        modalBody: document.getElementById("modalBody"),
        modalConfirmBtn: document.getElementById("modalConfirmBtn"),
        btnCerrarModal: document.getElementById("btnCerrarModal"),
        btnCancelarModal: document.getElementById("btnCancelarModal"),
        toastContainer: document.getElementById("toastContainer")
    };

    const estado = {
        modalCallback: null
    };

    // ========================================================
    // INICIALIZACIÓN
    // ========================================================

    function init() {
        actualizarEstadisticas();
        renderCursos(cursos);
        configurarEventos();
    }

    // ========================================================
    // ESTADÍSTICAS
    // ========================================================

    function actualizarEstadisticas() {
        const total = cursos.length;

        const estudiantes = cursos.reduce(
            (acumulado, curso) => acumulado + curso.estudiantes,
            0
        );

        if (DOM.totalGrupos) {
            DOM.totalGrupos.textContent = String(total).padStart(2, "0");
        }

        if (DOM.totalEstudiantes) {
            DOM.totalEstudiantes.textContent = estudiantes;
        }
    }

    // ========================================================
    // RENDERIZAR CURSOS
    // ========================================================

    function renderCursos(listaCursos) {
        if (!DOM.courseGrid) return;

        DOM.courseGrid.innerHTML = "";

        if (DOM.visibleCount) {
            DOM.visibleCount.textContent = listaCursos.length;
        }

        if (listaCursos.length === 0) {
            DOM.courseGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-folder-open"></i>
                    <p>No se encontraron asignaturas que coincidan con los filtros.</p>
                </div>
            `;
            return;
        }

        const fragment = document.createDocumentFragment();

        listaCursos.forEach(curso => {
            const card = document.createElement("article");
            card.className = "course-card";

            card.innerHTML = `
                <div>
                    <div class="card-header">
                        <div>
                            <span class="course-code-tag">${curso.codigo}</span>
                            <span class="semester-tag">${curso.semestre}</span>
                        </div>

                        <i class="fa-solid ${curso.icono} course-icon"></i>
                    </div>

                    <h3 class="course-title">${curso.nombre}</h3>

                    <div class="group-name">${curso.grupo}</div>

                    <div class="course-details">
                        <div class="detail-item">
                            <i class="fa-solid fa-users"></i>
                            <strong>${curso.estudiantes}</strong>
                            Estudiantes
                        </div>

                        <div class="detail-item">
                            <i class="fa-regular fa-clock"></i>
                            ${curso.horario}
                        </div>

                        <div class="detail-item">
                            <i class="fa-solid fa-location-dot"></i>
                            ${curso.aula}
                        </div>
                    </div>

                    ${crearEstado(curso)}
                </div>

                <div class="card-actions">
                    ${crearAcciones(curso)}
                </div>
            `;

            fragment.appendChild(card);
        });

        DOM.courseGrid.appendChild(fragment);
    }

    // ========================================================
    // ESTADO DE CADA CURSO
    // ========================================================

    function crearEstado(curso) {
        if (curso.estado === "progress") {
            return `
                <div class="status-box progress">
                    <div class="status-heading">
                        <span>${curso.estadoTexto}</span>
                        <span>${curso.avance}%</span>
                    </div>

                    <div class="progress-bar-container">
                        <div class="progress-bar-fill"
                             style="width:${curso.avance}%"></div>
                    </div>
                </div>
            `;
        }

        if (curso.estado === "warning") {
            return `
                <div class="status-box warning">
                    <div class="status-heading">
                        <span>
                            <i class="fa-solid fa-file-circle-exclamation"></i>
                            <strong>${curso.estadoTexto}</strong>
                        </span>
                        <span>Pendiente</span>
                    </div>

                    <p>
                        Tiene notas guardadas en borrador pendientes de publicar.
                    </p>
                </div>
            `;
        }

        if (curso.estado === "success") {
            return `
                <div class="status-box success">
                    <div class="status-heading">
                        <span>
                            <i class="fa-regular fa-circle-check"></i>
                            ${curso.estadoTexto}
                        </span>
                        <span>100% Evaluado</span>
                    </div>

                    <p>
                        Cierre consolidado. Puede generar el reporte final.
                    </p>
                </div>
            `;
        }

        if (curso.estado === "neutral") {
            return `
                <div class="status-box neutral">
                    <div class="status-heading">
                        <span>● ${curso.estadoTexto}</span>
                        <span>Sin pendientes inmediatos</span>
                    </div>

                    <div class="progress-bar-container">
                        <div class="progress-bar-fill"
                             style="width:${curso.avance}%"></div>
                    </div>
                </div>
            `;
        }

        return "";
    }

    // ========================================================
    // BOTONES DE LAS TARJETAS
    // ========================================================

    function crearAcciones(curso) {
        const datos = `
            data-code="${curso.codigo}"
            data-title="${curso.nombre}"
        `;

        if (curso.codigo === "MAT-102") {
            return `
                <button class="btn btn-navy btn-action-grades" ${datos}>
                    <i class="fa-solid fa-pen-to-square"></i>
                    Ingresar calificaciones
                </button>
            `;
        }

        if (curso.codigo === "MAT-305") {
            return `
                <button class="btn btn-light btn-action-records" ${datos}>
                    <i class="fa-regular fa-file-pdf"></i>
                    Ver actas
                </button>
            `;
        }

        return `
            <button class="btn btn-light btn-action-criteria" ${datos}>
                Gestionar criterios
            </button>

            <button class="btn btn-navy btn-action-grades" ${datos}>
                <i class="fa-solid fa-pen-to-square"></i>
                Ingresar notas
            </button>
        `;
    }

    // ========================================================
    // FILTROS Y BÚSQUEDA
    // ========================================================

    function aplicarFiltros() {
        const texto = DOM.courseSearch
            ? DOM.courseSearch.value.toLowerCase().trim()
            : "";

        const semestre = DOM.semestreFilter
            ? DOM.semestreFilter.value
            : "";

        const jornada = DOM.jornadaFilter
            ? DOM.jornadaFilter.value
            : "";

        const filtrados = cursos.filter(curso => {
            const coincideTexto =
                curso.codigo.toLowerCase().includes(texto) ||
                curso.nombre.toLowerCase().includes(texto);

            const coincideSemestre =
                semestre === "" || curso.semestre === semestre;

            const coincideJornada =
                jornada === "" || curso.jornada === jornada;

            return coincideTexto && coincideSemestre && coincideJornada;
        });

        renderCursos(filtrados);
    }

    // ========================================================
    // NAVEGACIÓN ENTRE MÓDULOS
    // ========================================================

    function navegarA(pagina, curso) {
        const parametros = new URLSearchParams({
            codigo: curso.codigo,
            curso: curso.nombre
        });

        window.location.href = `${pagina}?${parametros.toString()}`;
    }

    // ========================================================
    // MODAL
    // ========================================================

    function abrirModal(titulo, contenido, callback = null) {
        if (!DOM.actionModal || !DOM.modalTitle || !DOM.modalBody) return;

        DOM.modalTitle.textContent = titulo;
        DOM.modalBody.innerHTML = contenido;
        estado.modalCallback = callback;

        DOM.actionModal.classList.add("active");
    }

    function cerrarModal() {
        if (DOM.actionModal) {
            DOM.actionModal.classList.remove("active");
        }

        estado.modalCallback = null;
    }

    function confirmarModal() {
        if (typeof estado.modalCallback === "function") {
            estado.modalCallback();
        }

        cerrarModal();
    }

    // ========================================================
    // VER ACTAS
    // ========================================================

    function verActas(codigo, titulo) {
        abrirModal(
            `Acta oficial - ${titulo}`,
            `
                <p>
                    Vista previa del consolidado definitivo para
                    <strong>${codigo}</strong>.
                </p>

                <div class="acta-preview">
                    <i class="fa-solid fa-file-pdf fa-2x"></i>
                    <p>Acta_Final_${codigo}_2024-I.pdf</p>
                </div>
            `,
            () => {
                mostrarToast(
                    "La generación del PDF estará disponible al implementar el backend."
                );
            }
        );
    }

    // ========================================================
    // SINCRONIZAR
    // ========================================================

    function sincronizar() {
        if (!DOM.syncBtn) return;

        const textoOriginal = DOM.syncBtn.innerHTML;

        DOM.syncBtn.disabled = true;
        DOM.syncBtn.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Sincronizando...
        `;

        setTimeout(() => {
            DOM.syncBtn.disabled = false;
            DOM.syncBtn.innerHTML = textoOriginal;

            mostrarToast(
                "Vista actualizada. La sincronización con el servidor requiere backend."
            );
        }, 1000);
    }

    // ========================================================
    // CAMBIAR SEMESTRE
    // ========================================================

    function cambiarSemestre() {
        abrirModal(
            "Cambiar período académico",
            `
                <select id="semesterSelect" class="filter-select" style="width:100%">
                    <option value="2024-I">2024 - Primer semestre</option>
                    <option value="2023-II">2023 - Segundo semestre</option>
                </select>
            `,
            () => {
                const seleccionado = document.getElementById("semesterSelect");

                if (seleccionado) {
                    mostrarToast(
                        `Período seleccionado: ${seleccionado.value}. Los datos todavía son de demostración.`
                    );
                }
            }
        );
    }

    // ========================================================
    // SOPORTE
    // ========================================================

    function abrirSoporte() {
        abrirModal(
            "Soporte técnico",
            `
                <p>Escriba la descripción de su solicitud:</p>

                <textarea
                    id="supportMessage"
                    placeholder="Escriba su consulta aquí..."
                    style="width:100%;height:100px;padding:10px;"
                ></textarea>
            `,
            () => {
                const campo = document.getElementById("supportMessage");

                if (!campo || campo.value.trim() === "") {
                    mostrarToast("Debe escribir una consulta.");
                    return;
                }

                mostrarToast(
                    "La solicitud fue validada. El envío requiere conexión con el servidor."
                );
            }
        );
    }

    // ========================================================
    // NOTIFICACIONES Y MENSAJES
    // ========================================================

    function mostrarToast(mensaje) {
        if (!DOM.toastContainer) return;

        const toast = document.createElement("div");
        toast.className = "toast";

        const icono = document.createElement("i");
        icono.className = "fa-solid fa-circle-check";

        const texto = document.createElement("span");
        texto.textContent = mensaje;

        toast.append(icono, texto);
        DOM.toastContainer.appendChild(toast);

        setTimeout(() => toast.remove(), 3500);
    }

    // ========================================================
    // EVENTOS
    // ========================================================

    function configurarEventos() {

        if (DOM.courseSearch) {
            DOM.courseSearch.addEventListener("input", aplicarFiltros);
        }

        if (DOM.globalSearch) {
            DOM.globalSearch.addEventListener("input", () => {
                if (DOM.courseSearch) {
                    DOM.courseSearch.value = DOM.globalSearch.value;
                }

                aplicarFiltros();
            });
        }

        if (DOM.semestreFilter) {
            DOM.semestreFilter.addEventListener("change", aplicarFiltros);
        }

        if (DOM.jornadaFilter) {
            DOM.jornadaFilter.addEventListener("change", aplicarFiltros);
        }

        // Botones de las tarjetas
        if (DOM.courseGrid) {
            DOM.courseGrid.addEventListener("click", event => {
                const boton = event.target.closest("button[data-code]");

                if (!boton) return;

                const codigo = boton.dataset.code;
                const curso = cursos.find(item => item.codigo === codigo);

                if (!curso) return;

                if (boton.classList.contains("btn-action-grades")) {
                    navegarA("calycriterios.html", curso);
                } else if (boton.classList.contains("btn-action-criteria")) {
                    navegarA("configcriterios.html", curso);
                } else if (boton.classList.contains("btn-action-records")) {
                    verActas(curso.codigo, curso.nombre);
                }
            });
        }

        if (DOM.syncBtn) {
            DOM.syncBtn.addEventListener("click", sincronizar);
        }

        if (DOM.btnSemestre) {
            DOM.btnSemestre.addEventListener("click", cambiarSemestre);
        }

        if (DOM.btnAyuda) {
            DOM.btnAyuda.addEventListener("click", () => {
                mostrarToast("Centro de ayuda del Portal Docente.");
            });
        }

        if (DOM.btnNotificaciones) {
            DOM.btnNotificaciones.addEventListener("click", () => {
                mostrarToast("No hay nuevas notificaciones.");
            });
        }

        if (DOM.btnPerfil) {
            DOM.btnPerfil.addEventListener("click", () => {
                mostrarToast("Prof. Carlos Rivera - Ciencias Básicas.");
            });
        }

        if (DOM.btnGuia) {
            DOM.btnGuia.addEventListener("click", () => {
                mostrarToast("La guía rápida estará disponible próximamente.");
            });
        }

        if (DOM.btnSoporte) {
            DOM.btnSoporte.addEventListener("click", abrirSoporte);
        }

        // Los enlaces del menú conservan su href y navegan normalmente.

        if (DOM.modalConfirmBtn) {
            DOM.modalConfirmBtn.addEventListener("click", confirmarModal);
        }

        if (DOM.btnCerrarModal) {
            DOM.btnCerrarModal.addEventListener("click", cerrarModal);
        }

        if (DOM.btnCancelarModal) {
            DOM.btnCancelarModal.addEventListener("click", cerrarModal);
        }

        if (DOM.actionModal) {
            DOM.actionModal.addEventListener("click", event => {
                if (event.target === DOM.actionModal) {
                    cerrarModal();
                }
            });
        }

        document.addEventListener("keydown", event => {
            if (
                event.key === "Escape" &&
                DOM.actionModal &&
                DOM.actionModal.classList.contains("active")
            ) {
                cerrarModal();
            }
        });

        if (DOM.btnCerrarSesion) {
            DOM.btnCerrarSesion.addEventListener("click", event => {
                event.preventDefault();

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

    return { init };

})();