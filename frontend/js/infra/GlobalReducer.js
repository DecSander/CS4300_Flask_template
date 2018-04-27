import { Record, List } from 'immutable';
import { sendLike, sendResetBreeds, sendRemoveMatch } from 'infra/api';
import { preferencesDefault } from 'infra/const';

const Breed = Record({
  name: '',
  img: List(),
  match: 0,
  description: '',
  contributions: List(),
  contributingWords: List()
});

const Contribution = Record({
  name: '',
  units: '',
  value: 0
});

const SimilarDog = Record({
  name: '',
  img: ''
});

const Preferences = Record(preferencesDefault);

const GlobalState = Record({
  search: '',
  currentBreeds: List(),
  liked: List(),
  preferences: new Preferences(),
  breedsLoading: false,
  likedLoading: false,
  checkPreferences: false,
  page: 1,
  similarDogs: List(),
  retrievingSimilarDogs: false,
  failedRetrieveDogs: false,
  retrievedBreed: null
});

function buildDog(breed) {
  return new Breed({
    name: breed.dog_name,
    img: List(breed.images),
    description: breed.description,
    match: Math.round(breed.percent_match * 100),
    contributions: List(breed.contributions).map(Contribution),
    contributingWords: breed.term_contributions === undefined ? List() : List(breed.term_contributions)
  });
}

function buildSimilarDog(breed) {
  return new SimilarDog({name: breed.dog_name, img: breed.images[0]});
}

const initialState = new GlobalState();

export default function globalReducer(state = initialState, action) {
  switch (action.type) {
  case 'LIKE_BREED': {
    const current = state.currentBreeds.get(action.breed_number);
    sendLike(current.name);
    return state
      .set('currentBreeds', state.currentBreeds.splice(action.breed_number, 1))
      .set('liked', state.liked.push(current));
  }
  case 'REMOVE_MATCH':
    sendRemoveMatch(state.liked.get(action.breed_number).name);
    return state
      .set('liked', state.liked.splice(action.breed_number, 1));

  case 'CHANGE_SEARCH':
    return state
      .set('search', action.search);
  case 'UPDATE_PREFERENCE':
    localStorage[action.field] = JSON.stringify(action.value);
    return state
      .setIn(['preferences', action.field], action.value);
  case 'CHANGE_CHECK_PREFERENCES':
    return state
      .set('checkPreferences', action.selected);

  case 'REQUEST_BREEDS_START':
    return state
      .set('breedsLoading', true);
  case 'RECEIVE_BREEDS':
    return state
      .set('breedsLoading', false)
      .set('currentBreeds', state.currentBreeds.concat(List(action.breeds).map(buildDog)));
  case 'REQUEST_BREEDS_FAILED':
    return state
      .set('breedsLoading', false);

  case 'REQUEST_LIKED_START':
    return state
      .set('likedLoading', true);
  case 'RECEIVE_LIKED':
    return state
      .set('likedLoading', false)
      .set('liked', state.liked.concat(List(action.dogs).map(buildDog)));
  case 'REQUEST_LIKED_FAILED':
    return state
      .set('likedLoading', false);
  case 'RESET_BREED_LIST':
    sendResetBreeds();
    return state
      .set('page', 0)
      .set('currentBreeds', List());

  case 'INCREASE_PAGE_NUMBER':
    return state
      .set('page', state.page + 1);
  case 'RESET_PAGE_NUMBER':
    return state
      .set('currentBreeds', List())
      .set('page', 1);

  case 'REQUEST_SIMILAR_DOGS_START':
    return state
      .set('retrievedBreed', action.name)
      .set('retrievingSimilarDogs', true);
  case 'REQUEST_SIMILAR_DOGS_FAILED':
    return state
      .set('failedRetrieveDogs', true)
      .set('retrievingSimilarDogs', false);
  case 'RECEIVE_SIMILAR_DOGS':
    return state
      .set('retrievingSimilarDogs', false)
      .set('similarDogs', List(action.dogs).map(buildSimilarDog));

  default:
    return state;
  }
}
