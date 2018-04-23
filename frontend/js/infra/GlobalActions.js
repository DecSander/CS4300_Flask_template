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

export function removeMatch(breed_number) {
  return GlobalStore.dispatch({
    type: 'REMOVE_MATCH',
    breed_number
  });
}

export function changeSearch(search) {
  return GlobalStore.dispatch({
    type: 'CHANGE_SEARCH',
    search
  });
}

export function increasePageNumber() {
  return GlobalStore.dispatch({
    type: 'INCREASE_PAGE_NUMBER'
  });
}

export function resetPageNumber() {
  return GlobalStore.dispatch({
    type: 'RESET_PAGE_NUMBER'
  });
}

export function requestSimilarDogsStart(name) {
  return GlobalStore.dispatch({
    type: 'REQUEST_SIMILAR_DOGS_START',
    name
  });
}

export function requestSimilarDogsFailed() {
  return GlobalStore.dispatch({
    type: 'REQUEST_SIMILAR_DOGS_FAILED'
  });
}

export function receiveSimilarDogs(dogs) {
  return GlobalStore.dispatch({
    type: 'RECEIVE_SIMILAR_DOGS',
    dogs
  });
}
