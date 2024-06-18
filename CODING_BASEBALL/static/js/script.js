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


// 전송 버튼 클릭 이벤트 리스너
document.getElementById('inputForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // 입력된 숫자 가져오기
    let inputData = document.getElementById('data').value;

    // 선택된 자리수 가져오기
    let selectedOption = document.getElementById('digits').value;

  
    // 입력된 숫자의 자릿수 확인
    if (inputData.length !== parseInt(selectedOption)) {
        alert('숫자 자릿수가 잘못되었습니다.');
        return;
    }

    // 전송 횟수 증가
    attempts++;


    // 입력한 숫자와 랜덤 숫자 비교
    let result = compareNumbers(parseInt(inputData), randomNum, selectedOption);


    // 정답을 맞추지 않았고, 전송 횟수가 50회 미만일 때만 로그에 결과 추가
    if (result !== "정답" && attempts < 50) {
    addToGameLog(attempts, inputData, result);
}

    // 최대 전송 횟수(50회)를 초과하면 게임 종료
    if (attempts >= 50) {
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

// 주어진 자리수의 랜덤한 숫자 생성 함수
function generateRandomNumber(length) {
    const min = Math.pow(10, length - 1); // 최소값 (10의 자리수부터 시작)
    const max = Math.pow(10, length) - 1; // 최대값 (해당 자리수의 최대값)
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function compareNumbers(guess, target, digits) {
    if (guess === target) {
        alert('정답입니다!');
        let username = prompt("축하합니다! 이름을 입력해 주세요:", "이름"); // 사용자 이름 입력 받기
        if (username) {
            saveAttemptToBackend(digits, attempts, username); // 백엔드로 데이터 전송
            endGame(); // 게임 종료 호출
        } else {
            // 사용자가 이름을 입력하지 않았을 때도 게임 종료
            endGame(); // 게임 종료 호출
        }
        return "정답"
    } else if (guess > target) {
        alert('보다 작습니다.');
        return "보다 작음"
    } else {
        alert('보다 큽니다.');
        return "보다 큼"
    }
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
    // 화면 전환
    digitForm.style.display = 'block';
    endGameForm.style.display = 'none';
    inputForm.style.display = 'none';


   // 게임 로그 테이블 초기화
    resetGameLog();

    // 게임 설명 업데이트
    gameDescription.textContent = '게임 종료';

    // 전송 횟수 초기화
    attempts = 0;  // 게임 재시작을 위해 전송 횟수를 0으로 리셋

    // 게임 시작 버튼 활성화
    startGameButton.disabled = false;
}

// 게임 로그에 결과 추가하는 함수
function addToGameLog(attempt, inputNumber, result) {
    // 게임 로그 테이블 가져오기
    let gameLogTable = document.getElementById('gameLog');

    // 새로운 행 생성
    let newRow = document.createElement('tr');

    // 셀 생성 및 삽입
    let attemptCell = document.createElement('td');
    attemptCell.textContent = attempt;
    newRow.appendChild(attemptCell);


    let inputNumberCell = document.createElement('td');
    inputNumberCell.textContent = inputNumber;
    newRow.appendChild(inputNumberCell);


    let resultCell = document.createElement('td');
    resultCell.textContent = result;
    newRow.appendChild(resultCell);


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

    tableBody.innerHTML = '';  // 테이블 초기화

    // 데이터를 attempts에 따라 정렬
    records.sort((a, b) => a.attempts - b.attempts);

    // 순위 계산을 위한 변수 초기화
    let currentRank = 1;
    let previousAttempts = records[0].attempts;
    let skipNext = 0;

    records.forEach((record, index) => {
        let row = tableBody.insertRow(-1);  // 행 추가
        let cellRanking = row.insertCell(0);
        let cellAttempts = row.insertCell(1);
        let cellUsername = row.insertCell(2);
        let cellDate = row.insertCell(3);

        // 공동 순위 처리
        if (record.attempts === previousAttempts) {
            cellRanking.textContent = currentRank;
            skipNext++;
        } else {
            currentRank += skipNext;
            skipNext = 1;  // 다음 순위를 위해 현재 위치 +1
            cellRanking.textContent = currentRank;
        }
        previousAttempts = record.attempts;  // 이전 시도 횟수 업데이트

        cellAttempts.textContent = record.attempts;
        cellUsername.textContent = record.username;
        cellDate.textContent = new Date(record.timestamp).toLocaleString();
    });

    tableContainer.style.display = 'block';  // 테이블 컨테이너 보이기 설정
}
