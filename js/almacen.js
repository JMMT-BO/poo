/**
 * SGA Institucional - Almacenamiento de datos del sistema.
 *
 * Único punto de persistencia mientras no exista backend: guarda
 * colecciones (materias, usuarios, grupos) en localStorage. Al
 * conectar una API, solo hay que reemplazar el cuerpo de estas
 * funciones. La sesión NO se guarda aquí (ver js/auth.js).
 */
const Almacen = (() => {
    const PREFIJO = "sga_";

    function obtener(coleccion, porDefecto = []) {
        try {
            const datos = JSON.parse(localStorage.getItem(PREFIJO + coleccion));
            return Array.isArray(datos) ? datos : porDefecto;
        } catch (e) {
            return porDefecto;
        }
    }

    function guardar(coleccion, datos) {
        localStorage.setItem(PREFIJO + coleccion, JSON.stringify(datos));
    }

    function agregar(coleccion, elemento) {
        const datos = obtener(coleccion);
        datos.push(elemento);
        guardar(coleccion, datos);
    }

    return { obtener, guardar, agregar };
})();
