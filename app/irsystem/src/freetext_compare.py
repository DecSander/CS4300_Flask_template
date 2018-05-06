from __future__ import division
import json
import os
import collections
from collections import defaultdict, Counter
import numpy as np
import math
from nltk.tokenize import TreebankWordTokenizer
import string
import re
import sys
import operator
sys.path.insert(0, os.path.join(os.path.dirname(__file__) + "../../.."))
from structured_compare import structured_score


from app.irsystem.data.doggo_data import FREETEXT_DATA

base_pickles = os.path.join(os.path.dirname(os.path.realpath(__file__)), "..", "data")
# This is here in case all the weights are 0, we don't want to just fail
WEIGHT_EPSILON = .00001

ALPHA = 0.6
BETA = 0.35
GAMMA = 0.05


idf_path = os.path.join(base_pickles, 'idf.json')
norms_path = os.path.join(base_pickles, 'norms.json')
inv_word_doc_matrix_path = os.path.join(base_pickles, 'inv_word_doc_matrix.json')
dog_index_path = os.path.join(base_pickles, 'dog_index.json')

idf = None
norms = None
inv_word_doc_matrix = None
dog_index = None


def calc_norms():
    global idf, norms, inv_word_doc_matrix, dog_index
    doggo_trigrams = {}
    full_trigrams = Counter()
    doggo_data = []
    inv_dog_index = {}
    dog_index = []
    i = 0
    for dog, info in FREETEXT_DATA.iteritems():
        text_data = []
        for website, tags in info.iteritems():
            if website in ["akc", "wagwalking"]:
                for tag, text in tags.iteritems():
                    if isinstance(text, list):
                        for elem in text:
                            stripped = re.sub('[' + string.punctuation + ']', '', elem.lower())
                            text_data.append(stripped)
                    elif isinstance(text, unicode):
                        stripped = re.sub('[' + string.punctuation + ']', '', text.lower())
                        text_data.append(stripped)
            else:
                if tags is not None:
                    for text_likes in tags:
                        likes = text_likes['likes']
                        text = text_likes['text']
                        if isinstance(text, unicode):
                            stripped = re.sub('[' + string.punctuation + ']', '', text.lower())
                            text_data.append(stripped)
                            for i in range(likes):
                                text_data.append(stripped)
        tokenizer = TreebankWordTokenizer()
        text_tokens = []
        doggo_trigrams[dog] = Counter()
        for s in text_data:
            tokens = tokenizer.tokenize(s.strip().replace('\n', ' '))
            trigrams = [" ".join(x) for x in zip(tokens, tokens[1:], tokens[2:])]
            doggo_trigrams[dog].update(trigrams)
            full_trigrams.update(trigrams)
            text_tokens.extend(tokens)
        doggo_data.append(text_tokens)
        dog_index.append(dog)
        inv_dog_index[dog] = i
        i += 1

    final_doggo_trigrams = {}
    for dog in doggo_trigrams:
        final_doggo_trigrams[dog] = {}
        for trigram in doggo_trigrams[dog]:
            dog_name = set(dog.replace("-", " ").lower().split())
            if full_trigrams[trigram] > 3 and not dog_name & set(trigram.split()):
                final_doggo_trigrams[dog][trigram] = doggo_trigrams[dog][trigram] / full_trigrams[trigram]

    with open("trigram_info.json", 'w') as f:
        f.write(json.dumps(final_doggo_trigrams))

    inv_word_doc_matrix = {}
    for i in range(len(doggo_data)):
        cnt = collections.Counter()
        for word in doggo_data[i]:
            cnt[word] += 1
        for word in cnt:
            if word in inv_word_doc_matrix:
                inv_word_doc_matrix[word].append((i, cnt[word]))
            else:
                inv_word_doc_matrix[word] = [(i, cnt[word])]

    idf = {}
    for word in inv_word_doc_matrix:
        df = len(inv_word_doc_matrix[word])
        idf[word] = math.log(len(doggo_data) / (1 + df), 2)

    norms = [0] * len(doggo_data)
    for word in inv_word_doc_matrix:
        for doc_count in inv_word_doc_matrix[word]:
            if word in idf:
                norms[doc_count[0]] += (doc_count[1] * idf[word]) ** 2
    norms = np.array(norms)
    norms = np.sqrt(norms)

    json.dump(idf, open(idf_path, 'wb'))
    json.dump(norms.tolist(), open(norms_path, 'wb'))
    json.dump(inv_word_doc_matrix, open(inv_word_doc_matrix_path, 'wb'))
    json.dump(dog_index, open(dog_index_path, 'wb'))


def load_values():
    global idf, norms, inv_word_doc_matrix, dog_index
    idf = json.load(open(idf_path, 'rb'))
    norms = np.array(json.load(open(norms_path, 'rb')))
    inv_word_doc_matrix = json.load(open(inv_word_doc_matrix_path, 'rb'))
    dog_index = json.load(open(dog_index_path, 'rb'))


try:
    load_values()
except IOError:
    calc_norms()

def tokenize(query):
    q = re.sub('[' + string.punctuation + ']', '', query.lower())
    tokenizer = TreebankWordTokenizer()
    query = tokenizer.tokenize(q)
    return query

def calc_query_vector(query):
    query = tokenize(query)

    query_vector = collections.Counter([w for w in query if w in idf])
    for w, c in query_vector.iteritems():
        query_vector[w] = c * idf[w]

    return query_vector

def normalize_vector(v):
    s = sum(v.values())
    return Counter({k:v/s for k,v in v.items()})

def calc_dog_vectors(dogs):
    dog_vectors = {dog:collections.Counter() for dog in dogs}
    for word, scores in inv_word_doc_matrix.items():
        for dog_in, tf in scores:
            dog = dog_index[dog_in]
            if dog in dog_vectors:
                dog_vectors[dog][word] = tf * idf[word]
    
    # sums = {d:float(sum(score for _,score in c.items())) for d, c in dog_vectors.items()}
    # dog_vectors = {d:collections.Counter({w:score/sums[d] for w, score in dog_vectors[d].items()}) for d in dog_vectors}
    for d in dog_vectors:
        dog_vectors[d] = normalize_vector(dog_vectors[d])
    return dog_vectors

def rocchio(original_query, liked_dogs, disliked_dogs):
    print liked_dogs, disliked_dogs
    if liked_dogs is None:
        liked_dogs = []
    if disliked_dogs is None:
        disliked_dogs = []

    disliked_dogs = set(list(disliked_dogs)[:10])
    liked_dogs = set(list(liked_dogs)[:10])
    disliked_dog_vectors = calc_dog_vectors(disliked_dogs)
    liked_dog_vectors = calc_dog_vectors(liked_dogs)

    query_vector = normalize_vector(calc_query_vector(original_query))
    print query_vector

    new_vector = {}
    all_words = set(w for l in [query_vector.keys()] + [x.keys() for x in liked_dog_vectors.values()] + [x.keys() for x in disliked_dog_vectors.values()] for w in l)
    for word in all_words:
        relevant_score = BETA * (sum(d[word] for d in liked_dog_vectors.values()) / float(len(liked_dog_vectors)))
        irrelevant_score = GAMMA * (sum(d[word] for d in disliked_dog_vectors.values()) / float(len(disliked_dog_vectors)))
        original_score = ALPHA * query_vector[word]
        new_vector[word] = relevant_score + original_score - irrelevant_score

    return new_vector


def score_vector(query_vector, orig_query):
    orig_query = tokenize(orig_query)
    result = {}
    
    query_norm = 0
    doc_norms = norms + 1

    for term in query_vector:
        query_norm += (query_vector[term]) ** 2
    query_norm = math.sqrt(query_norm)

    doc_scores = [0] * len(doc_norms)
    dog_term_weights = {d:defaultdict(lambda: 0) for d in dog_index}
    for term in query_vector:
        if term in inv_word_doc_matrix and term in idf:
            for doc_count in inv_word_doc_matrix[term]:
                dog = dog_index[doc_count[0]]
                term_score = doc_count[1] * (idf[term]) * query_vector[term]
                if term in orig_query:
                    dog_term_weights[dog][term] = term_score
                doc_scores[doc_count[0]] += term_score
    for i in range(len(doc_norms)):
        doc_scores[i] = doc_scores[i] / (doc_norms[i] * query_norm)
        result[dog_index[i]] = doc_scores[i] if not np.isnan(doc_scores[i]) else WEIGHT_EPSILON
    return result, dog_term_weights


def freetext_score(query, liked_dogs=None, disliked_dogs=None):
    if liked_dogs or disliked_dogs:
        query_vector = rocchio(query, liked_dogs, disliked_dogs)
    else:
        query_vector = calc_query_vector(query)
    structured_scores = structured_score(create_form_data(query))
    free_text_scores, dog_term_weights = score_vector(query_vector, query)
    final_scores = {}
    free_weight = 0.6
    for dog in structured_scores.keys():
        final_scores[dog] = ((1-free_weight)*structured_scores[dog]["score"] + free_weight*free_text_scores[dog])/2
    return final_scores, dog_term_weights


def create_form_data(query):
    large = ["big","large", "huge"]
    small = ["small", "tiny", "little", "lapdog", "lap dog", "lap-dog"]
    mid_sized = ["medium","medium sized", "medium-sized", "midsize", "mid-size", "mid-sized","midsized"]
    chill = ["low energy", "low-energy", "chill", "lazy"]
    preferences = {}

    fields = ['activity_minutes','shedding','grooming_frequency','weight','temperament','food_monthly_cost','walk_miles','energy_level','trainability','lifespan','coat_length','popularity','health','height']
    #big and small
    for word in large:
        if word in query:
            preferences["weight"] = {"importance": 1, "value": 1}
    for word in small:
        if word in query:
            preferences["weight"] = {"importance": 1, "value": 0}
    for word in mid_sized:
        if word in query:
            preferences["weight"] = {"importance": 1, "value": 0.5}
            
    if "short" in query:
        preferences["height"] = {"importance": 1, "value": 0}
    if "tall" in query:
        preferences["height"] = {"importance": 1, "value": 1}
        
    if "high-energy" in query or "high energy" in query:
        preferences["energy_level"] = {"importance": 1, "value": 1}
    for word in chill:
        if word in query:
            preferences["energy_level"] = {"importance": 1, "value": 0}
            
    if "low-maintenance" in query or "low maintenance" in query:
        preferences["grooming_frequency"] = {"importance": 1, "value": 0}

    if "calm" in query or "chill" in query:
        preferences["temperament"] = {"importance": 1, "value": 0}
        
    if "excited" in query:
        preferences["temperament"] = {"importance": 1, "value": 1}
        
    if "trainable" in query:
        preferences["trainability"] = {"importance": 1, "value": 1}

    for field in fields:
        if field not in preferences:
            preferences[field] = {"importance": 0, "value": 1}
    return preferences
    

if __name__ == "__main__":
    scores = freetext_score("small")
    print(scores)
    sorted_scores = sorted(scores[0].items(), key=operator.itemgetter(1))
    print(sorted_scores)
