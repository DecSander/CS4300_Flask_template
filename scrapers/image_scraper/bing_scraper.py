#!/usr/bin/env python3
import os
import json
import traceback
import http.cookiejar
import urllib.request, urllib.error, urllib.parse
import time
import requests
from PIL import Image
from io import BytesIO
from tqdm import tqdm

from bs4 import BeautifulSoup

def get_soup(url,header):
    #return BeautifulSoup(urllib2.urlopen(urllib2.Request(url,headers=header)),
    # 'html.parser')
    return BeautifulSoup(urllib.request.urlopen(
        urllib.request.Request(url,headers=header)),
        'html.parser')

def scrape_images(orig_query, DIR="scraped_images"):
    query= orig_query.split()
    query='+'.join(query + ["dog"])
    url="http://www.bing.com/images/search?q=" + query + "&FORM=HDRSC2" + "&qft=+filterui:imagesize-custom_300_300+filterui:aspect-square&FORM=IRFLTR"

    if not os.path.exists(DIR):
        os.mkdir(DIR)
    if not os.path.exists(os.path.join(DIR, orig_query)):
        os.mkdir(os.path.join(DIR, orig_query))
    else:
        return False

    #add the directory for your image here
    header={'User-Agent':"Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.134 Safari/537.36"}
    soup = get_soup(url,header)

    ActualImages=[] # contains the link for Large original images, type of  image
    for a in soup.find_all("a",{"class":"iusc"}):
        #print a
        mad = json.loads(a["mad"])
        turl = mad["turl"]
        m = json.loads(a["m"])
        murl = m["murl"]

        image_name = urllib.parse.urlsplit(murl).path.split("/")[-1]

        ActualImages.append((image_name, turl, murl))

    urls = []

    for i, (image_name, turl, murl) in enumerate(ActualImages):
        try:
            _, ext = os.path.splitext(image_name)
            raw_img = urllib.request.urlopen(turl).read()
            size = Image.open(BytesIO(raw_img)).size
            # if abs(size[0] - size[1]) / min(size[0], size[1]) > 0.2:
            #     continue

            f = open(os.path.join(DIR, orig_query, str(i) + ext.lower()), 'wb')
            f.write(raw_img)
            f.close()
            urls.append(murl)
        except:
            traceback.print_exc()
            sys.exit()
            print(murl)

        if len(urls) >= 10:
            break

    with open(os.path.join(DIR, orig_query, "urls.txt"), 'w') as urls_file:
        urls_file.write("\n".join(urls))

    print("Found", len(urls), "images for", orig_query)
    return True

if __name__ == "__main__":
    with open("../structured_dataset.json", 'r') as data:
        dogs = json.load(data).keys()

    for dog in tqdm(dogs):
        if scrape_images(dog):
            time.sleep(1)
        
