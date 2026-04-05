import { describe, expect, test } from "bun:test";

import {
  mergeExperimentToken,
  parseExperimentToken,
  serializeExperimentToken,
  withExpParam,
} from "@/lib/experiments/attribution";

describe("experiment attribution", () => {
  test("serializes and parses experiment assignments consistently", () => {
    const token = serializeExperimentToken({
      homeHeroHeadline: "outcome",
      pricingPlanCta: "unlock",
      downloadsHeroCopy: "install_minutes",
    });

    expect(token).toBe("hhh:outcome~ppc:unlock~dhc:install_minutes");
    expect(parseExperimentToken(token)).toEqual({
      homeHeroHeadline: "outcome",
      pricingPlanCta: "unlock",
      downloadsHeroCopy: "install_minutes",
    });
  });

  test("merges new assignments over an existing token without dropping prior values", () => {
    const token = mergeExperimentToken("hhh:control~scc:compare_install", {
      homeHeroHeadline: "privacy",
      pricingHeroCopy: "one_payment",
    });

    expect(token).toBe("hhh:privacy~phc:one_payment~scc:compare_install");
  });

  test("appends exp to hrefs while preserving existing query params and hashes", () => {
    expect(withExpParam("/pricing", "hhh:outcome")).toBe("/pricing?exp=hhh%3Aoutcome");
    expect(withExpParam("/downloads?tab=cli", "hhh:outcome~ppc:unlock")).toBe(
      "/downloads?tab=cli&exp=hhh%3Aoutcome%7Eppc%3Aunlock",
    );
    expect(withExpParam("/docs#install", "hhh:outcome")).toBe(
      "/docs?exp=hhh%3Aoutcome#install",
    );
  });
});
