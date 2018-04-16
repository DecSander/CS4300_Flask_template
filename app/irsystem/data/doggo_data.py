import os
import json

STRUCTURED_DATA_FILE = os.path.join(os.path.dirname(os.path.realpath(__file__)), "..", "data", "structured_dataset.json")
FREETEXT_DATA_FILE = os.path.join(os.path.dirname(os.path.realpath(__file__)), "..", "data", "freetext_dataset.json")
DOGGO_METADATA_FILE = os.path.join(os.path.dirname(os.path.realpath(__file__)), "..", "data", "structured_metadata.json")

with open(STRUCTURED_DATA_FILE, 'r') as f:
    STRUCTURED_DATA = json.load(f)

with open(FREETEXT_DATA_FILE, 'r') as f:
    FREETEXT_DATA = json.load(f)

with open(DOGGO_METADATA_FILE, 'r') as f:
    STRUCTURED_METADATA = json.load(f)
