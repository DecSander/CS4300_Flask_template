from __future__ import division
import json
import os


DATA_FILE = os.path.join(os.path.dirname(os.path.realpath(__file__)), "..", "data", "final_dataset.json")

base_pickles = os.path.join(os.path.dirname(os.path.realpath(__file__)), "..", "data")

DELTA = 0.0001


def compare_dogs(dog1, dog2):
    with open(DATA_FILE, 'r') as f:
        data = json.load(f)
        if dog1 not in data or dog2 not in data:
            return 0
        dog1_data = data[dog1]
        dog2_data = data[dog2] 
        compare_structured = {}

        #converted scaled fields to integers
        dog1_data['structured']['grooming_freq_score'] = grooming_freq_text_to_int(dog1_data['structured']['grooming_freq_text'])
        dog2_data['structured']['grooming_freq_score'] = grooming_freq_text_to_int(dog2_data['structured']['grooming_freq_text'])

        dog1_data['structured']['activity_level_score'] = activity_level_to_int(dog1_data['structured']['activity_level'])
        dog2_data['structured']['activity_level_score'] = activity_level_to_int(dog2_data['structured']['activity_level'])
        
        for name, val1 in dog1_data['structured'].iteritems():
            val2 = dog2_data['structured'][name]
            if val1 == None or val1 == "" or val2 == None or val2 == "":
                continue            
            if name == 'grooming_freq_text':
                continue #calculate grooming_freq_score instead
            if name == "activity_level":
                continue #calculate activity_level_score instead
            if isinstance(val1, int) or isinstance(val1, float):
                if val1 == 0:
                    val1 = DELTA
                if val2 == 0:
                    val2 = DELTA
                compare_structured[name] = min(val1,val2) / max(val1,val2)
            elif name == "group":
                if val1 == val2:
                    compare_structured[name] = 1
                else:
                    compare_structured[name] = 0

        count = 0
        data_sum = 0
        for name, val in compare_structured.iteritems():
            count = count + 1
            data_sum = data_sum + val 

        compare_structured['final_score'] = data_sum / count
        return compare_structured

def compare_dog_score(dog1, dog2):
    return compare_dogs(dog1, dog2)['final_score']
             
def grooming_freq_text_to_int(text):
    if text == "daily":
        return 8
    if text == "weekly":
        return 4
    if text == "monthly":
        return 1
    if text == "":
        return None

def activity_level_to_int(text):
    if text == "low":
        return 1
    if text == "medium":
        return 4
    if text == "high":
        return 8
    if text == "":
        return None

if __name__ == "__main__":
    print(json.dumps(compare_dogs("miniature-pinscher","rottweiler"), indent=4))
    print(compare_dog_score( "rottweiler", "miniature-pinscher"))
