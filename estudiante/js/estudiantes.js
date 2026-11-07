const certificateBtn =
    document.getElementById("certificateBtn");


certificateBtn.addEventListener(
    "click",
    function () {

        alert(
            "El certificado se descargará próximamente."
        );

    }
);




const logoutBtn =
    document.getElementById("logoutBtn");


logoutBtn.addEventListener(
    "click",
    function () {

        const confirmar = confirm(
            "¿Deseas cerrar sesión?"
        );


        if (confirmar) {

            Auth.logout();

        }

    }
);




const notification =
    document.querySelector(".notification");


notification.addEventListener(
    "click",
    function () {

        alert(
            "No tienes nuevas notificaciones."
        );

    }
);




const navigationLinks =
    document.querySelectorAll(
        ".navigation a"
    );


navigationLinks.forEach(
    function (link) {

        link.addEventListener(
            "click",
            function (event) {

                event.preventDefault();


                navigationLinks.forEach(
                    function (item) {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                link.classList.add(
                    "active"
                );

            }
        );

    }
);




const avatar =
    document.querySelector(
        ".user-avatar"
    );


avatar.addEventListener(
    "click",
    function () {

        alert(
            "Perfil de Alejandro García Pérez"
        );

    }
);

async function cargarPanel() {
  const perfil = await api("estudiante/perfil.php");
  $("saludo").textContent = "Hola, " + perfil.nombre;

  await Promise.all([cargarMaterias(), cargarNotas(), cargarDisponibles()]);
}

async function cargarMaterias() {
  const datos = await api("estudiante/horario.php");
  $("tablaMaterias").innerHTML = datos.length
    ? datos.map(h => `
        <tr>
          <td>${esc(h.codigo)}</td><td>${esc(h.materia)}</td>
          <td>${esc(h.codigo_grupo)}</td><td>${esc(h.periodo)}</td>
          <td>${esc(h.profesor)}</td>
        </tr>`).join("")
    : `<tr><td colspan="5">No tienes materias inscritas</td></tr>`;
}

async function cargarNotas() {
  const filas = await api("estudiante/notas.php");
  if (!filas.length) {
    $("contenedorNotas").innerHTML = "<p>Aún no hay criterios de evaluación configurados.</p>";
    return;
  }

  // agrupar por inscripción (una tabla por materia)
  const porMateria = {};
  filas.forEach(f => {
    (porMateria[f.id_inscripcion] ??= { materia: f.materia, grupo: f.codigo_grupo, filas: [] }).filas.push(f);
  });

  $("contenedorNotas").innerHTML = Object.values(porMateria).map(m => {
    let acumulado = 0, evaluado = 0;
    const cuerpo = m.filas.map(f => {
      const tiene = f.calificacion !== null;
      if (tiene) {
        acumulado += parseFloat(f.calificacion) * parseFloat(f.porcentaje) / 100;
        evaluado  += parseFloat(f.porcentaje);
      }
      return `<tr>
        <td>Corte ${esc(f.corte)}</td>
        <td>${esc(f.criterio)}</td>
        <td>${esc(f.porcentaje)}%</td>
        <td>${tiene ? parseFloat(f.calificacion).toFixed(2) : "—"}</td>
        <td>${esc(f.observacion)}</td>
      </tr>`;
    }).join("");

    return `
      <h4>${esc(m.materia)} (grupo ${esc(m.grupo)})</h4>
      <table>
        <thead><tr><th>Corte</th><th>Criterio</th><th>Peso</th><th>Nota</th><th>Observación</th></tr></thead>
        <tbody>${cuerpo}</tbody>
      </table>
      <p><strong>Acumulado: ${acumulado.toFixed(2)}</strong> (sobre ${evaluado}% evaluado)</p>`;
  }).join("");
}

async function cargarDisponibles() {
  const gs = await api("estudiante/grupos_disponibles.php");
  $("tablaDisponibles").innerHTML = gs.length
    ? gs.map(g => `
        <tr>
          <td>${esc(g.codigo)}</td><td>${esc(g.materia)}</td>
          <td>${esc(g.codigo_grupo)}</td><td>${esc(g.periodo)}</td>
          <td>${esc(g.profesor)}</td>
          <td>${g.inscritos} / ${g.cupo}</td>
          <td><button onclick="inscribirse(${g.id_grupo})">Inscribirme</button></td>
        </tr>`).join("")
    : `<tr><td colspan="7">No hay grupos disponibles</td></tr>`;
}

async function inscribirse(idGrupo) {
  const r = await api("estudiante/inscribirse.php", { id_grupo: idGrupo });
  alert(r.ok ? "Inscripción realizada" : r.error);
  if (r.ok) cargarPanel();
}

cargarPanel();