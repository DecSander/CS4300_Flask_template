let preferencesDefaultBeforeMod = {
  activity_minutes: 0.5,
  shedding: 0.5,
  coat_length: 0.5,
  weight: 0.5,
  energy_level: 0.5,
  food_monthly_cost: 0.5,
  lifespan: 0.5,
  height: 0.5,
  popularity: 0.5,
  trainability: 0.5,
  temperament: 0.5,
  health: 0.5,
  grooming_frequency: 0.5,
  walk_miles: 0.5
};

Object.keys(preferencesDefaultBeforeMod).forEach(k => {
  preferencesDefaultBeforeMod[`${k}Importance`] = 0.5;
});

export const preferencesDefault = Object.freeze(preferencesDefaultBeforeMod);

export const preferenceKeys = Object.freeze(Object.keys(preferencesDefault));

export const preferenceLabels = Object.freeze({
  activity_minutes: ['Inactive', 'Active'],
  shedding: ['Doesn\'t Shed', 'Sheds Often'],
  coat_length: ['Short', 'Long'],
  weight: ['Small', 'Big'],
  energy_level: ['Low Energy', 'High Energy'],
  food_monthly_cost: ['Cheap', 'Expensive'],
  lifespan: ['Short', 'Long'],
  height: ['Short', 'Tall'],
  popularity: ['Unpopular', 'Popular'],
  trainability: ['Stubborn', 'Easy to Train'],
  temperament: ['Calm', 'Excited'],
  health: ['Unhealthy', 'Healthy'],
  grooming_frequency: ['Infrequently', 'Frequently'],
  walk_miles: ['Rarely', 'Often']
});
