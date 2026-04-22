import { API_BASE_URL } from "./config";
import { clearToken, getToken } from "./auth";
import { clearAdminToken, getAdminToken } from "./admin-auth";
import { resolveUiLanguage, type SupportedUiLanguage } from "./user-locales";
import type {
  AdminLever,
  AdminLeverCreate,
  AdminLeverUpdate,
  AdminLoginResponse,
  AdminMe,
  AdminStatusToggleResponse,
  AIArtifactCreateRequest,
  AIArtifactPreviewResponse,
  AIArtifactResponse,
  AIArtifactStatusResponse,
  ConversationTurnResponse,
  DashboardSummary,
  DashboardTimelineItem,
  Me,
  OpenSessionResponse,
  ProblemDetection,
  Recommendation,
  SessionCloseResponse,
  SessionCreateResponse,
  SessionDetail,
  SessionHistoryItem,
  VoiceTranscriptionResponse,
  VoiceTurnResponse,
  AdminDashboardSummary,
  AdminIntelligenceSummary,
  AdminCoverageSummary,
  AdminLeverQualitySummary,
  AdminSupportTriageRequest,
  AdminSupportTriageResponse,
  AdminSupportResolutionRequest,
  AdminSupportResolutionResponse,
  AdminTechOpsMonitoringRequest,
  AdminTechOpsMonitoringResponse,
  AdminBusinessOpsMonitoringRequest,
  AdminBusinessOpsMonitoringResponse,
  AdminChiefOfStaffRequest,
  AdminChiefOfStaffResponse,
  AdminDailyBriefingRequest,
  AdminDailyBriefingResponse,
  AdminOrchestrationRequest,
  AdminOrchestrationResponse,
  AdminCustomerExperienceMonitoringRequest,
  AdminCustomerExperienceMonitoringResponse,
} from "./types";

export type SupportIssuePayload = {
  message: string;
  language?: string;
  user_email?: string | null;
  user_id?: number | null;
  source?: string | null;
};

export type SupportTriageResult = {
  summary: string;
  category:
    | "auth_login"
    | "payment_issue"
    | "artifact_access_generation"
    | "recommendation_quality"
    | "onboarding_confusion"
    | "technical_bug"
    | "feature_request"
    | "trust_safety"
    | "other";
  severity: "P1" | "P2" | "P3" | "P4";
  confidence: number;
  likely_causes: string[];
  recommended_owner: "support_resolution" | "tech_ops" | "business_ops" | "founder";
  recommended_actions: string[];
  founder_escalation: boolean;
};

export type SupportCaseFlowResult = {
  scenario: string;
  status: "success" | "partial" | "failed";
  executed_agents: string[];
  final_output: Record<string, unknown>;
  intermediate_results: Record<string, unknown>;
  escalations: string[];
  confidence: number;
};

export type AdminSupportCaseFlowPayload = {
  message: string;
  language?: string;
  user_email?: string | null;
  user_id?: number | null;
  source?: string | null;
};

function getPreferredUiLanguage(): SupportedUiLanguage {
  if (typeof window !== "undefined") {
    const stored = window.localStorage.getItem("leanworker.uiLanguage");
    const htmlLang = document?.documentElement?.lang || null;
    const browserLang = window.navigator?.language || null;

    return resolveUiLanguage({
      language: stored || browserLang,
      locale: htmlLang,
    });
  }

  return "en";
}

function buildHeaders(options: RequestInit = {}): Headers {
  const token = getToken();
  const headers = options.headers ? new Headers(options.headers) : new Headers();

  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  if (options.body && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (!headers.has("Accept-Language")) {
    headers.set("Accept-Language", getPreferredUiLanguage());
  }

  return headers;
}

function buildAdminHeaders(options: RequestInit = {}): Headers {
  const token = getAdminToken();
  const headers = options.headers ? new Headers(options.headers) : new Headers();

  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  if (options.body && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (!headers.has("Accept-Language")) {
    headers.set("Accept-Language", getPreferredUiLanguage());
  }

  return headers;
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: buildHeaders(options),
    cache: "no-store",
  });

  if (response.status === 401) {
    clearToken();
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
    throw new Error("Authentication expired. Please sign in again.");
  }

  if (!response.ok) {
    let message = `API error on ${path}`;
    try {
      const data = await response.json();
      message = data.detail || JSON.stringify(data);
    } catch {
      message = await response.text();
    }
    throw new Error(message || `API error on ${path}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

async function adminApiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: buildAdminHeaders(options),
    cache: "no-store",
  });

  if (response.status === 401) {
    clearAdminToken();
    if (typeof window !== "undefined") {
      window.location.href = "/admin/login";
    }
    throw new Error("Admin authentication expired. Please sign in again.");
  }

  if (!response.ok) {
    let message = `API error on ${path}`;
    try {
      const data = await response.json();
      message = data.detail || JSON.stringify(data);
    } catch {
      message = await response.text();
    }
    throw new Error(message || `API error on ${path}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

async function apiFetchBlob(path: string, options: RequestInit = {}): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: buildHeaders(options),
    cache: "no-store",
  });

  if (response.status === 401) {
    clearToken();
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
    throw new Error("Authentication expired. Please sign in again.");
  }

  if (!response.ok) {
    let message = `API error on ${path}`;
    try {
      const data = await response.json();
      message = data.detail || JSON.stringify(data);
    } catch {
      message = await response.text();
    }
    throw new Error(message || `API error on ${path}`);
  }

  return response.blob();
}

export async function getLinkedInAuthorizationUrl(): Promise<string> {
  const data = await apiFetch<{ authorization_url: string }>("/auth/linkedin/login");
  return data.authorization_url;
}

export async function getMe(): Promise<Me> {
  return apiFetch<Me>("/auth/me");
}

export async function createSession(): Promise<SessionCreateResponse> {
  return apiFetch<SessionCreateResponse>("/sessions", {
    method: "POST",
  });
}

export async function sendConversationTurn(
  sessionId: number,
  message: string,
): Promise<ConversationTurnResponse> {
  return apiFetch<ConversationTurnResponse>("/conversations/turn", {
    method: "POST",
    body: JSON.stringify({ session_id: sessionId, message }),
  });
}

export async function closeSession(sessionId: number): Promise<SessionCloseResponse> {
  return apiFetch<SessionCloseResponse>(`/sessions/${sessionId}/close`, {
    method: "POST",
  });
}

export async function getRecommendations(): Promise<Recommendation[]> {
  return apiFetch<Recommendation[]>("/recommendations");
}

export async function getRecommendation(recommendationId: number): Promise<Recommendation> {
  return apiFetch<Recommendation>(`/recommendations/${recommendationId}`);
}

export async function getSessions(): Promise<SessionHistoryItem[]> {
  return apiFetch<SessionHistoryItem[]>("/sessions");
}

export async function getCurrentOpenSession(): Promise<OpenSessionResponse | null> {
  return apiFetch<OpenSessionResponse | null>("/sessions/open/current");
}

export async function forceCloseSession(sessionId: number): Promise<SessionCloseResponse> {
  return apiFetch<SessionCloseResponse>(`/sessions/${sessionId}/force-close`, {
    method: "POST",
  });
}

export async function getSessionDetail(sessionId: number): Promise<SessionDetail> {
  return apiFetch<SessionDetail>(`/sessions/${sessionId}`);
}

export async function getSessionProblemDetection(sessionId: number): Promise<ProblemDetection> {
  return apiFetch<ProblemDetection>(`/problem-detection/session/${sessionId}`);
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  return apiFetch<DashboardSummary>("/dashboard/summary");
}

export async function getDashboardTimeline(): Promise<DashboardTimelineItem[]> {
  return apiFetch<DashboardTimelineItem[]>("/dashboard/timeline");
}

export async function updateRecommendation(
  recommendationId: number,
  payload: { status?: string; user_note?: string | null },
): Promise<Recommendation> {
  return apiFetch<Recommendation>(`/recommendations/${recommendationId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function transcribeAudio(file: Blob): Promise<VoiceTranscriptionResponse> {
  const formData = new FormData();
  formData.append("file", file, "recording.webm");

  return apiFetch<VoiceTranscriptionResponse>("/voice/transcribe", {
    method: "POST",
    body: formData,
  });
}

export async function synthesizeSpeech(text: string): Promise<Blob> {
  return apiFetchBlob("/voice/speak/raw", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export async function voiceTurn(file: Blob): Promise<VoiceTurnResponse> {
  const formData = new FormData();
  formData.append("file", file, "recording.webm");

  return apiFetch<VoiceTurnResponse>("/voice/turn", {
    method: "POST",
    body: formData,
  });
}

export async function previewAIArtifact(
  recommendationId: number,
  format: "ebook" | "audiobook" = "ebook",
): Promise<AIArtifactPreviewResponse> {
  return apiFetch<AIArtifactPreviewResponse>(
    `/ai-artifacts/preview/${recommendationId}/${encodeURIComponent(format)}`,
  );
}

export async function createAIArtifact(
  payload: AIArtifactCreateRequest,
): Promise<AIArtifactResponse> {
  return apiFetch<AIArtifactResponse>("/ai-artifacts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createAIArtifactCheckoutSession(
  artifactId: number,
): Promise<{ artifact_id: number; checkout_session_id: string; checkout_url: string }> {
  return apiFetch<{ artifact_id: number; checkout_session_id: string; checkout_url: string }>(
    `/ai-artifacts/${artifactId}/checkout-session`,
    {
      method: "POST",
    },
  );
}

export async function generateAIArtifact(
  artifactId: number,
): Promise<AIArtifactResponse> {
  return apiFetch<AIArtifactResponse>(`/ai-artifacts/${artifactId}/generate`, {
    method: "POST",
  });
}

export async function getAIArtifact(
  artifactId: number,
): Promise<AIArtifactResponse> {
  return apiFetch<AIArtifactResponse>(`/ai-artifacts/${artifactId}`);
}

export async function getMyAIArtifacts(): Promise<AIArtifactStatusResponse[]> {
  return apiFetch<AIArtifactStatusResponse[]>("/ai-artifacts");
}

export async function submitSupportTriage(
  payload: SupportIssuePayload,
): Promise<SupportTriageResult> {
  return apiFetch<SupportTriageResult>("/support/triage", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function submitSupportCaseFlow(
  payload: SupportIssuePayload,
): Promise<SupportCaseFlowResult> {
  return apiFetch<SupportCaseFlowResult>("/support/case-flow", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* ---------------- ADMIN ---------------- */

export async function adminLogin(email: string, password: string): Promise<AdminLoginResponse> {
  return fetch(`${API_BASE_URL}/admin/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": getPreferredUiLanguage(),
    },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  }).then(async (response) => {
    if (!response.ok) {
      let message = "Admin login failed.";
      try {
        const data = await response.json();
        message = data.detail || JSON.stringify(data);
      } catch {
        message = await response.text();
      }
      throw new Error(message);
    }

    return response.json();
  });
}

export async function getAdminMe(): Promise<AdminMe> {
  return adminApiFetch<AdminMe>("/admin/auth/me");
}

export async function getAdminLevers(): Promise<AdminLever[]> {
  return adminApiFetch<AdminLever[]>("/admin/levers");
}

export async function createAdminLever(payload: AdminLeverCreate): Promise<AdminLever> {
  return adminApiFetch<AdminLever>("/admin/levers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAdminLever(
  leverId: number,
  payload: AdminLeverUpdate,
): Promise<AdminLever> {
  return adminApiFetch<AdminLever>(`/admin/levers/${leverId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function toggleAdminLeverStatus(
  leverId: number,
): Promise<AdminStatusToggleResponse> {
  return adminApiFetch<AdminStatusToggleResponse>(`/admin/levers/${leverId}/status`, {
    method: "PATCH",
  });
}

export async function deleteAdminLever(leverId: number): Promise<{ deleted: boolean }> {
  return adminApiFetch<{ deleted: boolean }>(`/admin/levers/${leverId}`, {
    method: "DELETE",
  });
}

export async function getAdminDashboardSummary(): Promise<AdminDashboardSummary> {
  return adminApiFetch<AdminDashboardSummary>("/admin/dashboard/summary");
}

export async function getAdminIntelligenceSummary(): Promise<AdminIntelligenceSummary> {
  return adminApiFetch<AdminIntelligenceSummary>("/admin/intelligence/summary");
}

export async function getAdminCoverageSummary(): Promise<AdminCoverageSummary> {
  return adminApiFetch<AdminCoverageSummary>("/admin/coverage/summary");
}

export async function getAdminQualitySummary(): Promise<AdminLeverQualitySummary> {
  return adminApiFetch<AdminLeverQualitySummary>("/admin/quality/summary");
}

export async function adminSupportTriage(
  payload: AdminSupportTriageRequest,
): Promise<AdminSupportTriageResponse> {
  return adminApiFetch<AdminSupportTriageResponse>("/admin/support/triage", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function adminSupportResolution(
  payload: AdminSupportResolutionRequest,
): Promise<AdminSupportResolutionResponse> {
  return adminApiFetch<AdminSupportResolutionResponse>("/admin/support/resolve", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function adminTechOpsMonitoring(
  payload: AdminTechOpsMonitoringRequest,
): Promise<AdminTechOpsMonitoringResponse> {
  return adminApiFetch<AdminTechOpsMonitoringResponse>("/admin/tech-ops/assess", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function adminBusinessOpsMonitoring(
  payload: AdminBusinessOpsMonitoringRequest,
): Promise<AdminBusinessOpsMonitoringResponse> {
  return adminApiFetch<AdminBusinessOpsMonitoringResponse>("/admin/business-ops/assess", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function adminChiefOfStaff(
  payload: AdminChiefOfStaffRequest,
): Promise<AdminChiefOfStaffResponse> {
  return adminApiFetch<AdminChiefOfStaffResponse>("/admin/chief-of-staff/synthesize", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function adminDailyBriefing(
  payload: AdminDailyBriefingRequest,
): Promise<AdminDailyBriefingResponse> {
  return adminApiFetch<AdminDailyBriefingResponse>("/admin/daily-briefing/generate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function adminOrchestrationRun(
  payload: AdminOrchestrationRequest,
): Promise<AdminOrchestrationResponse> {
  return adminApiFetch<AdminOrchestrationResponse>("/admin/orchestration/run", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function adminSupportCaseFlow(
  payload: AdminSupportCaseFlowPayload,
): Promise<SupportCaseFlowResult> {
  return adminApiFetch<SupportCaseFlowResult>("/admin/orchestration/support-case", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function adminCustomerExperienceMonitoring(
  payload: AdminCustomerExperienceMonitoringRequest,
): Promise<AdminCustomerExperienceMonitoringResponse> {
  return adminApiFetch<AdminCustomerExperienceMonitoringResponse>("/admin/customer-experience/assess", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* ---------------- ONBOARDING ---------------- */

export type OnboardingPayload = {
  current_role: string;
  industry: string;
  main_challenge: string;
  preferred_coaching_style: string;
  short_term_mission?: CareerHorizonPayload | null;
  mid_term_ambition?: CareerHorizonPayload | null;
  long_term_goal?: CareerHorizonPayload | null;
};

export async function completeOnboarding(
  payload: OnboardingPayload,
): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>("/onboarding", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

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

export async function getProfile(): Promise<ProfileResponse> {
  return apiFetch<ProfileResponse>("/profile");
}

export async function updateProfile(
  payload: ProfileUpdatePayload,
): Promise<ProfileResponse> {
  return apiFetch<ProfileResponse>("/profile", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function confirmCurrentProfileContext(): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>("/profile/confirm-current-context", {
    method: "POST",
  });
}

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
  is_completed: boolean;
};

export async function getCareerBlueprint(): Promise<CareerBlueprintResponse | null> {
  return apiFetch<CareerBlueprintResponse | null>("/career-blueprint");
}

export async function saveCareerBlueprint(
  payload: CareerBlueprintUpsertPayload,
): Promise<CareerBlueprintResponse> {
  return apiFetch<CareerBlueprintResponse>("/career-blueprint", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

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

export async function getCareerGap(): Promise<CareerGapResponse | null> {
  return apiFetch<CareerGapResponse | null>("/career-gap");
}

export async function getCareerTrajectory(): Promise<CareerTrajectoryResponse> {
  return apiFetch<CareerTrajectoryResponse>("/dashboard/career-trajectory");
}