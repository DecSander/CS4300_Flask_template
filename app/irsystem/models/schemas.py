import jsonschema
from jsonschema import Draft4Validator, validators


def extend_with_default(validator_class):
    validate_properties = validator_class.VALIDATORS["properties"]

    def set_defaults(validator, properties, instance, schema):
        for property, subschema in properties.iteritems():
            if "default" in subschema:
                if type(instance) == list:
                    for x in instance:
                        x.setdefault(property, subschema["default"])
                else:
                    instance.setdefault(property, subschema["default"])

        for error in validate_properties(
            validator, properties, instance, schema,
        ):
            yield error

    return validators.extend(validator_class, {"properties": set_defaults})


jsonschema = extend_with_default(Draft4Validator)


preferences = {
    "type": "object",
    "properties": {
        "preferences": {
            "type": "object",
        },
    },
    "required": ["preferences"]
}

liked_dog = {
    "type": "object",
    "properties": {
        "dog_name": {
            "type": "string",
        },
    },
    "required": ["dog_name"]
}

