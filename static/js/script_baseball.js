let startGameButton = document.getElementById('startGameButton');
let digitForm = document.getElementById('digitForm');
let endGameForm = document.getElementById('endGameForm');
let endButton = document.getElementById('endButton');
let gameDescription = document.createElement('p'); // 게임 설명 추가
let inputForm = document.getElementById('inputForm'); // inputForm 변수 선언
let attempts = 0; // 전송 횟수
let randomNum; // 전역 변수로 선언
let isTableVisible = false;



// 숨기기와 표시 초기화
digitForm.style.display = 'block';
endGameForm.style.display = 'none';
inputForm.style.display = 'none';




// 게임 시작 버튼 클릭 이벤트 리스너
startGameButton.addEventListener('click', function(event) {
    event.preventDefault();
 
    // 선택된 자리수 가져오기
    let selectedOption = document.getElementById('digits').value;

    // 게임 설명 업데이트
    updateGameDescription(selectedOption);
   


    // 생성된 랜덤한 숫자를 저장 (최초 게임 시작 시 한 번만 생성)
   
        randomNum = generateRandomNumber(parseInt(selectedOption));
    
      

    digitForm.style.display = 'none';
    endGameForm.style.display = 'block';
    inputForm.style.display = 'block';


    // 게임 종료 버튼 추가
    endButton = document.getElementById('endButton');
    endButton.disabled = false;

    
});

// 게임 종료 버튼 클릭 이벤트 리스너
document.addEventListener('click', function(event) {
    if (event.target && event.target.id === 'endButton') {
        event.preventDefault();

        endGame()

        digitForm.style.display = 'block';
        endGameForm.style.display = 'none';
        inputForm.style.display = 'none';

        // 게임 시작 버튼 활성화
        startGameButton.disabled = false;
        // 게임 종료 버튼 비활성화
        endButton.disabled = true;
    }
});


function updateGameDescription(selectedOption) {
    // form 요소 내의 input 요소를 가져옵니다.
    let inputField = document.getElementById('data');
    // 선택된 자릿수에 따라 placeholder를 업데이트합니다.
    inputField.placeholder = `숫자를 입력하세요 (${selectedOption}자리)`;
}


// 입력 폼 제출 이벤트 리스너
document.getElementById('inputForm').addEventListener('submit', function(event) {
    event.preventDefault();
    let inputData = document.getElementById('data').value;

    if (inputData.length !== randomNum.toString().length) {
        alert('숫자 자릿수가 잘못되었습니다.');
        return;
    }

    attempts++;
    let result = compareNumbers(inputData, randomNum);

    if (result === `${randomNum.toString().length} 스트라이크, 0 볼`) {
        alert(`정답입니다! 숫자는 ${randomNum}였습니다.`);
        let username = prompt("축하합니다! 이름을 입력해 주세요:", "");
        if (username) {
            saveAttemptToBackend(randomNum.toString().length, attempts, username);
        }
        endGame();
    } else if (attempts < 50) {
        addToGameLog(attempts, inputData, result);
    } else {
        alert("게임 오버: 최대 시도 횟수 초과!");
        endGame();
    }
});

//기록확인
document.getElementById('checkRecordsButton').addEventListener('click', function() {

    if (isTableVisible) {
        document.getElementById('recordsTableContainer').style.display = 'none';
        isTableVisible = false;
        return;
    } 

    let selectedDigits = document.getElementById('recordDigitsSelect').value;

    fetch(`/attempts/${selectedDigits}`)
    .then(response => response.json()) 

    .then(data => {
        
        
        if (data.length === 0) {
            alert("기록이 없습니다. 도전하세요!!");
        } else {
            showRecordsTable(data);
            isTableVisible = true;  // 테이블이 표시될 때 상태 업데이트
        }
    })


    .catch(error => {
        console.error('Error fetching records:', error);
    });
});

function generateRandomNumber(length) {
    let digits = []; // 숫자를 저장할 배열
    let number = ''; // 최종 숫자를 문자열로 저장

    // 중복 없이 숫자 생성
    while (digits.length < length) {
        let rand = Math.floor(Math.random() * 10); // 0에서 9 사이의 랜덤 숫자 생성
        if (!digits.includes(rand) || digits.length === 0) { // 이미 배열에 해당 숫자가 없으면
            digits.push(rand);
        }
    }

    // 숫자 배열을 문자열로 변환
    number = digits.join('');
    if (number.length > 1 && number[0] === '0') { // 첫 번째 숫자가 0이면 숫자 재생성
        return generateRandomNumber(length);
    }

    console.log(number)

    return number;
}



function compareNumbers(guess, target) {
    let strikes = 0;
    let balls = 0;
    guess = guess.toString();
    target = target.toString();

    // 각 숫자가 몇 번 등장했는지 카운트
    let counts = {};

    // 먼저 스트라이크를 계산
    for (let i = 0; i < target.length; i++) {
        if (guess[i] === target[i]) {
            strikes++;
        } else {
            // 숫자별로 카운트 증가 (타겟 기준)
            if (counts[target[i]]) {
                counts[target[i]]++;
            } else {
                counts[target[i]] = 1;
            }
        }
    }

    // 볼 계산
    for (let i = 0; i < guess.length; i++) {
        if (guess[i] !== target[i] && counts[guess[i]]) {
            balls++;
            counts[guess[i]]--; // 사용한 볼은 카운트 감소
        }
    }
    alert (`${strikes} 스트라이크, ${balls} 볼`);
    return `${strikes} 스트라이크, ${balls} 볼`;
}

// 결과 출력 함수
function displayResult(result) {
    let response = document.getElementById('response');
    response.textContent = result;
}


function resetGameLog() {
    let tbody = document.querySelector('#gameLog tbody');

    while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
    }
}

// 게임 종료 함수
function endGame() {
    digitForm.style.display = 'block';
    endGameForm.style.display = 'none';
    inputForm.style.display = 'none';
    gameDescription.textContent = '게임 종료';
    startGameButton.disabled = false;
    resetGameLog();
    attempts = 0;
}

// 게임 로그에 결과 추가하는 함수
function addToGameLog(attempt, inputNumber, result) {
    // 게임 로그 테이블 가져오기
    let gameLogTable = document.getElementById('gameLog');
    let [strikes, balls] = result.split(', '); // 결과에서 스트라이크와 볼을 분리

    // 스트라이크와 볼 숫자만 추출
    let strikeCount = parseInt(strikes.split(' ')[0]); // "3 스트라이크" -> "3"
    let ballCount = parseInt(balls.split(' ')[0]); // "1 볼" -> "1"

    // 새로운 행 생성
    let newRow = document.createElement('tr');

    // 시도 횟수 셀 생성 및 삽입
    let attemptCell = document.createElement('td');
    attemptCell.textContent = attempt;
    newRow.appendChild(attemptCell);

    // 입력 숫자 셀 생성 및 삽입
    let inputNumberCell = document.createElement('td');
    inputNumberCell.textContent = inputNumber;
    newRow.appendChild(inputNumberCell);

    // 스트라이크 결과 셀 생성 및 삽입
    let strikeCell = document.createElement('td');
    strikeCell.textContent = strikeCount; // 숫자만 표시
    strikeCell.style.color = 'red'; // 스트라이크는 빨간색으로 표시
    newRow.appendChild(strikeCell);

    // 볼 결과 셀 생성 및 삽입
    let ballCell = document.createElement('td');
    ballCell.textContent = ballCount; // 숫자만 표시
    ballCell.style.color = 'blue'; // 볼은 파란색으로 표시
    newRow.appendChild(ballCell);

    // 행을 테이블에 추가
    gameLogTable.querySelector('tbody').appendChild(newRow);
}

function saveAttemptToBackend(digits, attempts, username) {
    const data = {
        digits: digits,        // 몇 자리 숫자 게임인지
        attempts: attempts,    // 시도한 횟수
        username: username     // 작성자 이름
    };

    fetch('/attempts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}


function showRecordsTable(records) {
    let tableContainer = document.getElementById('recordsTableContainer');
    let tableBody = document.getElementById('recordsTable').getElementsByTagName('tbody')[0];

    // 테이블 내용 초기화
    tableBody.innerHTML = '';

    if (records.length === 0) {
        alert("기록이 없습니다. 도전하세요!!");
        tableContainer.style.display = 'none'; // 테이블을 숨깁니다.
        return;
    }

    // 데이터를 시도 횟수에 따라 정렬
    records.sort((a, b) => a.attempts - b.attempts);

    // 동점 처리를 위한 변수들
    let lastAttempts = null;
    let rank = 0;
    let skip = 0;

    records.forEach((record, index) => {
        if (lastAttempts !== record.attempts) {
            // 시도 횟수가 이전 레코드와 다르면 순위 업데이트
            rank += 1 + skip;
            skip = 0; // 스킵 카운트 리셋
        } else {
            // 동점자의 경우 스킵 카운트 증가
            skip++;
        }

        let row = tableBody.insertRow();

        let cellRanking = row.insertCell(0);
        let cellAttempts = row.insertCell(1);
        let cellUsername = row.insertCell(2);
        let cellDate = row.insertCell(3);

        cellRanking.textContent = rank; // 순위 설정
        cellAttempts.textContent = record.attempts;
        cellUsername.textContent = record.username;
        cellDate.textContent = new Date(record.timestamp).toLocaleString();

        // 다음 루프를 위해 이전 시도 횟수 업데이트
        lastAttempts = record.attempts;
    });

    tableContainer.style.display = 'block'; // 테이블 표시
}
