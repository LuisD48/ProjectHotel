from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
from mysql.connector import errorcode
from datetime import datetime
# Importación de seguridad para las contraseñas
from werkzeug.security import generate_password_hash, check_password_hash 

# --- CONFIGURACIÓN DE LA BASE DE DATOS ---
DB_CONFIG = {
    'user': 'root', 
    'password': 'Naruto123', # Tu contraseña actual
    'host': '127.0.0.1', 
    'database': 'hotel_db'
}

app = Flask(__name__)
CORS(app) 

# --- RUTA DE PRUEBA ---
@app.route('/')
def hello_world():
    return jsonify({"mensaje": "API de Hotel Funcionando Correctamente."})

def get_db_connection():
    try:
        cnx = mysql.connector.connect(**DB_CONFIG)
        return cnx
    except mysql.connector.Error as err:
        print(f"Error de conexión a MySQL: {err.msg}")
        return None

# --- ENDPOINT: REGISTRAR NUEVO USUARIO (NUEVO) ---
@app.route('/api/auth/register', methods=['POST'])
def register_user():
    data = request.get_json()
    
    # 1. Validar datos obligatorios
    campos_requeridos = ['nombre', 'apellido1', 'email', 'password', 'telefono', 'estado']
    if not all(k in data for k in campos_requeridos):
        return jsonify({"error": "Faltan datos obligatorios"}), 400

    # 2. Encriptar la contraseña (Hashing)
    hashed_password = generate_password_hash(data['password'])
    
    cnx = get_db_connection()
    if cnx is None:
        return jsonify({"error": "Error de conexión a la BD"}), 500

    cursor = cnx.cursor()
    
    query = ("INSERT INTO Usuarios "
             "(nombre, apellido_paterno, apellido_materno, email, telefono, estado_residencia, password_hash) "
             "VALUES (%s, %s, %s, %s, %s, %s, %s)")

    try:
        valores = (
            data['nombre'],
            data['apellido1'],
            data.get('apellido2', ''), # Opcional
            data['email'],
            data['telefono'],
            data['estado'],
            hashed_password # Guardamos la contraseña encriptada
        )
        cursor.execute(query, valores)
        cnx.commit()
        
        return jsonify({"mensaje": "Usuario registrado exitosamente"}), 201 

    except mysql.connector.IntegrityError:
        return jsonify({"error": "El correo electrónico ya está registrado."}), 409
    except mysql.connector.Error as err:
        print(f"Error SQL: {err}")
        return jsonify({"error": "Error interno del servidor"}), 500
    finally:
        cursor.close()
        cnx.close()

# --- ENDPOINT: OBTENER HABITACIONES ---
@app.route('/api/habitaciones', methods=['GET'])
def get_habitaciones():
    cnx = get_db_connection()
    if cnx is None: return jsonify({"error": "Error de BD"}), 500
    cursor = cnx.cursor(dictionary=True) 
    try:
        cursor.execute("SELECT id, numero, tipo, precio_noche, estado FROM Habitaciones WHERE estado = 'Disponible'")
        return jsonify(cursor.fetchall()) 
    finally:
        cursor.close()
        cnx.close()

# --- ENDPOINT: CREAR RESERVA ---
@app.route('/api/reservar', methods=['POST'])
def crear_reserva():
    data = request.get_json()
    cnx = get_db_connection()
    if cnx is None: return jsonify({"error": "Error de BD"}), 500
    cursor = cnx.cursor()
    try:
        # Insertar reserva
        query = ("INSERT INTO Reservas (habitacion_id, nombre_cliente, email, fecha_entrada, fecha_salida, estado) VALUES (%s, %s, %s, %s, %s, 'PENDIENTE')")
        vals = (data['habitacion_id'], data['nombre_cliente'], data['email'], data['fecha_entrada'], data['fecha_salida'])
        cursor.execute(query, vals)
        reserva_id = cursor.lastrowid
        
        # Actualizar habitación a Ocupada
        cursor.execute("UPDATE Habitaciones SET estado = 'Ocupada' WHERE id = %s", (data['habitacion_id'],))
        
        cnx.commit()
        return jsonify({"mensaje": "Reserva creada", "reserva_id": reserva_id}), 201 
    except Exception as e:
        cnx.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        cnx.close()

if __name__ == '__main__':
    app.run(debug=True)