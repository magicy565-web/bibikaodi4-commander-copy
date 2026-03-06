import { describe, it, expect } from "vitest";

// ─── Test: Inquiry Intent Classification Logic ────────────────
describe("Inquiry Intent Classification", () => {
  const classifyIntent = (confidence: number): "high" | "medium" | "low" => {
    if (confidence >= 90) return "high";
    if (confidence >= 75) return "medium";
    return "low";
  };

  it("should classify confidence >= 90 as high intent", () => {
    expect(classifyIntent(96)).toBe("high");
    expect(classifyIntent(90)).toBe("high");
    expect(classifyIntent(94)).toBe("high");
  });

  it("should classify confidence 75-89 as medium intent", () => {
    expect(classifyIntent(87)).toBe("medium");
    expect(classifyIntent(75)).toBe("medium");
    expect(classifyIntent(78)).toBe("medium");
  });

  it("should classify confidence < 75 as low intent", () => {
    expect(classifyIntent(62)).toBe("low");
    expect(classifyIntent(50)).toBe("low");
  });
});

// ─── Test: AI Log Status Mapping ─────────────────────────────
describe("AI Log Status", () => {
  const STATUS_LABELS: Record<string, string> = {
    sent: "已发送",
    draft: "草稿待发",
    pending: "待处理",
  };

  it("should map all statuses to correct labels", () => {
    expect(STATUS_LABELS["sent"]).toBe("已发送");
    expect(STATUS_LABELS["draft"]).toBe("草稿待发");
    expect(STATUS_LABELS["pending"]).toBe("待处理");
  });
});

// ─── Test: Asset Status Logic ─────────────────────────────────
describe("Asset Status", () => {
  type AssetStatus = "uploading" | "processing" | "active" | "error";

  const isActivated = (status: AssetStatus) => status === "active";
  const isProcessing = (status: AssetStatus) => status === "processing" || status === "uploading";

  it("should correctly identify active assets", () => {
    expect(isActivated("active")).toBe(true);
    expect(isActivated("processing")).toBe(false);
    expect(isActivated("uploading")).toBe(false);
  });

  it("should correctly identify processing assets", () => {
    expect(isProcessing("processing")).toBe(true);
    expect(isProcessing("uploading")).toBe(true);
    expect(isProcessing("active")).toBe(false);
  });
});

// ─── Test: Inquiry Value Parsing ─────────────────────────────
describe("Inquiry Value", () => {
  const parseValue = (value: string): number => {
    return parseFloat(value.replace(/[$,]/g, ""));
  };

  it("should parse dollar values correctly", () => {
    expect(parseValue("$48,000")).toBe(48000);
    expect(parseValue("$32,000")).toBe(32000);
    expect(parseValue("$101,600")).toBe(101600);
  });
});

// ─── Test: Greeting Logic ─────────────────────────────────────
describe("Greeting Logic", () => {
  const getGreeting = (hour: number): string => {
    if (hour < 12) return "早上好";
    if (hour < 18) return "下午好";
    return "晚上好";
  };

  it("should return morning greeting for hours 0-11", () => {
    expect(getGreeting(6)).toBe("早上好");
    expect(getGreeting(11)).toBe("早上好");
    expect(getGreeting(0)).toBe("早上好");
  });

  it("should return afternoon greeting for hours 12-17", () => {
    expect(getGreeting(12)).toBe("下午好");
    expect(getGreeting(17)).toBe("下午好");
  });

  it("should return evening greeting for hours 18-23", () => {
    expect(getGreeting(18)).toBe("晚上好");
    expect(getGreeting(22)).toBe("晚上好");
  });
});

// ─── Test: Tag Category Colors ────────────────────────────────
describe("Tag Category Colors", () => {
  const TAG_COLORS: Record<string, string> = {
    material: "#60A5FA",
    application: "#10B981",
    advantage: "#2DD4BF",
    market: "#F59E0B",
    buyer: "#A78BFA",
  };

  it("should have color for all tag categories", () => {
    const categories = ["material", "application", "advantage", "market", "buyer"];
    categories.forEach((cat) => {
      expect(TAG_COLORS[cat]).toBeDefined();
      expect(TAG_COLORS[cat]).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });
});
