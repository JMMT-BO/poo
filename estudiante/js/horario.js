const exportar = document.querySelector(
    ".student-header button"
);

exportar.addEventListener("click", function () {

    alert(
        "La opción de exportar PDF está lista para conectarse con un sistema real."
    );

});




const tabs = document.querySelectorAll(
    ".toolbar button"
);


tabs.forEach(function(tab) {

    tab.addEventListener("click", function() {

        // Quitamos la clase selected
        // de todos los botones

        tabs.forEach(function(item) {

            item.classList.remove(
                "selected"
            );

        });


     

        tab.classList.add(
            "selected"
        );

    });

});




const ahora = new Date();

console.log(
    "Portal Academia Pro cargado:",
    ahora.toLocaleTimeString()
);


async function cargarHorario() {
  const datos = await api("estudiante/horario.php");

  if (!datos.length) {
    $("tablaHorario").innerHTML = `<tr><td colspan="6">No tienes materias inscritas</td></tr>`;
    return;
  }
  $("tablaHorario").innerHTML = datos.map(h => `
    <tr>
      <td>${esc(h.codigo)}</td>
      <td>${esc(h.materia)}</td>
      <td>${esc(h.codigo_grupo)}</td>
      <td>${esc(h.periodo)}</td>
      <td>${esc(h.profesor)}</td>
      <td>${esc(h.creditos)}</td>
    </tr>`).join("");
}

cargarHorario();