function mostrarError(msg) {
  const p = $("mensajeError");
  p.textContent = msg;
  p.hidden = false;
}

$("formRegistro").addEventListener("submit", async (e) => {
  e.preventDefault();
  $("mensajeError").hidden = true;

  const correo = $("correo").value.trim();
  const contrasena = $("contrasena").value;
  if (!correo || !contrasena) {
    mostrarError("Ingresa tu correo y tu contraseña");
    return;
  }

  const btn = $("btnIngresar");
  btn.disabled = true;

  try {
    const r = await api("login.php", {
      correo: correo,
      password: contrasena,
      tipo: $("tipoUsuario").value,   // administrador | profesor | estudiante
    });

    if (r.ok) {
      location.href = BASE + r.destino;   // cada rol va a su carpeta
    } else {
      mostrarError(r.error);
    }
  } catch (err) {
    console.error(err);
    mostrarError("No se pudo conectar con el servidor. Revisa que Apache y MySQL estén encendidos.");
  } finally {
    btn.disabled = false;
  }
});