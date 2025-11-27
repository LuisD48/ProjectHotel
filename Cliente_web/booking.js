const API_URL = 'http://127.0.0.1:5000';

function showMessage(el, text, color='black'){
  el.textContent = text;
  el.style.color = color;
}

function getQueryParam(name){
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

async function loadSelectedRoom(){
  const idStr = getQueryParam('room');
  const container = document.getElementById('selected-room');
  const roomId = parseInt(idStr);

  if (!roomId) {
    container.innerHTML = '<p style="color:crimson">ID de habitación inválido. Regresa al listado e intenta de nuevo.</p>';
    return null;
  }

  container.innerHTML = 'Cargando habitación...';

  try {
    const resp = await fetch(`${API_URL}/api/habitaciones`);
    if (!resp.ok) throw new Error('No se pudo obtener lista de habitaciones');
    const habitaciones = await resp.json();
    const room = habitaciones.find(r => parseInt(r.id) === roomId);

    if (!room) {
      container.innerHTML = '<p style="color:crimson">No se encuentra la habitación solicitada o ya no está disponible.</p>';
      return null;
    }

    // Mostrar tarjeta resumen
    const img = room.imagen || `https://picsum.photos/seed/room${room.id}/600/400`;
    container.innerHTML = `
      <img src="${img}" alt="Habitación ${room.numero}" style="width:100%;height:220px;object-fit:cover;border-radius:8px;margin-bottom:10px;"/>
      <h3>Habitación #${room.numero}</h3>
      <p class="muted">Tipo: ${room.tipo}</p>
      <p><strong>Precio por noche:</strong> $${room.precio_noche}</p>
    `;

    // rellenar el campo oculto en el formulario
    const hidden = document.getElementById('booking-room-id');
    if (hidden) hidden.value = roomId;

    return room;
  } catch (err) {
    console.error('Error cargando habitación:', err);
    container.innerHTML = `<p style="color:crimson">Error al cargar la habitación: ${err.message}</p>`;
    return null;
  }
}

function validateBookingPayload(payload){
  if (!payload.habitacion_id) return 'Falta seleccionar la habitación.';
  if (!payload.nombre_cliente || payload.nombre_cliente.trim().length < 3) return 'Nombre inválido.';
  const emailPat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPat.test(payload.email)) return 'Email inválido.';
  if (!payload.fecha_entrada || !payload.fecha_salida) return 'Selecciona fechas de entrada y salida.';
  if (new Date(payload.fecha_salida) <= new Date(payload.fecha_entrada)) return 'La fecha de salida debe ser posterior a la fecha de entrada.';
  return null;
}

async function handleBookingSubmit(e){
  e.preventDefault();
  const msgEl = document.getElementById('booking-msg');
  showMessage(msgEl, 'Procesando reserva...', 'black');

  const payload = {
    habitacion_id: parseInt(document.getElementById('booking-room-id').value),
    nombre_cliente: document.getElementById('booking-nombre').value.trim(),
    email: document.getElementById('booking-email').value.trim(),
    fecha_entrada: document.getElementById('booking-entrada').value,
    fecha_salida: document.getElementById('booking-salida').value
  };

  const invalid = validateBookingPayload(payload);
  if (invalid) return showMessage(msgEl, invalid, 'red');

  try {
    const resp = await fetch(`${API_URL}/api/reservar`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload)
    });

    const data = await resp.json().catch(()=>({}));

    if (!resp.ok) {
      return showMessage(msgEl, data.error || 'Error al crear la reserva', 'red');
    }

    showMessage(msgEl, `Reserva creada ✅ ID: ${data.reserva_id}`,'green');
    document.getElementById('booking-form').reset();
    // opcional: redirigir al index o a una pantalla de confirmación
    setTimeout(()=> window.location.href = 'index.html', 1200);

  } catch(err){
    console.error('Fallo en booking:', err);
    showMessage(msgEl, 'Fallo al conectar con el servidor. (Simulación si no hay backend)', 'red');
  }
}

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
  await loadSelectedRoom();
  const form = document.getElementById('booking-form');
  if (form) form.addEventListener('submit', handleBookingSubmit);
});
