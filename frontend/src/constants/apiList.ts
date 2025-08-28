export const API_LIST = [
  'Cat Facts',
  'Chuck Norris Jokes',
  'Bored API',
  'GitHub Users',
  'Weather',
  'Custom Backend',
  'Dictionary',
  'System',
] as const;

export type ApiName = (typeof API_LIST)[number];
