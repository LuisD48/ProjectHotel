// login.js: validación de login y registro en cliente (simulación si no hay backend)
const API_URL = 'http://127.0.0.1:5000';

function showMessage(element, text, color='black'){
  element.textContent = text;
  element.style.color = color;
}

// --- LOGIN ---
const loginForm = document.getElementById('login-form');
const loginMsg = document.getElementById('login-msg');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    showMessage(loginMsg, 'Iniciando sesión...', 'black');

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
      showMessage(loginMsg, 'Completa correo y contraseña.', 'red');
      return;
    }

    try {
      const resp = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, password})
      });

      if (!resp.ok) {
        const data = await resp.json().catch(()=>({}));
        showMessage(loginMsg, data.error || 'Credenciales incorrectas.', 'red');
        return;
      }

      const data = await resp.json();
      
      // --- ESTO ES LO NUEVO: GUARDAR EL NOMBRE ---
      // Guardamos el nombre del usuario en el navegador
      localStorage.setItem('usuario_nombre', data.usuario.nombre);
      localStorage.setItem('usuario_id', data.usuario.id);
      
      showMessage(loginMsg, `¡Bienvenido, ${data.usuario.nombre}! Redirigiendo...`, 'green');
      
      setTimeout(()=>{
        window.location.href = 'index.html';
      }, 1500);

    } catch (err) {
      // Si no hay backend activo, simulamos éxito para pruebas
      console.warn('No se pudo conectar al backend para login. Simulando...', err);
      showMessage(loginMsg, 'No hay backend (simulación): sesión iniciada ✅', 'green');
      setTimeout(()=>{
        // redirigir al index u otra página
        window.location.href = 'index.html';
      }, 900);
    }
  });
}

// Registro removido (ahora en create-account.js)
