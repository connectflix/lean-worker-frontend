import { describe, expect, expectTypeOf, it } from "vitest";

import type {
  TrajectorySignalResponse,
  TrajectorySignalValue,
} from "@/lib/types";

const CANONICAL_TRAJECTORY_SIGNAL_FIELDS = [
  "trajectory_update_id",
  "source_session_id",
  "source_context_snapshot_id",
  "source_decisive_action_id",
  "source_execution_result_id",
  "trajectory_signal",
  "trajectory_summary",
  "attention_shift",
  "learned_constraints",
  "capability_signals",
  "effective_lever_signals",
  "next_attention_candidates",
  "recommended_next_focus",
  "confidence",
] as const satisfies readonly (keyof TrajectorySignalResponse)[];

type CanonicalTrajectorySignalField =
  (typeof CANONICAL_TRAJECTORY_SIGNAL_FIELDS)[number];

type MissingCanonicalFields = Exclude<
  keyof TrajectorySignalResponse,
  CanonicalTrajectorySignalField
>;

type UnexpectedCanonicalFields = Exclude<
  CanonicalTrajectorySignalField,
  keyof TrajectorySignalResponse
>;

type ForbiddenCommercialOrInternalField =
  | "payment_transaction_id"
  | "checkout_session_id"
  | "payment_intent_id"
  | "stripe_customer_id"
  | "transaction_status"
  | "amount_eur"
  | "price_eur"
  | "revenue"
  | "commercial_offer_resolution"
  | "reasoning_payload_json"
  | "rationale_json"
  | "raw_transcript";

type ForbiddenFieldsPresent = Extract<
  keyof TrajectorySignalResponse,
  ForbiddenCommercialOrInternalField
>;

describe("TrajectorySignalResponse frontend contract", () => {
  it("keeps exactly the canonical 14 public fields", () => {
    expect(CANONICAL_TRAJECTORY_SIGNAL_FIELDS).toHaveLength(14);

    expectTypeOf<MissingCanonicalFields>().toEqualTypeOf<never>();
    expectTypeOf<UnexpectedCanonicalFields>().toEqualTypeOf<never>();
  });

  it("keeps the trajectory signal value set bounded", () => {
    expectTypeOf<TrajectorySignalValue>().toEqualTypeOf<
      | "positive"
      | "mixed"
      | "neutral"
      | "negative"
      | "insufficient_evidence"
    >();
  });

  it("keeps source lineage identifiers optional and nullable", () => {
    expectTypeOf<
      TrajectorySignalResponse["trajectory_update_id"]
    >().toEqualTypeOf<number | null | undefined>();

    expectTypeOf<
      TrajectorySignalResponse["source_session_id"]
    >().toEqualTypeOf<number | null | undefined>();

    expectTypeOf<
      TrajectorySignalResponse["source_context_snapshot_id"]
    >().toEqualTypeOf<number | null | undefined>();

    expectTypeOf<
      TrajectorySignalResponse["source_decisive_action_id"]
    >().toEqualTypeOf<number | null | undefined>();

    expectTypeOf<
      TrajectorySignalResponse["source_execution_result_id"]
    >().toEqualTypeOf<number | null | undefined>();
  });

  it("keeps the worker-facing synthesis fields optional and nullable", () => {
    expectTypeOf<
      TrajectorySignalResponse["trajectory_signal"]
    >().toEqualTypeOf<
      TrajectorySignalValue | null | undefined
    >();

    expectTypeOf<
      TrajectorySignalResponse["trajectory_summary"]
    >().toEqualTypeOf<string | null | undefined>();

    expectTypeOf<
      TrajectorySignalResponse["recommended_next_focus"]
    >().toEqualTypeOf<string | null | undefined>();

    expectTypeOf<
      TrajectorySignalResponse["confidence"]
    >().toEqualTypeOf<number | null | undefined>();
  });

  it("keeps bounded learning collections flexible without exposing storage schemas", () => {
    expectTypeOf<
      TrajectorySignalResponse["attention_shift"]
    >().toEqualTypeOf<
      Record<string, unknown> | null | undefined
    >();

    expectTypeOf<
      TrajectorySignalResponse["learned_constraints"]
    >().toEqualTypeOf<unknown[] | null | undefined>();

    expectTypeOf<
      TrajectorySignalResponse["capability_signals"]
    >().toEqualTypeOf<unknown[] | null | undefined>();

    expectTypeOf<
      TrajectorySignalResponse["effective_lever_signals"]
    >().toEqualTypeOf<unknown[] | null | undefined>();

    expectTypeOf<
      TrajectorySignalResponse["next_attention_candidates"]
    >().toEqualTypeOf<unknown[] | null | undefined>();
  });

  it("does not allow commercial, payment, rationale, or raw-transcript fields", () => {
    expectTypeOf<ForbiddenFieldsPresent>().toEqualTypeOf<never>();
  });

  it("accepts the empty-history HTTP contract", () => {
    const emptyHistory: TrajectorySignalResponse = {};

    expect(emptyHistory).toEqual({});
  });
});