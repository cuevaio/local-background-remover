import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const nonEmpty = z.string().min(1);

export const flagsEnvSchema = z.object({
  FLAGS: nonEmpty,
  FLAGS_SECRET: nonEmpty,
});

export function getFlagsEnv() {
  return flagsEnvSchema.parse({
    FLAGS: process.env.FLAGS,
    FLAGS_SECRET: process.env.FLAGS_SECRET,
  });
}

export const env = createEnv({
  server: {
    POLAR_SERVER: z.enum(["sandbox", "production"]).default("sandbox"),
    POLAR_ACCESS_TOKEN: nonEmpty,
    POLAR_ORGANIZATION_ID: nonEmpty,
    POLAR_WEBHOOK_SECRET: nonEmpty,
    POLAR_PRODUCT_APP_ID: nonEmpty,
    POLAR_PRODUCT_CLI_ID: nonEmpty,
    POLAR_PRODUCT_BOTH_ID: nonEmpty,
    POLAR_BENEFIT_CLI_ID: nonEmpty,
    POLAR_BENEFIT_DESKTOP_ID: nonEmpty,
    LICENSE_SIGNING_PRIVATE_KEY: nonEmpty,
    RMBG_LICENSE_PUBLIC_KEY: nonEmpty,
    RMBG_LATEST_VERSION: nonEmpty.optional(),
    RMBG_GITHUB_REPO: nonEmpty.default("cuevaio/local-background-remover"),
    RMBG_GITHUB_TOKEN: nonEmpty.optional(),
    GITHUB_TOKEN: nonEmpty.optional(),
  },
  client: {},
  runtimeEnv: {
    POLAR_SERVER: process.env.POLAR_SERVER,
    POLAR_ACCESS_TOKEN: process.env.POLAR_ACCESS_TOKEN,
    POLAR_ORGANIZATION_ID: process.env.POLAR_ORGANIZATION_ID,
    POLAR_WEBHOOK_SECRET: process.env.POLAR_WEBHOOK_SECRET,
    POLAR_PRODUCT_APP_ID: process.env.POLAR_PRODUCT_APP_ID,
    POLAR_PRODUCT_CLI_ID: process.env.POLAR_PRODUCT_CLI_ID,
    POLAR_PRODUCT_BOTH_ID: process.env.POLAR_PRODUCT_BOTH_ID,
    POLAR_BENEFIT_CLI_ID: process.env.POLAR_BENEFIT_CLI_ID,
    POLAR_BENEFIT_DESKTOP_ID: process.env.POLAR_BENEFIT_DESKTOP_ID,
    LICENSE_SIGNING_PRIVATE_KEY: process.env.LICENSE_SIGNING_PRIVATE_KEY,
    RMBG_LICENSE_PUBLIC_KEY: process.env.RMBG_LICENSE_PUBLIC_KEY,
    RMBG_LATEST_VERSION: process.env.RMBG_LATEST_VERSION,
    RMBG_GITHUB_REPO: process.env.RMBG_GITHUB_REPO,
    RMBG_GITHUB_TOKEN: process.env.RMBG_GITHUB_TOKEN,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  },
  emptyStringAsUndefined: true,
});
