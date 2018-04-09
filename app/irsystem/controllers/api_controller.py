import pickle
from flask import session
import uuid
import os
import random
import sys
import json

from app.irsystem import irsystem
from app.irsystem.models.helpers import validate_json
from app.irsystem.models import schemas

# allow imports from root
sys.path.insert(0, os.path.dirname(__file__) + "/../")


breeds = ['rottweiler', 'labrador', 'wolfhound', 'cairn', 'samoyed', 'greyhound', 'vizsla', 'deerhound', 'akita', 'briard', 'hound', 'pinscher', 'bullterrier', 'malinois', 'setter', 'lhasa', 'collie', 'bluetick', 'saluki', 'groenendael', 'pyrenees', 'papillon', 'doberman', 'leonberg', 'poodle', 'whippet', 'basenji', 'beagle', 'kelpie', 'entlebucher', 'shihtz', 'pekinese', 'kuvasz', 'newfoundland', 'appenzeller', 'coonhound', 'keeshond', 'shiba', 'germanshepherd', 'weimaraner', 'pug', 'schipperke', 'pomeranian', 'mountain', 'bulldog', 'pointer', 'african', 'springer', 'spaniel', 'chihuahua', 'sheepdog', 'husky', 'maltese', 'clumber', 'eskimo', 'terrier', 'stbernard', 'retriever', 'schnauzer', 'pembroke', 'komondor', 'bouvier', 'dingo', 'mastiff', 'malamute', 'mexicanhairless', 'borzoi', 'elkhound', 'ridgeback', 'dhole', 'brabancon', 'boxer', 'dachshund', 'affenpinscher', 'otterhound', 'chow', 'redbone', 'corgi', 'dane', 'airedale']
breedset = set(breeds)


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


def get_next_dog_names(uuid, preferences):
    path = 'database/' + str(uuid) + ".pickle"
    if os.path.isfile(path):
        user_data = pickle.load(open(path, 'r'))
    else:
        user_data = {'exclude': [], 'liked': set(), 'disliked': set()}

    next_dog_names = get_n_random_dogs(10, user_data['exclude'])

    user_data['exclude'] += list(next_dog_names)
    pickle.dump(user_data, open(path, 'w'))
    return next_dog_names


def get_json_from_dog_names(dog_names):
    path = 'database/dog_urls.json'
    dog_urls = json.load(open(path, 'r'))['dogs']
    dogs = []
    for dog in dog_names:
        if dog in dog_urls:
            dogs.append({"dog_name": dog, "images": dog_urls[dog][0:5]})
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

    return {"liked": get_json_from_dog_names(list(user_data['liked']))}


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
@validate_json(schemas.preferences)
def get_dogs(request_json):
    if 'uuid' not in session:
        session['uuid'] = str(uuid.uuid1())

    preferences = request_json['preferences']

    next_dog_names = get_next_dog_names(session['uuid'], preferences)
    return json.dumps({"dogs": get_json_from_dog_names(next_dog_names)}), 200


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
