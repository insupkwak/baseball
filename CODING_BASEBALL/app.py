import json
from flask import Flask, request, jsonify, render_template
from datetime import datetime, timedelta
import mysql.connector

app = Flask(__name__)

# MySQL 데이터베이스 연결 설정
config = {
    'user': 'mari',
    'password': '1234',
    'host': 'svc.sel5.cloudtype.app',
    'port': 31200,
    'database': 'baseball_game'
}

def get_db_connection():
    return mysql.connector.connect(**config)

def create_table():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS attempts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        digits VARCHAR(255),
        attempts INT,
        username VARCHAR(255),
        timestamp DATETIME
    )
    """)
    conn.commit()
    cursor.close()
    conn.close()

create_table()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/attempts', methods=['POST'])
def record_attempt():
    data = request.get_json()

    if not data or not all(key in data for key in ['digits', 'attempts', 'username']):
        return jsonify({'error': 'Missing data'}), 400

    now_utc = datetime.utcnow()
    now_korea = now_utc + timedelta(hours=9)
    timestamp = now_korea.isoformat()

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO attempts (digits, attempts, username, timestamp)
    VALUES (%s, %s, %s, %s)
    """, (data['digits'], data['attempts'], data['username'], timestamp))
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({'message': 'Data saved successfully', 'data': data}), 201

@app.route('/attempts/<int:digits>', methods=['GET'])
def get_attempts(digits):
    digits_str = str(digits)
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
    SELECT * FROM attempts WHERE digits = %s ORDER BY attempts
    """, (digits_str,))
    attempts = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(attempts)

if __name__ == '__main__':
    app.run(host='0.0.0.0')
