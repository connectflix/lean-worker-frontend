import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { OrganizationWorkerGuidanceCard } from "@/app/admin/organizations/components/organization-worker-guidance-card";
import { ProfessionalExecutionPlanCard } from "@/app/admin/organizations/components/professional-execution-plan-card";
import type {
  OrganizationWorkerGuidanceResponse,
  ProfessionalExecutionPlanResponse,
} from "@/lib/types";


const guidance: OrganizationWorkerGuidanceResponse = {
  mandate_summary: {
    mandate_summary:
      "Strengthen strategic contribution while preserving sustainable execution.",
    professional_identity: "Senior cross-functional contributor",
    expected_outcomes: ["Increase strategic contribution"],
    success_definition: ["Contribution is visible in real work"],
    meaning_drivers: ["Useful contribution"],
    engagement_drivers: ["Autonomy"],
    contribution_drivers: ["Improve decision quality"],
    hard_constraints: [
      {
        code: "capacity",
        description: "Protect delivery capacity",
        severity: "hard",
      },
    ],
    soft_constraints: [],
    time_capacity: ["Approximately four focused hours per week"],
    energy_constraints: ["Avoid sustained overload"],
    risks_to_avoid: ["Role expansion without decision authority"],
    non_negotiables: ["Professional sustainability"],
  },

  mandate_plan: {
    plan_summary:
      "Move from clarification to real-work demonstration and consolidation.",
    planning_horizon: "Approximately 4-6 months",
    approach: ["Clarify the contribution target"],
    milestones: [
      {
        sequence: 1,
        title: "Clarify contribution target",
        objective: "Make the expected contribution explicit.",
        timing: "Weeks 1-2",
        expected_progress: ["The contribution target is explicit"],
        organization_support: ["Clarify decision boundaries"],
        dependencies: [],
      },
    ],
    assumptions: ["Timing should be revisited if the mandate changes."],
  },

  organization_recommendations: [
    {
      id: 801,
      title: "Clarify decision boundaries",
      action:
        "Make explicit which decisions the Worker can take without additional approval.",
      example: null,
      rationale: "This removes an avoidable organizational dependency.",
      timing: "Before the next execution step",
      completed_at: null,
    },
  ],
};


const executionPlan: ProfessionalExecutionPlanResponse = {
  plan_summary:
    "Build visible strategic contribution through staged professional progress.",
  planning_horizon_months: 12,
  milestones: [
    {
      sequence: 1,
      title: "Establish visible strategic contribution",
      objective:
        "Create observable strategic contribution in real professional work.",
      timing: "Months 1-3",
      expected_progress: ["Strategic contribution becomes visible"],
      completion_evidence: ["One strategic contribution is documented"],
      dependencies: ["Access to a cross-functional initiative"],
    },
  ],
  guardrails: ["Respect sustainable workload constraints"],
  assumptions: ["The current Professional Intention remains valid."],
};


describe("Organization Insights child cards internationalization", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem("leanworker.uiLanguage", "fr");
  });


  it("localizes Organization Worker Guidance chrome in French without translating backend content", () => {
    render(
      <OrganizationWorkerGuidanceCard
        guidance={guidance}
        loading={false}
      />,
    );

    expect(screen.getByText("Accompagnement de l’organisation")).toBeInTheDocument();
    expect(
      screen.getByText("Espace d’accompagnement du collaborateur"),
    ).toBeInTheDocument();

    expect(screen.getByText("Mandat disponible")).toBeInTheDocument();
    expect(screen.getAllByText("1 étape")).toHaveLength(2);
    expect(screen.getAllByText("1 recommandation")).toHaveLength(2);

    expect(
      screen.getByRole("heading", { name: "Synthèse du mandat" }),
    ).toBeInTheDocument();

    expect(screen.getByText("Identité professionnelle")).toBeInTheDocument();
    expect(screen.getByText("Résultats attendus")).toBeInTheDocument();
    expect(screen.getByText("Définition de la réussite")).toBeInTheDocument();
    expect(screen.getByText("Facteurs de contribution")).toBeInTheDocument();

    expect(screen.getByText("Cadre opérationnel")).toBeInTheDocument();
    expect(screen.getByText("En un coup d’œil")).toBeInTheDocument();
    expect(screen.getByText("Capacité temporelle")).toBeInTheDocument();
    expect(screen.getByText("Non négociables")).toBeInTheDocument();
    expect(screen.getByText("Risques à éviter")).toBeInTheDocument();

    expect(screen.getByText("Facteurs moteurs")).toBeInTheDocument();
    expect(
      screen.getByText("Ce qui soutient durablement le collaborateur"),
    ).toBeInTheDocument();

    expect(screen.getByText("Garde-fous")).toBeInTheDocument();
    expect(screen.getByText("Contraintes")).toBeInTheDocument();

    expect(screen.getByText("Étape 1")).toBeInTheDocument();
    expect(screen.getByText("Objectif")).toBeInTheDocument();
    expect(screen.getByText("Progression attendue")).toBeInTheDocument();
    expect(screen.getByText("Soutien de l’organisation")).toBeInTheDocument();

    expect(
      screen.getByText("Strengthen strategic contribution while preserving sustainable execution."),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Clarify contribution target"),
    ).toBeInTheDocument();
  });


  it("localizes Professional Execution Plan chrome in French without translating persisted plan content", () => {
    render(
      <ProfessionalExecutionPlanCard
        plan={executionPlan}
        loading={false}
      />,
    );

    expect(screen.getByText("Planification professionnelle")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Plan d’exécution professionnelle",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("12 mois")).toBeInTheDocument();
    expect(screen.getByText("1 étape")).toBeInTheDocument();

    expect(screen.getByText("Vue d’ensemble du plan")).toBeInTheDocument();
    expect(screen.getByText("Feuille de route")).toBeInTheDocument();
    expect(
      screen.getByText("Sélectionnez une étape pour afficher les détails"),
    ).toBeInTheDocument();

    expect(screen.getByText("Étape 1")).toBeInTheDocument();
    expect(screen.getByText("Objectif")).toBeInTheDocument();
    expect(screen.getByText("Progression attendue")).toBeInTheDocument();
    expect(screen.getByText("Preuves de réalisation")).toBeInTheDocument();
    expect(screen.getByText("Dépendances")).toBeInTheDocument();

    expect(screen.getByText("Contexte de planification")).toBeInTheDocument();
    expect(screen.getByText("Garde-fous")).toBeInTheDocument();
    expect(screen.getByText("Hypothèses de planification")).toBeInTheDocument();

    expect(
      screen.getByText(
        "Build visible strategic contribution through staged professional progress.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Establish visible strategic contribution"),
    ).toBeInTheDocument();
  });


  it("localizes both child-card loading and empty states in French", () => {
    const { rerender } = render(
      <OrganizationWorkerGuidanceCard
        guidance={null}
        loading
      />,
    );

    expect(
      screen.getByText("Chargement de l’accompagnement de l’organisation..."),
    ).toBeInTheDocument();

    rerender(
      <OrganizationWorkerGuidanceCard
        guidance={{
          mandate_summary: null,
          mandate_plan: null,
          organization_recommendations: [],
        }}
        loading={false}
      />,
    );

    expect(
      screen.getByText("Aucun accompagnement lié au mandat disponible pour le moment."),
    ).toBeInTheDocument();

    rerender(
      <ProfessionalExecutionPlanCard
        plan={null}
        loading
      />,
    );

    expect(
      screen.getByText("Chargement du plan d’exécution professionnelle..."),
    ).toBeInTheDocument();

    rerender(
      <ProfessionalExecutionPlanCard
        plan={null}
        loading={false}
      />,
    );

    expect(
      screen.getByText("Aucun plan d’exécution professionnelle disponible pour le moment."),
    ).toBeInTheDocument();
  });
});
