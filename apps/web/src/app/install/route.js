import { NextResponse } from "next/server";

const bootstrapScript = `#!/usr/bin/env bash
set -euo pipefail

INSTALLER_URL="\${RMBG_INSTALLER_URL:-https://raw.githubusercontent.com/cuevaio/background-removal/main/scripts/install.sh}"

if ! command -v curl >/dev/null 2>&1; then
  echo "rmbg installer error: curl is required" >&2
  exit 1
fi

curl -fsSL "\${INSTALLER_URL}" | bash
`;

export async function GET() {
  return new NextResponse(bootstrapScript, {
    headers: {
      "Content-Type": "text/x-shellscript; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
