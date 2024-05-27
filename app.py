from flask import Flask, request, jsonify, render_template
import requests
from bs4 import BeautifulSoup
import datetime
import re
import urllib.parse


app = Flask(__name__)
discord = "https://discord.com/api/webhooks/1176157989506404512/MPNnjvAJdhmsY37AGexHLQDwgUnekpRSRQKTWHC8_3PMQwrq1u0Z_wB_bR_b1BZHqnSx"

#메시지 전송
def send_message(msg):
    now = datetime.datetime.now()
    message = {"content": f"[{now.strftime('%H:%M')}] {str(msg)}"}
    requests.post(discord, data=message)


# def check_url_blocked(url):
#     try:
#         response = requests.get(url)
#         if response.status_code == 200:
#             send_message("URL이 차단되지 않았습니다.")
#         else:
#             send_message("URL이 차단되었습니다. 응답 코드:", response.status_code)
#     except requests.exceptions.RequestException as e:
#         send_message("요청 중 오류가 발생하였습니다:", e)



# url1 = "https://www.google.com/search"
# url2 = "https://search.naver.com/search.naver"
# url3 = "https://www.naver.com/"

# check_url_blocked(url1)
# check_url_blocked(url2)
# check_url_blocked(url3)


def crawl_naver_news(search_query):

    base_url = "https://search.naver.com/search.naver"
    params = {"query": search_query, "where": "news"}
     
    response = requests.get(base_url, params=params)
    soup = BeautifulSoup(response.text, 'html.parser')

    results = []
    
    for item in soup.select('div.news_contents'):
        title_tag = item.select_one('.news_tit')
    
        if title_tag:
            title = title_tag.get_text(strip=True)   
            link = title_tag['href']
        
        results.append({'title': title, 'link': link})
    
    i=0

    for item in soup.select('div.info_group'):

        news = item.find('a', class_='info press').text.strip()
        date = item.find('span', class_='info').text.strip()

        results[i]['news'] = news
        results[i]['date'] = date
        
        i += 1

  
    return results


def crawl_daum_news(search_query):
    base_url = "https://search.daum.net/search"
    params = {"nil_suggest": "btn", "w": "news", "DA": "SBC", "q": search_query}
    
    response = requests.get(base_url, params=params)
    soup = BeautifulSoup(response.text, 'html.parser')

    results = []
    for item in soup.select('strong.tit-g'):
        title_tag = item.select_one('a')
     
        if title_tag:
            title = title_tag.get_text(strip=True)
            link = title_tag['href']
        results.append({'title': title, 'link': link})


    i = 0
    for item in soup.select('div.c-tit-doc .area_tit .inner_header'):
        news_tag = item.select_one('a')
        news = news_tag.get_text(strip=True)
        
        results[i]['news'] = news
        i += 1

    i = 0
    for item in soup.select('div.item-contents'):
        date_tag = item.select_one('span.gem-subinfo')
        date = date_tag.get_text(strip=True)
        
        results[i]['date'] = date
        i += 1

    return results




def crawl_google_news(query):
    url = f"https://www.google.com/search?q={query}&tbm=nws"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'}
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.text, 'html.parser')

    news_results = []

    for result in soup.find_all('div', class_='Gx5Zad'):
        title_elem = result.find('div', class_='BNeawe')
        if title_elem:
            news = {}
            news['title'] = title_elem.text

            link_elem = result.find('a')
            if link_elem:
                # Extracting the link and removing unnecessary parameters
                link = link_elem['href']
                # Decoding the URL to handle special characters like "&amp;"
                decoded_link = urllib.parse.unquote(link)
                match = re.search(r'(https?://[^&]+)', decoded_link)
                if match:
                    news['link'] = match.group(1)


            date_elem = result.find('span', class_='r0bn4c')
            news['date'] = date_elem.text if date_elem else None

            content_elem = result.find('div', class_='BNeawe UPmit AP7Wnd lRVwie')
            news['news'] = content_elem.text if content_elem else None

            if not news['news']:  # If news is None, try to scrape the next article
                continue

            news_results.append(news)

    return news_results







@app.route('/')
def index():
    return render_template('index.html')

@app.route('/search', methods=['GET'])
def search_news():
    query = request.args.get('query')
    if not query:
        return jsonify({"error": "No query parameter provided"}), 400

    naver_results = crawl_naver_news(query)
    daum_results = crawl_daum_news(query)
    google_results = crawl_google_news(query)

    return jsonify({"naver": naver_results, "daum": daum_results, 'google' : google_results})

if __name__ == '__main__':
    try:
        app.run(host='0.0.0.0', debug=False)
    except Exception as e:
        print("An error occurred while running the server:", e)