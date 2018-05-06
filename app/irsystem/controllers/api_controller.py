import pickle
from flask import session
import uuid as uuidmod
import os
import random
import sys
import json
from collections import defaultdict

MIN_PERCENT_MATCH = 0.10
DOGS_PER_PAGE = 10

# allow imports from root
sys.path.insert(0, os.path.dirname(__file__) + "/../")

from app.irsystem import irsystem
from app.irsystem.models.helpers import validate_json
from app.irsystem.models import schemas
from app.irsystem.src.dog_compare import get_similar
from app.irsystem.src.structured_compare import structured_score
from app.irsystem.src.freetext_compare import freetext_score, WEIGHT_EPSILON
from app.irsystem.data.doggo_data import STRUCTURED_DATA, FREETEXT_DATA, STRUCTURED_METADATA


STRUCTURED_FACTORS = ["activity_minutes", "shedding", "coat_length", "weight", "energy_level", "food_monthly_cost", "lifespan", "height", "popularity", "trainability", "temperament", "health", "grooming_frequency", "walk_miles"]


def get_structured_scores(preferences):
    preferences = {k: preferences[k] for k in STRUCTURED_FACTORS}
    return structured_score(preferences)


def write_current_search_names(uuid, dog_names, is_new_search):
    path = 'database/' + str(uuid) + ".pickle"
    if os.path.isfile(path):
        user_data = pickle.load(open(path, 'r'))
    else:
        user_data = {'exclude': [], 'liked': set(), 'disliked': []}

    if is_new_search:
        user_data['exclude'] = list(dog_names)
    else:
        user_data['exclude'] += list(dog_names)
    pickle.dump(user_data, open(path, 'w'))


def get_json_from_dog_names(dogs_scores, structured_scores=None, dog_term_weights=None, require_min=True):
    dogs = []
    for dog, score in dogs_scores:
        # Don't include dogs that are bad matches
        if require_min and score < MIN_PERCENT_MATCH:
            continue

        dog_json = {"dog_name": dog, }
        dog_images_path = 'app/static/img/scraped_images'
        dirs = os.listdir(dog_images_path)
        if dog in dirs:
            images = os.listdir(dog_images_path + '/' + dog)
            images = filter(lambda x: not x.endswith('.txt'), images)
            dog_json["images"] = ['/static/img/scraped_images/' + dog + '/' + name for name in images[0:5]]
        else:
            dog_json["images"] = []

        dog_json["description"] = FREETEXT_DATA[dog]["akc"]["blurb"]

        dog_json['percent_match'] = score

        if structured_scores is not None:
            contrib_data = structured_scores[dog]["contributions"]
            contributions = sorted(contrib_data.keys(), key=lambda x: contrib_data[x], reverse=True)[:3]
            contrib_vals = []
            for contrib in contributions:
                factor = {
                    "name": contrib,
                    "value": STRUCTURED_DATA[dog][contrib],
                    "units": STRUCTURED_METADATA[contrib]
                }
                contrib_vals.append(factor)
            dog_json["contributions"] = contrib_vals
        else:
            dog_json["contributions"] = []

        if dog_term_weights is not None:
            term_contribs = sorted(dog_term_weights[dog].items(), key=lambda x: x[1], reverse=True)
            term_contribs = [w for w, _ in term_contribs][:3]
            # total_weight = sum(t[1] for t in term_contribs)
            # term_contribs = []
            dog_json["term_contributions"] = term_contribs

        dogs.append(dog_json)
    return dogs


def updated_liked_data(uuid, dog):
    path = 'database/' + str(uuid) + ".pickle"
    if os.path.isfile(path):
        user_data = pickle.load(open(path, 'r'))
    else:
        user_data = {'exclude': [], 'liked': set(), 'disliked': []}

    user_data['liked'].add(dog)

    index = user_data['exclude'].index(dog)
    disliked = [d for d in user_data['exclude'][0:index] if d not in user_data['liked'] and d not in user_data['disliked']]
    user_data['disliked'] += disliked

    pickle.dump(user_data, open(path, 'w'))


def get_likes(uuid):
    path = 'database/' + str(uuid) + ".pickle"
    if os.path.isfile(path):
        user_data = pickle.load(open(path, 'r'))
    else:
        user_data = {'exclude': [], 'liked': set(), 'disliked': []}

    dogs_scores = ((dog, 0) for dog in user_data['liked'])
    return {"liked": get_json_from_dog_names(dogs_scores, require_min=False)}


def unlike_dog(uuid, dog_name):
    path = 'database/' + str(uuid) + ".pickle"
    if not os.path.isfile(path):
        raise ValueError("Error: Can't remove dog, unknown UUID")

    user_data = pickle.load(open(path, 'r'))
    if dog_name not in user_data['liked']:
        raise ValueError("Error: Can't remove dog, unknown UUID")

    user_data['liked'].remove(dog_name)
    user_data['disliked'].append(dog_name)

    pickle.dump(user_data, open(path, 'w'))


@irsystem.before_request
def make_session_permanent():
    session.permanent = True


@irsystem.route('/reset', methods=['DELETE'])
def reset_uuid():
    if 'uuid' not in session:
        print 'error, no uuid in cookie'
        return 'error, no uuid in cookie', 400

    uuid = session['uuid']
    path = 'database/' + str(uuid) + ".pickle"

    if not os.path.isfile(path):
        return 'error, invalid uuid', 400

    user_data = pickle.load(open(path, 'r'))
    user_data['exclude'] = []
    pickle.dump(user_data, open(path, 'w'))

    return 'Success'


def get_preferences_score(request_json):
    if 'preferences' in request_json:
        preferences = request_json['preferences']
        reformatted_preferences = {}
        for key in preferences:
            if not key.endswith("Importance"):
                try:
                    reformatted_preferences[key] = {"value": preferences[key], "importance": preferences[key + "Importance"]}
                except KeyError:
                    reformatted_preferences[key] = preferences[key]
        preferences = reformatted_preferences
        structured_scores = get_structured_scores(preferences)
        return structured_scores
    return None

def normalize_search_scores(scores):
    max_search_value = max(scores.values())
    if max_search_value == WEIGHT_EPSILON:
        normalized_search_scores = {k: 0 for k, v in scores.items()}
    else:
        normalized_search_scores = {k: v * 0.99 / float(max_search_value) for k, v in scores.items()}
    return normalized_search_scores

def get_normalized_search_score(request_json, liked_dogs):
    if 'search' in request_json:
        search_scores, dog_term_weights = freetext_score(request_json['search'], liked_dogs)
        return normalize_search_scores(search_scores), dog_term_weights
    return None, None


def get_similar_search_score(request_json):
    if 'similar' in request_json:
        similar_scores = get_similar(request_json['similar'].lower())
        return dict(similar_scores)
    return None


def merge_scores(scores):
    scores = [score for score in scores if score is not None]
    final_scores = defaultdict(int)
    for score_type in scores:
        for dog, score in score_type.items():
            final_scores[dog] += score / float(len(scores))

    output = final_scores.items()
    output.sort(key=lambda x: x[1], reverse=True)
    return output

def get_liked_dogs(uuid):
    path = 'database/' + str(uuid) + ".pickle"
    if not os.path.isfile(path):
        return []
    user_data = pickle.load(open(path, 'r'))
    return user_data['liked']


def filter_liked_dogs(uuid, dogs_scores):
    liked = get_liked_dogs(uuid)
    if not liked:
        return dogs_scores
    output = []
    for dog, score in dogs_scores:
        if dog not in liked:
            output.append((dog, score))

    return output


@irsystem.route('/get_dogs', methods=['POST'])
@validate_json(schemas.get_dogs)
def get_dogs(request_json):
    if 'uuid' not in session:
        session['uuid'] = str(uuidmod.uuid1())

    liked_dogs = get_liked_dogs(session['uuid'])

    structured_scores = get_preferences_score(request_json)
    normalized_search_scores, dog_term_weights = get_normalized_search_score(request_json, liked_dogs)
    similar_search_scores = get_similar_search_score(request_json)

    structured_num_score = {s:v["score"] for s, v in structured_scores.items()} if structured_scores is not None else None
    dogs_scores_unfiltered = merge_scores([structured_num_score, normalized_search_scores, similar_search_scores])
    dogs_scores = filter_liked_dogs(session['uuid'], dogs_scores_unfiltered)

    dog_names = [dog_score[0] for dog_score in dogs_scores]

    if 'page_number' in request_json:
        start_index = (request_json['page_number'] - 1) * DOGS_PER_PAGE
    else:
        start_index = 0
    end_index = start_index + DOGS_PER_PAGE

    write_current_search_names(session['uuid'], dog_names[start_index: end_index], start_index is 0)
    return json.dumps({"dogs": get_json_from_dog_names(dogs_scores[start_index: end_index], 
                                                        structured_scores, 
                                                        dog_term_weights=dog_term_weights)})


@irsystem.route('/get_similar', methods=['POST'])
@validate_json(schemas.get_dogs)
def get_similar_route(request_json):
    similar_dogs = get_similar(request_json['similar'].lower())
    output = {"dogs": get_json_from_dog_names(similar_dogs[0: 10])}
    return json.dumps(output)


@irsystem.route('/unlike', methods=['DELETE'])
@validate_json(schemas.liked_dog)
def unlike_dog_route(request_json):
    if 'uuid' not in session:
        print "error, no uuid in cookie"
        return "error, no uuid in cookie", 400

    uuid = session['uuid']
    unlike_dog(uuid, request_json['dog_name'])
    return 'Success', 200


@irsystem.route('/liked_dog', methods=['POST'])
@validate_json(schemas.liked_dog)
def liked_dog(request_json):
    if 'uuid' not in session:
        print "error, no uuid in cookie"
        return "error, no uuid in cookie", 400

    uuid = session['uuid']
    updated_liked_data(uuid, request_json['dog_name'])
    return 'Success', 200


@irsystem.route('/liked_dog', methods=['GET'])
def get_liked_dog():
    if 'uuid' not in session:
        print "error, no uuid in cookie"
        return json.dumps({"liked": [], "disliked": []}), 400

    uuid = session['uuid']
    return json.dumps(get_likes(uuid))
