from __future__ import division
import requests
from bs4 import BeautifulSoup as BSoup
import re
import time
import sys, os
import shelve
import json
from tqdm import tqdm

RATE_LIMIT = 3
BASE_URL = "http://www.forum.breedia.com/"
BREEDS_ROOT = "categories/dog-breed-forums.3/"
last_request = 0
cache = shelve.open("cache.data")
if os.path.exists("output.json"):
    with open("output.json", 'r') as f:
        data = json.loads(f.read())
else:
    data = {}
DOG_BREED_LIST = []

def url_get(url):
    url = str(url)
    if url in cache:
        html_text = cache[url]
        if type(html_text) == unicode:
            return BSoup(html_text, 'html.parser')
        else:
            return html_text
    global last_request
    diff = time.time() - last_request
    if diff < 1/RATE_LIMIT:
        time.sleep(1/RATE_LIMIT - diff)

    print "rul request sed"
    last_request = time.time()
    html_text = requests.get(url).text
    cache[url] = html_text
    return BSoup(html_text, 'html.parser')

n = 0
if __name__ == "__main__":
    base_forum = url_get(BASE_URL + BREEDS_ROOT)

    for link in base_forum.find_all('a'):
        if re.match("([A-Z] - )+.*", link.text):
            print link.text
            ref = link.get('href')
            letter_page = url_get(BASE_URL + ref)

            for letter_link in letter_page.find_all('a'):
                if letter_link.text.startswith("Dog Breeds - "):
                    letter_ref = letter_link.get('href')
                    breeds_page = url_get(BASE_URL + letter_ref)

                    for breed_link in breeds_page.find_all(class_="nodeTitle"):
                        breed = breed_link.text
                        # if breed[0].lower() in ['a', 'b', 'c']:
                        #     continue
                        n += 1
                        if breed in data:
                            print breed, "already done"
                            continue
                        print breed

                        breed_messages = []

                        breed_ref = breed_link.find('a').get('href')
                        breed_page = url_get(BASE_URL + breed_ref)
                        pages_obj = breed_page.find(class_="pageNavHeader")
                        if pages_obj:
                            num_pages = int(pages_obj.text[-1])
                        else:
                            num_pages = 1
                        for page_num in tqdm(range(1, num_pages+1)):
                            if page_num != 1:
                                breed_page = url_get(BASE_URL + breed_ref + "page-" + str(page_num))
                            for thread_link in breed_page.find_all(class_="PreviewTooltip"):
                                thread_ref = thread_link.get('href')
                                thread_page = url_get(BASE_URL + thread_ref)

                                thread_pages_obj = thread_page.find(class_="pageNavHeader")
                                if thread_pages_obj:
                                    num_pages = int(thread_pages_obj.text[-1])
                                else:
                                    num_pages = 1
                                for thread_page_num in xrange(1, num_pages+1):
                                    if thread_page_num != 1:
                                        thread_page = url_get(BASE_URL + thread_ref + "page-" + str(thread_page_num))

                                    for message in thread_page.select("div.messageInfo.primaryContent"):
                                        text = message.find(class_="messageContent").text
                                        like_info = message.find(class_="LikeText")
                                        if like_info:
                                            listed = len(like_info.find_all(class_="username"))
                                            other_info = re.findall(r"(\d+) other", like_info.text)
                                            if other_info:
                                                other = int(other_info[-1])
                                            else:
                                                other = 0
                                            likes = listed + other
                                        else:
                                            likes = 0
                                        breed_messages.append({"text":text.strip(), "likes": likes})

                        data[breed] = breed_messages
                        not_done = True
                        while not_done:
                            try:
                                with open("output.json", 'w') as f:
                                    f.write(json.dumps(data, indent=2))
                                not_done = False
                            except KeyboardInterrupt:
                                pass

print n
