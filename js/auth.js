
const Auth = (() => {
    const CLAVE_SESION = "sesion";

    const ROLES = {
        ADMIN: "administrador",
        DOCENTE: "docente",
        ESTUDIANTE: "estudiante"
    };

    // Raíz del proyecto, calculada desde la ubicación de este script
    // (js/auth.js -> ../). Funciona con file:// y con servidores.
    const script = document.currentScript;
    const RAIZ = new URL("../", script.src).href;

    const RUTAS = {
        login: RAIZ + "html/registro.html",
        [ROLES.ADMIN]: RAIZ + "admin/html/Ges_Universidad.html",
        [ROLES.DOCENTE]: RAIZ + "docente/html/gruposA.html",
        [ROLES.ESTUDIANTE]: RAIZ + "estudiante/html/Panel_E.html"
    };

    // ------------------------------------------------------------------
    // USUARIOS QUEMADOS
    // ------------------------------------------------------------------
    const USUARIOS = [
        {
            correo: "admin@institucion.edu",
            contrasena: "admin123",
            nombre: "Coordinador",
            rol: ROLES.ADMIN
        },
        {
            correo: "docente@institucion.edu",
            contrasena: "docente123",
            nombre: "Prof. Carlos Rivera",
            rol: ROLES.DOCENTE
        },
        {
            correo: "estudiante@institucion.edu",
            contrasena: "estudiante123",
            nombre: "estdian. thomas Agudelo",
            rol: ROLES.ESTUDIANTE
        }
    ];

    // ------------------------------------------------------------------
    // SESIÓN
    // ------------------------------------------------------------------
    function getSesion() {
        try {
            return JSON.parse(sessionStorage.getItem(CLAVE_SESION));
        } catch (e) {
            return null;
        }
    }

    /**
     * Valida credenciales y crea la sesión.
     * Devuelve { ok: true, sesion } o { ok: false, mensaje }.
     */
    function login(rol, correo, contrasena) {
        const usuario = USUARIOS.find(u =>
            u.rol === rol &&
            u.correo === correo.trim().toLowerCase() &&
            u.contrasena === contrasena
        );

        if (!usuario) {
            return { ok: false, mensaje: "Credenciales incorrectas para el tipo de usuario seleccionado." };
        }

        const sesion = { correo: usuario.correo, nombre: usuario.nombre, rol: usuario.rol };
        sessionStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
        return { ok: true, sesion };
    }

    function logout() {
        sessionStorage.clear();
        window.location.replace(RUTAS.login);
    }

    function irAInicio(rol) {
        window.location.href = RUTAS[rol] || RUTAS.login;
    }

    // ------------------------------------------------------------------
    // PROTECCIÓN DE PÁGINAS
    // ------------------------------------------------------------------
    /** Redirige al login si no hay sesión, o al inicio propio si el rol no corresponde. */
    function proteger(rolRequerido) {
        const sesion = getSesion();

        if (!sesion) {
            window.location.replace(RUTAS.login);
            return false;
        }
        if (sesion.rol !== rolRequerido) {
            window.location.replace(RUTAS[sesion.rol] || RUTAS.login);
            return false;
        }
        return true;
    }

    function conectarPagina() {
        document.querySelectorAll("#btnCerrarSesion").forEach(boton => {
            boton.addEventListener("click", evento => {
                evento.preventDefault();
                logout();
            });
        });

        const sesion = getSesion();
        if (sesion) {
            document.querySelectorAll("[data-usuario-nombre]").forEach(el => {
                el.textContent = sesion.nombre;
            });
        }
    }

    // Protección automática según el atributo data-rol del <script>.
    const rolRequerido = script.dataset.rol;
    if (rolRequerido && proteger(rolRequerido)) {
        document.addEventListener("DOMContentLoaded", conectarPagina);
    }

    return { ROLES, getSesion, login, logout, irAInicio, proteger };
})();
