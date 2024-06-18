from flask import Flask, request, jsonify, render_template
from datetime import datetime, timedelta, timezone
import mysql.connector

app = Flask(__name__)

# MySQL 데이터베이스 연결 설정
config = {
    'user': 'mariadb',
    'password': '1234',
    'host': 'svc.sel5.cloudtype.app',
    'port': 31200,
    'database': 'mariadb'
}

def get_db_connection():
    return mysql.connector.connect(**config)

# attempts 테이블 삭제 함수 정의
def drop_attempts_table():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DROP TABLE IF EXISTS attempts;")
        conn.commit()
        cursor.close()
        conn.close()
        print("attempts 테이블 삭제 완료")
    except mysql.connector.Error as err:
        print(f"Error: {err}")

# attempts 테이블 삭제 함수 호출 (예: Flask 애플리케이션 시작 전에 실행)
drop_attempts_table()

