from __future__ import division
import json
import os
import sys
from copy import deepcopy

sys.path.insert(0, os.path.join(os.path.dirname(__file__) + "../../.."))

from app.irsystem.data.doggo_data import STRUCTURED_DATA

# This is here in case all the weights are 0, we don't want to just fail
WEIGHT_EPSILON = .00001
CONFIDENCE_THRESHOLD = 0.1
scaled_doggo_data = deepcopy(STRUCTURED_DATA)

def _scale_val(val_name):
    mi = sys.maxint
    ma = 0
    for dog, info in scaled_doggo_data.items():
        val = info[val_name]
        if val is not None:
            mi = min(val, mi)
            ma = max(val, ma)

    for dog in scaled_doggo_data:
        if scaled_doggo_data[dog][val_name] is not None:
            scaled_doggo_data[dog][val_name] = (scaled_doggo_data[dog][val_name] - mi) / (ma - mi)


_scale_val("weight")
_scale_val("lifespan")
_scale_val("food_monthly_cost")
_scale_val("height")
_scale_val("coat_length")
_scale_val("activity_minutes")
_scale_val("walk_miles")


def _score(preferences, dog):
    total_weight = sum(v["importance"] + WEIGHT_EPSILON for k, v in preferences.items() if scaled_doggo_data[dog][k] is not None)
    actual_weight = sum(v["importance"] + WEIGHT_EPSILON for k, v in preferences.items())
    score = 0
    contributions = {}
    for p in preferences:
        if scaled_doggo_data[dog][p] is not None:
            importance = (preferences[p]["importance"] + WEIGHT_EPSILON) / total_weight
            similarity = 1 - abs(preferences[p]["value"] - scaled_doggo_data[dog][p])
            contributions[p] = (similarity * importance) / total_weight
            score += similarity * importance
        else:
            contributions[p] = 0

    confidence = total_weight / actual_weight
    if confidence < CONFIDENCE_THRESHOLD:
        score = 0
    return {"score": score, "confidence": confidence, "contributions": contributions}


def structured_score(preferences):
    return {d: _score(preferences, d) for d in scaled_doggo_data}


if __name__ == "__main__":
    print scaled_doggo_data['affenpinscher']
