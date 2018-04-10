import json
import string
import os
import pickle

wagwalking_data = json.load(open("wagwalking/wagwalking_data.json", 'r'))
breedia_data = json.load(open("breedia_forum/output.json", 'r'))
akc_data = json.load(open("american_kennel_club/akc_data.json", 'r'))

ww_dogs = set(map(lambda x:x.lower(), wagwalking_data.keys()))
b_dogs = set(map(lambda x:x.lower(), breedia_data.keys()))
akc_dogs = set(map(lambda x:x.lower(), akc_data.keys()))

breedia_equivalencies = [
    {"Collie": ["Collie (Rough)", "Collie (Smooth)"]},
    {"Dachshund": ["Dachshund (Long Haired)", "Dachshund (Smooth Haired)", "Dachshund (Wire Haired)"]},
]

def equivalent(d1, d2):
    to_remove = {"shepherd", "hound", "dog", "retriever", "terrier", "haired", "miniature", "toy", "de", "border"}
    def tokenize(d):
        d = d.lower()
        d = d.replace("-", " ")
        d = "".join(c for c in d if c in string.ascii_lowercase + " ")
        return set(d.split()) - to_remove


    t1 = tokenize(d1) 
    t2 = tokenize(d2)
    both = t1 & t2
    return float(len(both))/float(min(len(d1), len(d2)))

# needs_merging = [
#     ("Cardigan Welsh Corgi", {"breedia": "Welsh Corgi (Cardigan)", "wagwalking": "Cardigan Welsh Corgi"}),
#     ("Pembroke Welsh Corgi", {"breedia": "Welsh Corgi (Pembroke)", "wagwalking": "Pembroke Welsh Corgi"}),
#     ("Akita", {"breedia": "Akita", "wagwalking": "Akita Inu"}),
#     ("Anatolian Shepherd", {"breedia": "Anatolian Shepherd Dog", "wagwalking": "Anatolian Shepherd"}),
#     ("Silky Terrier", {"breedia": "Australian Silky Terrier", "wagwalking": "Silky Terrier"}),
#     ("Australian Cattle", {"breedia": "Australian Cattle Dog", "wagwalking": "Australian Cattle"}),
#     ("petit basset griffon vendeen", {"breedia": "basset griffon vendeen (petit)", "wagwalking": "petit basset griffon vendeen"}),
#     ("grand basset griffon vendeen", {"breedia": "basset griffon vendeen (grand)", "wagwalking": "grand basset griffon vendeen"}),
#     ("Australian Cattle", {"breedia": "Australian Cattle Dog", "wagwalking": "Australian Cattle"}),
#     ("Australian Cattle", {"breedia": "Australian Cattle Dog", "wagwalking": "Australian Cattle"}),
#     ("Australian Cattle", {"breedia": "Australian Cattle Dog", "wagwalking": "Australian Cattle"}),
#     ("Australian Cattle", {"breedia": "Australian Cattle Dog", "wagwalking": "Australian Cattle"}),
#     ("Australian Cattle", {"breedia": "Australian Cattle Dog", "wagwalking": "Australian Cattle"}),
# ]

matches = []
unmatched = []
a_done = set()

if os.path.exists('wwpairs.json'):
    with open('wwpairs.json', 'r') as f:
        x = json.load(f)
        a_done = set(y[0] for y in x)
        matches = x

if os.path.exists('wwunmatched.json'):
    with open('wwunmatched.json', 'r') as f:
        x = json.load(f)
        unmatched = x

def alnumify(s):
    s = s.replace("-", " ")
    x = set((''.join(ch for ch in s if ch.isalnum() or ch == " ")).split(" "))
    return x

# for adog in sorted(akc_dogs):
#     if adog in a_done or adog in unmatched:
#         continue
#     done = False
#     for bdog in b_dogs:
#         if alnumify(adog) == alnumify(bdog):
#             matches.append((adog, bdog))
#             done = True
#     if done:
#         continue
#     for bdog in b_dogs:
#         if equivalent(adog, bdog):
#             if alnumify(adog) == alnumify(bdog):
#                 matches.append((adog, bdog))
#                 break
#             print adog, " | ", bdog
#             x = raw_input("same (y/n):")
#             if x.lower().startswith('y'):
#                 matches.append((adog, bdog))
#                 break
#             elif x.lower().startswith('s'):
#                 unmatched.append(adog)
#                 break
#     else:
#         unmatched.append(adog)
    
#     with open('pairs.json', 'w') as f:
#         f.write(json.dumps(matches, indent=2))
#     with open('unmatched.json', 'w') as f:
#         f.write(json.dumps(unmatched, indent=2))

def is_num(s):
    try:
        int(s)
        return True
    except ValueError:
        return False

for adog in sorted(akc_dogs):
    if adog in a_done or adog in unmatched:
        continue
    done = False
    for ww_dog in ww_dogs:
        if alnumify(adog) == alnumify(ww_dog):
            matches.append((adog, ww_dog))
            done = True
    if done:
        continue
    possibilities = []
    for ww_dog in ww_dogs:
        if equivalent(adog, ww_dog):
            possibilities.append(ww_dog)
    possibilities.sort(key=lambda x: equivalent(adog, x), reverse=True)
    print "AKC Dog: ", adog
    if not possibilities:
        unmatched.append(adog)
        print "HAS NO MATCHES"
        continue
    print "="*20
    for i, d in enumerate(possibilities):
        print i,": ", d  
    x = ""
    while not is_num(x) and not x.lower().startswith('n'):
        x = raw_input("index or none (#/n): ")
    if is_num(x):
        matches.append((adog, possibilities[int(x)]))
    elif x.lower().startswith('s'):
        unmatched.append(adog)
    else:
        unmatched.append(adog)
    print "\n"
    
with open('wwpairs.json', 'w') as f:
    f.write(json.dumps(matches, indent=2))
with open('wwunmatched.json', 'w') as f:
    f.write(json.dumps(unmatched, indent=2))