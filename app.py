from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
from mysql.connector import errorcode
from datetime import datetime

# --- 1. CONFIGURACIÓN DE LA BASE DE DATOS ---
DB_CONFIG = {
    'user': 'root', 
    'password': 'Naruto123', # <<--- ¡MODIFICAR ESTO!
    'host': '127.0.0.1', 
    'database': 'hotel_db' # <<--- Asegúrate de que este sea el nombre correcto
}

app = Flask(__name__)
CORS(app) 

@app.route('/')
def hello_world():
    # Retorna un JSON simple para confirmar que el servidor está OK
    return jsonify({"mensaje": "API de Hotel Funcionando Correctamente, rutas cargadas."})

def get_db_connection():
    """Función de utilidad para conectar a la BD"""
    try:
        cnx = mysql.connector.connect(**DB_CONFIG)
        return cnx
    except mysql.connector.Error as err:
        print(f"Error de conexión a MySQL: {err.msg}")
        return None

# --- 2. ENDPOINT: OBTENER HABITACIONES (GET) ---
@app.route('/api/habitaciones', methods=['GET'])
def get_habitaciones():
    cnx = get_db_connection()
    if cnx is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500

    cursor = cnx.cursor(dictionary=True) 
    query = ("SELECT id, numero, tipo, precio_noche, estado FROM Habitaciones WHERE estado = 'Disponible'")

    try:
        cursor.execute(query)
        habitaciones = cursor.fetchall()
        
        return jsonify(habitaciones) 

    except mysql.connector.Error as err:
        print(f"Error al ejecutar la consulta GET: {err}")
        return jsonify({"error": "Error al obtener datos"}), 500
        
    finally:
        cursor.close()
        cnx.close()


# --- 3. ENDPOINT: CREAR RESERVA (POST) ---
@app.route('/api/reservar', methods=['POST'])
def crear_reserva():
    data = request.get_json()
    
    # Validación básica de datos
    if not all(k in data for k in ('habitacion_id', 'nombre_cliente', 'email', 'fecha_entrada', 'fecha_salida')):
        return jsonify({"error": "Faltan datos obligatorios"}), 400

    cnx = get_db_connection()
    if cnx is None:
        return jsonify({"error": "Error de servidor"}), 500

    cursor = cnx.cursor()
    
    # Consulta de Inserción
    query = ("INSERT INTO Reservas "
             "(habitacion_id, nombre_cliente, email, fecha_entrada, fecha_salida, estado) "
             "VALUES (%s, %s, %s, %s, %s, 'PENDIENTE')")

    try:
        valores = (
            data['habitacion_id'],
            data['nombre_cliente'],
            data['email'],
            data['fecha_entrada'],
            data['fecha_salida']
        )
        
        cursor.execute(query, valores)
        cnx.commit()
        
        return jsonify({
            "mensaje": "Reserva creada con éxito", 
            "reserva_id": cursor.lastrowid
        }), 201 

    except mysql.connector.Error as err:
        cnx.rollback()
        print(f"Error de MySQL al insertar reserva: {err}")
        return jsonify({"error": "Fallo al procesar la reserva. Verifique las fechas o ID."}), 500
        
    finally:
        cursor.close()
        cnx.close()

# --- 4. PUNTO DE ENTRADA (Mantenemos el debug para desarrollo) ---
if __name__ == '__main__':
    app.run(debug=True)