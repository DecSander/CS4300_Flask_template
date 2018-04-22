import json

x = json.load(open("inv_word_doc_matrix.json", 'r'))
y = json.load(open("freetext_dataset.json", 'r'))

for word in x:
    if any(y[0] == 134 for y in x[word]):
        print(word)

print(y["spanish-mastiff"])