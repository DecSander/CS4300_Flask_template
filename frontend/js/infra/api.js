import { receiveBreeds, receivePreferenceValues } from 'infra/GlobalActions';

export function requestMoreBreeds() {
  fetch('/breeds')
    .then(JSON.parse)
    .then(receiveBreeds)
    .catch(console.log);
}

export function sendLike(breed) {
  fetch('/like', {
    body: JSON.stringify({ breed }),
    cache: 'no-cache',
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    }
  });
}

export function sendDislike(breed) {
  fetch('/dislike', {
    body: JSON.stringify({ breed }),
    cache: 'no-cache',
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    }
  });
}

export function requestPreferences() {
  fetch('/pref')
    .then(JSON.parse)
    .then(receivePreferenceValues)
    .catch(console.log);
}
