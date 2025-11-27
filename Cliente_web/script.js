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
                <button type="button" aria-label="Reservar habitación ${hab.numero}" onclick="window.location.href='booking.html?room=${hab.id}'">Reservar esta</button>
            `;
            contenedor.appendChild(div);
        });

    } catch (error) {
        console.error('Error en la comunicación con el API:', error);
        contenedor.innerHTML = `<p style="color: red;">Error al conectar con el servidor: ${error.message}</p>`;
    }
}

// Nota: el envío del formulario de reserva ahora se gestiona en booking.js en la página booking.html

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
    
    // NOTA: el formulario de reserva se encuentra ahora en booking.html y es manejado por booking.js
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