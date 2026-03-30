const CLI_INSTALL_CMD = "curl -fsSL https://local.backgroundrm.com/install | bash";

export default function DownloadsPage() {
  return (
    <main className="container section">
      <h1>Local Background Remover Downloads</h1>
      <p className="subtitle">
        Downloads are public. Runtime features require valid activation for each surface.
      </p>

      <div className="card">
        <h3>CLI (macOS)</h3>
        <p>Install globally with one command:</p>
        <pre className="code-block">{CLI_INSTALL_CMD}</pre>
        <p className="note">
          Activate your CLI key before running model ensure/remove commands.
        </p>
      </div>

      <div className="card">
        <h3>Desktop app</h3>
        <p>
          Desktop downloads are public. Once installed, activate your desktop license key
          in-app before processing images.
        </p>
        <p className="note">
          If you bought App + CLI, desktop processing requires both active keys.
        </p>
      </div>
    </main>
  );
}
