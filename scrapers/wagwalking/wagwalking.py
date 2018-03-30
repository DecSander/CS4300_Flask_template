from __future__ import division
import requests
from bs4 import BeautifulSoup
import json
from tqdm import tqdm
import time
import re
import sys
import shelve

cache = shelve.open("cache.data")
last_request = 0
RATE_LIMIT = 5

try:
    with open("link_cache.json", 'r') as f:
        breed_links = json.loads(f.read())
except Exception as e:
    print e
    base = requests.get('https://wagwalking.com/breed')
    base_soup = BeautifulSoup(base.text, 'html.parser')
    breed_links = []
    for anchor in base_soup.find_all('a'):
        link = anchor.get('href', '/')
        if link.startswith('/breed'):
            name = anchor.text
            breed_links.append((link, name))

with open("link_cache.json", 'w') as f:
    f.write(json.dumps(breed_links))

def url_get(url):
    url = str(url)
    if url in cache:
        html_text = cache[url]
        if type(html_text) == unicode:
            return BeautifulSoup(html_text, 'html.parser')
        else:
            return html_text
    global last_request
    diff = time.time() - last_request
    if diff < 1/RATE_LIMIT:
        time.sleep(1/RATE_LIMIT - diff)

    last_request = time.time()
    html_text = requests.get(url).text
    cache[url] = html_text
    return BeautifulSoup(html_text, 'html.parser')

result_dict = {}
for link, name in tqdm(breed_links):
    try:
        breed_soup = url_get('https://wagwalking.com' + link)

        overview = breed_soup.find('span', class_='overview-block').find('div', class_='rich-text').text
        ancestry = breed_soup.find_all('div', class_='highlights-col')[2].find('span', class_='highlights-title').text

        try:
            major_concerns_soup = breed_soup.find('div', class_='health-stats').find('div', class_='info-box').find('div', class_='info-box-content')
            concerns = []
            for li in major_concerns_soup.find_all('li'):
                concerns.append(li.text)
        except AttributeError:
            concerns = []

        size = breed_soup.find('div', class_='gender-details').find_all('span', class_='gender-stat')[1].text
        # Weight: 12-22 lbs
        wmin, wmax = size.split("-")
        wmin = int(wmin.split()[-1])
        wmax = int(wmax.split()[0])
        size = int((wmax + wmin)/2.0)
        appearance = breed_soup.find('div', class_='appearance-section').find('div', class_='rich-text').text
        history = breed_soup.find('div', class_='history-section').find('div', class_='rich-text').text
        maintenance = breed_soup.find('div', class_='maintenance-section').find('div', class_='rich-text').text
        temperament = breed_soup.find('div', class_='activity-section').find_all('div', class_='container')[0].find('div', class_='rich-text').text
        try:
            activity = breed_soup.find('div', class_='activity-section').find_all('div', class_='container')[1].find('div', class_='rich-text').text
        except (AttributeError, IndexError):
            activity = ''

        coat_colors = None
        coat_length = None
        activity_level = None
        walk_miles = None
        activity_minutes = None
        food_monthly_cost = None
        lifespan = None
        height = None
        texture = None

        divs = breed_soup.find_all('div')
        for d in divs:
            section = d.find('div', class_='section-title')
            if section:
                text = section.text
                if text == "Coat Color Possibilities":
                    coat_colors = []
                    for x in d.find_all('div', class_=""):
                        coat_colors.append(x.text)
                elif text == "Coat Length":
                    coat_length = int(d.find_all('img')[-1].get('class')[-1].split("-")[-1])
                elif text == "Activity Level":
                    activity_level = d.find('div', class_="slider-bar").find('img').get('class')[-1].split("-")[-1]
                elif text == "Rec. Walk Mileage Per Week":
                    walk_miles = int(d.find('div', class_='item-title').text.split()[0])
                elif text == "Minutes of Activity Per Day":
                    activity_minutes = int(d.find('div', class_='item-title').text.split()[0])
                elif text == "Monthly Cost":
                    monthly_costs = d.find('div', class_="item-title").text.split(" - ")
                    minc, maxc = [float(c[1:]) for c in monthly_costs]
                    food_monthly_cost = int((maxc + minc)/2.0)
                elif text == "Coat Texture":
                    texture = d.find_all('img')[-1].get('class')[-1].split("-")[-1]

        for d in breed_soup.find_all('div', class_="link-wrapper"):
            for s in d.find_all('span', class_="nav-detail-text"):
                if "yrs" in s.text:
                    minl, maxl = s.text.split("-")
                    maxl = int(maxl[:maxl.index(" ")])
                    minl = int(minl)
                    lifespan = int((minl + maxl)/2.0)
                elif '"' in s.text:
                    minh, maxh = s.text.split("-")
                    maxh = int(maxh[:maxh.index('"')])
                    minh = int(minh)
                    height = int((minh + maxh)/2.0)


        try:
            grooming_freq = breed_soup.find('div', class_='maintenance-section').find('div', class_='slider-bar').find('img').get('class')[-1].split("-")[-1]
        except AttributeError:
            grooming_freq = ""

        ratings = {
            "Health": 0,
            "Grooming": 0,
            "Friendliness": 0,
            "Energy": 0,
            "Trainability": 0
        }
        num_ratings = {
            "Health": 0,
            "Grooming": 0,
            "Friendliness": 0,
            "Energy": 0,
            "Trainability": 0
        }

        for rating_section in breed_soup.find_all('div', class_='rating-section'):
            category = rating_section.find('div', class_="rating-description").text
            rating_imgs = [x.get('src') for x in rating_section.find('div', class_="wag-rating").find_all('img')]
            rating = sum(1 for x in rating_imgs if "icon-wag-filled" in x)
            ratings[category] += rating
            num_ratings[category] += 1

        assert(len(set(num_ratings.values())) == 1)
        if all(x > 0 for x in num_ratings.values()):
            ratings = {c:ratings[c]/num_ratings[c] for c in ratings}
        else:
            ratings = None

        reviews = [x.text.strip() for x in breed_soup.find_all('div', class_='text')]
        if not reviews:
            reviews = None
                

        results = {
            'size': size,
            'appearance': appearance,
            'history': history,
            'maintenance': maintenance,
            'temperament': temperament,
            'activity': activity,
            'overview': overview,
            'ancestry': ancestry,
            'concerns': concerns,
            'grooming_freq': grooming_freq,
            'coat_length': coat_length,
            'activity_level': activity_level,
            'walk_miles': walk_miles,
            'activity_minutes': activity_minutes,
            'food_monthly_cost': food_monthly_cost,
            'lifespan': lifespan,
            'height': height,
            'texture': texture,
            'ratings': ratings,
            'num_ratings': num_ratings.values()[0],
            'reviews': reviews,
        }
        result_dict[name] = results
        with open('wagwalking_data.json', 'w') as f:
            f.write(json.dumps(result_dict, indent=2))
    except Exception:
        import traceback
        traceback.print_exc()
        print 'Failed to retrieve dog {}'.format(name)
        sys.exit()
