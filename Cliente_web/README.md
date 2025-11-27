# Cliente_web — Pruebas locales

Cómo probar la UI localmente:

1) Levantar un servidor estático desde la carpeta `Cliente_web`:

```cmd
cd /d "c:\Users\luisl\OneDrive\Escritorio\Hotel\Cliente_web"
python -m http.server 8000
```

2) Abrir en el navegador:
- http://localhost:8000/index.html  — landing (lista de habitaciones)
- http://localhost:8000/login.html  — página de inicio de sesión
- http://localhost:8000/create-account.html — página para crear cuenta

3) Flujo de reserva a probar:
- En la landing, espera que carguen las tarjetas de habitaciones (si el backend está activo) o usa los placeholders.
- En una tarjeta, haz clic en "Reservar esta" → te redirigirá a `booking.html?room={id}` mostrando los datos de la habitación seleccionada.
- Completa los campos (nombre, email, fechas) y pulsa "Confirmar reserva".

El frontend llama a los endpoints:
- GET /api/habitaciones — lista de habitaciones
- POST /api/reservar — crear reserva (payload JSON: habitacion_id, nombre_cliente, email, fecha_entrada, fecha_salida)

Si no hay backend corriendo, el sistema mostrará mensajes de error y el envío quedará en modo "simulado" para pruebas de UI.
