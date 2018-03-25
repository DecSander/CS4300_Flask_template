import { Record, List } from 'immutable';
import { requestMoreBreeds, sendLike, sendDislike } from 'infra/api';

const Breed = Record({
  name: '',
  img: ''
});

const hardcodedBreeds = [{
  name: 'Corgi', img: '/static/img/corgi.jpg'
}, {
  name: 'Husky', img: '/static/img/husky.jpg'
}];

const Preferences = Record({
  keywords: ''
});

const GlobalState = Record({
  currentBreeds: List(hardcodedBreeds).map(Breed),
  liked: List(),
  disliked: List(),
  preferences: new Preferences()
});

const initialState = new GlobalState();

export default function globalReducer(state = initialState, action) {
  switch (action.type) {
  case 'RECEIVE_BREEDS':
    return state
      .set('currentBreeds', state.currentBreeds.concat(List(action.breeds).map(Breed)));
  case 'LIKE_BREED': {
    if (state.currentBreeds.size - 1 === 3) requestMoreBreeds();
    const current = state.currentBreeds.get(0);
    sendLike(current.name);
    return state
      .set('currentBreeds', state.currentBreeds.splice(0, 1))
      .set('liked', state.liked.push(current));
  }
  case 'DISLIKE_BREED': {
    if (state.currentBreeds.size - 1 === 3) requestMoreBreeds();
    const current = state.currentBreeds.get(0);
    sendDislike(current.name);
    return state
      .set('currentBreeds', state.currentBreeds.splice(0, 1))
      .set('disliked', state.disliked.push(current));
  }
  case 'UPDATE_PREFERENCE':
    return state
      .setIn(['preferences', action.field], action.value);
  case 'RECEIVE_PREFERENCE_VALUES':
    return state
      .set('preferences', state.preferences.merge(action.values));
  default:
    return state;
  }
}
