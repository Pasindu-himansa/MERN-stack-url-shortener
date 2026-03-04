import { useEffect, useState } from "react";
import bg from "./assets/blackhole.png"; // change filename if needed

export default function App() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  // history UI
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const submit = async (e) => {
    e.preventDefault();
    setResult("");
    setLoading(true);

    try {
      const res = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalUrl: url }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed");

      setResult(data.shortUrl);
      setUrl("");

      // refresh history after a successful shorten
      await loadHistory();
    } catch (err) {
      setResult("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const copy = async (text) => {
    if (text?.startsWith("http")) await navigator.clipboard.writeText(text);
  };

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch("/api/history");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to load history");
      setHistory(Array.isArray(data) ? data : []);
    } catch (e) {
      // keep it simple: show empty history if failed
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    // load once when app starts
    loadHistory();
  }, []);

  return (
    <div
      className="min-h-screen w-screen bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative min-h-screen flex items-center justify-center p-4">
        {/* Bigger Glass card */}
        <div className="w-full max-w-3xl rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl p-10 text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold mb-2">URL Shortener</h1>
              <p className="text-white/80 mb-6">
                Paste a link and get a short one.
              </p>
            </div>

            <button
              onClick={async () => {
                setHistoryOpen(true);
                await loadHistory();
              }}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition"
            >
              History
            </button>
          </div>

          <form onSubmit={submit} className="flex gap-2">
            <input
              className="flex-1 rounded-xl px-4 py-3 bg-white/10 border border-white/20 outline-none placeholder:text-white/60 focus:border-white/40"
              placeholder="https://example.com/very/long/link"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button
              className="rounded-xl px-5 py-3 bg-blue-500/80 hover:bg-blue-500 disabled:opacity-60 transition"
              disabled={loading}
            >
              {loading ? "..." : "Shorten"}
            </button>
          </form>

          {result && (
            <div className="mt-5 p-4 rounded-xl bg-white/10 border border-white/20">
              <div className="flex items-center justify-between gap-3">
                <span className="break-all">{result}</span>
                <button
                  onClick={() => copy(result)}
                  className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition"
                >
                  Copy
                </button>
              </div>
            </div>
          )}
        </div>

        {/* History Modal */}
        {historyOpen && (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setHistoryOpen(false)}
            />

            <div className="relative w-full max-w-2xl rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">History</h2>
                <button
                  className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition"
                  onClick={() => setHistoryOpen(false)}
                >
                  Close
                </button>
              </div>

              <button
                onClick={loadHistory}
                className="mb-4 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition"
              >
                Refresh
              </button>

              {historyLoading ? (
                <div className="text-white/80">Loading...</div>
              ) : history.length === 0 ? (
                <div className="text-white/80">No history yet.</div>
              ) : (
                <div className="space-y-3 max-h-[55vh] overflow-auto pr-1">
                  {history.map((item) => (
                    <div
                      key={item.shortCode}
                      className="p-4 rounded-xl bg-white/10 border border-white/20"
                    >
                      <div className="text-sm text-white/70">Original</div>
                      <div className="break-all">{item.originalUrl}</div>

                      <div className="mt-3 flex items-center justify-between gap-2">
                        <a
                          className="break-all underline text-white"
                          href={item.shortUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {item.shortUrl}
                        </a>

                        <div className="flex gap-2">
                          <button
                            onClick={() => copy(item.shortUrl)}
                            className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition"
                          >
                            Copy
                          </button>
                        </div>
                      </div>

                      <div className="mt-2 text-xs text-white/60">
                        Clicks: {item.clicks ?? 0}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
