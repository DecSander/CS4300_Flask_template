import GlobalStore from 'infra/GlobalStore';

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

export function requestMoreBreedsStart() {
  return GlobalStore.dispatch({
    type: 'REQUEST_BREEDS_START'
  });
}

export function receiveBreeds(breeds) {
  return GlobalStore.dispatch({
    type: 'RECEIVE_BREEDS',
    breeds
  });
}

export function requestMoreBreedsFailed() {
  return GlobalStore.dispatch({
    type: 'REQUEST_BREEDS_FAILED'
  });
}


export function requestLikedDogsStart() {
  return GlobalStore.dispatch({
    type: 'REQUEST_LIKED_START'
  });
}

export function receiveLikedDogs(dogs) {
  return GlobalStore.dispatch({
    type: 'RECEIVE_LIKED',
    dogs
  });
}

export function requestLikedDogsFailed() {
  return GlobalStore.dispatch({
    type: 'REQUEST_LIKED_FAILED'
  });
}

export function changeCheckPreferences(selected) {
  return GlobalStore.dispatch({
    type: 'CHANGE_CHECK_PREFERENCES',
    selected
  });
}

export function resetBreedList() {
  return GlobalStore.dispatch({
    type: 'RESET_BREED_LIST'
  });
}
