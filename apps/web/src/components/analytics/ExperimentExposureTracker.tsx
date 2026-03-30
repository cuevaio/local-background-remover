"use client";

import { useEffect } from "react";

import { trackExperimentExposure } from "@/lib/analytics/events";
import type { ExperimentPage } from "@/lib/experiments/types";

const STORAGE_PREFIX = "exp:exposure";

type Exposure = {
  experimentKey: string;
  variant: string;
  page: ExperimentPage;
  slot: string;
};

type ExperimentExposureTrackerProps = {
  exposures: Exposure[];
};

export default function ExperimentExposureTracker({ exposures }: ExperimentExposureTrackerProps) {
  useEffect(() => {
    for (const exposure of exposures) {
      const storageKey = [
        STORAGE_PREFIX,
        exposure.page,
        exposure.slot,
        exposure.experimentKey,
        exposure.variant,
      ].join(":");

      if (sessionStorage.getItem(storageKey)) {
        continue;
      }

      sessionStorage.setItem(storageKey, "1");
      trackExperimentExposure({
        experiment_key: exposure.experimentKey,
        variant: exposure.variant,
        page: exposure.page,
        slot: exposure.slot,
      });
    }
  }, [exposures]);

  return null;
}
