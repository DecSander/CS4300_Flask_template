from __future__ import division
import json
import os
from collections import namedtuple
import re
import sys

DATA_FILE = os.path.join(os.path.dirname(os.path.realpath(__file__)), "..", "data", "final_dataset.json")
WEIGHT_EPSILON = .00001

with open(DATA_FILE, 'r') as f:
    doggo_data = {k:v["structured"] for k,v in json.load(f).iteritems()}

def _scale_val(val_name):
    mi = sys.maxint
    ma = 0
    for dog, info in doggo_data.items():
        val = info[val_name]
        if val is not None:
            mi = min(val, mi)
            ma = max(val, ma)

    for dog in doggo_data:
        if doggo_data[dog][val_name] is not None:
            doggo_data[dog][val_name] = (doggo_data[dog][val_name] - mi)/(ma - mi)

_scale_val("weight")
_scale_val("lifespan")
_scale_val("food_monthly_cost")
_scale_val("height")
_scale_val("coat_length")
_scale_val("activity_minutes")
_scale_val("walk_miles")

def _score(preferences, dog):
    total_weight = sum(v["importance"]+WEIGHT_EPSILON for k,v in preferences.items() if doggo_data[dog][k] is not None)
    score = 0
    for p in preferences:
        if doggo_data[dog][p] is not None:
            importance = (preferences[p]["importance"] + WEIGHT_EPSILON) / total_weight
            similarity = 1 - abs(preferences[p]["value"] - doggo_data[dog][p])
            score += similarity * importance
    return score

def structured_score(preferences):
    return {d: _score(preferences, d) for d in doggo_data}
    


if __name__ == "__main__":
    print doggo_data['affenpinscher']
