let preferencesDefaultBeforeMod = {
  keywords: '',
  activity_minutes: 0.5,
  shedding: 0.5,
  coat_length: 0.5,
  weight: 0.5,
  'energy level': 0.5,
  food_monthly_cost: 0.5,
  lifespan: 0.5,
  height: 0.5,
  'akc breed popularity': 0.5,
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

export const preferenceKeys = Object.keys(preferencesDefault);
