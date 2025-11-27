// create-account.js: validación y envío del formulario de registro (simulado si no hay backend)
const API_URL = 'http://127.0.0.1:5000';

function showMessage(element, text, color='black'){
  element.textContent = text;
  element.style.color = color;
}

function validatePassword(password){
  // Regla: al menos 8 caracteres, 1 minúscula, 1 mayúscula y 1 número
  const minLen = /.{8,}/;
  const lower = /[a-z]/;
  const upper = /[A-Z]/;
  const digit = /[0-9]/;
  return minLen.test(password) && lower.test(password) && upper.test(password) && digit.test(password);
}

const createForm = document.getElementById('create-form');
const createMsg = document.getElementById('create-msg');

if (createForm){
  createForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    showMessage(createMsg, 'Validando datos...', 'black');

    const nombre = document.getElementById('nombre').value.trim();
    const apellido1 = document.getElementById('apellido1').value.trim();
    const apellido2 = document.getElementById('apellido2').value.trim();
    const telefono = document.getElementById('telefono').value.replace(/\s+/g, '');
    const estado = document.getElementById('estado').value.trim();
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('password').value;
    const pass2 = document.getElementById('password2').value;

    if (!nombre || !apellido1 || !telefono || !estado || !email || !pass || !pass2) {
      showMessage(createMsg, 'Por favor completa los campos obligatorios.', 'red');
      return;
    }

    if (pass !== pass2){
      showMessage(createMsg, 'Las contraseñas no coinciden.', 'red');
      return;
    }

    if (!validatePassword(pass)){
      showMessage(createMsg, 'La contraseña debe tener al menos 8 caracteres y contener mayúsculas, minúsculas y números.', 'red');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)){
      showMessage(createMsg, 'Proporciona un correo válido.', 'red');
      return;
    }

    const phonePattern = /^[0-9+()\-\s]{7,20}$/;
    if (!phonePattern.test(telefono)){
      showMessage(createMsg, 'Número telefónico inválido.', 'red');
      return;
    }

    const payload = {nombre, apellido1, apellido2, telefono, estado, email, password: pass};

    try{
      const resp = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload)
      });

      if (!resp.ok){
        const data = await resp.json().catch(()=>({}));
        showMessage(createMsg, data.error || 'Error al registrar', 'red');
        return;
      }

      const data = await resp.json();
      showMessage(createMsg, 'Usuario registrado con éxito ✅', 'green');
      createForm.reset();

    } catch (err){
      console.warn('No hay backend para registro. Simulando registro correcto.', err);
      showMessage(createMsg, 'Registro simulado. Puedes iniciar sesión ahora.', 'green');
      createForm.reset();
    }
  });
}
