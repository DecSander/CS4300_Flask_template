import { receiveBreeds, receivePreferenceValues, requestMoreBreedsStart,
         requestMoreBreedsFailed, requestLikedDogsStart, requestLikedDogsFailed,
         receiveLikedDogs } from 'infra/GlobalActions';

export function requestMoreBreeds(preferences, sendPrefs = true) {
  requestMoreBreedsStart();
  const prefsObj = sendPrefs ? preferences.toJS() : {};
  fetch('/api/get_dogs', {
      body: JSON.stringify({preferences: prefsObj}),
      cache: 'no-cache',
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json' }
    })
    .then(response => {
      if (response.ok) return response.text();
      else throw Error(response.statusText)
    })
    .then(JSON.parse)
    .then(result => result.dogs)
    .then(receiveBreeds)
    .catch(v => {
      requestMoreBreedsFailed();
      console.log(v);
    });
}

export function sendLike(breed) {
  fetch('/api/liked_dog', {
    body: JSON.stringify({ dog_name: breed.toLowerCase() }),
    cache: 'no-cache',
    method: 'POST',
    credentials: 'include',
    headers: {
      'content-type': 'application/json'
    }
  });
}

export function getLikedDogs() {
  requestLikedDogsStart();
  fetch('/api/liked_dog', {
      credentials: 'include',
      cache: 'no-cache'
    })
    .then(response => {
      if (response.ok) return response.text();
      else throw Error(response.statusText)
    })
    .then(JSON.parse)
    .then(result => result.liked)
    .then(receiveLikedDogs)
    .catch(v => {
      requestLikedDogsFailed();
      console.log(v);
    });
}

export function sendResetBreeds() {
  fetch('/api/reset', {
    cache: 'no-cache',
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'content-type': 'application/json'
    }
  });
}

export function sendRemoveMatch(breed) {
  fetch('/api/unlike', {
    body: JSON.stringify({ dog_name: breed.toLowerCase() }),
    cache: 'no-cache',
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'content-type': 'application/json'
    }
  });
}
