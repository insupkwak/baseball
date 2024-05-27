function applyColorsToText(text, colors) {
    return text.split('').map((char, index) => {
        return `<span class="${colors[index % colors.length]}">${char}</span>`;
    }).join('');
}

async function searchNews(query) {
    try {
        const response = await fetch(`/search?query=${query}`);
        const data = await response.json();

        const naverResultsBody = document.getElementById('naver-results-body');
        const daumResultsBody = document.getElementById('daum-results-body');
        const googleResultsBody = document.getElementById('google-results-body');

        const naverResultsSection = document.getElementById('naver-results');
        const daumResultsSection = document.getElementById('daum-results');
        const googleResultsSection = document.getElementById('google-results');

        const bannerContainer = document.getElementById('banner-container'); // 쿠팡 배너 컨테이너

        // 검색할 때마다 결과를 초기화
        naverResultsBody.innerHTML = '';
        daumResultsBody.innerHTML = '';
        googleResultsBody.innerHTML = '';

        let hasResults = false;

        if (data.naver.length > 0) {
            data.naver.forEach(result => {
                const row = document.createElement('tr');
                row.innerHTML = `<td>${result.news}</td><td><a href="${result.link}" target="_blank">${result.title}</a></td><td>${result.date}</td>`;
                naverResultsBody.appendChild(row);
            });
            naverResultsSection.style.display = 'block';
            hasResults = true;
        } else {
            naverResultsSection.style.display = 'none';
        }

        if (data.daum.length > 0) {
            data.daum.forEach(result => {
                const row = document.createElement('tr');
                row.innerHTML = `<td>${result.news}</td><td><a href="${result.link}" target="_blank">${result.title}</a></td><td>${result.date}</td>`;
                daumResultsBody.appendChild(row);
            });
            daumResultsSection.style.display = 'block';
            hasResults = true;
        } else {
            daumResultsSection.style.display = 'none';
        }

        if (data.google.length > 0) {
            data.google.forEach(result => {
                const row = document.createElement('tr');
                row.innerHTML = `<td>${result.news}</td><td><a href="${result.link}" target="_blank">${result.title}</a></td><td>${result.date}</td>`;
                googleResultsBody.appendChild(row);
            });
            googleResultsSection.style.display = 'block';
            hasResults = true;
        } else {
            googleResultsSection.style.display = 'none';
        }

        // 결과가 있는지 확인하고 results-container를 보이거나 숨김
        const resultsContainer = document.getElementById('results-container');
        if (hasResults) {
            resultsContainer.style.display = 'block';
            bannerContainer.style.display = 'block'; // 검색 결과가 있으면 쿠팡 배너 표시
        } else {
            resultsContainer.style.display = 'none';
            bannerContainer.style.display = 'none'; // 검색 결과가 없으면 쿠팡 배너 숨김
        }

        // h2에 색상 적용
        document.getElementById('google-results').querySelector('h2').innerHTML = applyColorsToText('Google', ['google-color-1', 'google-color-2', 'google-color-3', 'google-color-4', 'google-color-5', 'google-color-6']);
        document.getElementById('daum-results').querySelector('h2').innerHTML = applyColorsToText('Daum', ['daum-color-1', 'daum-color-2', 'daum-color-3', 'daum-color-4']);
        document.getElementById('naver-results').querySelector('h2').innerHTML = 'Naver'.split('').map(char => `<span class="naver-color">${char}</span>`).join('');


    } catch (error) {
        console.error('Error fetching search results:', error);
        alert('An error occurred while fetching search results. Please try again.');
    }
}
document.addEventListener('DOMContentLoaded', function() {
    const searchButton = document.querySelector('.search-box button');
    const newsButton = document.getElementById('news-button');
    const exclusiveButton = document.getElementById('exclusive-button');
    

    searchButton.addEventListener('click', function() {
        const query = document.getElementById('search-query').value;
        if (query) {
            searchNews(query);
        } else {
            alert('Please enter a search query');
        }
    });

    newsButton.addEventListener('click', function() {
        searchNews('속보');
    });

    exclusiveButton.addEventListener('click', function() {
        searchNews('단독');
    });

    const searchInput = document.getElementById('search-query');
    searchInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            const query = document.getElementById('search-query').value;
            if (query) {
                searchNews(query);
            } else {
                alert('Please enter a search query');
            }
        }
    });
});
