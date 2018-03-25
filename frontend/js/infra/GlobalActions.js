import GlobalStore from 'infra/GlobalStore';

export function receiveBreeds(breeds) {
  return GlobalStore.dispatch({
    type: 'RECEIVE_BREEDS',
    breeds
  });
}

export function likeBreed() {
  return GlobalStore.dispatch({
    type: 'LIKE_BREED'
  });
}

export function dislikeBreed() {
  return GlobalStore.dispatch({
    type: 'DISLIKE_BREED'
  });
}

export function updatePreference(field, value) {
  return GlobalStore.dispatch({
    type: 'UPDATE_PREFERENCE',
    field, value
  });
}

export function receivePreferenceValues(values) {
  return GlobalStore.dispatch({
    type: 'RECEIVE_PREFERENCE_VALUES',
    values
  });
}
