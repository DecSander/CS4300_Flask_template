import { Record, List } from 'immutable';
import { requestMoreBreeds, sendLike, sendDislike, sendResetBreeds,
         sendRemoveMatch } from 'infra/api';
import { preferencesDefault } from 'infra/const';

const Breed = Record({
  name: '',
  img: List(),
  match: 0,
  description: '',
  contributions: List()
});

const Contribution = Record({
  name: '',
  units: '',
  value: 0
});

const Preferences = Record(preferencesDefault);

const GlobalState = Record({
  search: '',
  currentBreeds: List(),
  liked: List(),
  preferences: new Preferences(),
  breedsLoading: false,
  likedLoading: false,
  checkPreferences: false
});

function buildDog(breed) {
  return new Breed({
    name: breed.dog_name,
    img: List(breed.images),
    description: breed.description,
    match: Math.round(breed.percent_match * 100),
    contributions: List(breed.contributions).map(Contribution)
  });
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
      .set('currentBreeds', List(action.breeds).map(buildDog));
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
      .set('currentBreeds', List());
  default:
    return state;
  }
}
