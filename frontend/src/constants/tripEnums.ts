export const MOOD_OPTIONS = [
  { value: 'RELAXED', label: 'Relaxed' },
  { value: 'ADVENTUROUS', label: 'Adventurous' },
  { value: 'ROMANTIC', label: 'Romantic' },
  { value: 'SOCIAL', label: 'Social' },
  { value: 'SPIRITUAL', label: 'Spiritual' },
  { value: 'CURIOUS', label: 'Curious' },
  { value: 'CELEBRATORY', label: 'Celebratory' },
  { value: 'PEACEFUL', label: 'Peaceful' },
  { value: 'FOOD_FOCUSED', label: 'Food Focused' },
  { value: 'NATURE_FOCUSED', label: 'Nature Focused' },
  { value: 'ENERGETIC', label: 'Energetic' },
  { value: 'ESCAPE_FROM_STRESS', label: 'Escape from Stress' },
] as const;

export const INTEREST_OPTIONS = [
  { value: 'NATURE', label: 'Nature' },
  { value: 'ADVENTURE', label: 'Adventure' },
  { value: 'FOOD', label: 'Food' },
  { value: 'CULTURE', label: 'Culture' },
  { value: 'HISTORY', label: 'History' },
  { value: 'SHOPPING', label: 'Shopping' },
  { value: 'NIGHTLIFE', label: 'Nightlife' },
  { value: 'PHOTOGRAPHY', label: 'Photography' },
  { value: 'WILDLIFE', label: 'Wildlife' },
  { value: 'BEACHES', label: 'Beaches' },
  { value: 'MOUNTAINS', label: 'Mountains' },
  { value: 'SPIRITUAL', label: 'Spiritual' },
  { value: 'WELLNESS', label: 'Wellness' },
  { value: 'HIDDEN_GEMS', label: 'Hidden Gems' },
  { value: 'LOCAL_EXPERIENCES', label: 'Local Experiences' },
] as const;

export const TRAVELLER_TYPE_OPTIONS = [
  { value: 'SOLO', label: 'Solo' },
  { value: 'COUPLE', label: 'Couple' },
  { value: 'FRIENDS', label: 'Friends' },
  { value: 'FAMILY', label: 'Family' },
  { value: 'COLLEAGUES', label: 'Colleagues' },
  { value: 'COLLEGE_GROUP', label: 'College Group' },
  { value: 'SENIOR_CITIZENS', label: 'Senior Citizens' },
  { value: 'PARENTS_WITH_CHILDREN', label: 'Parents with Children' },
] as const;

export const TRAVEL_PACE_OPTIONS = [
  { value: 'RELAXED', label: 'Relaxed' },
  { value: 'BALANCED', label: 'Balanced' },
  { value: 'PACKED', label: 'Packed' },
] as const;

export const BUDGET_FLEXIBILITY_OPTIONS = [
  { value: 'STRICT', label: 'Strict' },
  { value: 'FIVE_PERCENT', label: 'Up to 5%' },
  { value: 'TEN_PERCENT', label: 'Up to 10%' },
  { value: 'FLEXIBLE', label: 'Flexible' },
] as const;

export type Mood = (typeof MOOD_OPTIONS)[number]['value'];
export type Interest = (typeof INTEREST_OPTIONS)[number]['value'];
export type TravellerType = (typeof TRAVELLER_TYPE_OPTIONS)[number]['value'];
export type TravelPace = (typeof TRAVEL_PACE_OPTIONS)[number]['value'];
export type BudgetFlexibility = (typeof BUDGET_FLEXIBILITY_OPTIONS)[number]['value'];
