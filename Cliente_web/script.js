const API_URL = 'http://127.0.0.1:5000'; 

// Coordenadas del hotel (modifica a las reales)
const HOTEL_COORDS = { lat: 19.4326, lng: -99.1332 };

// --- A. Función para CARGAR Y MOSTRAR las Habitaciones ---
async function cargarHabitaciones() {
    const contenedor = document.getElementById('contenedor-habitaciones');
    contenedor.innerHTML = 'Cargando...';

    try {
        const response = await fetch(`${API_URL}/api/habitaciones`);

        if (!response.ok) {
            throw new Error('No se pudo cargar la lista de habitaciones. Código: ' + response.status);
        }

        const habitaciones = await response.json();

        contenedor.innerHTML = '';

        if (!Array.isArray(habitaciones) || habitaciones.length === 0) {
            contenedor.innerHTML = '<p>No hay habitaciones disponibles en este momento.</p>';
            return;
        }

        habitaciones.forEach(hab => {
            const div = document.createElement('div');
            div.className = 'habitacion-card';
            // URL de imagen: usa la propiedad `imagen` si la provee el API,
            // si no, usa un placeholder de picsum.photos
            const imageUrl = hab.imagen || (`https://picsum.photos/seed/room${hab.id}/600/400`);
            // Mostrar los datos de la habitación
            div.innerHTML = `
                <img src="${imageUrl}" alt="Habitación ${hab.numero}" loading="lazy" class="habitacion-img" />
                <h3>Habitación #${hab.numero} (ID: ${hab.id})</h3>
                <p>Tipo: ${hab.tipo} | Precio por Noche: $${hab.precio_noche}</p>
                <button type="button" aria-label="Reservar habitación ${hab.numero}" onclick="document.getElementById('room_id').value = ${hab.id}">Reservar esta</button>
            `;
            contenedor.appendChild(div);
        });

    } catch (error) {
        console.error('Error en la comunicación con el API:', error);
        contenedor.innerHTML = `<p style="color: red;">Error al conectar con el servidor: ${error.message}</p>`;
    }
}

// --- B. Función para MANEJAR EL ENVÍO DEL FORMULARIO ---
async function handleFormSubmit(event) {
    event.preventDefault(); // Evita que la página se recargue

    const form = event.target;
    const mensajeElement = document.getElementById('mensaje-reserva');
    mensajeElement.textContent = 'Procesando reserva...';
    mensajeElement.style.color = 'black';

    // 1. Recolectar datos del formulario
    const datosReserva = {
        habitacion_id: parseInt(form.habitacion_id.value),
        nombre_cliente: form.nombre_cliente.value,
        email: form.email.value,
        fecha_entrada: form.fecha_entrada.value,
        fecha_salida: form.fecha_salida.value,
    };

    // Validaciones cliente
    if (!datosReserva.habitacion_id || isNaN(datosReserva.habitacion_id)) {
        mensajeElement.textContent = 'Por favor selecciona una habitación válida.';
        mensajeElement.style.color = 'red';
        return;
    }
    if (new Date(datosReserva.fecha_salida) <= new Date(datosReserva.fecha_entrada)) {
        mensajeElement.textContent = 'La fecha de salida debe ser posterior a la fecha de entrada.';
        mensajeElement.style.color = 'red';
        return;
    }

    // Deshabilitar botón mientras se procesa
    const submitBtn = form.querySelector('.boton-submit');
    if (submitBtn) submitBtn.disabled = true;

    // 2. Enviar los datos a la API (POST)
    try {
        const response = await fetch(`${API_URL}/api/reservar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datosReserva)
        });

        const data = await response.json();

        if (!response.ok) {
            mensajeElement.textContent = `Error: ${data.error || 'Fallo desconocido'}`;
            mensajeElement.style.color = 'red';
            return;
        }

        // Éxito
        mensajeElement.textContent = `¡Reserva creada con éxito! ID: ${data.reserva_id}.`;
        mensajeElement.style.color = 'green';
        form.reset();
        cargarHabitaciones(); // Refresca la lista
        
    } catch (error) {
        console.error('Error en la comunicación con el API:', error);
        mensajeElement.textContent = 'Fallo al conectar con el servidor API.';
        mensajeElement.style.color = 'red';
    }
    finally {
        const submitBtn = form.querySelector('.boton-submit');
        if (submitBtn) submitBtn.disabled = false;
    }
}

function verificarSesion() {
    const nombreUsuario = localStorage.getItem('usuario_nombre');
    const loginContainer = document.querySelector('.login-link a');
    const userIcon = document.querySelector('.user-icon');
    const loginText = document.querySelector('.login-text');

    if (nombreUsuario && loginContainer) {
        // Cambiar el icono a uno de usuario logueado
        userIcon.textContent = '👤'; 
        // Cambiar "Iniciar sesión" por "Hola, Juan"
        loginText.textContent = `Hola, ${nombreUsuario}`;
        
        // Opcional: Cambiar el enlace para que ahora sea "Cerrar sesión"
        loginContainer.href = "#";
        loginContainer.onclick = (e) => {
            e.preventDefault();
            if(confirm("¿Deseas cerrar sesión?")) {
                localStorage.removeItem('usuario_nombre');
                localStorage.removeItem('usuario_id');
                window.location.reload();
            }
        };
    }
}

// Agregar la llamada a la inicialización
document.addEventListener('DOMContentLoaded', () => {
    cargarHabitaciones();
    verificarSesion();
    
    // Conectar el formulario a la función de envío
    const form = document.getElementById('booking-form');
    form.addEventListener('submit', handleFormSubmit);
    // Inicializar mapa embebido
    try {
        const iframe = document.getElementById('map-iframe');
        if (iframe) {
            const { lat, lng } = HOTEL_COORDS;
            // Usamos la URL de embed de Google Maps via query para evitar PB tokens.
            iframe.src = `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
        }
    } catch (err) {
        console.warn('No se pudo inicializar el mapa:', err);
    }
});