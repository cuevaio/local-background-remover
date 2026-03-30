import { getProviderData } from "@flags-sdk/vercel";
import { createFlagsDiscoveryEndpoint } from "flags/next";

import { flagDefinitions } from "@/lib/experiments/flags";

export const GET = createFlagsDiscoveryEndpoint(async () => {
  return getProviderData(flagDefinitions);
});
