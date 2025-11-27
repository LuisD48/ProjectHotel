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
      // Intentamos POST al endpoint de login - si no existe, lo simulamos
      const resp = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, password})
      });

      if (!resp.ok) {
        // si falla la petición (404 u otro), mostramos mensaje del servidor o simulamos
        const data = await resp.json().catch(()=>({}));
        const msg = data?.error || 'Error al iniciar sesión (simulado).';
        showMessage(loginMsg, msg, 'red');
        return;
      }

      const data = await resp.json();
      showMessage(loginMsg, 'Sesión iniciada correctamente', 'green');
      // Aquí podrías guardar token en localStorage y redirigir: localStorage.setItem('token', data.token)

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

// --- REGISTER ---
const regForm = document.getElementById('register-form');
const regMsg = document.getElementById('register-msg');

function validatePassword(password){
  // Regla: al menos 8 caracteres, 1 minúscula, 1 mayúscula y 1 número
  const minLen = /.{8,}/;
  const lower = /[a-z]/;
  const upper = /[A-Z]/;
  const digit = /[0-9]/;
  return minLen.test(password) && lower.test(password) && upper.test(password) && digit.test(password);
}

if (regForm){
  regForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    showMessage(regMsg, 'Validando datos...', 'black');

    const nombre = document.getElementById('reg-nombre').value.trim();
    const apellido1 = document.getElementById('reg-apellido1').value.trim();
    const apellido2 = document.getElementById('reg-apellido2').value.trim();
    const telefono = document.getElementById('reg-telefono').value.replace(/\s+/g, '');
    const estado = document.getElementById('reg-estado').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const pass = document.getElementById('reg-password').value;
    const pass2 = document.getElementById('reg-password2').value;

    if (!nombre || !apellido1 || !telefono || !estado || !email || !pass || !pass2) {
      showMessage(regMsg, 'Por favor completa los campos obligatorios.', 'red');
      return;
    }

    // Contraseña y validación
    if (pass !== pass2){
      showMessage(regMsg, 'Las contraseñas no coinciden.', 'red');
      return;
    }

    if (!validatePassword(pass)){
      showMessage(regMsg, 'La contraseña debe tener al menos 8 caracteres y contener mayúsculas, minúsculas y números.', 'red');
      return;
    }

    // Validar correo básico
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)){
      showMessage(regMsg, 'Proporciona un correo válido.', 'red');
      return;
    }

    // Validación teléfono simple
    const phonePattern = /^[0-9+()\-\s]{7,20}$/;
    if (!phonePattern.test(telefono)){
      showMessage(regMsg, 'Número telefónico inválido.', 'red');
      return;
    }

    // Datos listos — enviar al backend (si existe) o simular
    const payload = {nombre, apellido1, apellido2, telefono, estado, email, password: pass};

    try{
      const resp = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload)
      });

      if (!resp.ok){
        const data = await resp.json().catch(()=>({}));
        showMessage(regMsg, data.error || 'Error al registrar', 'red');
        return;
      }

      const data = await resp.json();
      showMessage(regMsg, 'Usuario registrado con éxito ✅', 'green');
      regForm.reset();

    } catch (err){
      console.warn('No hay backend para registro. Simulando registro correcto.', err);
      showMessage(regMsg, 'Registro simulado. Puedes iniciar sesión ahora.', 'green');
      regForm.reset();
    }
  });
}
