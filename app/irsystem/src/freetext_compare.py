from __future__ import division
import json
import os
import collections
import numpy as np
import math
from nltk.tokenize import TreebankWordTokenizer
import string
import re
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__) + "../../.."))

from app.irsystem.data.doggo_data import FREETEXT_DATA

base_pickles = os.path.join(os.path.dirname(os.path.realpath(__file__)), "..", "data")
# This is here in case all the weights are 0, we don't want to just fail
WEIGHT_EPSILON = .00001

ALPHA = 0.8
BETA = 1 - ALPHA


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
                            text_data.append(elem)
                    elif isinstance(text, unicode):
                        text_data.append(text)
            else:
                if tags is not None:
                    for text in tags:
                        if isinstance(text, unicode):
                            text_data.append(text)
        tokenizer = TreebankWordTokenizer()
        text_tokens = []
        for s in text_data:
            text_tokens.extend(tokenizer.tokenize(s.strip().replace('\n', ' ')))
        doggo_data.append(text_tokens)
        dog_index.append(dog)
        inv_dog_index[dog] = i
        i += 1

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

def calc_query_vector(query):
    q = re.sub('[' + string.punctuation + ']', '', query.lower())
    tokenizer = TreebankWordTokenizer()
    query = tokenizer.tokenize(q)

    query_vector = collections.Counter(query)
    for w, c in query_vector.iteritems():
        query_vector[w] = c * idf[w]

    return query_vector

def calc_dog_vectors(dogs):
    dog_vectors = {dog:collections.Counter() for dog in dogs}
    for word, scores in inv_word_doc_matrix.items():
        for dog_in, tf in scores:
            dog = dog_index[dog_in]
            if dog in dog_vectors:
                dog_vectors[dog][word] = tf * idf[word]

    return dog_vectors

def rocchio(original_query, liked_dogs):
    dog_vectors = calc_dog_vectors(liked_dogs)
    query_vector = calc_query_vector(original_query)

    new_vector = {}
    all_words = [w for l in [query_vector.keys()] + [x.keys() for x in dog_vectors.values()] for w in l]
    for word in all_words:
        relevant_score = BETA * (sum(d[word] for d in dog_vectors.values()) / float(len(dog_vectors)))
        original_score = ALPHA * query_vector[word]
        new_vector[word] = relevant_score + original_score

    return new_vector


def score_vector(query_vector):
    result = {}
    
    query_norm = 0
    doc_norms = norms + 1

    for term in query_vector:
        query_norm += (query_vector[term]) ** 2
    query_norm = math.sqrt(query_norm)

    doc_scores = [0] * len(doc_norms)
    for term in query_vector:
        if term in inv_word_doc_matrix and term in idf:
            for doc_count in inv_word_doc_matrix[term]:
                doc_scores[doc_count[0]] += doc_count[1] * (idf[term]) * query_vector[term]
    for i in range(len(doc_norms)):
        doc_scores[i] = doc_scores[i] / (doc_norms[i] * query_norm)
        result[dog_index[i]] = doc_scores[i] if not np.isnan(doc_scores[i]) else WEIGHT_EPSILON
    return result


def freetext_score(query):
    return score_vector(calc_query_vector(query))


def get_more_matches(original_query, liked_dogs):
    print "RUnning Rocchio", liked_dogs
    new_query_vector = rocchio(original_query, liked_dogs)
    return score_vector(new_query_vector)

if __name__ == "__main__":
    print get_more_matches("Small cute fluffy", ["mastiff"])["mastiff"]
    print "\n"
    print freetext_score("Small cute fluffy")["mastiff"]
