import { Record, List } from 'immutable';
import { requestMoreBreeds, sendLike, sendDislike } from 'infra/api';
import { updatePreference } from 'infra/GlobalActions';
import { preferencesDefault } from 'infra/const';

const Breed = Record({
  name: '',
  img: ''
});

const hardcodedBreeds = [{
  name: 'Corgi', img: '/static/img/corgi.jpg'
}, {
  name: 'Husky', img: '/static/img/husky.jpg'
}, {
  name: 'Corgi', img: '/static/img/corgi.jpg'
}, {
  name: 'Husky', img: '/static/img/husky.jpg'
}, {
  name: 'Corgi', img: '/static/img/corgi.jpg'
}, {
  name: 'Husky', img: '/static/img/husky.jpg'
}, {
  name: 'Corgi', img: '/static/img/corgi.jpg'
}];

const Preferences = Record(preferencesDefault);

const GlobalState = Record({
  currentBreeds: List(hardcodedBreeds).map(Breed),
  liked: List(),
  preferences: new Preferences(),
  isInfiniteLoading: false
});

const initialState = new GlobalState();

export default function globalReducer(state = initialState, action) {
  switch (action.type) {
  case 'RECEIVE_BREEDS':
    return state
      .set('currentBreeds', state.currentBreeds.concat(List(action.breeds).map(Breed)));
  case 'LIKE_BREED': {
    const current = state.currentBreeds.get(action.breed_number);
    sendLike(current.name);
    return state
      .set('currentBreeds', state.currentBreeds.splice(action.breed_number, 1))
      .set('liked', state.liked.push(current));
  }
  case 'UPDATE_PREFERENCE':
    localStorage[action.field] = JSON.stringify(action.value);
    return state
      .setIn(['preferences', action.field], action.value);
  case 'REQUEST_BREEDS_START':
    return state
      .set('isInfiniteLoading', true);
  case 'REQUEST_BREEDS_FAILED':
    return state
      .set('isInfiniteLoading', false);
  default:
    return state;
  }
}
