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

export type Reminder = {
  id: string; // UUID
  pet_id: string; // Foreign key to Pet
  type: "feeding" | "vaccination" | "vet_checkup" | "playtime";
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  time?: string[]; // Array of times (HH:MM format)
  next_due?: string; // YYYY-MM-DD format
  created_at: string; // Timestamp
  updated_at: string; // Timestamp
};
