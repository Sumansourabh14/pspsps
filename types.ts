export type Pet = {
  id: string; // UUID
  user_id: string; // Owner's user ID
  name: string;
  species?: "cat"; // Defaults to 'cat' for now
  breed?: string;
  birth_date: string; // YYYY-MM-DD format
  gender?: "male" | "female" | "unknown";
  weight?: number; // In kg
  created_at: string; // Timestamp
  updated_at: string; // Timestamp
};

// Reminders
// Enum for reminder types (added vet_checkup and playtime)
enum ReminderType {
  Deworming = "deworming",
  FeedingWet = "feeding_wet",
  FeedingDry = "feeding_dry",
  NailCutting = "nail_cutting",
  LitterCleaning = "litter_cleaning",
  Vaccination = "vaccination",
  VetCheckup = "vet_checkup", // New: Regular vet visits
  Playtime = "playtime", // New: Scheduled play sessions
}

// Enum for frequency types (unchanged)
enum Frequency {
  Daily = "daily",
  Weekly = "weekly",
  Monthly = "monthly",
  Yearly = "yearly",
  Custom = "custom",
}

// Interface for a single reminder (unchanged structure, just updated type usage)
interface Reminder {
  id: string; // Unique identifier for the reminder
  petId: string; // Reference to the pet
  type: ReminderType; // Now includes vet_checkup and playtime
  title: string; // Short description
  frequency: Frequency; // How often the reminder repeats
  interval?: number; // Custom interval in days (optional, for Frequency.Custom)
  startDate: string; // ISO date string (e.g., "2025-03-01T08:00:00Z")
  lastCompleted?: string; // ISO date string of last completion (optional)
  nextDue: string; // ISO date string for the next occurrence
  notes?: string; // Optional notes
  isActive: boolean; // Whether the reminder is active or paused
}

// Reminders collection type (unchanged)
type RemindersCollection = Reminder[];
