// lib/api.ts
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
  AdminOrchestrationRunSummary,
  AdminOrchestrationRunDetail,
  AdminWorker,
  AdminWorkerCreate,
  AdminWorkerUpdate,
  AdminWorkerConversation,
  AdminWorkerConversationCreate,
  AdminWorkerConversationUpdate,
  AdminWorkerEngagement,
  AdminWorkerEngagementCreate,
  AdminWorkerEngagementUpdate,
  AdminWorkerEngagementState,
  AdminWorkerPurposeCanvas,
  AdminWorkerPurposeCanvasCreate,
  AdminWorkerPurposeCanvasUpdate,
  AdminWorkerSignificanceAnswerValue,
  AdminWorkerSignificanceCanvas,
  AdminWorkerSignificanceCanvasCreate,
  AdminWorkerSignificanceCanvasUpdate,
  AdminWorkerSignificanceCanvasComputedResult,
  AdminWorkerSignificanceQuestion,
  AdminWorkerSignificanceQuestionAnswer,
  AdminWorkerSignificanceScoreMap,
  AdminOrganization,
  AdminOrganizationCreate,
  AdminOrganizationDetail,
  AdminOrganizationUpdate,
  AdminOrganizationWorkerSummary,
  AdminOrganizationAccessAccount,
  AdminOrganizationAccessAccountCreate,
  AdminSubscriptionPlan,
  AdminWorkerSubscriptionSummary,
  AdminWorkerSubscriptionUpdate,
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

const ZERO_SIGNIFICANCE_SCORES: AdminWorkerSignificanceScoreMap = {
  raison: 0,
  metier: 0,
  occupation: 0,
  corvee: 0,
  hobby: 0,
};

function isSignificanceAnswerValue(value: unknown): value is AdminWorkerSignificanceAnswerValue {
  return value === "yes" || value === "no" || value === "maybe" || value === "unknown";
}

function normalizeSignificanceScores(value: unknown): AdminWorkerSignificanceScoreMap {
  if (!value || typeof value !== "object") {
    return { ...ZERO_SIGNIFICANCE_SCORES };
  }

  const raw = value as Partial<Record<keyof AdminWorkerSignificanceScoreMap, unknown>>;

  return {
    raison: Number(raw.raison ?? 0),
    metier: Number(raw.metier ?? 0),
    occupation: Number(raw.occupation ?? 0),
    corvee: Number(raw.corvee ?? 0),
    hobby: Number(raw.hobby ?? 0),
  };
}

function normalizeSignificanceQuestionAnswer(
  value: unknown,
): AdminWorkerSignificanceQuestionAnswer {
  const raw = value && typeof value === "object" ? (value as Record<string, unknown>) : {};

  const answerValue = isSignificanceAnswerValue(raw.value) ? raw.value : "unknown";

  return {
    value: answerValue,
    label: typeof raw.label === "string" && raw.label.trim() ? raw.label : "Je ne sais pas",
    scores: normalizeSignificanceScores(raw.scores),
  };
}

function normalizeSignificanceQuestion(value: unknown, index: number): AdminWorkerSignificanceQuestion {
  const raw = value && typeof value === "object" ? (value as Record<string, unknown>) : {};

  const rawId = raw.id ?? raw.order ?? raw.key ?? index + 1;
  const normalizedId = Number(rawId);
  const id = Number.isFinite(normalizedId) && normalizedId > 0 ? normalizedId : index + 1;

  const rawOptions = Array.isArray(raw.answers)
    ? raw.answers
    : Array.isArray(raw.options)
      ? raw.options
      : [];

  return {
    id,
    key: typeof raw.key === "string" ? raw.key : String(id),
    order:
      typeof raw.order === "number"
        ? raw.order
        : Number.isFinite(Number(raw.order))
          ? Number(raw.order)
          : id,
    text: typeof raw.text === "string" ? raw.text : `Question ${id}`,
    answers: rawOptions.map(normalizeSignificanceQuestionAnswer),
    options: rawOptions.map(normalizeSignificanceQuestionAnswer),
  };
}

function normalizeSignificanceQuestionsPayload(
  payload: unknown,
): AdminWorkerSignificanceQuestion[] {
  const rawQuestions =
    payload && typeof payload === "object" && "questions" in payload
      ? (payload as { questions?: unknown }).questions
      : payload;

  if (!Array.isArray(rawQuestions)) {
    return [];
  }

  return rawQuestions
    .map((question, index) => normalizeSignificanceQuestion(question, index))
    .filter((question) => question.id > 0 && question.answers.length > 0);
}

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

  if (response.status === 403) {
    if (typeof window !== "undefined") {
      window.location.href = "/admin/organizations";
    }

    throw new Error("You do not have access to this backoffice area.");
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

/* ---------------- USER AUTH / SESSION ---------------- */

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
  uiLanguage?: SupportedUiLanguage,
): Promise<ConversationTurnResponse> {
  const resolvedLanguage = uiLanguage || getPreferredUiLanguage();

  return apiFetch<ConversationTurnResponse>("/conversations/turn", {
    method: "POST",
    headers: {
      "Accept-Language": resolvedLanguage,
    },
    body: JSON.stringify({ session_id: sessionId, message }),
  });
}

export async function closeSession(sessionId: number): Promise<SessionCloseResponse> {
  return apiFetch<SessionCloseResponse>(`/sessions/${sessionId}/close`, {
    method: "POST",
  });
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

/* ---------------- USER RECOMMENDATIONS / DASHBOARD ---------------- */

export async function getRecommendations(): Promise<Recommendation[]> {
  return apiFetch<Recommendation[]>("/recommendations");
}

export async function getRecommendation(recommendationId: number): Promise<Recommendation> {
  return apiFetch<Recommendation>(`/recommendations/${recommendationId}`);
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

export async function getDashboardSummary(): Promise<DashboardSummary> {
  return apiFetch<DashboardSummary>("/dashboard/summary");
}

export async function getDashboardTimeline(): Promise<DashboardTimelineItem[]> {
  return apiFetch<DashboardTimelineItem[]>("/dashboard/timeline");
}

/* ---------------- USER VOICE ---------------- */

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

export async function voiceTurn(
  file: Blob,
  uiLanguage?: SupportedUiLanguage,
): Promise<VoiceTurnResponse> {
  const formData = new FormData();
  formData.append("file", file, "recording.webm");

  const resolvedLanguage = uiLanguage || getPreferredUiLanguage();

  return apiFetch<VoiceTurnResponse>("/voice/turn", {
    method: "POST",
    headers: {
      "Accept-Language": resolvedLanguage,
    },
    body: formData,
  });
}

/* ---------------- USER AI ARTIFACTS ---------------- */

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

export async function generateAIArtifact(artifactId: number): Promise<AIArtifactResponse> {
  return apiFetch<AIArtifactResponse>(`/ai-artifacts/${artifactId}/generate`, {
    method: "POST",
  });
}

export async function getAIArtifact(artifactId: number): Promise<AIArtifactResponse> {
  return apiFetch<AIArtifactResponse>(`/ai-artifacts/${artifactId}`);
}

export async function getMyAIArtifacts(): Promise<AIArtifactStatusResponse[]> {
  return apiFetch<AIArtifactStatusResponse[]>("/ai-artifacts");
}

/* ---------------- USER SUPPORT ---------------- */

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

/* ---------------- ADMIN AUTH ---------------- */

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

/* ---------------- ADMIN LEVERS ---------------- */

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

/* ---------------- ADMIN DASHBOARD / QUALITY ---------------- */

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

/* ---------------- ADMIN AGENTS ---------------- */

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

export async function adminCustomerExperienceMonitoring(
  payload: AdminCustomerExperienceMonitoringRequest,
): Promise<AdminCustomerExperienceMonitoringResponse> {
  return adminApiFetch<AdminCustomerExperienceMonitoringResponse>(
    "/admin/customer-experience/assess",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

/* ---------------- ADMIN ORCHESTRATION ---------------- */

export async function adminOrchestrationRun(
  payload: AdminOrchestrationRequest,
): Promise<AdminOrchestrationResponse> {
  return adminApiFetch<AdminOrchestrationResponse>("/admin/orchestration/run", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getAdminOrchestrationRuns(
  limit = 50,
): Promise<AdminOrchestrationRunSummary[]> {
  return adminApiFetch<AdminOrchestrationRunSummary[]>(
    `/admin/orchestration/runs?limit=${limit}`,
  );
}

export async function getAdminOrchestrationRunDetail(
  runId: number,
): Promise<AdminOrchestrationRunDetail> {
  return adminApiFetch<AdminOrchestrationRunDetail>(`/admin/orchestration/runs/${runId}`);
}

export async function adminSupportCaseFlow(
  payload: AdminSupportCaseFlowPayload,
): Promise<SupportCaseFlowResult> {
  return adminApiFetch<SupportCaseFlowResult>("/admin/orchestration/support-case", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* ---------------- ADMIN WORKERS ---------------- */

export async function getAdminWorkers(
  params?: { q?: string; subscription_pack?: string },
): Promise<AdminWorker[]> {
  const search = new URLSearchParams();

  if (params?.q) {
    search.set("q", params.q);
  }

  if (params?.subscription_pack) {
    search.set("subscription_pack", params.subscription_pack);
  }

  const query = search.toString();

  return adminApiFetch<AdminWorker[]>(`/admin/workers${query ? `?${query}` : ""}`);
}

export async function getAdminWorker(workerId: number): Promise<AdminWorker> {
  return adminApiFetch<AdminWorker>(`/admin/workers/${workerId}`);
}

export async function createAdminWorker(payload: AdminWorkerCreate): Promise<AdminWorker> {
  return adminApiFetch<AdminWorker>("/admin/workers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAdminWorker(
  workerId: number,
  payload: AdminWorkerUpdate,
): Promise<AdminWorker> {
  return adminApiFetch<AdminWorker>(`/admin/workers/${workerId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/* ---------------- ADMIN WORKER CONVERSATIONS ---------------- */

export async function getAdminWorkerConversations(
  params?: { worker_id?: number },
): Promise<AdminWorkerConversation[]> {
  const search = new URLSearchParams();

  if (params?.worker_id != null) {
    search.set("worker_id", String(params.worker_id));
  }

  const query = search.toString();

  return adminApiFetch<AdminWorkerConversation[]>(
    `/admin/worker-conversations${query ? `?${query}` : ""}`,
  );
}

export async function getAdminWorkerConversation(
  conversationId: number,
): Promise<AdminWorkerConversation> {
  return adminApiFetch<AdminWorkerConversation>(
    `/admin/worker-conversations/${conversationId}`,
  );
}

export async function createAdminWorkerConversation(
  payload: AdminWorkerConversationCreate,
): Promise<AdminWorkerConversation> {
  return adminApiFetch<AdminWorkerConversation>("/admin/worker-conversations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAdminWorkerConversation(
  conversationId: number,
  payload: AdminWorkerConversationUpdate,
): Promise<AdminWorkerConversation> {
  return adminApiFetch<AdminWorkerConversation>(
    `/admin/worker-conversations/${conversationId}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );
}

/* ---------------- ADMIN WORKER ENGAGEMENTS ---------------- */

export async function getAdminWorkerEngagements(
  params?: { worker_id?: number; state_type?: AdminWorkerEngagementState },
): Promise<AdminWorkerEngagement[]> {
  const search = new URLSearchParams();

  if (params?.worker_id != null) {
    search.set("worker_id", String(params.worker_id));
  }

  if (params?.state_type) {
    search.set("state_type", params.state_type);
  }

  const query = search.toString();

  return adminApiFetch<AdminWorkerEngagement[]>(
    `/admin/worker-engagements${query ? `?${query}` : ""}`,
  );
}

export async function getAdminWorkerEngagement(
  engagementId: number,
): Promise<AdminWorkerEngagement> {
  return adminApiFetch<AdminWorkerEngagement>(`/admin/worker-engagements/${engagementId}`);
}

export async function createAdminWorkerEngagement(
  payload: AdminWorkerEngagementCreate,
): Promise<AdminWorkerEngagement> {
  return adminApiFetch<AdminWorkerEngagement>("/admin/worker-engagements", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAdminWorkerEngagement(
  engagementId: number,
  payload: AdminWorkerEngagementUpdate,
): Promise<AdminWorkerEngagement> {
  return adminApiFetch<AdminWorkerEngagement>(`/admin/worker-engagements/${engagementId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function finalizeAdminWorkerEngagement(
  engagementId: number,
): Promise<AdminWorkerEngagement> {
  return adminApiFetch<AdminWorkerEngagement>(
    `/admin/worker-engagements/${engagementId}/finalize`,
    {
      method: "POST",
    },
  );
}

/* ---------------- ADMIN WORKER PURPOSE CANVASES ---------------- */

export async function getAdminWorkerPurposeCanvases(
  params?: { worker_id?: number },
): Promise<AdminWorkerPurposeCanvas[]> {
  const search = new URLSearchParams();

  if (params?.worker_id != null) {
    search.set("worker_id", String(params.worker_id));
  }

  const query = search.toString();

  return adminApiFetch<AdminWorkerPurposeCanvas[]>(
    `/admin/worker-purpose-canvases${query ? `?${query}` : ""}`,
  );
}

export async function getAdminWorkerPurposeCanvas(
  canvasId: number,
): Promise<AdminWorkerPurposeCanvas> {
  return adminApiFetch<AdminWorkerPurposeCanvas>(
    `/admin/worker-purpose-canvases/${canvasId}`,
  );
}

export async function createAdminWorkerPurposeCanvas(
  payload: AdminWorkerPurposeCanvasCreate,
): Promise<AdminWorkerPurposeCanvas> {
  return adminApiFetch<AdminWorkerPurposeCanvas>("/admin/worker-purpose-canvases", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAdminWorkerPurposeCanvas(
  canvasId: number,
  payload: AdminWorkerPurposeCanvasUpdate,
): Promise<AdminWorkerPurposeCanvas> {
  return adminApiFetch<AdminWorkerPurposeCanvas>(
    `/admin/worker-purpose-canvases/${canvasId}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );
}

export async function deleteAdminWorkerPurposeCanvas(
  canvasId: number,
): Promise<{ deleted: boolean }> {
  return adminApiFetch<{ deleted: boolean }>(
    `/admin/worker-purpose-canvases/${canvasId}`,
    {
      method: "DELETE",
    },
  );
}

/* ---------------- ADMIN WORKER SIGNIFICANCE CANVASES ---------------- */

export async function getAdminWorkerSignificanceQuestions(): Promise<
  AdminWorkerSignificanceQuestion[]
> {
  const payload = await adminApiFetch<unknown>("/admin/worker-significance-canvases/questions");

  return normalizeSignificanceQuestionsPayload(payload);
}

export async function computeAdminWorkerSignificanceCanvas(
  payload: AdminWorkerSignificanceCanvasCreate | AdminWorkerSignificanceCanvasUpdate,
): Promise<AdminWorkerSignificanceCanvasComputedResult> {
  return adminApiFetch<AdminWorkerSignificanceCanvasComputedResult>(
    "/admin/worker-significance-canvases/compute",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function getAdminWorkerSignificanceCanvases(
  params?: { worker_id?: number },
): Promise<AdminWorkerSignificanceCanvas[]> {
  const search = new URLSearchParams();

  if (params?.worker_id != null) {
    search.set("worker_id", String(params.worker_id));
  }

  const query = search.toString();

  return adminApiFetch<AdminWorkerSignificanceCanvas[]>(
    `/admin/worker-significance-canvases${query ? `?${query}` : ""}`,
  );
}

export async function getAdminWorkerSignificanceCanvas(
  canvasId: number,
): Promise<AdminWorkerSignificanceCanvas> {
  return adminApiFetch<AdminWorkerSignificanceCanvas>(
    `/admin/worker-significance-canvases/${canvasId}`,
  );
}

export async function createAdminWorkerSignificanceCanvas(
  payload: AdminWorkerSignificanceCanvasCreate,
): Promise<AdminWorkerSignificanceCanvas> {
  return adminApiFetch<AdminWorkerSignificanceCanvas>(
    "/admin/worker-significance-canvases",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function updateAdminWorkerSignificanceCanvas(
  canvasId: number,
  payload: AdminWorkerSignificanceCanvasUpdate,
): Promise<AdminWorkerSignificanceCanvas> {
  return adminApiFetch<AdminWorkerSignificanceCanvas>(
    `/admin/worker-significance-canvases/${canvasId}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );
}

export async function deleteAdminWorkerSignificanceCanvas(
  canvasId: number,
): Promise<{ deleted: boolean }> {
  return adminApiFetch<{ deleted: boolean }>(
    `/admin/worker-significance-canvases/${canvasId}`,
    {
      method: "DELETE",
    },
  );
}

/* ---------------- USER ONBOARDING / PROFILE / CAREER ---------------- */

export type OnboardingPayload = {
  current_role: string;
  industry: string;
  main_challenge: string;
  preferred_coaching_style: string;
  short_term_mission?: CareerHorizonPayload | null;
  mid_term_ambition?: CareerHorizonPayload | null;
  long_term_goal?: CareerHorizonPayload | null;
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

export async function completeOnboarding(
  payload: OnboardingPayload,
): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>("/onboarding", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getProfile(): Promise<ProfileResponse> {
  return apiFetch<ProfileResponse>("/profile");
}

export async function updateProfile(payload: ProfileUpdatePayload): Promise<ProfileResponse> {
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

export async function getCareerGap(): Promise<CareerGapResponse | null> {
  return apiFetch<CareerGapResponse | null>("/career-gap");
}

export async function getCareerTrajectory(): Promise<CareerTrajectoryResponse> {
  return apiFetch<CareerTrajectoryResponse>("/dashboard/career-trajectory");
}

/* ---------------- ADMIN ORGANIZATIONS ---------------- */

export async function getAdminOrganizations(): Promise<AdminOrganization[]> {
  return adminApiFetch<AdminOrganization[]>("/admin/organizations");
}

export async function createAdminOrganization(
  payload: AdminOrganizationCreate,
): Promise<AdminOrganization> {
  return adminApiFetch<AdminOrganization>("/admin/organizations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getAdminOrganizationDetail(
  organizationId: number,
): Promise<AdminOrganizationDetail> {
  return adminApiFetch<AdminOrganizationDetail>(`/admin/organizations/${organizationId}`);
}

export async function updateAdminOrganization(
  organizationId: number,
  payload: AdminOrganizationUpdate,
): Promise<AdminOrganization> {
  return adminApiFetch<AdminOrganization>(`/admin/organizations/${organizationId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function createOrResetAdminOrganizationAccessAccount(
  organizationId: number,
  payload: AdminOrganizationAccessAccountCreate = {},
): Promise<AdminOrganizationAccessAccount> {
  return adminApiFetch<AdminOrganizationAccessAccount>(
    `/admin/organizations/${organizationId}/access-account`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function assignWorkerToOrganization(
  organizationId: number,
  workerId: number,
): Promise<AdminWorker> {
  return adminApiFetch<AdminWorker>(
    `/admin/organizations/${organizationId}/workers/${workerId}`,
    {
      method: "POST",
    },
  );
}

export async function unassignWorkerFromOrganization(
  organizationId: number,
  workerId: number,
): Promise<AdminWorker> {
  return adminApiFetch<AdminWorker>(
    `/admin/organizations/${organizationId}/workers/${workerId}`,
    {
      method: "DELETE",
    },
  );
}

export async function getAdminOrganizationWorkerSummary(
  organizationId: number,
  workerId: number,
): Promise<AdminOrganizationWorkerSummary> {
  return adminApiFetch<AdminOrganizationWorkerSummary>(
    `/admin/organizations/${organizationId}/workers/${workerId}/summary`,
  );
}

/* ---------------- ADMIN SUBSCRIPTIONS ---------------- */

export async function getAdminSubscriptionPlans(): Promise<AdminSubscriptionPlan[]> {
  return adminApiFetch<AdminSubscriptionPlan[]>("/admin/subscriptions/plans");
}

export async function getAdminWorkerSubscription(
  workerId: number,
): Promise<AdminWorkerSubscriptionSummary | null> {
  return adminApiFetch<AdminWorkerSubscriptionSummary | null>(
    `/admin/workers/${workerId}/subscription`,
  );
}

export async function updateAdminWorkerSubscription(
  workerId: number,
  payload: AdminWorkerSubscriptionUpdate,
): Promise<AdminWorkerSubscriptionSummary> {
  return adminApiFetch<AdminWorkerSubscriptionSummary>(
    `/admin/workers/${workerId}/subscription`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );
}

export async function cancelAdminWorkerSubscription(
  workerId: number,
): Promise<AdminWorkerSubscriptionSummary> {
  return adminApiFetch<AdminWorkerSubscriptionSummary>(
    `/admin/workers/${workerId}/subscription/cancel`,
    {
      method: "POST",
    },
  );
}

export async function reactivateAdminWorkerSubscription(
  workerId: number,
): Promise<AdminWorkerSubscriptionSummary> {
  return adminApiFetch<AdminWorkerSubscriptionSummary>(
    `/admin/workers/${workerId}/subscription/reactivate`,
    {
      method: "POST",
    },
  );
}