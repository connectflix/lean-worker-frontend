// lib/types.ts
import type { ReactNode } from "react";

export type Me = {
  id: number;
  auth_provider: string;
  provider_user_id: string;
  email?: string | null;
  email_verified: boolean;
  display_name: string;
  given_name?: string | null;
  family_name?: string | null;
  avatar_url?: string | null;
  locale?: string | null;
  language: string;

  onboarding_completed: boolean;
  current_role?: string | null;
  industry?: string | null;
  primary_goal?: string | null;
  main_challenge?: string | null;
  improvement_focus?: string | null;
  preferred_coaching_style?: string | null;

  profile_update_suspected: boolean;
  profile_last_confirmed_at?: string | null;
};

export type SessionCreateResponse = {
  session_id: number;
  status: string;
  started_at: string;
};

export type ConversationTurnResponse = {
  session_id: number;
  user_message: string;
  agent_message: string;
  coach_mode: string;
  coach_intent: string;
};

export type VoiceTurnResponse = {
  session_id: number;
  user_message: string;
  agent_message: string;
  audio_base64: string;
  mime_type: string;
  coach_mode: string;
  coach_intent: string;
};

export type VoiceTranscriptionResponse = {
  transcript: string;
};

export type Lever = {
  id: number;
  name: string;
  type: string;
  url?: string | null;
  provider_type?: string;
  is_paid?: boolean;
  price_min_eur?: number | null;
  price_max_eur?: number | null;
  currency?: string;
  is_highlighted?: boolean;
  display_rank?: number;
  match_reason?: string | null;
};

export type OfferType = "base" | "upsell" | "cross_sell";

export type OfferFormat =
  | "ebook"
  | "audiobook"
  | "session"
  | "program"
  | "job_opportunity"
  | "resource"
  | "unknown";

export type PromotionType = "percentage" | "fixed_amount" | "bundle_discount";

export type PromotionScope =
  | "offer"
  | "offer_type"
  | "lever_category"
  | "format"
  | "bundle";

export type PromotionRuleResponse = {
  code: string;
  name: string;
  description?: string | null;

  promotion_type: PromotionType;
  scope: PromotionScope;

  is_active: boolean;

  percentage_value?: number | null;
  fixed_amount_eur?: number | null;
  bundle_price_eur?: number | null;

  applicable_offer_type?: OfferType | null;
  applicable_lever_category?: string | null;
  applicable_format?: OfferFormat | null;

  starts_at?: string | null;
  ends_at?: string | null;

  badge_text?: string | null;
  marketing_message?: string | null;
};

export type AppliedPromotionResponse = {
  code: string;
  name: string;
  promotion_type: PromotionType;

  badge_text?: string | null;
  marketing_message?: string | null;

  original_price_eur: number;
  discounted_price_eur: number;
  discount_amount_eur: number;
};

export type OfferItemResponse = {
  lever_id?: number | null;
  lever_name: string;
  lever_category: string;

  offer_type: OfferType;
  format: OfferFormat;

  title: string;
  subtitle?: string | null;
  description?: string | null;

  is_paid: boolean;
  currency: string;

  original_price_eur?: number | null;
  final_price_eur?: number | null;
  price_min_eur?: number | null;
  price_max_eur?: number | null;

  provider_type?: string;
  url?: string | null;

  is_highlighted?: boolean;
  display_rank?: number;

  match_reason?: string | null;
  commercial_reason?: string | null;

  applied_promotions?: AppliedPromotionResponse[];
  metadata?: Record<string, unknown>;
};

export type OfferEngineResponse = {
  recommendation_id: number;

  base_offer?: OfferItemResponse | null;
  upsell_offers: OfferItemResponse[];
  cross_sell_offers: OfferItemResponse[];

  available_promotions: PromotionRuleResponse[];
  promotions_applied: AppliedPromotionResponse[];

  show_upgrade: boolean;
  show_cross_sell: boolean;
  urgency_badge?: string | null;
  marketing_message?: string | null;
};

export type Recommendation = {
  id: number;
  title: string;
  description: string;
  primary_problem?: string | null;
  action_track?: string | null;
  why_recommended?: string | null;
  priority: string;
  status: "open" | "in_progress" | "completed" | "dismissed";
  artifact_generation_available?: boolean;
  artifact_default_format?: string | null;
  artifact_price_min_eur?: number | null;
  artifact_price_max_eur?: number | null;
  user_note?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  levers?: Lever[];
  offers?: OfferEngineResponse | null;
};

export type AIArtifactOutlineSection = {
  title?: string;
};

export type AIArtifactOutline = {
  sections?: AIArtifactOutlineSection[];
};

export type AIArtifactPreviewResponse = {
  recommendation_id?: number;
  lever_id?: number;
  available: boolean;

  default_format?: "ebook" | "audiobook" | null;
  format?: "ebook" | "audiobook";

  price_min_eur?: number | null;
  price_max_eur?: number | null;

  artifact_price_min_eur?: number | null;
  artifact_price_max_eur?: number | null;
  estimated_price_eur: number;

  suggested_title?: string | null;
  suggested_goal?: string | null;
  summary?: string | null;

  title: string;
  subtitle?: string | null;
  goal?: string | null;
  lever_name?: string | null;
  outline_json?: AIArtifactOutline | null;
};

export type AIArtifactCreateRequest = {
  recommendation_id: number;
  format: "ebook" | "audiobook";
  upsell?: boolean;
};

export type AIArtifactResponse = {
  id: number;
  user_id: number;
  session_id: number | null;
  recommendation_id: number;
  lever_id: number | null;
  format: string;
  status: string;
  title: string;
  subtitle?: string | null;
  goal?: string | null;
  target_action?: string | null;
  source_problem_summary?: string | null;
  personalization_context_json?: Record<string, unknown> | null;
  estimated_effort_score?: number | null;
  price_eur: number;
  outline_json?: Record<string, unknown> | null;
  content_markdown?: string | null;
  audio_script_text?: string | null;
  file_url?: string | null;
  audio_url?: string | null;
  cover_url?: string | null;
  generation_notes?: string | null;
  error_message?: string | null;
  created_at: string;
  updated_at: string;
};

export type AIArtifactStatusResponse = {
  id: number;
  recommendation_id?: number;
  status: string;
  format: string;
  title: string;
  price_eur: number;
  file_url?: string | null;
  audio_url?: string | null;
  error_message?: string | null;
  updated_at: string;
};

export type SessionCloseResponse = {
  session_id: number;
  status: string;
  summary: string;
};

export type SessionHistoryItem = {
  session_id: number;
  status: string;
  summary?: string | null;
  started_at: string;
  ended_at?: string | null;
};

export type OpenSessionResponse = {
  session_id: number;
  status: string;
  started_at: string;
};

export type TranscriptTurn = {
  speaker: "user" | "agent";
  text: string;
  created_at: string;
  coach_mode?: string;
  coach_intent?: string;
};

export type SessionDetail = {
  session_id: number;
  status: string;
  summary?: string | null;
  started_at: string;
  ended_at?: string | null;
  transcript: TranscriptTurn[];
};

export type ProblemDetection = {
  id: number;
  session_id: number;
  primary_problem: string;
  secondary_problems: string[];
  problem_domain: string;
  severity: string;
  urgency: string;
  recommended_action_tracks: string[];
  recommended_lever_types: string[];
  rationale: string;
  created_at: string;
};

export type DashboardSummary = {
  recommendation_stats: {
    open: number;
    in_progress: number;
    completed: number;
    dismissed: number;
    total: number;
    completion_rate: number;
  };
  problem_trends: {
    top_primary_problem?: string | null;
    top_secondary_problems: string[];
    average_severity?: string | null;
    average_urgency?: string | null;
  };
  session_count: number;
  top_lever_types_used: {
    lever_type: string;
    count: number;
  }[];
  recent_sessions: {
    session_id: number;
    status: string;
    summary?: string | null;
    started_at: string;
    ended_at?: string | null;
  }[];
  recent_recommendations: {
    id: number;
    title: string;
    status: string;
    priority: string;
    created_at: string;
  }[];
};

export type DashboardTimelineItem = {
  session_id: number;
  started_at: string;
  ended_at?: string | null;
  primary_problem?: string | null;
  severity?: string | null;
  urgency?: string | null;
  completed_recommendations: number;
  total_recommendations: number;
};

/* ---------------- ADMIN LEVERS ---------------- */

export type AdminLever = {
  id: number;
  category: string;
  name: string;
  description: string;
  url: string | null;
  tags: string[];
  target_problem: string[];
  provider_type?: string;
  is_paid?: boolean;
  price_min_eur?: number | null;
  price_max_eur?: number | null;
  currency?: string;
  is_default?: boolean;
  priority_score?: number;
  is_active: boolean;
  created_at: string;
};

export type AdminLeverCreate = {
  category: string;
  name: string;
  description: string;
  url?: string | null;
  tags: string[];
  target_problem: string[];
  provider_type?: string;
  is_paid?: boolean;
  price_min_eur?: number | null;
  price_max_eur?: number | null;
  currency?: string;
  is_default?: boolean;
  priority_score?: number;
  is_active?: boolean;
};

export type AdminLeverUpdate = Partial<AdminLeverCreate> & {
  is_active?: boolean;
};

export type AdminLoginResponse = {
  access_token: string;
  token_type: string;
};

export type AdminChangePasswordRequest = {
  current_password: string;
  new_password: string;
  confirm_new_password: string;
};

export type AdminChangePasswordResponse = {
  success: boolean;
  message: string;
};

export type AdminStatusToggleResponse = {
  id: number;
  is_active: boolean;
};

export type AdminMe = {
  id: number;
  email: string;
  role: "admin" | "organization";
  organization_id?: number | null;
  organization_name?: string | null;
  organization_code?: string | null;
  organization_type?: string | null;
  is_active: boolean;
};

/* ---------------- ADMIN WORKERS / SUBSCRIPTIONS ---------------- */

export type AdminSubscriptionPack = "standard" | "classique" | "flix" | "executif";

export type AdminWorkerSubscriptionSummary = {
  id?: number | null;
  pack: AdminSubscriptionPack | string;
  status: "active" | "inactive" | "cancelled" | "past_due" | string;
  billing_cycle: "monthly" | "yearly" | "custom" | string;

  monthly_price_eur: number;
  annual_price_eur?: number | null;
  total_paid_eur: number;

  started_at?: string | null;
  current_period_start?: string | null;
  current_period_end?: string | null;
  cancelled_at?: string | null;

  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
};

export type AdminWorker = {
  id: number;
  auth_provider: string;
  provider_user_id: string;

  email?: string | null;
  email_verified: boolean;

  display_name: string;
  given_name?: string | null;
  family_name?: string | null;
  avatar_url?: string | null;

  locale?: string | null;
  language: string;

  onboarding_completed: boolean;

  current_role?: string | null;
  industry?: string | null;
  primary_goal?: string | null;
  main_challenge?: string | null;
  improvement_focus?: string | null;
  preferred_coaching_style?: string | null;

  profile_update_suspected: boolean;
  profile_last_confirmed_at?: string | null;

  business_id?: string | null;
  location?: string | null;
  phone_number?: string | null;
  subscription_pack: AdminSubscriptionPack;
  profession?: string | null;
  organization_id?: number | null;

  total_spent_eur?: number;
  paid_artifacts_count?: number;
  artifacts_spent_eur?: number;
  subscription_total_paid_eur?: number;
  active_subscription?: AdminWorkerSubscriptionSummary | null;

  created_at: string;

  is_manually_created?: boolean;
  linkedin_linked_at?: string | null;
};

export type AdminWorkerCreate = {
  email: string;
  display_name: string;
  given_name?: string | null;
  family_name?: string | null;
  language?: string | null;
  business_id?: string | null;
  location?: string | null;
  phone_number?: string | null;
  subscription_pack?: AdminSubscriptionPack | null;
  profession?: string | null;
  organization_id?: number | null;
};

export type AdminWorkerUpdate = {
  business_id?: string | null;
  location?: string | null;
  phone_number?: string | null;
  subscription_pack?: AdminSubscriptionPack | null;
  profession?: string | null;
};

export type AdminSubscriptionPlan = {
  pack: AdminSubscriptionPack | string;
  label: string;
  monthly_price_eur: number;
  annual_price_eur?: number | null;
  billing_cycles: string[];
  is_contact_sales: boolean;
  description?: string | null;
};

export type AdminWorkerSubscriptionUpdate = {
  pack: AdminSubscriptionPack;
  status: "active" | "inactive" | "cancelled" | "past_due";
  billing_cycle: "monthly" | "yearly" | "custom";

  monthly_price_eur?: number | null;
  annual_price_eur?: number | null;
  total_paid_eur?: number | null;

  current_period_start?: string | null;
  current_period_end?: string | null;

  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
};

/* ---------------- ADMIN WORKER CONVERSATIONS ---------------- */

export type AdminWorkerConversation = {
  id: number;
  worker_id: number;
  title: string;
  source_type: "url" | "upload";
  source_label?: string | null;
  video_url?: string | null;
  file_path?: string | null;
  conversation_date?: string | null;
  transcript?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
};

export type AdminWorkerConversationCreate = {
  worker_id: number;
  title: string;
  source_type: "url" | "upload";
  source_label?: string | null;
  video_url?: string | null;
  file_path?: string | null;
  conversation_date?: string | null;
  transcript?: string | null;
  notes?: string | null;
};

export type AdminWorkerConversationUpdate = {
  title?: string | null;
  source_type?: "url" | "upload" | null;
  source_label?: string | null;
  video_url?: string | null;
  file_path?: string | null;
  conversation_date?: string | null;
  transcript?: string | null;
  notes?: string | null;
};

/* ---------------- ADMIN WORKER ENGAGEMENTS ---------------- */

export type AdminWorkerEngagementState = "current" | "future";
export type AdminWorkerEngagementStatus = "draft" | "finalized";
export type AdminWorkerEngagementCoherenceStatus = "coherent" | "watch" | "critical";

export type AdminWorkerEngagementCoherenceFlag = {
  code: string;
  level: "low" | "medium" | "high";
  message: string;
  related_blocks: string[];
};

export type AdminWorkerEngagement = {
  id: number;
  worker_id: number;
  state_type: AdminWorkerEngagementState;
  status: AdminWorkerEngagementStatus;
  title: string;

  identity_text?: string | null;
  purpose_text?: string | null;
  missions_text?: string | null;
  ambitions_text?: string | null;

  career_intent_compensation?: string | null;
  career_intent_role?: string | null;
  career_intent_passion_criteria?: string | null;
  career_intent_collaboration_profile?: string | null;
  career_intent_performance_level?: string | null;
  career_intent_responsibilities?: string | null;

  vision_text?: string | null;
  actions_text?: string | null;
  objectives_text?: string | null;

  talent_intent_foundations?: string | null;
  talent_intent_personality?: string | null;
  talent_intent_watch?: string | null;
  talent_intent_next_level?: string | null;
  talent_intent_impact_niches?: string | null;
  talent_intent_social_contributions?: string | null;

  coherence_status: AdminWorkerEngagementCoherenceStatus;
  coherence_summary?: string | null;
  coherence_flags: AdminWorkerEngagementCoherenceFlag[];

  is_finalized: boolean;
  finalized_at?: string | null;

  created_at: string;
  updated_at: string;
};

export type AdminWorkerEngagementCreate = {
  worker_id: number;
  state_type: AdminWorkerEngagementState;
  title: string;

  identity_text?: string | null;
  purpose_text?: string | null;
  missions_text?: string | null;
  ambitions_text?: string | null;

  career_intent_compensation?: string | null;
  career_intent_role?: string | null;
  career_intent_passion_criteria?: string | null;
  career_intent_collaboration_profile?: string | null;
  career_intent_performance_level?: string | null;
  career_intent_responsibilities?: string | null;

  vision_text?: string | null;
  actions_text?: string | null;
  objectives_text?: string | null;

  talent_intent_foundations?: string | null;
  talent_intent_personality?: string | null;
  talent_intent_watch?: string | null;
  talent_intent_next_level?: string | null;
  talent_intent_impact_niches?: string | null;
  talent_intent_social_contributions?: string | null;

  is_finalized?: boolean;
};

export type AdminWorkerEngagementUpdate = {
  title?: string | null;

  identity_text?: string | null;
  purpose_text?: string | null;
  missions_text?: string | null;
  ambitions_text?: string | null;

  career_intent_compensation?: string | null;
  career_intent_role?: string | null;
  career_intent_passion_criteria?: string | null;
  career_intent_collaboration_profile?: string | null;
  career_intent_performance_level?: string | null;
  career_intent_responsibilities?: string | null;

  vision_text?: string | null;
  actions_text?: string | null;
  objectives_text?: string | null;

  talent_intent_foundations?: string | null;
  talent_intent_personality?: string | null;
  talent_intent_watch?: string | null;
  talent_intent_next_level?: string | null;
  talent_intent_impact_niches?: string | null;
  talent_intent_social_contributions?: string | null;

  is_finalized?: boolean | null;
};

/* ---------------- ADMIN WORKER PURPOSE CANVASES ---------------- */

export type AdminWorkerPurposeRelationStatus = "pending" | "coherent" | "incoherent";

export type AdminWorkerPurposeRelation = {
  from?: string;
  to?: string;
  source?: string;
  target?: string;
  source_node_key?: string;
  target_node_key?: string;
  source_label?: string | null;
  target_label?: string | null;
  status: AdminWorkerPurposeRelationStatus | string;
  is_coherent?: boolean;
  reason?: string | null;
  rationale?: string | null;
};

export type AdminWorkerPurposeCoherenceStatus =
  | "not_evaluated"
  | "coherent"
  | "partially_coherent"
  | "incoherent"
  | string;

export type AdminWorkerPurposeCanvas = {
  id: number;
  worker_id: number;

  travail_text?: string | null;
  aspiration_text?: string | null;
  inspiration_text?: string | null;
  passion_text?: string | null;
  vocation_text?: string | null;
  formation_text?: string | null;

  coherence_score: number;
  coherence_status: AdminWorkerPurposeCoherenceStatus;
  coherence_summary?: string | null;
  relation_map_json: AdminWorkerPurposeRelation[] | Record<string, unknown>[];

  created_at: string;
  updated_at: string;
};

export type AdminWorkerPurposeCanvasCreate = {
  worker_id: number;

  travail_text?: string | null;
  aspiration_text?: string | null;
  inspiration_text?: string | null;
  passion_text?: string | null;
  vocation_text?: string | null;
  formation_text?: string | null;

  coherence_score?: number;
  coherence_status?: AdminWorkerPurposeCoherenceStatus;
  coherence_summary?: string | null;
  relation_map_json?: AdminWorkerPurposeRelation[] | Record<string, unknown>[];
};

export type AdminWorkerPurposeCanvasUpdate = {
  travail_text?: string | null;
  aspiration_text?: string | null;
  inspiration_text?: string | null;
  passion_text?: string | null;
  vocation_text?: string | null;
  formation_text?: string | null;

  coherence_score?: number | null;
  coherence_status?: AdminWorkerPurposeCoherenceStatus | null;
  coherence_summary?: string | null;
  relation_map_json?: AdminWorkerPurposeRelation[] | Record<string, unknown>[] | null;
};

/* ---------------- ADMIN WORKER SIGNIFICANCE CANVASES ---------------- */

export type AdminWorkerSignificanceDimensionKey =
  | "raison"
  | "metier"
  | "occupation"
  | "corvee"
  | "hobby";

export type AdminWorkerSignificanceAnswerValue = "yes" | "no" | "maybe" | "unknown";

export type AdminWorkerSignificanceCoherenceStatus =
  | "not_evaluated"
  | "balanced"
  | "dominant"
  | "fragmented"
  | "tension"
  | string;

export type AdminWorkerSignificanceScoreMap = Record<
  AdminWorkerSignificanceDimensionKey,
  number
>;

export type AdminWorkerSignificanceQuestionAnswer = {
  value: AdminWorkerSignificanceAnswerValue;
  label: string;
  scores: AdminWorkerSignificanceScoreMap;
};

export type AdminWorkerSignificanceQuestionOption = AdminWorkerSignificanceQuestionAnswer;

export type AdminWorkerSignificanceQuestion = {
  id: number;
  key?: string | null;
  order?: number | null;
  text: string;
  answers: AdminWorkerSignificanceQuestionAnswer[];
  options?: AdminWorkerSignificanceQuestionOption[] | null;
};

export type AdminWorkerSignificanceAnswer = {
  question_id: number;
  question_key?: string | null;
  question_text?: string | null;

  answer: AdminWorkerSignificanceAnswerValue;
  answer_value?: AdminWorkerSignificanceAnswerValue | string | null;
  answer_key?: AdminWorkerSignificanceAnswerValue | string | null;
  answer_label?: string | null;

  scores?: AdminWorkerSignificanceScoreMap | null;
};

export type AdminWorkerSignificanceStoredAnswer = Partial<AdminWorkerSignificanceAnswer> &
  Record<string, unknown>;

export type AdminWorkerSignificanceDimension = {
  key: AdminWorkerSignificanceDimensionKey;
  label: string;
  score: number;
  percentage: number;
  tone?: string;
};

export type AdminWorkerSignificanceCanvas = {
  id: number;
  worker_id: number;

  title?: string | null;

  answers_json: AdminWorkerSignificanceStoredAnswer[];

  raw_scores_json?: AdminWorkerSignificanceScoreMap | Record<string, unknown> | null;
  scores_json?: AdminWorkerSignificanceScoreMap | Record<string, unknown> | null;
  percentages_json?: AdminWorkerSignificanceScoreMap | Record<string, unknown> | null;
  dimensions_json?: AdminWorkerSignificanceDimension[] | Record<string, unknown>[] | null;

  raison_score?: number;
  metier_score?: number;
  occupation_score?: number;
  corvee_score?: number;
  hobby_score?: number;

  total_score?: number;

  raison_percent?: number;
  metier_percent?: number;
  occupation_percent?: number;
  corvee_percent?: number;
  hobby_percent?: number;

  dominant_section?: AdminWorkerSignificanceDimensionKey | string | null;
  dominant_dimension?: AdminWorkerSignificanceDimensionKey | string | null;
  dominant_percent?: number;

  perception_summary?: string | null;
  analysis_summary?: string | null;
  coherence_status?: AdminWorkerSignificanceCoherenceStatus | null;

  created_at: string;
  updated_at: string;
};

export type AdminWorkerSignificanceCanvasCreate = {
  worker_id: number;
  title?: string | null;

  answers_json?: AdminWorkerSignificanceStoredAnswer[];

  raw_scores_json?: AdminWorkerSignificanceScoreMap | Record<string, unknown> | null;
  scores_json?: AdminWorkerSignificanceScoreMap | Record<string, unknown> | null;
  percentages_json?: AdminWorkerSignificanceScoreMap | Record<string, unknown> | null;
  dimensions_json?: AdminWorkerSignificanceDimension[] | Record<string, unknown>[] | null;

  dominant_section?: AdminWorkerSignificanceDimensionKey | string | null;
  dominant_dimension?: AdminWorkerSignificanceDimensionKey | string | null;

  perception_summary?: string | null;
  analysis_summary?: string | null;
  coherence_status?: AdminWorkerSignificanceCoherenceStatus | null;
};

export type AdminWorkerSignificanceCanvasUpdate = {
  title?: string | null;

  answers_json?: AdminWorkerSignificanceStoredAnswer[] | null;

  raw_scores_json?: AdminWorkerSignificanceScoreMap | Record<string, unknown> | null;
  scores_json?: AdminWorkerSignificanceScoreMap | Record<string, unknown> | null;
  percentages_json?: AdminWorkerSignificanceScoreMap | Record<string, unknown> | null;
  dimensions_json?: AdminWorkerSignificanceDimension[] | Record<string, unknown>[] | null;

  dominant_section?: AdminWorkerSignificanceDimensionKey | string | null;
  dominant_dimension?: AdminWorkerSignificanceDimensionKey | string | null;

  perception_summary?: string | null;
  analysis_summary?: string | null;
  coherence_status?: AdminWorkerSignificanceCoherenceStatus | null;
};

export type AdminWorkerSignificanceCanvasComputedResult = {
  scores: AdminWorkerSignificanceScoreMap;
  percentages: AdminWorkerSignificanceScoreMap;
  total_score: number;
  dominant_section?: AdminWorkerSignificanceDimensionKey | string | null;
  dominant_dimension?: AdminWorkerSignificanceDimensionKey | string | null;
  dominant_percent: number;
  perception_summary?: string | null;
  analysis_summary: string;
  coherence_status?: AdminWorkerSignificanceCoherenceStatus | null;
};

export type AdminWorkerSignificanceQuestionsResponse = {
  questions: AdminWorkerSignificanceQuestion[];
};

/* ---------------- ADMIN WORKER TIME CANVASES ---------------- */

export type AdminWorkerTimeCanvasReadinessStatus =
  | "not_evaluated"
  | "ready"
  | "partially_ready"
  | "at_risk"
  | string;

export type AdminWorkerTimeCanvas = {
  id: number;
  worker_id: number;

  available_time_text?: string | null;
  time_constraints_text?: string | null;
  time_energy_text?: string | null;
  time_rituals_text?: string | null;
  time_priorities_text?: string | null;
  time_risks_text?: string | null;

  readiness_score?: number | null;
  readiness_status?: AdminWorkerTimeCanvasReadinessStatus | null;
  summary_text?: string | null;

  created_at: string;
  updated_at: string;
};

export type AdminWorkerTimeCanvasCreate = {
  worker_id: number;

  available_time_text?: string | null;
  time_constraints_text?: string | null;
  time_energy_text?: string | null;
  time_rituals_text?: string | null;
  time_priorities_text?: string | null;
  time_risks_text?: string | null;

  readiness_score?: number | null;
  readiness_status?: AdminWorkerTimeCanvasReadinessStatus | null;
  summary_text?: string | null;
};

export type AdminWorkerTimeCanvasUpdate = {
  available_time_text?: string | null;
  time_constraints_text?: string | null;
  time_energy_text?: string | null;
  time_rituals_text?: string | null;
  time_priorities_text?: string | null;
  time_risks_text?: string | null;

  readiness_score?: number | null;
  readiness_status?: AdminWorkerTimeCanvasReadinessStatus | null;
  summary_text?: string | null;
};

/* ---------------- ADMIN BOOKINGS ---------------- */

export type AdminBookingStatus =
  | "requested"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show"
  | string;

export type AdminBooking = {
  id: number;

  worker_id?: number | null;
  organization_id?: number | null;

  title: string;
  description?: string | null;

  booking_type?: string | null;
  status: AdminBookingStatus;

  starts_at?: string | null;
  ends_at?: string | null;
  timezone?: string | null;

  location?: string | null;
  meeting_url?: string | null;

  source: string;
  external_provider?: string | null;

  external_event_uri?: string | null;
  external_invitee_uri?: string | null;
  external_event_type_uri?: string | null;

  cancel_url?: string | null;
  reschedule_url?: string | null;

  invitee_email?: string | null;
  invitee_name?: string | null;

  worker_email?: string | null;
  worker_display_name?: string | null;

  organization_name?: string | null;
  organization_code?: string | null;

  price_eur?: number | null;
  notes?: string | null;

  external_payload_json?: Record<string, unknown> | null;

  created_at: string;
  updated_at: string;
};

export type AdminBookingCreate = {
  worker_id?: number | null;
  organization_id?: number | null;

  title: string;
  description?: string | null;

  booking_type?: string | null;
  status?: AdminBookingStatus | null;

  starts_at?: string | null;
  ends_at?: string | null;
  timezone?: string | null;

  location?: string | null;
  meeting_url?: string | null;

  source?: string | null;
  external_provider?: string | null;

  external_event_uri?: string | null;
  external_invitee_uri?: string | null;
  external_event_type_uri?: string | null;

  cancel_url?: string | null;
  reschedule_url?: string | null;

  invitee_email?: string | null;
  invitee_name?: string | null;

  price_eur?: number | null;
  notes?: string | null;

  external_payload_json?: Record<string, unknown> | null;
};

export type AdminBookingUpdate = Partial<AdminBookingCreate>;

export type AdminCalendlySyncRequest = {
  organization_id?: number | null;
  worker_id?: number | null;
  status?: string | null;
  event_type_uri?: string | null;
  days_past?: number | null;
  days_future?: number | null;
};

export type AdminCalendlySyncResponse = {
  provider: "calendly" | string;
  scanned_events: number;
  scanned_invitees: number;
  created_count: number;
  updated_count: number;
  skipped_count: number;
  bookings: AdminBooking[];
  message: string;
};

export type AdminCalendlyAvailableTime = {
  start_time: string;
  scheduling_url?: string | null;
  status: "available" | string;
  event_type_uri: string;
  raw_payload?: Record<string, unknown> | null;
};

export type AdminCalendlyAvailabilityResponse = {
  provider: "calendly" | string;
  event_type_uri: string;
  start_time: string;
  end_time: string;
  available_times: AdminCalendlyAvailableTime[];
  available_count: number;
  message: string;
};

/* ---------------- CAREER / PROFILE ---------------- */

export type ProfileResponse = {
  given_name?: string | null;
  current_role?: string | null;
  industry?: string | null;
  primary_goal?: string | null;
  main_challenge?: string | null;
  improvement_focus?: string | null;
  preferred_coaching_style?: string | null;
  profile_update_suspected: boolean;
  profile_last_confirmed_at?: string | null;
};

export type ProfileUpdatePayload = {
  current_role?: string | null;
  industry?: string | null;
  primary_goal?: string | null;
  main_challenge?: string | null;
  improvement_focus?: string | null;
  preferred_coaching_style?: string | null;
};

export type CareerLevel = "Starter" | "Junior" | "Senior" | "Expert" | "Master" | "Elite";

export type CareerHorizonPayload = {
  target_compensation?: string | null;
  target_role?: string | null;
  target_level?: CareerLevel | null;
};

export type StartingPointPayload = {
  my_profession_percent: number;
  my_work_percent: number;
  chore_percent: number;
  destiny_percent: number;
  hobby_percent: number;
};

export type CareerBlueprintResponse = {
  id: number;
  user_id: number;
  identity_text?: string | null;
  vision_text?: string | null;
  talent_focus_text?: string | null;
  career_focus_text?: string | null;
  inspiration_person?: string | null;
  aspiration_person?: string | null;
  short_term_mission?: CareerHorizonPayload | null;
  mid_term_ambition?: CareerHorizonPayload | null;
  long_term_goal?: CareerHorizonPayload | null;
  starting_point?: StartingPointPayload | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
};

export type CareerBlueprintUpsertPayload = {
  identity_text?: string | null;
  vision_text?: string | null;
  talent_focus_text?: string | null;
  career_focus_text?: string | null;
  inspiration_person?: string | null;
  aspiration_person?: string | null;
  short_term_mission?: CareerHorizonPayload | null;
  mid_term_ambition?: CareerHorizonPayload | null;
  long_term_goal?: CareerHorizonPayload | null;
  starting_point?: StartingPointPayload | null;
  is_completed: boolean;
};

export type CareerGapResponse = {
  current_role?: string | null;
  short_term_role?: string | null;
  short_term_level?: string | null;
  mid_term_role?: string | null;
  mid_term_level?: string | null;
  long_term_role?: string | null;
  long_term_level?: string | null;
  role_gap_short_term: boolean;
  role_gap_mid_term: boolean;
  role_gap_long_term: boolean;
  level_gap_mid_term: boolean;
  level_gap_long_term: boolean;
  profession_percent?: number | null;
  work_percent?: number | null;
  chore_percent?: number | null;
  destiny_percent?: number | null;
  hobby_percent?: number | null;
  key_gap_summary?: string | null;
};

export type CareerTrajectoryResponse = {
  current_position: string | null;
  target_position: string | null;
  strategic_bridge: string | null;
  trajectory_summary: string | null;
} | null;

/* ---------------- ADMIN ORGANIZATIONS ---------------- */

export type AdminOrganizationType = "agent_flix" | "agent_premium" | "agent_de_reve";

export type AdminOrganization = {
  id: number;
  name: string;
  code?: string | null;
  organization_type: AdminOrganizationType;
  description?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  calendly_event_type_uri?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type AdminOrganizationCreate = {
  name: string;
  code?: string | null;
  organization_type?: AdminOrganizationType;
  description?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  calendly_event_type_uri?: string | null;
  is_active?: boolean | null;
};

export type AdminOrganizationUpdate = {
  name?: string | null;
  code?: string | null;
  organization_type?: AdminOrganizationType | null;
  description?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  calendly_event_type_uri?: string | null;
  is_active?: boolean | null;
};

export type AdminOrganizationAccessAccountCreate = {
  email?: string | null;
  temporary_password?: string | null;
};

export type AdminOrganizationAccessAccount = {
  admin_user_id: number;
  organization_id: number;
  email: string;
  role: "organization" | string;
  is_active: boolean;
  temporary_password: string;
  created_new_account: boolean;
  message: string;
};

export type AdminOrganizationDetail = {
  organization: AdminOrganization;
  workers: AdminWorker[];
};

export type AdminOrganizationWorkerLeverSummary = {
  id: number;
  name: string;
  category: string;
  description: string;
  url?: string | null;
  provider_type?: string;
  is_paid?: boolean;
  price_min_eur?: number | null;
  price_max_eur?: number | null;
  currency?: string;
  is_active: boolean;
  is_default?: boolean;
  priority_score?: number;
  usage_count: number;
  recommendation_ids: number[];
  match_reasons: string[];
  is_highlighted: boolean;
  best_display_rank?: number | null;
};

export type AdminOrganizationWorkerSummary = {
  worker: AdminWorker;
  career_blueprint: CareerBlueprintResponse | null;
  sessions: SessionHistoryItem[];
  recommendations: Recommendation[];
  artifacts: AIArtifactStatusResponse[];
  levers: AdminOrganizationWorkerLeverSummary[];
  session_count: number;
  external_conversation_count: number;
  recommendation_count: number;
  artifact_count: number;
  lever_count: number;
};

/* ---------------- ADMIN DASHBOARD / INTELLIGENCE ---------------- */

export type AdminDashboardCategoryStat = {
  category: string;
  count: number;
};

export type AdminDashboardRecentLever = {
  id: number;
  category: string;
  name: string;
  is_active: boolean;
  created_at: string;
};

export type AdminDashboardSummary = {
  total_levers: number;
  active_levers: number;
  inactive_levers: number;
  category_breakdown: AdminDashboardCategoryStat[];
  recent_levers: AdminDashboardRecentLever[];
};

export type AdminProblemFrequencyItem = {
  problem: string;
  count: number;
};

export type AdminLeverUsageItem = {
  lever_id: number;
  name: string;
  category: string;
  is_active: boolean;
  usage_count: number;
};

export type AdminUnusedLeverItem = {
  lever_id: number;
  name: string;
  category: string;
  is_active: boolean;
};

export type AdminIntelligenceSummary = {
  total_problem_detections: number;
  top_primary_problems: AdminProblemFrequencyItem[];
  top_secondary_problems: AdminProblemFrequencyItem[];
  most_used_levers: AdminLeverUsageItem[];
  unused_levers: AdminUnusedLeverItem[];
};

export type AdminCoverageGapItem = {
  problem: string;
  detection_count: number;
  active_lever_count: number;
  inactive_lever_count: number;
  matching_lever_names: string[];
  severity: "critical" | "high" | "medium" | "low";
};

export type AdminCoverageSummary = {
  total_distinct_problems: number;
  coverage_gaps: AdminCoverageGapItem[];
};

export type AdminLeverQualityItem = {
  lever_id: number;
  name: string;
  category: string;
  is_active: boolean;
  usage_count: number;
  target_problem_count: number;
  tag_count: number;
  quality_score: number;
  quality_label: "excellent" | "strong" | "average" | "weak";
  reasons: string[];
};

export type AdminLeverQualitySummary = {
  total_levers: number;
  top_quality_levers: AdminLeverQualityItem[];
  lowest_quality_levers: AdminLeverQualityItem[];
};

/* ---------------- ADMIN SUPPORT / OPS AGENTS ---------------- */

export type AdminSupportTriageCategory =
  | "auth_login"
  | "payment_issue"
  | "artifact_access_generation"
  | "recommendation_quality"
  | "onboarding_confusion"
  | "technical_bug"
  | "feature_request"
  | "trust_safety"
  | "other";

export type AdminSupportTriageSeverity = "P1" | "P2" | "P3" | "P4";

export type AdminSupportTriageOwner =
  | "support_resolution"
  | "tech_ops"
  | "business_ops"
  | "founder";

export type AdminSupportTriageRequest = {
  message: string;
  language: string;
  user_email?: string | null;
  user_id?: number | null;
  source?: string | null;
};

export type AdminSupportTriageResponse = {
  summary: string;
  category: AdminSupportTriageCategory;
  severity: AdminSupportTriageSeverity;
  confidence: number;
  likely_causes: string[];
  recommended_owner: AdminSupportTriageOwner;
  recommended_actions: string[];
  founder_escalation: boolean;
};

export type AdminSupportResolutionRequest = {
  message: string;
  language: string;
  triage_category: AdminSupportTriageCategory;
  triage_severity: AdminSupportTriageSeverity;
  triage_owner: AdminSupportTriageOwner;
  founder_escalation: boolean;
  user_email?: string | null;
  user_id?: number | null;
  source?: string | null;
};

export type AdminSupportResolutionResponse = {
  user_reply: string;
  internal_summary: string;
  resolution_checks: string[];
  suggested_next_step: string;
  escalate: boolean;
  escalation_reason?: string | null;
  confidence: number;
};

export type AdminTechSignalType =
  | "auth_error"
  | "api_error"
  | "webhook_failure"
  | "artifact_generation_failure"
  | "availability_alert"
  | "frontend_runtime_error"
  | "unknown";

export type AdminTechSignalSource =
  | "render"
  | "vercel"
  | "stripe"
  | "backend"
  | "frontend"
  | "manual_test"
  | "unknown";

export type AdminTechEnvironment = "production" | "staging" | "development";

export type AdminTechIncidentStatus = "healthy" | "watch" | "incident";

export type AdminTechIncidentType =
  | "auth_failure"
  | "api_failure"
  | "webhook_failure"
  | "artifact_generation_failure"
  | "availability_issue"
  | "frontend_runtime_issue"
  | "configuration_issue"
  | "unknown";

export type AdminTechIncidentSeverity = "critical" | "high" | "medium" | "low";

export type AdminTechOpsMonitoringRequest = {
  signal_type: AdminTechSignalType;
  signal_source: AdminTechSignalSource;
  message: string;
  language: string;
  environment: AdminTechEnvironment;
  context?: Record<string, string | number | boolean | null> | null;
};

export type AdminTechOpsMonitoringResponse = {
  status: AdminTechIncidentStatus;
  incident_detected: boolean;
  incident_type: AdminTechIncidentType;
  severity: AdminTechIncidentSeverity;
  summary: string;
  likely_causes: string[];
  recommended_checks: string[];
  escalate: boolean;
  escalation_reason?: string | null;
  confidence: number;
};

export type AdminBusinessSignalType =
  | "payment_signal"
  | "unlock_signal"
  | "artifact_signal"
  | "engagement_signal"
  | "funnel_signal"
  | "retention_signal"
  | "unknown";

export type AdminBusinessSignalSource =
  | "stripe"
  | "backend"
  | "dashboard"
  | "analytics"
  | "manual_test"
  | "unknown";

export type AdminBusinessEnvironment = "production" | "staging" | "development";

export type AdminBusinessIssueStatus = "healthy" | "watch" | "issue";

export type AdminBusinessIssueType =
  | "payment_conversion_issue"
  | "post_payment_unlock_issue"
  | "artifact_delivery_issue"
  | "recommendation_engagement_issue"
  | "funnel_drop_issue"
  | "retention_risk"
  | "business_configuration_issue"
  | "unknown";

export type AdminBusinessIssueSeverity = "critical" | "high" | "medium" | "low";

export type AdminBusinessOpsMonitoringRequest = {
  signal_type: AdminBusinessSignalType;
  signal_source: AdminBusinessSignalSource;
  message: string;
  language: string;
  environment: AdminBusinessEnvironment;
  context?: Record<string, string | number | boolean | null> | null;
};

export type AdminBusinessOpsMonitoringResponse = {
  status: AdminBusinessIssueStatus;
  issue_detected: boolean;
  issue_type: AdminBusinessIssueType;
  severity: AdminBusinessIssueSeverity;
  summary: string;
  likely_causes: string[];
  recommended_checks: string[];
  escalate: boolean;
  escalation_reason?: string | null;
  confidence: number;
};

/* ---------------- CHIEF OF STAFF / BRIEFING / ORCHESTRATION ---------------- */

export type AdminChiefOfStaffOverallHealth = "healthy" | "watch" | "critical";

export type AdminChiefOfStaffRequest = {
  language: string;
  support_summary?: string | null;
  tech_ops_summary?: string | null;
  business_ops_summary?: string | null;
  founder_notes?: string | null;
  context?: Record<string, string | number | boolean | null> | null;
};

export type AdminChiefOfStaffResponse = {
  executive_summary: string;
  overall_health: AdminChiefOfStaffOverallHealth;
  top_priorities: string[];
  key_risks: string[];
  recommended_decisions: string[];
  recommended_owner_actions: string[];
  founder_attention_required: boolean;
  founder_attention_reason?: string | null;
  confidence: number;
};

export type AdminDailyBriefingHealthStatus = "healthy" | "watch" | "critical";

export type AdminDailyBriefingRequest = {
  language: string;
  support_summary?: string | null;
  tech_ops_summary?: string | null;
  business_ops_summary?: string | null;
  chief_of_staff_summary?: string | null;
  founder_notes?: string | null;
  context?: Record<string, string | number | boolean | null> | null;
};

export type AdminDailyBriefingResponse = {
  daily_overview: string;
  health_status: AdminDailyBriefingHealthStatus;
  new_important_signals: string[];
  open_operational_points: string[];
  things_improving: string[];
  things_worsening: string[];
  today_priorities: string[];
  owner_action_list: string[];
  founder_focus?: string | null;
  confidence: number;
};

export type AdminOrchestrationScenario =
  | "support_case_flow"
  | "ops_incident_flow"
  | "daily_management_flow"
  | "growth_followup_flow"
  | "customer_experience_flow";

export type AdminOrchestrationStatus = "success" | "partial" | "failed";

export type AdminOrchestrationOptions = {
  include_intermediate_results?: boolean;
  force_chief_of_staff?: boolean;
  force_daily_briefing?: boolean;
  force_customer_experience?: boolean;
};

export type AdminOrchestrationRequest = {
  scenario: AdminOrchestrationScenario;
  language: string;
  input_payload: Record<string, unknown>;
  options?: AdminOrchestrationOptions;
};

export type AdminOrchestrationResponse = {
  scenario: AdminOrchestrationScenario;
  status: AdminOrchestrationStatus;
  executed_agents: string[];
  final_output: Record<string, unknown>;
  intermediate_results: Record<string, unknown>;
  escalations: string[];
  confidence: number;
};

export type AdminOrchestrationRunSummary = {
  id: number;
  scenario: AdminOrchestrationScenario | string;
  status: AdminOrchestrationStatus | string;
  language?: string | null;
  confidence: number;
  executed_agents?: string[] | null;
  escalations?: string[] | null;
  created_at: string;
};

export type AdminOrchestrationRunDetail = {
  id: number;
  scenario: AdminOrchestrationScenario | string;
  status: AdminOrchestrationStatus | string;
  language?: string | null;
  input_payload_json?: Record<string, unknown> | null;
  options_json?: Record<string, unknown> | null;
  executed_agents_json?: string[] | null;
  final_output_json?: Record<string, unknown> | null;
  intermediate_results_json?: Record<string, unknown> | null;
  escalations_json?: string[] | null;
  confidence: number;
  created_at: string;
};

/* ---------------- CUSTOMER EXPERIENCE AGENT ---------------- */

export type AdminCustomerExperienceSignalType =
  | "coach_signal"
  | "recommendation_signal"
  | "lever_signal"
  | "artifact_signal"
  | "journey_signal"
  | "trust_signal"
  | "unknown";

export type AdminCustomerExperienceSignalSource =
  | "user_feedback"
  | "support_case"
  | "manual_test"
  | "dashboard"
  | "conversation_review"
  | "unknown";

export type AdminCustomerExperienceEnvironment = "production" | "staging" | "development";

export type AdminCustomerExperienceStatus = "healthy" | "watch" | "degraded";

export type AdminCustomerExperienceArea =
  | "coach_quality"
  | "recommendation_relevance"
  | "lever_relevance"
  | "artifact_value"
  | "journey_clarity"
  | "trust_and_confidence"
  | "overall_experience"
  | "unknown";

export type AdminCustomerExperienceSeverity = "high" | "medium" | "low";

export type AdminCustomerExperienceRisk = "high" | "medium" | "low";

export type AdminCustomerExperienceMonitoringRequest = {
  signal_type: AdminCustomerExperienceSignalType;
  signal_source: AdminCustomerExperienceSignalSource;
  message: string;
  language: string;
  environment: AdminCustomerExperienceEnvironment;
  context?: Record<string, string | number | boolean | null> | null;
};

export type AdminCustomerExperienceMonitoringResponse = {
  satisfaction_status: AdminCustomerExperienceStatus;
  issue_detected: boolean;
  experience_area: AdminCustomerExperienceArea;
  severity: AdminCustomerExperienceSeverity;
  summary: string;
  likely_causes: string[];
  recommended_actions: string[];
  user_experience_risk: AdminCustomerExperienceRisk;
  escalate: boolean;
  escalation_reason?: string | null;
  confidence: number;
};

export type AdminRenderableNode = ReactNode;