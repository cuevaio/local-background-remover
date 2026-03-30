export default function ThankYouPage() {
  return (
    <main className="container section">
      <h1>Thanks for your Local Background Remover purchase</h1>
      <p className="subtitle">
        Your order is complete. Downloads are public, and runtime features unlock after
        activating the matching key(s).
      </p>
      <div className="card">
        <h3>Next steps</h3>
        <ul>
          <li>Install CLI: <code>curl -fsSL https://localremovebg.com/install | bash</code>.</li>
          <li>Copy your Polar key(s) from purchases.</li>
          <li>Activate in CLI: <code>rmbg license activate --key YOUR_KEY --surface cli</code>.</li>
          <li>Activate app key in desktop from the License panel.</li>
          <li>If you bought App + CLI, activate both keys before desktop processing.</li>
        </ul>
      </div>
    </main>
  );
}
