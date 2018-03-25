from __future__ import division
import requests
from bs4 import BeautifulSoup as BS
import re
import time
import sys
import shelve
import json
from tqdm import tqdm

RATE_LIMIT = 5
BASE_URL = "http://www.akc.org/"
BREEDS_ROOT = "dog-breeds/"
last_request = 0
cache = shelve.open("cache.data")
data = {}

def url_get(url):
    url = str(url)
    if url in cache:
        data = cache[url]
        return BS(data, 'html.parser')
    global last_request
    diff = time.time() - last_request
    if diff < 1/RATE_LIMIT:
        print("slowing down")
        time.sleep(1/RATE_LIMIT - diff)

    last_request = time.time()
    data = requests.get(url).text
    cache[url] = data
    return BS(data, 'html.parser')

if __name__ == "__main__":
    breeds_home = url_get(BASE_URL + BREEDS_ROOT)

    for link in tqdm(breeds_home.find_all('a')): 
        print(link)
