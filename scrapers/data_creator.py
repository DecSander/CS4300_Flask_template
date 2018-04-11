from __future__ import division
import json
import re
from collections import defaultdict

ww_matches = json.load(open("wwpairs.json", 'r'))
ww_matches = dict(ww_matches)
b_matches = json.load(open("b_akc_comb.json", 'r'))
b_matches = dict(b_matches)

akc_data = json.load(open("american_kennel_club/akc_data.json", 'r'))
wagwalking_data = json.load(open("wagwalking/wagwalking_data.json", 'r'))
wagwalking_data = {k.lower(): v for k, v in wagwalking_data.items()}
breedia_data = json.load(open("breedia_forum/output.json", 'r'))
breedia_data = {k.lower(): v for k, v in breedia_data.items()}


final_dataset = {}

akc_textual = ["nutrition", "Temperament:", "General_apperance", "About",
               "health", "exercise", "Facts", "training", "grooming", "Blurb"]
akc_numerical = ["Temperament/Demeanor", "Height:", "Trainability", "Energy Level",
                 "Grooming Frequency", "Life Expectancy:", "Weight:", "Shedding", "AKC Breed Popularity:", "Group:"]

ww_textual = ["temperament", "overview", "appearance", "texture",
              "reviews", "ancestry", "maintenance", "concerns", "history"]
ww_numerical = ["size", "activity_minutes", "grooming_freq", "lifespan", "ratings", "food_monthly_cost",
                "height", "num_ratings", "activity_level", "walk_miles", "coat_length", "activity"]

def depercentify(s):
    return int(s[:-1])/100.0

def flatten(l):
    return [item for sublist in l for item in sublist]

for doggo in akc_data:
    print doggo
    if doggo in ww_matches:
        ww_info = wagwalking_data[ww_matches[doggo]]
        ww_text_data = {k: ww_info[k] for k in ww_textual}
        ww_num_data = {k: ww_info[k] for k in ww_numerical}
    else:
        ww_text_data = None
        ww_num_data = None

    if doggo in b_matches:
        b_info = breedia_data[b_matches[doggo]]
        b_text_data = b_info
    else:
        b_text_data = None

    akc_info = defaultdict(lambda : None)
    akc_info.update(akc_data[doggo])
    if akc_info["Shedding"] is not None:
        akc_info["Shedding"] = depercentify(akc_info["Shedding"])

    if akc_info["Temperament/Demeanor"] is not None:
        akc_info["Temperament/Demeanor"] = depercentify(akc_info["Temperament/Demeanor"])

    if akc_info["Height"] is not None:
        height_re = re.compile(r"(\d+)-(\d+)")
        heights = map(float, flatten(height_re.findall(akc_info["Height"])))
        akc_info["Height"] = sum(heights)/len(heights)

    if akc_info["Energy Level"] is not None:
        akc_info["Energy Level"] = depercentify(akc_info["Energy Level"])

    if akc_info["Life Expectancy:"] is not None:
        life_re = re.compile(r"(\d+)-(\d+)")
        akc_info["Life Expectancy:"] = sum(map(float, flatten(life_re.findall(akc_info["Life Expectancy:"]))))/2.0

    if akc_info["AKC Breed Popularity:"] is not None:
        pop_re = re.compile(r"(\d+) of (\d+)")
        try:
            rank, total = map(int, flatten(pop_re.findall(akc_info["AKC Breed Popularity:"])))
            akc_info["AKC Breed Popularity:"] = rank/total
        except ValueError:
            akc_info["AKC Breed Popularity:"] = None

    if akc_info["Weight"] is not None:
        Weight_re = re.compile(r"(\d+)-(\d+)")
        Weights = map(float, flatten(Weight_re.findall(akc_info["Weight"])))
        akc_info["Weight"] = sum(Weights)/len(Weights)

    if akc_info["Trainability"] is not None:
        akc_info["Trainability"] = depercentify(akc_info["Trainability"])

    if akc_info["Grooming Frequency"] is not None:
        akc_info["Grooming Frequency"] = depercentify(akc_info["Grooming Frequency"])


    akc_text_data = {k: akc_info[k] for k in akc_textual}
    akc_num_data = {k: akc_info[k] for k in akc_numerical}

    final_dataset[doggo] = {"text": {
        "breedia": b_text_data,
        "wagwalking": ww_text_data,
        "akc": akc_text_data,
    },
        "structured": {
        "breedia": None,
        "wagwalking": ww_num_data,
        "akc": akc_num_data,
    }
    }

print len(final_dataset)
with open("final_dataset.json", 'w') as f:
    f.write(json.dumps(final_dataset, indent=2))