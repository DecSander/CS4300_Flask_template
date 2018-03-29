import json
from flask import session

from app.irsystem import irsystem
from app.irsystem.models.helpers import validate_json
from app.irsystem.models import schemas


@irsystem.route('/preferences', methods=['POST'])
@validate_json(schemas.set_preferences)
def set_preferences(request_json):
    preferences = request_json['preferences']
    session['preferences'] = preferences
    return 'Successfully updated preferences', 200


@irsystem.route('/preferences', methods=['GET'])
def get_preferences():
    return json.dumps(session['preferences'])
