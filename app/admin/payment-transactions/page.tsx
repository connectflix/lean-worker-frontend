"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import { AdminGuard } from "@/components/admin-guard";
import { AdminShell } from "@/components/admin-shell";
import {
  getAdminMe,
  getAdminPaymentTransactions,
} from "@/lib/api";
import type {
  AdminMe,
  PaymentTransactionResponse,
} from "@/lib/types";

type TransactionStatusFilter =
  | "all"
  | "pending"
  | "paid"
  | "cancelled"
  | "failed";

type TransactionTypeFilter =
  | "all"
  | "ai_artifact"
  | "lever"
  | "subscription";

export default function AdminPaymentTransactionsPage() {
  return (
    <AdminGuard>
      <AdminPaymentTransactionsContent />
    </AdminGuard>
  );
}

function formatDateTime(value?: string | null): string {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatAmount(value?: number | null, currency = "EUR"): string {
  const amount = Number(value ?? 0);

  if (!Number.isFinite(amount)) {
    return "—";
  }

  return new Intl.NumberFormat("fr-BE", {
    style: "currency",
    currency: currency || "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function normalizeLabel(value?: string | null): string {
  if (!value) return "—";

  return value
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getTransactionDate(transaction: PaymentTransactionResponse): string {
  return (
    transaction.paid_at ||
    transaction.cancelled_at ||
    transaction.failed_at ||
    transaction.created_at
  );
}

function getWorkerLabel(transaction: PaymentTransactionResponse): string {
  return (
    transaction.worker_name ||
    transaction.worker_email ||
    `Worker #${transaction.user_id}`
  );
}

function getItemLabel(transaction: PaymentTransactionResponse): string {
  return (
    transaction.artifact_title ||
    transaction.lever_name ||
    transaction.recommendation_title ||
    `Transaction #${transaction.id}`
  );
}

function getTransactionDescription(transaction: PaymentTransactionResponse): string {
  return (
    transaction.transaction_description ||
    transaction.recommendation_description ||
    transaction.recommendation_title ||
    "No transaction description available."
  );
}

function statusTone(status: string): CSSProperties {
  const normalized = status.toLowerCase();

  const base: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    padding: "5px 10px",
    fontWeight: 800,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    whiteSpace: "nowrap",
  };

  if (normalized === "paid") {
    return {
      ...base,
      color: "#15803d",
      background: "rgba(21,128,61,0.10)",
      border: "1px solid rgba(21,128,61,0.24)",
    };
  }

  if (normalized === "pending") {
    return {
      ...base,
      color: "#92400e",
      background: "rgba(251,191,36,0.14)",
      border: "1px solid rgba(251,191,36,0.28)",
    };
  }

  if (normalized === "cancelled") {
    return {
      ...base,
      color: "#475569",
      background: "rgba(100,116,139,0.12)",
      border: "1px solid rgba(100,116,139,0.20)",
    };
  }

  if (normalized === "failed") {
    return {
      ...base,
      color: "#b91c1c",
      background: "rgba(220,38,38,0.10)",
      border: "1px solid rgba(220,38,38,0.24)",
    };
  }

  return {
    ...base,
    color: "#4338ca",
    background: "rgba(99,102,241,0.12)",
    border: "1px solid rgba(99,102,241,0.24)",
  };
}

function typeTone(type: string): CSSProperties {
  const normalized = type.toLowerCase();

  const base: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    padding: "5px 10px",
    fontWeight: 800,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    whiteSpace: "nowrap",
  };

  if (normalized === "ai_artifact") {
    return {
      ...base,
      color: "#4338ca",
      background: "rgba(99,102,241,0.12)",
      border: "1px solid rgba(99,102,241,0.24)",
    };
  }

  if (normalized === "lever") {
    return {
      ...base,
      color: "#0369a1",
      background: "rgba(14,165,233,0.12)",
      border: "1px solid rgba(14,165,233,0.24)",
    };
  }

  if (normalized === "subscription") {
    return {
      ...base,
      color: "#9a3412",
      background: "rgba(249,115,22,0.12)",
      border: "1px solid rgba(249,115,22,0.24)",
    };
  }

  return {
    ...base,
    color: "#475569",
    background: "rgba(100,116,139,0.12)",
    border: "1px solid rgba(100,116,139,0.20)",
  };
}

function KpiCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number | string;
  tone?: "default" | "success" | "warning" | "danger" | "primary";
}) {
  const toneStyle: CSSProperties =
    tone === "success"
      ? {
          border: "1px solid rgba(34,197,94,0.22)",
          background: "rgba(34,197,94,0.08)",
        }
      : tone === "danger"
        ? {
            border: "1px solid rgba(239,68,68,0.22)",
            background: "rgba(239,68,68,0.08)",
          }
        : tone === "warning"
          ? {
              border: "1px solid rgba(245,158,11,0.22)",
              background: "rgba(245,158,11,0.08)",
            }
          : tone === "primary"
            ? {
                border: "1px solid rgba(59,130,246,0.22)",
                background: "rgba(59,130,246,0.08)",
              }
            : {};

  return (
    <div className="card-soft stack admin-kpi-card" style={{ gap: 7, ...toneStyle }}>
      <div className="muted">{label}</div>
      <div className="admin-metric-value" style={{ fontSize: 30 }}>
        {value}
      </div>
    </div>
  );
}

async function copyToClipboard(value?: string | null): Promise<void> {
  if (!value) return;

  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";

    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }
}

function CopyableValue({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!value) return;

    await copyToClipboard(value);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1400);
  }

  return (
    <div className="stack" style={{ gap: 4, minWidth: 0 }}>
      <div className="muted">{label}</div>

      <div className="row" style={{ gap: 8, alignItems: "center", minWidth: 0 }}>
        <div
          className="muted"
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            minWidth: 0,
            flex: 1,
          }}
          title={value || undefined}
        >
          {value || "—"}
        </div>

        {value ? (
          <button
            type="button"
            className="button ghost"
            onClick={() => void handleCopy()}
            style={{
              padding: "6px 9px",
              fontSize: 12,
              whiteSpace: "nowrap",
            }}
            title={`Copy ${label}`}
          >
            {copied ? "Copied" : "Copy"}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function AdminPaymentTransactionsContent() {
  const [admin, setAdmin] = useState<AdminMe | null>(null);
  const [transactions, setTransactions] = useState<PaymentTransactionResponse[]>([]);
  const [total, setTotal] = useState(0);

  const [statusFilter, setStatusFilter] = useState<TransactionStatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TransactionTypeFilter>("all");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(50);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [me, response] = await Promise.all([
        getAdminMe(),
        getAdminPaymentTransactions({
          q: query.trim() || undefined,
          transaction_status: statusFilter === "all" ? undefined : statusFilter,
          transaction_type: typeFilter === "all" ? undefined : typeFilter,
          limit,
          offset: 0,
        }),
      ]);

      setAdmin(me);
      setTransactions(response.items);
      setTotal(response.total);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load payment transactions.",
      );
    } finally {
      setLoading(false);
    }
  }, [limit, query, statusFilter, typeFilter]);

  useEffect(() => {
    void loadTransactions();
  }, [loadTransactions]);

  const counters = useMemo(() => {
    const paidTransactions = transactions.filter(
      (item) => item.transaction_status === "paid",
    );
    const pendingTransactions = transactions.filter(
      (item) => item.transaction_status === "pending",
    );
    const failedTransactions = transactions.filter(
      (item) => item.transaction_status === "failed",
    );

    const paidAmount = paidTransactions.reduce((sum, item) => {
      return sum + Number(item.amount_eur ?? 0);
    }, 0);

    return {
      visible: transactions.length,
      total,
      paid: paidTransactions.length,
      pending: pendingTransactions.length,
      failed: failedTransactions.length,
      paidAmount,
    };
  }, [total, transactions]);

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((left, right) => {
      const leftDate = new Date(getTransactionDate(left)).getTime();
      const rightDate = new Date(getTransactionDate(right)).getTime();

      return rightDate - leftDate;
    });
  }, [transactions]);

  return (
    <AdminShell
      activeHref="/admin/payment-transactions"
      title="Payment Transactions"
      subtitle="Track payments made by workers for levers, AI artifacts, subscriptions, and other paid actions."
      adminEmail={admin?.email ?? null}
      adminRole={admin?.role ?? "admin"}
      adminOrganizationName={admin?.organization_name ?? null}
    >
      <div className="stack" style={{ gap: 18 }}>
        <div
          className="card stack"
          style={{
            gap: 14,
            border: "1px solid rgba(59,130,246,0.16)",
            background:
              "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(255,255,255,0.96) 58%, rgba(34,197,94,0.06))",
          }}
        >
          <div
            className="row space-between"
            style={{ gap: 14, flexWrap: "wrap", alignItems: "flex-start" }}
          >
            <div className="stack" style={{ gap: 6, maxWidth: 860 }}>
              <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                <span className="badge primary">Payments</span>
                <span className="badge">Worker transactions</span>
                <span className="badge">Stripe tracking</span>
              </div>

              <div className="section-title" style={{ fontSize: 24 }}>
                Worker payment transaction ledger
              </div>

              <div className="muted" style={{ lineHeight: 1.6 }}>
                Monitor every payment created from LeanWorker: worker, lever,
                recommendation, generated artifact, amount, Stripe identifiers,
                and transaction status.
              </div>
            </div>

            <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              <button
                className="button ghost"
                type="button"
                onClick={() => void loadTransactions()}
                disabled={loading}
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="admin-kpi-scroll">
          <div className="admin-kpi-row admin-kpi-row--5">
            <KpiCard label="Total matched" value={counters.total} tone="primary" />
            <KpiCard label="Visible" value={counters.visible} />
            <KpiCard label="Paid" value={counters.paid} tone="success" />
            <KpiCard label="Pending" value={counters.pending} tone="warning" />
            <KpiCard label="Paid amount" value={formatAmount(counters.paidAmount)} tone="success" />
          </div>
        </div>

        {error ? (
          <div className="card-soft" style={{ color: "var(--danger)" }}>
            {error}
          </div>
        ) : null}

        <div className="card stack" style={{ gap: 14 }}>
          <div
            className="row space-between"
            style={{ gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}
          >
            <div className="stack" style={{ gap: 4 }}>
              <div className="section-title">Filters</div>
              <div className="muted">
                Search by worker, email, lever, recommendation, artifact, Stripe session,
                or payment intent.
              </div>
            </div>

            <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              <input
                className="input"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search transactions..."
                style={{ minWidth: 260 }}
              />

              <select
                className="select"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as TransactionStatusFilter)
                }
                style={{ minWidth: 170 }}
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
                <option value="failed">Failed</option>
              </select>

              <select
                className="select"
                value={typeFilter}
                onChange={(event) =>
                  setTypeFilter(event.target.value as TransactionTypeFilter)
                }
                style={{ minWidth: 180 }}
              >
                <option value="all">All types</option>
                <option value="ai_artifact">AI artifact</option>
                <option value="lever">Lever</option>
                <option value="subscription">Subscription</option>
              </select>

              <select
                className="select"
                value={limit}
                onChange={(event) => setLimit(Number(event.target.value))}
                style={{ minWidth: 120 }}
              >
                <option value={25}>25 rows</option>
                <option value={50}>50 rows</option>
                <option value={100}>100 rows</option>
                <option value={200}>200 rows</option>
              </select>

              <button
                className="button"
                type="button"
                onClick={() => void loadTransactions()}
                disabled={loading}
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        <div className="card stack" style={{ gap: 14 }}>
          <div
            className="row space-between"
            style={{ gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}
          >
            <div className="stack" style={{ gap: 4 }}>
              <div className="section-title">Transactions</div>
              <div className="muted">
                Latest payment events created from worker actions.
              </div>
            </div>

            <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              <span className="badge">loaded: {transactions.length}</span>
              <span className="badge">total: {total}</span>
              <span className="badge">failed: {counters.failed}</span>
            </div>
          </div>

          {loading ? (
            <div className="card-soft">Loading payment transactions...</div>
          ) : sortedTransactions.length === 0 ? (
            <div className="card-soft stack">
              <strong>No payment transactions found.</strong>
              <div className="muted">
                Transactions will appear here when a worker starts or completes a paid
                action such as an AI artifact checkout.
              </div>
            </div>
          ) : (
            <div
              className="stack"
              style={{
                gap: 12,
                maxHeight: "calc(100vh - 360px)",
                minHeight: 360,
                overflowY: "auto",
                paddingRight: 6,
                paddingBottom: 4,
              }}
            >
              {sortedTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="card-soft stack"
                  style={{
                    gap: 12,
                    border: "1px solid rgba(15,23,42,0.08)",
                    background: "rgba(255,255,255,0.86)",
                  }}
                >
                  <div
                    className="row space-between"
                    style={{ gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}
                  >
                    <div className="stack" style={{ gap: 7, minWidth: 0 }}>
                      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                        <span className="badge">#{transaction.id}</span>
                        <span style={statusTone(transaction.transaction_status)}>
                          {normalizeLabel(transaction.transaction_status)}
                        </span>
                        <span style={typeTone(transaction.transaction_type)}>
                          {normalizeLabel(transaction.transaction_type)}
                        </span>
                        {transaction.artifact_format ? (
                          <span className="badge">
                            {normalizeLabel(transaction.artifact_format)}
                          </span>
                        ) : null}
                      </div>

                      <div className="section-title" style={{ fontSize: 18 }}>
                        {getItemLabel(transaction)}
                      </div>

                      <div className="muted" style={{ lineHeight: 1.55 }}>
                        {getTransactionDescription(transaction)}
                      </div>
                    </div>

                    <div
                      className="card-soft stack"
                      style={{
                        gap: 4,
                        textAlign: "right",
                        minWidth: 230,
                        background: "rgba(248,250,252,0.9)",
                      }}
                    >
                      <div className="muted">Amount</div>
                      <strong style={{ fontSize: 22 }}>
                        {formatAmount(transaction.amount_eur, transaction.currency)}
                      </strong>
                      <div className="muted">
                        {formatDateTime(getTransactionDate(transaction))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-3">
                    <div className="stack" style={{ gap: 4 }}>
                      <div className="muted">Worker</div>
                      <strong>{getWorkerLabel(transaction)}</strong>
                      {transaction.worker_email ? (
                        <div className="muted">{transaction.worker_email}</div>
                      ) : null}
                    </div>

                    <div className="stack" style={{ gap: 4 }}>
                      <div className="muted">Lever</div>
                      <strong>{transaction.lever_name || "—"}</strong>
                      {transaction.lever_id ? (
                        <div className="muted">Lever #{transaction.lever_id}</div>
                      ) : null}
                    </div>

                    <div className="stack" style={{ gap: 4 }}>
                      <div className="muted">AI artifact</div>
                      <strong>{transaction.artifact_title || "—"}</strong>
                      {transaction.artifact_id ? (
                        <div className="muted">Artifact #{transaction.artifact_id}</div>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid grid-3">
                    <div className="stack" style={{ gap: 4 }}>
                      <div className="muted">Recommendation</div>
                      <strong>{transaction.recommendation_title || "—"}</strong>
                      {transaction.recommendation_id ? (
                        <div className="muted">
                          Recommendation #{transaction.recommendation_id}
                        </div>
                      ) : null}
                    </div>

                    <div className="stack" style={{ gap: 4 }}>
                      <div className="muted">Created</div>
                      <div>{formatDateTime(transaction.created_at)}</div>
                    </div>

                    <div className="stack" style={{ gap: 4 }}>
                      <div className="muted">Updated</div>
                      <div>{formatDateTime(transaction.updated_at)}</div>
                    </div>
                  </div>

                  <div className="grid grid-3">
                    <CopyableValue
                      label="Stripe checkout session"
                      value={transaction.checkout_session_id}
                    />

                    <CopyableValue
                      label="Stripe payment intent"
                      value={transaction.payment_intent_id}
                    />

                    <CopyableValue
                      label="Stripe customer"
                      value={transaction.stripe_customer_id}
                    />
                  </div>

                  {(transaction.paid_at ||
                    transaction.cancelled_at ||
                    transaction.failed_at) ? (
                    <div className="grid grid-3">
                      <div className="stack" style={{ gap: 4 }}>
                        <div className="muted">Paid at</div>
                        <div>{formatDateTime(transaction.paid_at)}</div>
                      </div>

                      <div className="stack" style={{ gap: 4 }}>
                        <div className="muted">Cancelled at</div>
                        <div>{formatDateTime(transaction.cancelled_at)}</div>
                      </div>

                      <div className="stack" style={{ gap: 4 }}>
                        <div className="muted">Failed at</div>
                        <div>{formatDateTime(transaction.failed_at)}</div>
                      </div>
                    </div>
                  ) : null}

                  {transaction.recommendation_description ? (
                    <div
                      className="card-soft"
                      style={{
                        background: "rgba(15,23,42,0.04)",
                      }}
                    >
                      <strong>Recommendation description</strong>
                      <div className="muted" style={{ marginTop: 4, lineHeight: 1.55 }}>
                        {transaction.recommendation_description}
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}