import json
from flask import Flask, request, jsonify, render_template
from datetime import datetime, timedelta





app = Flask(__name__)
data_file = 'attempts.json'


def load_data():
    try:
        with open(data_file, 'r') as f:
            data = json.load(f)
            # 모든 데이터의 'digits' 필드를 문자열로 통일
            for attempt in data:
                attempt['digits'] = str(attempt['digits'])
            return data
    except (FileNotFoundError, json.JSONDecodeError):
        return []
    

def save_data(data):
    with open(data_file, 'w') as f:
        json.dump(data, f, default=str)


attempts_log = load_data()


@app.route('/')
def home():
    return render_template('index_baseball.html')

@app.route('/attempts', methods=['POST'])
def record_attempt():
    data = request.get_json()

    if not data or not all(key in data for key in ['digits', 'attempts', 'username']):
        return jsonify({'error': 'Missing data'}), 400

    now_utc = datetime.utcnow()
    now_korea = now_utc + timedelta(hours=9)
    data['timestamp'] = now_korea.isoformat()  # ISO 형식으로 문자열 변환

   
    attempts_log.append(data)


    save_data(attempts_log)  # 데이터를 파일에 저장

    return jsonify({'message': 'Data saved successfully', 'data': data}), 201


@app.route('/attempts/<int:digits>', methods=['GET'])
def get_attempts(digits):
    digits_str = str(digits)
    attempts_log = load_data()  # 파일에서 데이터를 로드
    filtered_attempts = [attempt for attempt in attempts_log if attempt['digits'] == digits_str]
    sorted_attempts = sorted(filtered_attempts, key=lambda x: x['attempts'])
    return jsonify(sorted_attempts)


if __name__ == '__main__':
    app.run(host='0.0.0.0')