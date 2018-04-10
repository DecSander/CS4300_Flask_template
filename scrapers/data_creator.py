import json
import pyperclip
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