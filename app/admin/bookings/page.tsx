"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { AdminGuard } from "@/components/admin-guard";
import { AdminShell } from "@/components/admin-shell";
import {
  getAdminBookings,
  getAdminCalendlyAvailability,
  getAdminMe,
  syncAdminCalendlyBookings,
} from "@/lib/api";
import type {
  AdminBooking,
  AdminCalendlyAvailabilityResponse,
  AdminCalendlyAvailableTime,
  AdminCalendlySyncResponse,
  AdminMe,
} from "@/lib/types";

type BookingStatusFilter =
  | "all"
  | "requested"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

type CalendarViewMode = "day" | "week" | "month";

type CalendarSlot = {
  id: string;
  start: Date;
  end?: Date | null;
  title: string;
  subtitle?: string | null;
  status: "booked" | "available";
  booking?: AdminBooking;
  availability?: AdminCalendlyAvailableTime;
};

const HOUR_HEIGHT = 64;
const DAY_START_HOUR = 7;
const DAY_END_HOUR = 21;
const DEFAULT_SLOT_MINUTES = 30;

export default function AdminBookingsPage() {
  return (
    <AdminGuard>
      <AdminBookingsContent />
    </AdminGuard>
  );
}

function formatDateTime(value?: string | null): string {
  if (!value) return "Not scheduled";

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

function formatTime(value?: string | Date | null): string {
  if (!value) return "—";

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDayLabel(value: Date): string {
  return value.toLocaleDateString(undefined, {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

function formatMonthLabel(value: Date): string {
  return value.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
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

function startOfDay(value: Date): Date {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function endOfDay(value: Date): Date {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
}

function startOfWeek(value: Date): Date {
  const date = startOfDay(value);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date;
}

function endOfWeek(value: Date): Date {
  const date = startOfWeek(value);
  date.setDate(date.getDate() + 6);
  return endOfDay(date);
}

function startOfMonthGrid(value: Date): Date {
  const first = new Date(value.getFullYear(), value.getMonth(), 1);
  return startOfWeek(first);
}

function endOfMonthGrid(value: Date): Date {
  const last = new Date(value.getFullYear(), value.getMonth() + 1, 0);
  return endOfWeek(last);
}

function addDays(value: Date, days: number): Date {
  const date = new Date(value);
  date.setDate(date.getDate() + days);
  return date;
}

function addMonths(value: Date, months: number): Date {
  const date = new Date(value);
  date.setMonth(date.getMonth() + months);
  return date;
}

function isSameDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function isWithinRange(date: Date, start: Date, end: Date): boolean {
  return date.getTime() >= start.getTime() && date.getTime() <= end.getTime();
}

function getCalendarRange(viewMode: CalendarViewMode, anchorDate: Date): { start: Date; end: Date } {
  if (viewMode === "day") {
    return {
      start: startOfDay(anchorDate),
      end: endOfDay(anchorDate),
    };
  }

  if (viewMode === "week") {
    return {
      start: startOfWeek(anchorDate),
      end: endOfWeek(anchorDate),
    };
  }

  return {
    start: startOfMonthGrid(anchorDate),
    end: endOfMonthGrid(anchorDate),
  };
}

function getDaysBetween(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  let cursor = startOfDay(start);
  const last = startOfDay(end);

  while (cursor.getTime() <= last.getTime()) {
    days.push(new Date(cursor));
    cursor = addDays(cursor, 1);
  }

  return days;
}

function getSlotEnd(start: Date, end?: Date | null): Date {
  if (end && end.getTime() > start.getTime()) {
    return end;
  }

  const fallback = new Date(start);
  fallback.setMinutes(fallback.getMinutes() + DEFAULT_SLOT_MINUTES);
  return fallback;
}

function getSlotTopPercent(date: Date): number {
  const minutes = date.getHours() * 60 + date.getMinutes();
  const startMinutes = DAY_START_HOUR * 60;
  const endMinutes = DAY_END_HOUR * 60;
  const clamped = Math.max(startMinutes, Math.min(minutes, endMinutes));

  return ((clamped - startMinutes) / (endMinutes - startMinutes)) * 100;
}

function getSlotHeightPercent(start: Date, end: Date): number {
  const startMinutes = start.getHours() * 60 + start.getMinutes();
  const endMinutes = end.getHours() * 60 + end.getMinutes();
  const visibleStart = DAY_START_HOUR * 60;
  const visibleEnd = DAY_END_HOUR * 60;

  const clampedStart = Math.max(visibleStart, Math.min(startMinutes, visibleEnd));
  const clampedEnd = Math.max(visibleStart, Math.min(endMinutes, visibleEnd));
  const duration = Math.max(20, clampedEnd - clampedStart);

  return (duration / (visibleEnd - visibleStart)) * 100;
}

function getWorkerLabel(booking: AdminBooking): string {
  return (
    booking.worker_display_name ||
    booking.invitee_name ||
    booking.worker_email ||
    booking.invitee_email ||
    (booking.worker_id ? `Worker #${booking.worker_id}` : "Worker not linked")
  );
}

function getOrganizationLabel(booking: AdminBooking): string {
  if (booking.organization_name && booking.organization_code) {
    return `${booking.organization_name} · ${booking.organization_code}`;
  }

  return (
    booking.organization_name ||
    booking.organization_code ||
    (booking.organization_id
      ? `Organization #${booking.organization_id}`
      : "Organization not linked")
  );
}

function getCalendarTitle(viewMode: CalendarViewMode, anchorDate: Date): string {
  if (viewMode === "day") {
    return anchorDate.toLocaleDateString(undefined, {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  if (viewMode === "week") {
    const start = startOfWeek(anchorDate);
    const end = endOfWeek(anchorDate);

    return `${start.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
    })} - ${end.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })}`;
  }

  return formatMonthLabel(anchorDate);
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

function CopyableUri({
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
  };

  if (normalized === "confirmed") {
    return {
      ...base,
      color: "#15803d",
      background: "rgba(21,128,61,0.1)",
      border: "1px solid rgba(21,128,61,0.24)",
    };
  }

  if (normalized === "cancelled" || normalized === "no_show") {
    return {
      ...base,
      color: "#b91c1c",
      background: "rgba(220,38,38,0.1)",
      border: "1px solid rgba(220,38,38,0.24)",
    };
  }

  if (normalized === "completed") {
    return {
      ...base,
      color: "#334155",
      background: "rgba(15,23,42,0.07)",
      border: "1px solid rgba(15,23,42,0.14)",
    };
  }

  return {
    ...base,
    color: "#92400e",
    background: "rgba(251,191,36,0.14)",
    border: "1px solid rgba(251,191,36,0.28)",
  };
}

function sourceTone(source?: string | null): CSSProperties {
  const normalized = (source || "manual").toLowerCase();

  return {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    padding: "5px 10px",
    fontWeight: 800,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    color: normalized === "calendly" ? "#4338ca" : "#475569",
    background:
      normalized === "calendly"
        ? "rgba(99,102,241,0.12)"
        : "rgba(100,116,139,0.12)",
    border:
      normalized === "calendly"
        ? "1px solid rgba(99,102,241,0.24)"
        : "1px solid rgba(100,116,139,0.2)",
  };
}

function CalendarSlotCard({ slot, compact = false }: { slot: CalendarSlot; compact?: boolean }) {
  const isBooked = slot.status === "booked";

  return (
    <div
      title={`${slot.title} · ${formatTime(slot.start)}`}
      style={{
        borderRadius: 12,
        border: isBooked
          ? "1px solid rgba(79,70,229,0.24)"
          : "1px solid rgba(21,128,61,0.24)",
        background: isBooked ? "rgba(99,102,241,0.12)" : "rgba(21,128,61,0.1)",
        padding: compact ? "5px 7px" : "8px 10px",
        minWidth: 0,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          fontSize: compact ? 11 : 12,
          fontWeight: 800,
          color: isBooked ? "#4338ca" : "#15803d",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {formatTime(slot.start)} · {isBooked ? "Booked" : "Available"}
      </div>

      <div
        style={{
          fontSize: compact ? 11 : 12,
          marginTop: 2,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {slot.title}
      </div>
    </div>
  );
}

function DayCalendar({ day, slots }: { day: Date; slots: CalendarSlot[] }) {
  const hours = Array.from({ length: DAY_END_HOUR - DAY_START_HOUR + 1 }, (_, index) => {
    return DAY_START_HOUR + index;
  });

  const daySlots = slots.filter((slot) => isSameDay(slot.start, day));

  return (
    <div className="card-soft" style={{ overflowX: "auto" }}>
      <div style={{ minWidth: 760 }}>
        <div className="row space-between" style={{ marginBottom: 12 }}>
          <div className="section-title" style={{ fontSize: 16 }}>
            {formatDayLabel(day)}
          </div>
          <div className="muted">
            {daySlots.filter((item) => item.status === "booked").length} booked ·{" "}
            {daySlots.filter((item) => item.status === "available").length} available
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "80px 1fr",
            border: "1px solid rgba(15,23,42,0.08)",
            borderRadius: 16,
            overflow: "hidden",
            background: "rgba(255,255,255,0.6)",
          }}
        >
          <div>
            {hours.slice(0, -1).map((hour) => (
              <div
                key={hour}
                style={{
                  height: HOUR_HEIGHT,
                  padding: "8px 10px",
                  borderBottom: "1px solid rgba(15,23,42,0.06)",
                  fontSize: 12,
                  color: "var(--muted)",
                }}
              >
                {String(hour).padStart(2, "0")}:00
              </div>
            ))}
          </div>

          <div
            style={{
              position: "relative",
              minHeight: HOUR_HEIGHT * (DAY_END_HOUR - DAY_START_HOUR),
              borderLeft: "1px solid rgba(15,23,42,0.08)",
            }}
          >
            {hours.slice(0, -1).map((hour) => (
              <div
                key={hour}
                style={{
                  height: HOUR_HEIGHT,
                  borderBottom: "1px solid rgba(15,23,42,0.06)",
                }}
              />
            ))}

            {daySlots.map((slot) => {
              const end = getSlotEnd(slot.start, slot.end);
              const top = getSlotTopPercent(slot.start);
              const height = Math.max(5, getSlotHeightPercent(slot.start, end));

              return (
                <div
                  key={slot.id}
                  style={{
                    position: "absolute",
                    left: 12,
                    right: 12,
                    top: `${top}%`,
                    height: `${height}%`,
                    minHeight: 42,
                  }}
                >
                  <CalendarSlotCard slot={slot} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function WeekCalendar({ start, slots }: { start: Date; slots: CalendarSlot[] }) {
  const days = getDaysBetween(startOfWeek(start), endOfWeek(start));
  const hours = Array.from({ length: DAY_END_HOUR - DAY_START_HOUR + 1 }, (_, index) => {
    return DAY_START_HOUR + index;
  });

  return (
    <div className="card-soft" style={{ overflowX: "auto" }}>
      <div style={{ minWidth: 1120 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "72px repeat(7, minmax(140px, 1fr))",
            border: "1px solid rgba(15,23,42,0.08)",
            borderRadius: 16,
            overflow: "hidden",
            background: "rgba(255,255,255,0.6)",
          }}
        >
          <div
            style={{
              padding: 10,
              borderRight: "1px solid rgba(15,23,42,0.08)",
              borderBottom: "1px solid rgba(15,23,42,0.08)",
            }}
          />

          {days.map((day) => (
            <div
              key={day.toISOString()}
              style={{
                padding: 10,
                borderRight: "1px solid rgba(15,23,42,0.08)",
                borderBottom: "1px solid rgba(15,23,42,0.08)",
                fontWeight: 800,
                fontSize: 13,
              }}
            >
              {formatDayLabel(day)}
            </div>
          ))}

          <div>
            {hours.slice(0, -1).map((hour) => (
              <div
                key={hour}
                style={{
                  height: HOUR_HEIGHT,
                  padding: "8px 8px",
                  borderRight: "1px solid rgba(15,23,42,0.08)",
                  borderBottom: "1px solid rgba(15,23,42,0.06)",
                  fontSize: 12,
                  color: "var(--muted)",
                }}
              >
                {String(hour).padStart(2, "0")}:00
              </div>
            ))}
          </div>

          {days.map((day) => {
            const daySlots = slots.filter((slot) => isSameDay(slot.start, day));

            return (
              <div
                key={day.toISOString()}
                style={{
                  position: "relative",
                  minHeight: HOUR_HEIGHT * (DAY_END_HOUR - DAY_START_HOUR),
                  borderRight: "1px solid rgba(15,23,42,0.08)",
                }}
              >
                {hours.slice(0, -1).map((hour) => (
                  <div
                    key={hour}
                    style={{
                      height: HOUR_HEIGHT,
                      borderBottom: "1px solid rgba(15,23,42,0.06)",
                    }}
                  />
                ))}

                {daySlots.map((slot) => {
                  const end = getSlotEnd(slot.start, slot.end);
                  const top = getSlotTopPercent(slot.start);
                  const height = Math.max(5, getSlotHeightPercent(slot.start, end));

                  return (
                    <div
                      key={slot.id}
                      style={{
                        position: "absolute",
                        left: 6,
                        right: 6,
                        top: `${top}%`,
                        height: `${height}%`,
                        minHeight: 38,
                      }}
                    >
                      <CalendarSlotCard slot={slot} compact />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MonthCalendar({ anchorDate, slots }: { anchorDate: Date; slots: CalendarSlot[] }) {
  const start = startOfMonthGrid(anchorDate);
  const end = endOfMonthGrid(anchorDate);
  const days = getDaysBetween(start, end);

  return (
    <div className="card-soft" style={{ overflowX: "auto" }}>
      <div
        style={{
          minWidth: 980,
          display: "grid",
          gridTemplateColumns: "repeat(7, minmax(130px, 1fr))",
          border: "1px solid rgba(15,23,42,0.08)",
          borderRadius: 16,
          overflow: "hidden",
          background: "rgba(255,255,255,0.6)",
        }}
      >
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label) => (
          <div
            key={label}
            style={{
              padding: "10px 12px",
              fontSize: 12,
              fontWeight: 900,
              color: "var(--muted)",
              borderRight: "1px solid rgba(15,23,42,0.08)",
              borderBottom: "1px solid rgba(15,23,42,0.08)",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            {label}
          </div>
        ))}

        {days.map((day) => {
          const daySlots = slots
            .filter((slot) => isSameDay(slot.start, day))
            .sort((left, right) => left.start.getTime() - right.start.getTime());

          const isCurrentMonth = day.getMonth() === anchorDate.getMonth();

          return (
            <div
              key={day.toISOString()}
              style={{
                minHeight: 128,
                padding: 10,
                borderRight: "1px solid rgba(15,23,42,0.08)",
                borderBottom: "1px solid rgba(15,23,42,0.08)",
                background: isCurrentMonth ? "transparent" : "rgba(15,23,42,0.025)",
              }}
            >
              <div
                style={{
                  fontWeight: 900,
                  fontSize: 13,
                  marginBottom: 8,
                  color: isCurrentMonth ? "inherit" : "var(--muted)",
                }}
              >
                {day.getDate()}
              </div>

              <div className="stack" style={{ gap: 5 }}>
                {daySlots.slice(0, 4).map((slot) => (
                  <CalendarSlotCard key={slot.id} slot={slot} compact />
                ))}

                {daySlots.length > 4 ? (
                  <div className="muted" style={{ fontSize: 12 }}>
                    +{daySlots.length - 4} more
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AdminBookingsContent() {
  const [admin, setAdmin] = useState<AdminMe | null>(null);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [availability, setAvailability] = useState<AdminCalendlyAvailabilityResponse | null>(null);

  const [statusFilter, setStatusFilter] = useState<BookingStatusFilter>("all");
  const [calendarView, setCalendarView] = useState<CalendarViewMode>("week");
  const [anchorDate, setAnchorDate] = useState<Date>(() => new Date());

  const [loading, setLoading] = useState(true);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<AdminCalendlySyncResponse | null>(null);

  async function loadBookings() {
    setLoading(true);
    setError(null);

    try {
      const [me, items] = await Promise.all([
        getAdminMe(),
        getAdminBookings(statusFilter === "all" ? undefined : { status: statusFilter }),
      ]);

      setAdmin(me);
      setBookings(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  }

  async function loadAvailability() {
    const range = getCalendarRange(calendarView, anchorDate);

    setAvailabilityLoading(true);
    setAvailabilityError(null);

    try {
      const result = await getAdminCalendlyAvailability({
        start_time: range.start.toISOString(),
        end_time: range.end.toISOString(),
      });

      setAvailability(result);
    } catch (err) {
      setAvailability(null);
      setAvailabilityError(
        err instanceof Error ? err.message : "Failed to load Calendly availability.",
      );
    } finally {
      setAvailabilityLoading(false);
    }
  }

  async function handleSyncCalendly() {
    setSyncing(true);
    setError(null);
    setSyncResult(null);

    try {
      const result = await syncAdminCalendlyBookings({});
      setSyncResult(result);
      await loadBookings();

      if (admin?.role === "organization") {
        await loadAvailability();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to synchronize Calendly bookings.");
    } finally {
      setSyncing(false);
    }
  }

  useEffect(() => {
    void loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  useEffect(() => {
    if (admin?.role === "organization") {
      void loadAvailability();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin?.role, calendarView, anchorDate]);

  const counters = useMemo(() => {
    return {
      total: bookings.length,
      requested: bookings.filter((item) => item.status === "requested").length,
      confirmed: bookings.filter((item) => item.status === "confirmed").length,
      completed: bookings.filter((item) => item.status === "completed").length,
      cancelled: bookings.filter((item) => item.status === "cancelled").length,
      calendly: bookings.filter((item) => item.source === "calendly").length,
    };
  }, [bookings]);

  const sortedBookings = useMemo(() => {
    return [...bookings].sort((left, right) => {
      const leftDate = left.starts_at ? new Date(left.starts_at).getTime() : 0;
      const rightDate = right.starts_at ? new Date(right.starts_at).getTime() : 0;

      return rightDate - leftDate;
    });
  }, [bookings]);

  const calendarRange = useMemo(() => {
    return getCalendarRange(calendarView, anchorDate);
  }, [calendarView, anchorDate]);

  const calendarSlots = useMemo<CalendarSlot[]>(() => {
    const bookedSlots = bookings.reduce<CalendarSlot[]>((acc, booking) => {
      if (!booking.starts_at) {
        return acc;
      }

      const start = new Date(booking.starts_at);

      if (Number.isNaN(start.getTime())) {
        return acc;
      }

      if (!isWithinRange(start, calendarRange.start, calendarRange.end)) {
        return acc;
      }

      const rawEnd = booking.ends_at ? new Date(booking.ends_at) : null;
      const end = rawEnd && !Number.isNaN(rawEnd.getTime()) ? rawEnd : null;

      acc.push({
        id: `booking-${booking.id}`,
        start,
        end,
        title: getWorkerLabel(booking),
        subtitle: booking.title,
        status: "booked",
        booking,
      });

      return acc;
    }, []);

    const availableSlots = (availability?.available_times || []).reduce<CalendarSlot[]>(
      (acc, item, index) => {
        const start = new Date(item.start_time);

        if (Number.isNaN(start.getTime())) {
          return acc;
        }

        if (!isWithinRange(start, calendarRange.start, calendarRange.end)) {
          return acc;
        }

        const end = new Date(start);
        end.setMinutes(end.getMinutes() + DEFAULT_SLOT_MINUTES);

        acc.push({
          id: `availability-${item.start_time}-${index}`,
          start,
          end,
          title: "Available slot",
          subtitle: item.scheduling_url || null,
          status: "available",
          availability: item,
        });

        return acc;
      },
      [],
    );

    return [...bookedSlots, ...availableSlots].sort(
      (left, right) => left.start.getTime() - right.start.getTime(),
    );
  }, [availability?.available_times, bookings, calendarRange.end, calendarRange.start]);

  const isOrganization = admin?.role === "organization";

  function goToPreviousPeriod() {
    if (calendarView === "day") {
      setAnchorDate((current) => addDays(current, -1));
      return;
    }

    if (calendarView === "week") {
      setAnchorDate((current) => addDays(current, -7));
      return;
    }

    setAnchorDate((current) => addMonths(current, -1));
  }

  function goToNextPeriod() {
    if (calendarView === "day") {
      setAnchorDate((current) => addDays(current, 1));
      return;
    }

    if (calendarView === "week") {
      setAnchorDate((current) => addDays(current, 7));
      return;
    }

    setAnchorDate((current) => addMonths(current, 1));
  }

  return (
    <AdminShell
      activeHref="/admin/bookings"
      title="Manage Bookings"
      subtitle="Manage Calendly-based meetings between workers and organizations."
      adminEmail={admin?.email ?? null}
      adminRole={admin?.role ?? "admin"}
      adminOrganizationName={admin?.organization_name ?? null}
    >
      <div className="stack" style={{ gap: 18 }}>
        <div className="card stack" style={{ gap: 8 }}>
          <div className="section-title">Worker ↔ Organization meetings</div>
          <div className="muted">
            This workspace centralizes appointments created through Calendly and links them back
            to LeanWorker workers and their assigned organizations.
          </div>
        </div>

        <div
          style={{
            width: "100%",
            overflowX: "auto",
            paddingBottom: 4,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, minmax(170px, 1fr))",
              gap: 14,
              minWidth: 920,
            }}
          >
            <div className="card stack">
              <div className="muted">Total bookings</div>
              <div className="admin-metric-value">{counters.total}</div>
            </div>

            <div className="card stack">
              <div className="muted">Confirmed</div>
              <div className="admin-metric-value">{counters.confirmed}</div>
            </div>

            <div className="card stack">
              <div className="muted">Completed</div>
              <div className="admin-metric-value">{counters.completed}</div>
            </div>

            <div className="card stack">
              <div className="muted">Cancelled</div>
              <div className="admin-metric-value">{counters.cancelled}</div>
            </div>

            <div className="card stack">
              <div className="muted">Calendly synced</div>
              <div className="admin-metric-value">{counters.calendly}</div>
            </div>
          </div>
        </div>

        {isOrganization ? (
          <div className="card stack" style={{ gap: 14 }}>
            <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
              <div className="stack" style={{ gap: 4 }}>
                <div className="section-title">Calendar availability</div>
                <div className="muted">
                  View occupied bookings and available Calendly slots for your organization.
                </div>
              </div>

              <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                <button className="button ghost" type="button" onClick={goToPreviousPeriod}>
                  Previous
                </button>

                <button
                  className="button ghost"
                  type="button"
                  onClick={() => setAnchorDate(new Date())}
                >
                  Today
                </button>

                <button className="button ghost" type="button" onClick={goToNextPeriod}>
                  Next
                </button>

                <select
                  className="input"
                  value={calendarView}
                  onChange={(event) => setCalendarView(event.target.value as CalendarViewMode)}
                  style={{ minWidth: 150 }}
                >
                  <option value="day">Day</option>
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                </select>

                <button
                  className="button ghost"
                  type="button"
                  onClick={() => void loadAvailability()}
                  disabled={availabilityLoading}
                >
                  {availabilityLoading ? "Loading..." : "Refresh slots"}
                </button>
              </div>
            </div>

            <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
              <div className="section-title" style={{ fontSize: 16 }}>
                {getCalendarTitle(calendarView, anchorDate)}
              </div>

              <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                <span className="badge">
                  booked: {calendarSlots.filter((item) => item.status === "booked").length}
                </span>
                <span className="badge">
                  available: {calendarSlots.filter((item) => item.status === "available").length}
                </span>
              </div>
            </div>

            {availabilityError ? (
              <div className="card-soft" style={{ color: "var(--danger)" }}>
                {availabilityError}
              </div>
            ) : null}

            {calendarView === "day" ? (
              <DayCalendar day={anchorDate} slots={calendarSlots} />
            ) : calendarView === "week" ? (
              <WeekCalendar start={anchorDate} slots={calendarSlots} />
            ) : (
              <MonthCalendar anchorDate={anchorDate} slots={calendarSlots} />
            )}
          </div>
        ) : null}

        <div className="card stack">
          <div className="row space-between" style={{ gap: 12, flexWrap: "wrap" }}>
            <div className="stack" style={{ gap: 4 }}>
              <div className="section-title">Bookings</div>
              <div className="muted">
                Filter, refresh, and synchronize meetings from Calendly.
              </div>
            </div>

            <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              <select
                className="input"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as BookingStatusFilter)}
                style={{ minWidth: 180 }}
              >
                <option value="all">All statuses</option>
                <option value="requested">Requested</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No show</option>
              </select>

              <button
                className="button ghost"
                type="button"
                onClick={() => void loadBookings()}
                disabled={loading || syncing}
              >
                Refresh
              </button>

              <button
                className="button"
                type="button"
                onClick={() => void handleSyncCalendly()}
                disabled={loading || syncing}
              >
                {syncing ? "Syncing..." : "Sync Calendly"}
              </button>
            </div>
          </div>

          {syncResult ? (
            <div
              className="card-soft stack"
              style={{
                gap: 8,
                border: "1px solid rgba(99,102,241,0.22)",
                background: "rgba(99,102,241,0.08)",
              }}
            >
              <strong>{syncResult.message}</strong>
              <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                <span className="badge">events: {syncResult.scanned_events}</span>
                <span className="badge">invitees: {syncResult.scanned_invitees}</span>
                <span className="badge">created: {syncResult.created_count}</span>
                <span className="badge">updated: {syncResult.updated_count}</span>
                <span className="badge">skipped: {syncResult.skipped_count}</span>
              </div>
            </div>
          ) : null}

          {loading ? (
            <div className="card-soft">Loading bookings...</div>
          ) : error ? (
            <div className="card-soft" style={{ color: "var(--danger)" }}>
              {error}
            </div>
          ) : sortedBookings.length === 0 ? (
            <div className="card-soft stack">
              <strong>No bookings yet.</strong>
              <div className="muted">
                Once Calendly meetings are synchronized, Worker ↔ Organization bookings will
                appear here.
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
              {sortedBookings.map((booking) => (
                <div key={booking.id} className="card-soft stack" style={{ gap: 12 }}>
                  <div
                    className="row space-between"
                    style={{ gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}
                  >
                    <div className="stack" style={{ gap: 7 }}>
                      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                        <span className="badge">#{booking.id}</span>
                        <span style={statusTone(booking.status)}>
                          {normalizeLabel(booking.status)}
                        </span>
                        <span style={sourceTone(booking.source)}>
                          {normalizeLabel(booking.source)}
                        </span>
                        {booking.booking_type ? (
                          <span className="badge">{normalizeLabel(booking.booking_type)}</span>
                        ) : null}
                      </div>

                      <div className="section-title" style={{ fontSize: 17 }}>
                        {booking.title}
                      </div>

                      {booking.description ? (
                        <div className="muted">{booking.description}</div>
                      ) : null}
                    </div>

                    <div className="stack" style={{ gap: 4, textAlign: "right", minWidth: 210 }}>
                      <div className="muted">Meeting time</div>
                      <strong>{formatDateTime(booking.starts_at)}</strong>
                      {booking.ends_at ? (
                        <div className="muted">Ends {formatDateTime(booking.ends_at)}</div>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid grid-3">
                    <div className="stack" style={{ gap: 4 }}>
                      <div className="muted">Worker / invitee</div>
                      <strong>{getWorkerLabel(booking)}</strong>
                      {booking.invitee_email ? (
                        <div className="muted">{booking.invitee_email}</div>
                      ) : null}
                    </div>

                    <div className="stack" style={{ gap: 4 }}>
                      <div className="muted">Organization</div>
                      <strong>{getOrganizationLabel(booking)}</strong>
                    </div>

                    <div className="stack" style={{ gap: 4 }}>
                      <div className="muted">Location</div>
                      <strong>{booking.location || "Not specified"}</strong>
                      {booking.timezone ? <div className="muted">{booking.timezone}</div> : null}
                    </div>
                  </div>

                  <div className="grid grid-3">
                    <div className="stack" style={{ gap: 4 }}>
                      <div className="muted">External provider</div>
                      <div>{normalizeLabel(booking.external_provider || booking.source)}</div>
                    </div>

                    <CopyableUri
                      label="Calendly scheduled event URI"
                      value={booking.external_event_uri}
                    />

                    <CopyableUri
                      label="Calendly event type URI"
                      value={booking.external_event_type_uri}
                    />
                  </div>

                  <div className="grid grid-3">
                    <CopyableUri label="Invitee URI" value={booking.external_invitee_uri} />

                    <div className="stack" style={{ gap: 4 }}>
                      <div className="muted">Last update</div>
                      <div>{formatDateTime(booking.updated_at)}</div>
                    </div>

                    <div className="stack" style={{ gap: 4 }}>
                      <div className="muted">Booking source</div>
                      <div>{normalizeLabel(booking.source)}</div>
                    </div>
                  </div>

                  <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                    {booking.meeting_url ? (
                      <a
                        className="button ghost"
                        href={booking.meeting_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open meeting
                      </a>
                    ) : null}

                    {booking.cancel_url ? (
                      <a
                        className="button ghost"
                        href={booking.cancel_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Cancel in Calendly
                      </a>
                    ) : null}

                    {booking.reschedule_url ? (
                      <a
                        className="button ghost"
                        href={booking.reschedule_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Reschedule in Calendly
                      </a>
                    ) : null}
                  </div>

                  {booking.notes ? (
                    <div
                      className="card-soft"
                      style={{
                        background: "rgba(15,23,42,0.04)",
                      }}
                    >
                      <strong>Notes</strong>
                      <div className="muted">{booking.notes}</div>
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