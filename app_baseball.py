import json
import requests
from flask import Flask, request, jsonify, render_template
from datetime import datetime, timedelta

app = Flask(__name__)
data_file = 'attempts.json'
discord_webhook = "https://discord.com/api/webhooks/1176157989506404512/MPNnjvAJdhmsY37AGexHLQDwgUnekpRSRQKTWHC8_3PMQwrq1u0Z_wB_bR_b1BZHqnSx"

def send_message(msg):
    now = datetime.now()
    message = {"content": f"[{now.strftime('%H:%M')}] {str(msg)}"}
    requests.post(discord_webhook, data=message)

send_message("서버 시작")

def load_data():
    try:
        with open(data_file, 'r') as f:
            data = json.load(f)
            for attempt in data:
                attempt['digits'] = str(attempt['digits'])
            return data
    except FileNotFoundError:
        send_message("파일을 찾을 수 없습니다.")
        return []
    except json.JSONDecodeError:
        send_message("JSON 파일을 로드하는 중 오류가 발생했습니다.")
        return []

def save_data(data):
    try:
        with open(data_file, 'w') as f:
            json.dump(data, f, default=str)
    except Exception as e:
        send_message(f"데이터를 저장하는 중 오류가 발생했습니다: {str(e)}")

attempts_log = load_data()

@app.route('/')
def home():
    return render_template('index_baseball.html')

@app.route('/attempts', methods=['POST'])
def record_attempt():
    try:
        data = request.get_json()

        if not data or not all(key in data for key in ['digits', 'attempts', 'username']):
            return jsonify({'error': 'Missing data'}), 400

        now_utc = datetime.utcnow()
        now_korea = now_utc + timedelta(hours=9)
        data['timestamp'] = now_korea.isoformat()

        attempts_log.append(data)
        save_data(attempts_log)
        return jsonify({'message': 'Data saved successfully', 'data': data}), 201
    except Exception as e:
        print("An error occurred:", e)
        send_message(f"데이터 기록 중 오류가 발생했습니다: {str(e)}")
        return jsonify({'error': 'An error occurred while processing your request'}), 500

@app.route('/attempts/<int:digits>', methods=['GET'])
def get_attempts(digits):
    try:
        digits_str = str(digits)
        attempts_log = load_data()
        filtered_attempts = [attempt for attempt in attempts_log if attempt['digits'] == digits_str]
        sorted_attempts = sorted(filtered_attempts, key=lambda x: x['attempts'])
        return jsonify(sorted_attempts)
    except Exception as e:
        print("An error occurred:", e)
        send_message(f"데이터 조회 중 오류가 발생했습니다: {str(e)}")
        return jsonify({'error': 'An error occurred while processing your request'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=False)
