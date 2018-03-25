from __future__ import division
import requests
from bs4 import BeautifulSoup as BSoup
import re
import time
import sys
import shelve
import json
from tqdm import tqdm

RATE_LIMIT = 3
BASE_URL = "http://www.forum.breedia.com/"
BREEDS_ROOT = "categories/dog-breed-forums.3/"
last_request = 0
cache = shelve.open("cache.data")
data = {}

def url_get(url):
    url = str(url)
    if url in cache:
        data = cache[url]
        if type(data) == unicode:
            return BSoup(data, 'html.parser')
        else:
            return data
    global last_request
    diff = time.time() - last_request
    if diff < 1/RATE_LIMIT:
        time.sleep(1/RATE_LIMIT - diff)

    last_request = time.time()
    data = requests.get(url).text
    cache[url] = data
    return BSoup(data, 'html.parser')


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
                        if breed.lower() != "akita":
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
                                        print BASE_URL + thread_ref + "page-" + str(thread_page_num)

                                    for message in thread_page.find_all(class_="messageText"):
                                        breed_messages.append(message.text.strip())

                                data[breed] = breed_messages
                        with open("output.json", 'w') as f:
                            f.write(json.dumps(data, indent=2))
