export interface UserTravelProfile {
  profileId: number;
  userId: number;
  userFullName: string;
  userEmail: string;
  preferredMoods: string[];
  interests: string[];
  defaultTravellerType?: string;
  preferredTravelPace?: string;
  preferredTransport?: string;
  maximumTravelDistance?: number;
  crowdTolerance?: number;
  maximumWalkingDistance?: number;
  dietaryPreferences?: string;
  accessibilityRequirements?: string;
  preferredWakeUpTime?: string;
  preferredSleepTime?: string;
  createdAt?: string;
  updatedAt?: string;
}
