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
  session_id: number;
  recommendation_id: number;
  lever_id: number;
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

export type VoiceTranscriptionResponse = {
  transcript: string;
};

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

export type AdminStatusToggleResponse = {
  id: number;
  is_active: boolean;
};

export type AdminMe = {
  id: number;
  email: string;
  is_active: boolean;
};

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

export type CareerLevel =
  | "Starter"
  | "Junior"
  | "Senior"
  | "Expert"
  | "Master"
  | "Elite";

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
};