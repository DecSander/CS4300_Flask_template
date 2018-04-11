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

akc_textual = ["nutrition", "temperament", "general_apperance", "about",
               "health", "exercise", "facts", "training", "grooming", "blurb"]
akc_numerical = ["temperament/demeanor", "height", "trainability", "energy level",
                 "grooming frequency", "life expectancy", "weight", "shedding", "akc breed popularity", "group"]

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
    better_dict = {}
    x = akc_info.items()
    for key, val in x:
        new_key = key.replace(":", "").lower()
        del akc_info[key]
        akc_info[new_key] = val

    if akc_info["shedding"] is not None:
        akc_info["shedding"] = depercentify(akc_info["shedding"])

    if akc_info["temperament/demeanor"] is not None:
        akc_info["temperament/demeanor"] = depercentify(akc_info["temperament/demeanor"])

    if akc_info["height"] is not None:
        height_re = re.compile(r"(\d+)")
        heights = map(float, flatten(height_re.findall(akc_info["height"])))
        akc_info["height"] = sum(heights)/len(heights)

    if akc_info["energy level"] is not None:
        akc_info["energy level"] = depercentify(akc_info["energy level"])

    if akc_info["life expectancy"] is not None:
        life_re = re.compile(r"(\d+)")
        akc_info["life expectancy"] = sum(map(float, flatten(life_re.findall(akc_info["life expectancy"]))))/2.0

    if akc_info["akc breed popularity"] is not None:
        pop_re = re.compile(r"(\d+) of (\d+)")
        try:
            rank, total = map(int, flatten(pop_re.findall(akc_info["akc breed popularity"])))
            akc_info["akc breed popularity"] = rank/total
        except ValueError:
            akc_info["akc breed popularity"] = None

    if akc_info["weight"] is not None:
        Weight_re = re.compile(r"(\d+)")
        try:
            Weights = map(float, flatten(Weight_re.findall(akc_info["weight"])))
            akc_info["weight"] = sum(Weights)/len(Weights)
        except (ValueError, ZeroDivisionError):
            akc_info["weight"] = None


    if akc_info["trainability"] is not None:
        akc_info["trainability"] = depercentify(akc_info["trainability"])

    if akc_info["grooming frequency"] is not None:
        akc_info["grooming frequency"] = depercentify(akc_info["grooming frequency"])


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