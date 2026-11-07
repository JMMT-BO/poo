/**
 * SGA Institucional - Página de inicio (html/introduccion.html).
 * Requiere js/auth.js cargado antes.
 */
document.addEventListener("DOMContentLoaded", () => {
    const btnPortal = document.getElementById("btnPortal");
    const btnConocer = document.getElementById("btnConocer");

    btnPortal.addEventListener("click", () => {
        const sesion = Auth.getSesion();
        if (sesion) {
            Auth.irAInicio(sesion.rol);
        } else {
            window.location.href = "registro.html";
        }
    });

    btnConocer.addEventListener("click", () => {
        document.getElementById("funcionalidades").scrollIntoView({ behavior: "smooth" });
    });
});


function mostrarAlerta(titulo, mensaje, tipo = "exito") {

    let alerta = document.getElementById("alerta");
    let alertaTitulo = document.getElementById("alertaTitulo");
    let alertaMensaje = document.getElementById("alertaMensaje");
    let alertaIcono = document.getElementById("alertaIcono");

    alertaTitulo.textContent = titulo;
    alertaMensaje.textContent = mensaje;

    if (tipo === "exito") {
        alertaIcono.textContent = "✓";
    } 
    else if (tipo === "error") {
        alertaIcono.textContent = "×";
    } 
    else if (tipo === "advertencia") {
        alertaIcono.textContent = "!";
    } 
    else {
        alertaIcono.textContent = "i";
    }

    alerta.classList.add("mostrar");

    setTimeout(function () {
        alerta.classList.remove("mostrar");
    }, 4000);
}

document.getElementById("cerrarAlerta").addEventListener("click", function () {
    document.getElementById("alerta").classList.remove("mostrar");
});