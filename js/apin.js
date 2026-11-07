// Función auxiliar para seleccionar elementos por ID
function $(id) {
    return document.getElementById(id);
}

// Función para escapar HTML y prevenir ataques XSS
function esc(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Función global para manejar peticiones Fetch hacia el backend PHP en XAMPP
async function api(endpoint, datos = null) {
    // Ajusta la ruta base según donde esté tu carpeta php en XAMPP
    const url = `../../php/${endpoint}`; 
    
    const opciones = {
        method: datos ? "POST" : "GET",
        headers: { "Content-Type": "application/json" }
    };

    if (datos) {
        opciones.body = JSON.stringify(datos);
    }

    try {
        const respuesta = await fetch(url, opciones);
        if (!respuesta.ok) throw new Error("Error en la petición al servidor");
        return await respuesta.json();
    } catch (error) {
        console.error("Error API:", error);
        throw error;
    }
}

// Sistema global de alertas visuales conectado a tu HTML
function mostrarAlerta(titulo, mensaje, tipo = "exito") {
    const alerta = $("alerta");
    if (!alerta) {
        alert(`${titulo}: ${mensaje}`);
        return;
    }

    $("alertaTitulo").textContent = titulo;
    $("alertaMensaje").textContent = mensaje;
    
    const icono = $("alertaIcono");
    if (tipo === "exito") icono.textContent = "✓";
    else if (tipo === "error") icono.textContent = "✕";
    else icono.textContent = "⚠";

    alerta.classList.add("mostrar");

    const btnCerrar = $("cerrarAlerta");
    if (btnCerrar) {
        btnCerrar.onclick = () => alerta.classList.remove("mostrar");
    }

    setTimeout(() => {
        alerta.classList.remove("mostrar");
    }, 4000);
}