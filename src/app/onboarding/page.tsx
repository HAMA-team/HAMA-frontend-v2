"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useUserStore } from "@/store/userStore";
import { useDialogStore } from "@/store/dialogStore";

type OnboardingStep =
  | "intro"
  | "basicInfo"
  | "purpose"
  | "style"
  | "allocation"
  | "summary";

type RiskProfileType =
  | "conservative"
  | "moderatelyConservative"
  | "neutral"
  | "aggressive";

interface FormState {
  name: string;
  ageInput: string;
  purpose: string;
  style: "conservative" | "neutral" | "aggressive" | null;
  allocation: 1 | 2 | 3 | 4 | 5 | null;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { setInvestmentProfile, setUserInfo } = useUserStore();
  const { openConfirm, close } = useDialogStore();

  const [step, setStep] = useState<OnboardingStep>("intro");
  const [form, setForm] = useState<FormState>({
    name: "",
    ageInput: "",
    purpose: "",
    style: null,
    allocation: null,
  });
  const [touched, setTouched] = useState<{ name: boolean }>({ name: false });

  const currentStepIndex = useMemo(() => {
    const order: OnboardingStep[] = [
      "intro",
      "basicInfo",
      "purpose",
      "style",
      "allocation",
      "summary",
    ];
    return order.indexOf(step);
  }, [step]);

  const totalSteps = 6;

  const isNameInvalid = touched.name && !form.name.trim();

  const computedAge = useMemo(() => {
    const raw = form.ageInput.trim();
    if (!raw) return 24;
    const value = Number(raw);
    if (Number.isNaN(value)) return 24;
    if (value < 18) return 18;
    if (value > 100) return 100;
    return Math.floor(value);
  }, [form.ageInput]);

  const computedRiskProfileType: RiskProfileType = useMemo(() => {
    if (!form.style || !form.allocation) {
      return "conservative";
    }

    if (form.style === "conservative") {
      return "conservative";
    }

    if (form.style === "neutral") {
      if (form.allocation <= 2) {
        return "moderatelyConservative";
      }
      if (form.allocation === 3) {
        return "neutral";
      }
      return "neutral";
    }

    if (form.allocation >= 4) {
      return "aggressive";
    }

    return "neutral";
  }, [form.style, form.allocation]);

  const handleCancelOnboarding = () => {
    openConfirm({
      title: t("mypage.onboarding.cancel.title"),
      message: t("mypage.onboarding.cancel.description"),
      confirmLabel: t("mypage.onboarding.cancel.confirm"),
      cancelLabel: t("mypage.onboarding.cancel.keep"),
      onConfirm: () => {
        close();
        router.push("/settings");
      },
    });
  };

  const handleNext = () => {
    if (step === "intro") {
      setStep("basicInfo");
    } else if (step === "basicInfo") {
      setTouched((prev) => ({ ...prev, name: true }));
      if (!form.name.trim()) {
        return;
      }
      setStep("purpose");
    } else if (step === "purpose") {
      setStep("style");
    } else if (step === "style") {
      if (!form.style) return;
      setStep("allocation");
    } else if (step === "allocation") {
      if (!form.allocation) return;
      setStep("summary");
    }
  };

  const handleBack = () => {
    if (step === "basicInfo") {
      setStep("intro");
    } else if (step === "purpose") {
      setStep("basicInfo");
    } else if (step === "style") {
      setStep("purpose");
    } else if (step === "allocation") {
      setStep("style");
    } else if (step === "summary") {
      setStep("allocation");
    }
  };

  const handleComplete = () => {
    const now = new Date().toISOString();

    const trimmedName = form.name.trim();
    const localPart = trimmedName
      .replace(/\s+/g, "")
      .toLowerCase() || "demo";
    const email = `${localPart}@hama.ai`;

    setUserInfo({
      id: "demo-onboarding",
      name: trimmedName,
      email,
      age: computedAge,
    });

    const localizedTypeLabel = t(
      `mypage.profile.types.${computedRiskProfileType}`,
    );

    const description = t("mypage.onboarding.summary.description", {
      name: form.name.trim(),
      age: computedAge,
      purpose:
        form.purpose.trim() ||
        t("mypage.onboarding.summary.defaultPurpose"),
      style: t(
        `mypage.onboarding.style.options.${form.style || "neutral"}.title`,
      ),
      allocation: t(
        `mypage.onboarding.allocation.options.${form.allocation || 1}.label`,
      ),
      type: localizedTypeLabel,
    });

    setInvestmentProfile({
      type: computedRiskProfileType,
      description,
      last_updated: now,
      context: {
        name: trimmedName,
        age: computedAge,
        purpose: form.purpose.trim(),
        styleKey: form.style || "neutral",
        allocation: form.allocation || 1,
      },
    });

    router.push("/settings");
  };

  const renderStepContent = () => {
    if (step === "intro") {
      return (
        <div className="space-y-6">
          <div>
            <span
              className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
              style={{
                backgroundColor: "var(--primary-50)",
                color: "var(--primary-500)",
              }}
            >
              {t("mypage.onboarding.badge")}
            </span>
          </div>
          <div>
            <h1
              className="text-2xl md:text-3xl font-bold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              {t("mypage.onboarding.title")}
            </h1>
            <p
              className="text-sm md:text-base"
              style={{ color: "var(--text-secondary)" }}
            >
              {t("mypage.onboarding.subtitle")}
            </p>
          </div>
          <div
            className="rounded-lg p-4 text-sm"
            style={{
              backgroundColor: "var(--main-background)",
              color: "var(--text-secondary)",
            }}
          >
            {t("mypage.onboarding.notice")}
          </div>
        </div>
      );
    }

    if (step === "basicInfo") {
      return (
        <div className="space-y-6">
          <div>
            <h2
              className="text-xl font-semibold mb-1"
              style={{ color: "var(--text-primary)" }}
            >
              {t("mypage.onboarding.basicInfo.title")}
            </h2>
            <p
              className="text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              {t("mypage.onboarding.basicInfo.subtitle")}
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label
                className="text-sm font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                {t("mypage.onboarding.basicInfo.nameLabel")}
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                onBlur={() =>
                  setTouched((prev) => ({ ...prev, name: true }))
                }
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                style={{
                  backgroundColor: "var(--main-background)",
                  borderColor: isNameInvalid
                    ? "var(--danger-500)"
                    : "var(--border-default)",
                  color: "var(--text-primary)",
                }}
                placeholder={t(
                  "mypage.onboarding.basicInfo.namePlaceholder",
                )}
              />
              {isNameInvalid && (
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--danger-500)" }}
                >
                  {t("mypage.onboarding.basicInfo.nameError")}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label
                className="text-sm font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                {t("mypage.onboarding.basicInfo.ageLabel")}
                <span
                  className="ml-1 text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {t("mypage.onboarding.basicInfo.ageOptional")}
                </span>
              </label>
              <input
                type="number"
                inputMode="numeric"
                min={18}
                max={100}
                value={form.ageInput}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, ageInput: e.target.value }))
                }
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                style={{
                  backgroundColor: "var(--main-background)",
                  borderColor: "var(--border-default)",
                  color: "var(--text-primary)",
                }}
                placeholder={t(
                  "mypage.onboarding.basicInfo.agePlaceholder",
                )}
              />
              <p
                className="text-xs"
                style={{ color: "var(--text-secondary)" }}
              >
                {t("mypage.onboarding.basicInfo.ageHelper", {
                  age: computedAge,
                })}
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (step === "purpose") {
      return (
        <div className="space-y-6">
          <div>
            <h2
              className="text-xl font-semibold mb-1"
              style={{ color: "var(--text-primary)" }}
            >
              {t("mypage.onboarding.purpose.title")}
            </h2>
            <p
              className="text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              {t("mypage.onboarding.purpose.subtitle")}
            </p>
          </div>

          <div className="space-y-2">
            <textarea
              value={form.purpose}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, purpose: e.target.value }))
              }
              rows={4}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none resize-none"
              style={{
                backgroundColor: "var(--main-background)",
                borderColor: "var(--border-default)",
                color: "var(--text-primary)",
              }}
              placeholder={t("mypage.onboarding.purpose.placeholder")}
            />
            <p
              className="text-xs"
              style={{ color: "var(--text-secondary)" }}
            >
              {t("mypage.onboarding.purpose.helper")}
            </p>
          </div>
        </div>
      );
    }

    if (step === "style") {
      return (
        <div className="space-y-6">
          <div>
            <h2
              className="text-xl font-semibold mb-1"
              style={{ color: "var(--text-primary)" }}
            >
              {t("mypage.onboarding.style.title")}
            </h2>
            <p
              className="text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              {t("mypage.onboarding.style.subtitle")}
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {(["conservative", "neutral", "aggressive"] as const).map(
              (key) => {
                const selected = form.style === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, style: key }))
                    }
                    className="text-left rounded-xl border p-4 transition-colors"
                    style={{
                      backgroundColor: selected
                        ? "var(--primary-50)"
                        : "var(--container-background)",
                      borderColor: selected
                        ? "var(--primary-500)"
                        : "var(--border-default)",
                      color: "var(--text-primary)",
                    }}
                  >
                    <div className="font-semibold mb-1">
                      {t(
                        `mypage.onboarding.style.options.${key}.title`,
                      )}
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {t(
                        `mypage.onboarding.style.options.${key}.description`,
                      )}
                    </div>
                  </button>
                );
              },
            )}
          </div>
        </div>
      );
    }

    if (step === "allocation") {
      return (
        <div className="space-y-6">
          <div>
            <h2
              className="text-xl font-semibold mb-1"
              style={{ color: "var(--text-primary)" }}
            >
              {t("mypage.onboarding.allocation.title")}
            </h2>
            <p
              className="text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              {t("mypage.onboarding.allocation.subtitle")}
            </p>
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            {[1, 2, 3, 4, 5].map((value) => {
              const selected = form.allocation === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      allocation: value as any,
                    }))
                  }
                  className="flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors"
                  style={{
                    backgroundColor: selected
                      ? "var(--primary-50)"
                      : "var(--container-background)",
                    borderColor: selected
                      ? "var(--primary-500)"
                      : "var(--border-default)",
                    color: "var(--text-primary)",
                  }}
                >
                  <div className="text-sm font-medium">
                    {t(
                      `mypage.onboarding.allocation.options.${value}.label`,
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    if (step === "summary") {
      return (
        <div className="space-y-6">
          <div>
            <h2
              className="text-xl font-semibold mb-1"
              style={{ color: "var(--text-primary)" }}
            >
              {t("mypage.onboarding.summary.title")}
            </h2>
            <p
              className="text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              {t("mypage.onboarding.summary.subtitle")}
            </p>
          </div>

          <div
            className="rounded-xl border p-4 space-y-3"
            style={{
              backgroundColor: "var(--container-background)",
              borderColor: "var(--border-default)",
            }}
          >
            <div className="flex justify-between text-sm">
              <span style={{ color: "var(--text-secondary)" }}>
                {t("mypage.onboarding.summary.name")}
              </span>
              <span style={{ color: "var(--text-primary)" }}>
                {form.name.trim()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: "var(--text-secondary)" }}>
                {t("mypage.onboarding.summary.age")}
              </span>
              <span style={{ color: "var(--text-primary)" }}>
                {computedAge}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: "var(--text-secondary)" }}>
                {t("mypage.onboarding.summary.style")}
              </span>
              <span style={{ color: "var(--text-primary)" }}>
                {form.style
                  ? t(
                      `mypage.onboarding.style.options.${form.style}.title`,
                    )
                  : t("mypage.onboarding.summary.styleFallback")}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: "var(--text-secondary)" }}>
                {t("mypage.onboarding.summary.allocation")}
              </span>
              <span style={{ color: "var(--text-primary)" }}>
                {form.allocation
                  ? t(
                      `mypage.onboarding.allocation.options.${form.allocation}.label`,
                    )
                  : t("mypage.onboarding.summary.allocationFallback")}
              </span>
            </div>
            <div className="text-sm">
              <span
                className="mr-2"
                style={{ color: "var(--text-secondary)" }}
              >
                {t("mypage.onboarding.summary.type")}
              </span>
              <span
                className="px-2 py-1 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: "var(--primary-50)",
                  color: "var(--primary-500)",
                }}
              >
                {t(
                  `mypage.profile.types.${computedRiskProfileType}`,
                )}
              </span>
            </div>
            <div
              className="mt-3 text-xs"
              style={{ color: "var(--text-secondary)" }}
            >
              {t("mypage.onboarding.summary.notice")}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderPrimaryButtonLabel = () => {
    if (step === "intro") return t("mypage.onboarding.actions.start");
    if (step === "summary") return t("mypage.onboarding.actions.finish");
    return t("mypage.onboarding.actions.next");
  };

  const isPrimaryDisabled = () => {
    if (step === "intro") return false;
    if (step === "basicInfo") {
      return !form.name.trim();
    }
    if (step === "style") {
      return !form.style;
    }
    if (step === "allocation") {
      return !form.allocation;
    }
    return false;
  };

  const handlePrimaryClick = () => {
    if (step === "summary") {
      handleComplete();
    } else {
      handleNext();
    }
  };

  return (
    <div
      className="flex h-full w-full flex-col overflow-x-hidden"
      style={{ backgroundColor: "var(--main-background)" }}
    >
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[800px] mx-auto px-4 py-8 w-full min-w-0">
          <div className="flex items-center justify-between mb-6">
            <div className="text-xs font-medium uppercase tracking-wide">
              <span style={{ color: "var(--text-secondary)" }}>
                {t("mypage.onboarding.stepIndicator.label", {
                  current: currentStepIndex + 1,
                  total: totalSteps,
                })}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCancelOnboarding}
              className="text-xs md:text-sm font-semibold px-3 py-2 rounded-lg border transition-colors"
              style={{
                backgroundColor: "transparent",
                borderColor: "var(--border-default)",
                color: "var(--text-secondary)",
              }}
            >
              {t("mypage.onboarding.actions.cancel")}
            </button>
          </div>

          <div
            className="rounded-2xl border p-6 md:p-8"
            style={{
              backgroundColor: "var(--container-background)",
              borderColor: "var(--border-default)",
            }}
          >
            {renderStepContent()}

            <div className="mt-8 flex justify-between items-center gap-4">
              <button
                type="button"
                onClick={
                  step === "intro" ? () => router.push("/settings") : handleBack
                }
                className="text-xs md:text-sm px-3 py-2 rounded-lg border transition-colors"
                style={{
                  backgroundColor: "transparent",
                  borderColor: "var(--border-default)",
                  color: "var(--text-secondary)",
                }}
              >
                {step === "intro"
                  ? t("mypage.onboarding.actions.backToMyPage")
                  : t("mypage.onboarding.actions.back")}
              </button>

              <button
                type="button"
                onClick={handlePrimaryClick}
                disabled={isPrimaryDisabled()}
                className="text-xs md:text-sm px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: isPrimaryDisabled()
                    ? "var(--border-default)"
                    : "var(--primary-500)",
                  color: isPrimaryDisabled()
                    ? "var(--text-secondary)"
                    : "#ffffff",
                }}
              >
                {renderPrimaryButtonLabel()}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
