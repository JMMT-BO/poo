const certificateBtn = document.getElementById("certificateBtn");

if (certificateBtn) {
    certificateBtn.addEventListener("click", function () {
        alert("El certificado se descargará próximamente.");
    });
}



const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {

        const confirmar = confirm("¿Deseas cerrar sesión?");

        if (confirmar) {
            Auth.logout();
        }

    });
}




const notification = document.querySelector(".notification");

if (notification) {
    notification.addEventListener("click", function () {
        alert("No tienes nuevas notificaciones.");
    });
}




const avatar = document.querySelector(".user-avatar");

if (avatar) {
    avatar.addEventListener("click", function () {
        alert("Perfil de Alejandro García Pérez");
    });
}

function poner(id, valor) {
  const el = $(id);
  if (!el) return;
  if ("value" in el) el.value = valor ?? "";
  else el.textContent = valor ?? "";
}

async function cargarPerfil() {
  const p = await api("estudiante/perfil.php");
  poner("pNombre", p.nombre);
  poner("pCorreo", p.correo);
  poner("pCodigo", p.codigo_estudiantil);
  poner("pPrograma", p.programa);
  poner("pSemestre", p.semestre);
}

$("formPerfil").addEventListener("submit", async (e) => {
  e.preventDefault();
  const r = await api("estudiante/perfil_update.php", {
    nombre: $("pNombre").value,
    password_actual: $("pPassActual").value,
    password_nueva: $("pPassNueva").value,
  });
  $("pMensaje").textContent = r.ok ? "Datos actualizados" : r.error;
  if (r.ok) { $("pPassActual").value = ""; $("pPassNueva").value = ""; }
});

cargarPerfil();