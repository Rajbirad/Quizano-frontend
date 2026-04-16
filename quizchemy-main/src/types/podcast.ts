// Podcast API Types

export interface PodcastHost {
  role: string;
  style: string;
  host_number?: number;
  voice_id?: string;
}

export interface Exchange {
  speaker: string;
  role: string;
  text: string;
  audio_url: string;
  audio_format: string;
  audio_size_bytes: number;
}

export interface Section {
  timestamp: string;
  title: string;
  turns: Exchange[];
  exchanges?: Exchange[]; // legacy fallback
}

// Legacy support
export interface DialogueSegment {
  host: string | number; // Can be voice name like "alloy" or number
  role?: string; // Optional role like "Host", "Expert"
  text: string;
  voice_id: string;
  audio_url: string;
  duration_seconds: number;
  audio_format: string;
  audio_size_bytes?: number;
  storage_type?: string;
}

export interface PodcastMetadata {
  correlation_id: string;
  processing_time: number;
  content_type: string;
  generated_at: string;
  segment_count: number;
  estimated_duration_minutes: number;
}

export interface PodcastResponse {
  id: string;
  title: string;
  description: string;
  cover_image?: string;
  cover_image_url?: string; // Presigned URL from API
  language: string;
  language_name: string;
  num_hosts: number;
  hosts: PodcastHost[];
  sections?: Section[]; // New structure
  dialogue?: DialogueSegment[]; // Legacy support
  has_audio?: boolean;
  audio_storage?: string;
  full_audio_url?: string;
  metadata: PodcastMetadata;
  created_at?: string;
  processing_time?: number;
  correlation_id?: string;
}
