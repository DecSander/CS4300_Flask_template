import traceback
import jsonschema
from functools import wraps
from flask import request

import schemas


# Asserts request format matches schema
def validate_json(schema):
    def decorator(func):
        @wraps(func)
        def decorated_function(*args, **kwargs):
            json_data = request.get_json()
            try:
                schemas.jsonschema(schema).validate(json_data)
            except jsonschema.ValidationError as e:
                print("ERROR: JSON does contain the correct fields")
                print(traceback.format_exc())
                return "Error: json does contain the correct fields: {}".format(e), 400
            return func(json_data, *args, **kwargs)

        return decorated_function
    return decorator
