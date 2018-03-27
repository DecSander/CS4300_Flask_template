import GlobalStore from 'infra/GlobalStore';

export function receiveBreeds(breeds) {
  return GlobalStore.dispatch({
    type: 'RECEIVE_BREEDS',
    breeds
  });
}

export function likeBreed(breed_number) {
  return GlobalStore.dispatch({
    type: 'LIKE_BREED',
    breed_number
  });
}

export function updatePreference(field, value) {
  return GlobalStore.dispatch({
    type: 'UPDATE_PREFERENCE',
    field, value
  });
}
