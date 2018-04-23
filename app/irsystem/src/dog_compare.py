from __future__ import division
import json
import os, sys
import string
import unicodedata
import time
from copy import deepcopy

sys.path.insert(0, os.path.join(os.path.dirname(__file__) + "../../.."))

import freetext_compare as fc

from app.irsystem.data.doggo_data import STRUCTURED_DATA 
from app.irsystem.data.doggo_data import FREETEXT_DATA 

DELTA = 0.0001

structured = deepcopy(STRUCTURED_DATA)
free = deepcopy(FREETEXT_DATA)

def get_similar(dog1):
    dogs = {} 
    out = []
    
    count = 1
    for dog, info in structured.items():
        print(str(count) + "/" + str(len(structured.items())))
        count = count + 1
        if dog != dog1:
            dogs[dog] = compare_dog_score(dog,dog1)

    for key, score in sorted(dogs.items(), key=lambda (k,v): (v,k), reverse=True):
        out.append((key, score)) 

    return out

def compare_dogs_structured(dog1, dog2):
    if dog1 not in structured or dog2 not in structured:
        return 0
    dog1_data = structured[dog1]
    dog2_data = structured[dog2] 
    compare_structured = {}

    #converted scaled fields to integers
    dog1_data['grooming_freq_score'] = grooming_freq_text_to_int(dog1_data['grooming_freq_text'])
    dog2_data['grooming_freq_score'] = grooming_freq_text_to_int(dog2_data['grooming_freq_text'])

    dog1_data['activity_level_score'] = activity_level_to_int(dog1_data['activity_level'])
    dog2_data['activity_level_score'] = activity_level_to_int(dog2_data['activity_level'])
    
    for name, val1 in dog1_data.items():
        val2 = dog2_data[name]
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
        for name, val in compare_structured.items():
            count = count + 1
            data_sum = data_sum + val 

        compare_structured['final_score'] = data_sum / count
        
    return compare_structured

def compare_dogs_free(dog1, dog2):
    dog1_data = free[dog1]
    dog2_data = free[dog2]    

    for website, tags in dog1_data.items():
        text_data = ""
        if website in ["akc", "wagwalking"]:
            for tag, text in tags.iteritems():
                if isinstance(text, list):
                    for elem in text:
                        text_data += elem + "\n"
                elif isinstance(text, unicode):
                    text_data += text + "\n"
        else:
            if tags is not None:
                for text in tags:
                    if isinstance(text, unicode):
                        text_data+=text

    text_data = text_data.strip().replace('\n', '') 
    
    text_data = "".join(i for i in text_data if ord(i)<128 and i not in set(string.punctuation))

    if isinstance(text_data, unicode):
        text_data = unicodedata.normalize('NFKD', text_data).encode('ascii', 'ignore')
    
    free_compare = fc.freetext_score(text_data)

    if dog2 in free_compare:
        return free_compare[dog2]
    else:
        return 0

def compare_dog_score(dog1, dog2):
    struct = compare_dogs_structured(dog1, dog2)['final_score']
    free1 = compare_dogs_free(dog1, dog2)
    free2 = compare_dogs_free(dog2, dog1)

    return struct * .5 + free1 * .25 + free2 * .25
             
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
    #try:
    #    fc.load_values()
    #except IOError:
    #    fc.calc_norms()
    #print(compare_dogs_free("miniature-pinscher", "rottweiler"))
    #print(compare_dogs_free("rottweiler", "miniature-pinscher"))
    #print(json.dumps(compare_dogs("miniature-pinscher","rottweiler"), indent=4))
    #print(compare_dog_score( "rottweiler", "miniature-pinscher"))
    start = time.time()    
    print(get_similar("rottweiler"))
    end = time.time()
    print end - start
