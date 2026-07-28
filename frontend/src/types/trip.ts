export interface SelectedDestinationSummary {
  id: number;
  name: string;
  state?: string;
  country: string;
  description?: string;
  imageUrl?: string;
  averageDailyCost?: number;
  bestSeason?: string;
  averageRating?: number;
  active?: boolean;
}

export interface Trip {
  tripId: number;
  creatorUserId: number;
  creatorFullName: string;
  tripName: string;
  startingLocation: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  numberOfTravellers: number;
  numberOfAdults?: number;
  numberOfChildren?: number;
  numberOfElderly?: number;
  travellerType?: string;
  travelPace?: string;
  moods?: string[];
  interests?: string[];
  totalBudget?: number;
  perPersonBudget?: number;
  budgetFlexibility?: string;
  preferredTransport?: string;
  maximumTravelDistance?: number;
  dietaryPreferences?: string;
  accessibilityRequirements?: string;
  activitiesToAvoid?: string;
  preferredWakeUpTime?: string;
  preferredSleepTime?: string;
  crowdTolerance?: number;
  maximumWalkingDistance?: number;
  selectedDestination?: SelectedDestinationSummary;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
