import { describe, expect, test } from "bun:test";

import { GET } from "./route";

describe("GET /install", () => {
  test("retries release asset downloads before failing", async () => {
    const response = await GET();
    const script = await response.text();

    expect(script).toContain("download_file_with_retry");
    expect(script).toContain("RMBG_DOWNLOAD_ATTEMPTS");
    expect(script).toContain("Release asset %s not ready yet, retrying");
  });
});
