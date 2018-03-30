import { receiveBreeds, receivePreferenceValues,
         requestMoreBreedsStart, requestMoreBreedsFailed } from 'infra/GlobalActions';

export function requestMoreBreeds(preferences) {
  requestMoreBreedsStart();
  fetch(`/breeds`, {
    body: preferences.toJS(),
    cache: 'no-cache',
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    }
  })
    .then(response => {
      if (response.ok) return response
      else throw Error(response.statusText)
    })
    .then(JSON.parse)
    .then(receiveBreeds)
    .catch(v => {
      requestMoreBreedsFailed();
      console.log(v);
    })
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
