import {
  EXPERIMENT_TOKEN_KEYS,
  type ExperimentAssignmentKey,
  type ExperimentAssignments,
} from "@/lib/experiments/types";

const TOKEN_SEPARATOR = "~";
const TOKEN_KEY_VALUE_SEPARATOR = ":";

const TOKEN_TO_ASSIGNMENT_KEY = Object.entries(EXPERIMENT_TOKEN_KEYS).reduce(
  (accumulator, [assignmentKey, tokenKey]) => {
    accumulator[tokenKey] = assignmentKey as ExperimentAssignmentKey;
    return accumulator;
  },
  {} as Record<string, ExperimentAssignmentKey>,
);

export function readSingleParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export function parseExperimentToken(token: string | undefined): Partial<ExperimentAssignments> {
  if (!token) {
    return {};
  }

  const parsed: Partial<ExperimentAssignments> = {};
  const entries = token.split(TOKEN_SEPARATOR);

  for (const entry of entries) {
    const [tokenKey, variant] = entry.split(TOKEN_KEY_VALUE_SEPARATOR);
    if (!tokenKey || !variant) {
      continue;
    }

    const assignmentKey = TOKEN_TO_ASSIGNMENT_KEY[tokenKey];
    if (!assignmentKey) {
      continue;
    }

    (parsed as Record<ExperimentAssignmentKey, string>)[assignmentKey] = variant;
  }

  return parsed;
}

export function serializeExperimentToken(assignments: Partial<ExperimentAssignments>): string {
  const entries: string[] = [];

  for (const assignmentKey of Object.keys(EXPERIMENT_TOKEN_KEYS) as ExperimentAssignmentKey[]) {
    const variant = assignments[assignmentKey];
    if (!variant) {
      continue;
    }

    const tokenKey = EXPERIMENT_TOKEN_KEYS[assignmentKey];
    entries.push(`${tokenKey}${TOKEN_KEY_VALUE_SEPARATOR}${variant}`);
  }

  return entries.join(TOKEN_SEPARATOR);
}

export function mergeExperimentToken(
  existingToken: string | undefined,
  nextAssignments: Partial<ExperimentAssignments>,
): string {
  const existingAssignments = parseExperimentToken(existingToken);
  return serializeExperimentToken({ ...existingAssignments, ...nextAssignments });
}

export function withExpParam(href: string, exp: string): string {
  if (!exp) {
    return href;
  }

  const [pathnameWithQuery, hashFragment] = href.split("#");
  const [pathname, rawQuery] = pathnameWithQuery.split("?");
  const params = new URLSearchParams(rawQuery || "");
  params.set("exp", exp);

  const query = params.toString();
  const path = query ? `${pathname}?${query}` : pathname;

  if (!hashFragment) {
    return path;
  }

  return `${path}#${hashFragment}`;
}
