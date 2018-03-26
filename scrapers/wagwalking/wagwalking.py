import requests
from bs4 import BeautifulSoup
import json
from tqdm import tqdm
import time

base = requests.get('https://wagwalking.com/breed')
base_soup = BeautifulSoup(base.text, 'html.parser')

breed_links = []
for anchor in base_soup.find_all('a'):
    link = anchor.get('href', '/')
    if link.startswith('/breed'):
        name = anchor.text
        breed_links.append((link, name))

result_list = []
for link, name in tqdm(breed_links):
    time.sleep(0.5)
    try:
        first_page = requests.get('https://wagwalking.com' + link)
        breed_soup = BeautifulSoup(first_page.text, 'html.parser')

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
        appearance = breed_soup.find('div', class_='appearance-section').find('div', class_='rich-text').text
        history = breed_soup.find('div', class_='history-section').find('div', class_='rich-text').text
        maintenance = breed_soup.find('div', class_='maintenance-section').find('div', class_='rich-text').text
        temperament = breed_soup.find('div', class_='activity-section').find_all('div', class_='container')[0].find('div', class_='rich-text').text
        try:
            activity = breed_soup.find('div', class_='activity-section').find_all('div', class_='container')[1].find('div', class_='rich-text').text
        except (AttributeError, IndexError):
            activity = ''

        results = {
            'name': name,
            'size': size,
            'appearance': appearance,
            'history': history,
            'maintenance': maintenance,
            'temperament': temperament,
            'activity': activity,
            'overview': overview,
            'ancestry': ancestry,
            'concerns': concerns
        }
        result_list.append(results)
    except Exception:
        print 'Failed to retrieve dog {}'.format(name)

with open('wegwalking_data.json', 'w') as f:
    f.write(json.dumps(result_list))
