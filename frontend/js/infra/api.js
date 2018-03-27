import { receiveBreeds, receivePreferenceValues } from 'infra/GlobalActions';

function getQueryString(params) {
  var esc = encodeURIComponent;
  return Object.keys(params)
    .map(k => `${k}=${esc(params[k])}`)
    .join('&');
}

export function requestMoreBreeds(preferences) {
  fetch(`/breeds?${getQueryString(preferences.toJS())}`)
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
