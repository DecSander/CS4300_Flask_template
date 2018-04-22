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
        user_data = {'exclude': [], 'liked': set(), 'disliked': set()}

    if is_new_search:
        user_data['exclude'] = list(dog_names)
    else:
        user_data['exclude'] += list(dog_names)
    pickle.dump(user_data, open(path, 'w'))


def get_json_from_dog_names(dogs_scores, structured_scores=None, require_min=True):
    dogs = []
    for dog, score in dogs_scores:
        # Don't include dogs that are bad matches
        if require_min and score < MIN_PERCENT_MATCH:
            print 'score', score
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
                if contrib_data[contrib] < .01:
                    continue
                factor = {
                    "name": contrib,
                    "value": STRUCTURED_DATA[dog][contrib],
                    "units": STRUCTURED_METADATA[contrib]
                }
                contrib_vals.append(factor)
            dog_json["contributions"] = contrib_vals
        else:
            dog_json["contributions"] = []

        dogs.append(dog_json)
    return dogs


def updated_liked_data(uuid, dog):
    path = 'database/' + str(uuid) + ".pickle"
    if os.path.isfile(path):
        user_data = pickle.load(open(path, 'r'))
    else:
        user_data = {'exclude': [], 'liked': set(), 'disliked': set()}

    user_data['liked'].add(dog)

    index = user_data['exclude'].index(dog)
    disliked = [d for d in user_data['exclude'][0:index] if d not in user_data['liked']]
    user_data['disliked'].update(disliked)

    pickle.dump(user_data, open(path, 'w'))


def get_likes(uuid):
    path = 'database/' + str(uuid) + ".pickle"
    if os.path.isfile(path):
        user_data = pickle.load(open(path, 'r'))
    else:
        user_data = {'exclude': [], 'liked': set(), 'disliked': set()}

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
    user_data['disliked'].add(dog_name)

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


def get_normalized_search_score(request_json):
    if 'search' in request_json:
        _search_scores = freetext_score(request_json['search'])
        max_search_value = max(_search_scores.values())
        if max_search_value == WEIGHT_EPSILON:
            normalized_search_scores = {k: 0 for k, v in _search_scores.items()}
        else:
            normalized_search_scores = {k: v * 0.99 / float(max_search_value) for k, v in _search_scores.items()}
        return normalized_search_scores
    return None


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


def filter_liked_dogs(uuid, dogs_scores):
    path = 'database/' + str(uuid) + ".pickle"
    if not os.path.isfile(path):
        print path
        return dogs_scores
    user_data = pickle.load(open(path, 'r'))

    print 'liked', user_data['liked']
    output = []
    for dog, score in dogs_scores:
        if dog not in user_data['liked']:
            output.append((dog, score))
        else:
            print "FOUND", dog
    # output = [dogscore for dogscore in dogs_scores.oitem if dogscore[0] not in user_data['liked']]
    # print dogs_scores
    print output[0: 5]

    return output


@irsystem.route('/get_dogs', methods=['POST'])
@validate_json(schemas.get_dogs)
def get_dogs(request_json):
    if 'uuid' not in session:
        session['uuid'] = str(uuidmod.uuid1())

    structured_scores = get_preferences_score(request_json)
    normalized_search_scores = get_normalized_search_score(request_json)
    similar_search_scores = get_similar_search_score(request_json)

    dogs_scores_unfiltered = merge_scores([structured_scores, normalized_search_scores, similar_search_scores])
    dogs_scores = filter_liked_dogs(session['uuid'], dogs_scores_unfiltered)

    dog_names = [dog_score[0] for dog_score in dogs_scores]

    if 'page_number' in request_json:
        start_index = (request_json['page_number'] - 1) * DOGS_PER_PAGE
    else:
        start_index = 0
    end_index = start_index + DOGS_PER_PAGE

    write_current_search_names(session['uuid'], dog_names[start_index: end_index], start_index is 0)
    print 'again', dogs_scores[start_index: end_index]
    return json.dumps({"dogs": get_json_from_dog_names(dogs_scores[start_index: end_index], structured_scores)})


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
