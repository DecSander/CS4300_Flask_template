import pickle
from flask import session
import uuid
import os
import random
import sys
import json


MIN_PERCENT_MATCH = 0.10

# allow imports from root
sys.path.insert(0, os.path.dirname(__file__) + "/../")

from app.irsystem import irsystem
from app.irsystem.models.helpers import validate_json
from app.irsystem.models import schemas
from app.irsystem.src.structured_compare import structured_score
from app.irsystem.src.freetext_compare import freetext_score, WEIGHT_EPSILON
from app.irsystem.data.doggo_data import STRUCTURED_DATA, FREETEXT_DATA, STRUCTURED_METADATA



STRUCTURED_FACTORS = ["activity_minutes", "shedding", "coat_length", "weight", "energy_level", "food_monthly_cost", "lifespan", "height", "popularity", "trainability", "temperament", "health", "grooming_frequency", "walk_miles"]

breeds = ['rottweiler', 'labrador', 'wolfhound', 'cairn', 'samoyed', 'greyhound', 'vizsla', 'deerhound', 'akita', 'briard', 'hound', 'pinscher', 'bullterrier', 'malinois', 'setter', 'lhasa', 'collie', 'bluetick', 'saluki', 'groenendael', 'pyrenees', 'papillon', 'doberman', 'leonberg', 'poodle', 'whippet', 'basenji', 'beagle', 'kelpie', 'entlebucher', 'shihtz', 'pekinese', 'kuvasz', 'newfoundland', 'appenzeller', 'coonhound', 'keeshond', 'shiba', 'germanshepherd', 'weimaraner', 'pug', 'schipperke', 'pomeranian', 'mountain', 'bulldog', 'pointer', 'african', 'springer', 'spaniel', 'chihuahua', 'sheepdog', 'husky', 'maltese', 'clumber', 'eskimo', 'terrier', 'stbernard', 'retriever', 'schnauzer', 'pembroke', 'komondor', 'bouvier', 'dingo', 'mastiff', 'malamute', 'mexicanhairless', 'borzoi', 'elkhound', 'ridgeback', 'dhole', 'brabancon', 'boxer', 'dachshund', 'affenpinscher', 'otterhound', 'chow', 'redbone', 'corgi', 'dane', 'airedale']
breedset = set(breeds)


def get_structured_scores(preferences):
    preferences = {k: preferences[k] for k in STRUCTURED_FACTORS}
    return structured_score(preferences)


def get_n_random_dogs(n, exclude=frozenset()):
    output = []
    exclude = set(exclude)
    available = breedset - exclude
    for i in range(0, 10):
        if len(available) == 0:
            return output
        next_dog = random.sample(available, 1)[0]
        available -= set([next_dog])
        output.append(next_dog)
    return output


def write_dog_names(uuid, dog_names):
    path = 'database/' + str(uuid) + ".pickle"
    if os.path.isfile(path):
        user_data = pickle.load(open(path, 'r'))
    else:
        user_data = {'exclude': [], 'liked': set(), 'disliked': set()}

    user_data['exclude'] += list(dog_names)
    pickle.dump(user_data, open(path, 'w'))


def get_json_from_dog_names(dog_names, search_scores=None, structured_scores=None, require_min=True):
    dogs = []
    for dog in dog_names:
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

        if structured_scores and search_scores:
            dog_json['percent_match'] = (structured_scores[dog]['score'] + search_scores[dog]) / 2
        elif structured_scores:
            dog_json['percent_match'] = structured_scores[dog]['score']
        elif search_scores:
            dog_json['percent_match'] = search_scores[dog]
        else:
            dog_json['percent_match'] = None

        # Don't include dogs that are bad matches
        if require_min and \
          (dog_json['percent_match'] is None or dog_json['percent_match'] < MIN_PERCENT_MATCH):
            print "dog_json['percent_match']", dog_json['percent_match']
            continue

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

    print 'uuid', uuid
    return {"liked": get_json_from_dog_names(list(user_data['liked']), require_min=False)}

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


@irsystem.route('/get_dogs', methods=['POST'])
@validate_json(schemas.get_dogs)
def get_dogs(request_json):
    if 'uuid' not in session:
        session['uuid'] = str(uuid.uuid1())

    structured_scores = None
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

    normalized_search_scores = None
    if 'search' in request_json:
        _search_scores = freetext_score(request_json['search'])
        max_search_value = max(_search_scores.values())
        if max_search_value == WEIGHT_EPSILON:
            normalized_search_scores = {k: 0 for k, v in _search_scores.items()}
        else:
            normalized_search_scores = {k: v * 0.99 / float(max_search_value) for k, v in _search_scores.items()}

    if normalized_search_scores is not None:
        search_dog_names = sorted(normalized_search_scores.keys(), key=lambda x: normalized_search_scores[x], reverse=True)
    if structured_scores is not None:
        structured_dog_names = sorted(structured_scores.keys(), key=lambda x: structured_scores[x]["score"], reverse=True)

    if structured_scores is None and normalized_search_scores is None:
        return 'Nothing supplied', 400
    elif structured_scores is None:  # search only
        # Update user session information
        write_dog_names(session['uuid'], search_dog_names[:10])
        return json.dumps({"dogs": get_json_from_dog_names(search_dog_names[:10], normalized_search_scores, None)})
    elif normalized_search_scores is None:  # preferences only
        # Update user session information
        write_dog_names(session['uuid'], search_dog_names[:10])
        return json.dumps({"dogs": get_json_from_dog_names(structured_dog_names[:10], None, structured_scores)})
    else:  # both
        combined_scores = {}
        for dog in structured_dog_names:
            if dog in structured_scores:
                combined_scores[dog] = (normalized_search_scores[dog] + structured_scores[dog]['score']) / 2
        combined_dog_names = sorted(combined_scores.keys(), key=lambda x: combined_scores[x], reverse=True)[:10]
        # Update user session information
        write_dog_names(session['uuid'], combined_dog_names)
        return json.dumps({"dogs": get_json_from_dog_names(combined_dog_names, normalized_search_scores, structured_scores)})


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
