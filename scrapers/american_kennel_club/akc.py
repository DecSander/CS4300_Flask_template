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
    #print('new call')
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
    data = {}
    for page in range(1,24):
        breeds_page = url_get(BASE_URL + BREEDS_ROOT + 'page/' + str(page))
        print("Page: " + str(page))
        for dog_grid_el in tqdm(breeds_page.find_all('div', class_='grid-col')):
            links = dog_grid_el.find_all('a', class_='d-block relative', href=True)    
            dog_data = {}
            if len(links) > 0:
                page_url = links[0]['href']
                breed_page = url_get(page_url)
                breed_name = page_url.split("/")[-2]
            else:
                continue 

            attribute_list = breed_page.find(class_='attribute-list')
            about_the_breed = breed_page.find(class_='breed-info__content-wrap')
            #print("########################")
            #print(breed_name)

            
            text_list = attribute_list.find_all(class_='attribute-list__text')
            for i in range(len(text_list)):
                if i % 2 == 0:
                    dog_data[text_list[i].get_text()] = text_list[i + 1].get_text()
            #print(attribute_list.prettify())
                
            #print('-------')
            dog_data['About'] = about_the_breed.get_text()

            fact_list = breed_page.find_all(class_='fact-slider__slide-content')

            facts = []
            for fact in fact_list:
                facts.append(fact.get_text().strip())

            dog_data['Facts'] = facts


            care_list = breed_page.find_all(class_='tabs__tab-panel-content')            
            #for care in care_list:
                #print(care.prettify())

            data[breed_name] = dog_data

   # print(json.dumps(data, indent=2, separators=(',', ': ')))
