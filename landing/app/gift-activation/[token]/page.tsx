"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";

interface OrderInfo {
  companyName: string;
  treeCount: number;
  expiresAt: string;
}

interface EmployeeRow {
  name: string;
  email: string;
}

type Step = "loading" | "invalid" | "expired" | "already_used" | "form" | "generating" | "done" | "error";

export default function GiftActivationPage() {
  const params = useParams();
  const token = params.token as string;

  const [step, setStep] = useState<Step>("loading");
  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [csvError, setCsvError] = useState("");
  const [generatedCount, setGeneratedCount] = useState(0);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/gift-activation/${token}`)
      .then((r) => {
        if (r.status === 404) { setStep("invalid"); return null; }
        if (r.status === 409) { setStep("already_used"); return null; }
        if (r.status === 410) { setStep("expired"); return null; }
        if (!r.ok) { setStep("invalid"); return null; }
        return r.json();
      })
      .then((data: OrderInfo | null) => {
        if (!data) return;
        setOrder(data);
        setEmployees(Array.from({ length: data.treeCount }, () => ({ name: "", email: "" })));
        setStep("form");
      })
      .catch(() => setStep("invalid"));
  }, [token]);

  const handleCsvUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCsvError("");
      const file = e.target.files?.[0];
      if (!file || !order) return;

      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        const lines = text
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter(Boolean);

        // Skip header row if it looks like one
        const dataLines = lines[0]?.toLowerCase().includes("name") ? lines.slice(1) : lines;

        const parsed: EmployeeRow[] = dataLines.map((line) => {
          const [name = "", email = ""] = line.split(",").map((s) => s.trim().replace(/^"|"$/g, ""));
          return { name, email };
        });

        if (parsed.length !== order.treeCount) {
          setCsvError(
            `CSV enthält ${parsed.length} Zeilen, erwartet werden ${order.treeCount}. Bitte korrigieren Sie die Datei.`
          );
          return;
        }

        setEmployees(parsed);
      };
      reader.readAsText(file);
    },
    [order]
  );

  const updateEmployee = useCallback((index: number, field: "name" | "email", value: string) => {
    setEmployees((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!order) return;

    const emptyNames = employees.filter((e) => !e.name.trim());
    if (emptyNames.length > 0) {
      setCsvError("Bitte geben Sie alle Mitarbeiternamen ein.");
      return;
    }

    setStep("generating");
    setCsvError("");

    try {
      const payload = {
        token,
        employees: employees.map((e) => ({
          name: e.name.trim(),
          email: e.email.trim() || undefined,
        })),
      };

      const res = await fetch("/api/gift-certificates/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unbekannter Fehler");
      }

      setGeneratedCount(data.count);
      setStep("done");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unbekannter Fehler";
      setCsvError(msg);
      setStep("form");
    }
  }, [token, order, employees]);

  const hasAnyEmail = employees.some((e) => e.email.trim());

  if (step === "loading") {
    return <CenteredMessage text="Bitte warten..." />;
  }

  if (step === "invalid") {
    return <CenteredMessage text="Dieser Link ist ungültig. Bitte wenden Sie sich an hola@quetz.org." />;
  }

  if (step === "expired") {
    return (
      <CenteredMessage text="Dieser Aktivierungslink ist abgelaufen (30 Tage). Bitte kontaktieren Sie uns unter hola@quetz.org." />
    );
  }

  if (step === "already_used") {
    return (
      <CenteredMessage text="Die Zertifikate für diese Bestellung wurden bereits erstellt. Bei Fragen: hola@quetz.org" />
    );
  }

  if (step === "generating") {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.spinner} />
          <h2 style={styles.h2}>Zertifikate werden generiert</h2>
          <p style={styles.bodyText}>
            Dies kann einige Minuten dauern. Bitte schließen Sie diese Seite nicht.
          </p>
        </div>
      </div>
    );
  }

  if (step === "done") {
    const hasEmails = employees.every((e) => e.email.trim());
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={{ fontSize: 48, textAlign: "center", marginBottom: 16 }}>
          </div>
          <h2 style={{ ...styles.h2, color: "#1B4332" }}>Fertig!</h2>
          <p style={styles.bodyText}>
            {generatedCount} Adoptionszertifikate wurden erfolgreich erstellt.
          </p>
          {hasEmails ? (
            <p style={styles.bodyText}>
              Jeder Mitarbeiter erhält sein Zertifikat direkt per E-Mail.
            </p>
          ) : (
            <p style={styles.bodyText}>
              Eine E-Mail mit allen PDF-Links wurde an <strong>{order?.companyName}</strong> gesendet.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoRow}>
          <span style={styles.logoText}>quetz.org</span>
        </div>

        <h1 style={styles.h1}>Zertifikate erstellen</h1>

        {order && (
          <p style={styles.bodyText}>
            Guten Tag, <strong>{order.companyName}</strong>. Sie haben ein Paket mit{" "}
            <strong>{order.treeCount} Bäumen</strong> erworben. Bitte geben Sie die Namen Ihrer
            Mitarbeiter ein oder laden Sie eine CSV-Datei hoch.
          </p>
        )}

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Option A: CSV hochladen</h3>
          <p style={styles.hint}>
            Format: Name,E-Mail (optional). Eine Zeile pro Mitarbeiter. {order?.treeCount} Zeilen erwartet.
          </p>
          <input type="file" accept=".csv,text/csv" onChange={handleCsvUpload} style={styles.fileInput} />
        </div>

        <div style={styles.divider} />

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Option B: Namen manuell eingeben</h3>
          <p style={styles.hint}>
            E-Mail-Adressen sind optional. Werden keine angegeben, erhalten Sie alle PDFs per E-Mail.
          </p>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={{ ...styles.th, width: 30 }}>#</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>E-Mail (optional)</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp, i) => (
                  <tr key={i} style={i % 2 === 0 ? {} : { background: "#F9FAF7" }}>
                    <td style={styles.tdNum}>{i + 1}</td>
                    <td style={styles.td}>
                      <input
                        type="text"
                        value={emp.name}
                        onChange={(e) => updateEmployee(i, "name", e.target.value)}
                        placeholder="Vorname Nachname"
                        style={styles.input}
                      />
                    </td>
                    <td style={styles.td}>
                      <input
                        type="email"
                        value={emp.email}
                        onChange={(e) => updateEmployee(i, "email", e.target.value)}
                        placeholder="max@unternehmen.de"
                        style={styles.input}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {csvError && (
          <div style={styles.error}>{csvError}</div>
        )}

        {!hasAnyEmail && (
          <div style={styles.infoBox}>
            <strong>Hinweis:</strong> Da keine E-Mail-Adressen angegeben wurden, erhalten Sie alle
            PDFs gesammelt per E-Mail an die Bestelladresse.
          </div>
        )}

        <button onClick={handleSubmit} style={styles.button}>
          Zertifikate generieren ({order?.treeCount})
        </button>
      </div>
    </div>
  );
}

function CenteredMessage({ text }: { text: string }) {
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <p style={{ ...styles.bodyText, textAlign: "center" }}>{text}</p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#F4F4F0",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: "48px 16px",
  },
  card: {
    background: "#FFFFFF",
    borderRadius: 12,
    padding: "48px 40px",
    maxWidth: 720,
    width: "100%",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
  },
  logoRow: {
    marginBottom: 24,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 700,
    color: "#1B4332",
    letterSpacing: "0.08em",
  },
  h1: {
    fontSize: 28,
    fontWeight: 700,
    color: "#1A1A1A",
    margin: "0 0 16px",
    fontFamily: "Georgia, serif",
  },
  h2: {
    fontSize: 22,
    fontWeight: 700,
    color: "#1A1A1A",
    margin: "16px 0",
    textAlign: "center" as const,
  },
  bodyText: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 1.7,
    margin: "0 0 24px",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#1B4332",
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
    margin: "0 0 8px",
  },
  hint: {
    fontSize: 13,
    color: "#6b7280",
    margin: "0 0 12px",
    lineHeight: 1.6,
  },
  fileInput: {
    display: "block",
    fontSize: 14,
    color: "#374151",
  },
  divider: {
    borderTop: "1px solid #E5E7EB",
    margin: "24px 0",
  },
  tableContainer: {
    overflowX: "auto" as const,
    maxHeight: 400,
    overflowY: "auto" as const,
    border: "1px solid #E5E7EB",
    borderRadius: 6,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    fontSize: 14,
  },
  th: {
    padding: "10px 12px",
    background: "#F3F4F6",
    fontWeight: 600,
    color: "#374151",
    textAlign: "left" as const,
    borderBottom: "1px solid #E5E7EB",
    position: "sticky" as const,
    top: 0,
  },
  td: {
    padding: "6px 8px",
    borderBottom: "1px solid #F3F4F6",
  },
  tdNum: {
    padding: "6px 12px",
    borderBottom: "1px solid #F3F4F6",
    color: "#9CA3AF",
    fontSize: 13,
  },
  input: {
    width: "100%",
    border: "1px solid #D1D5DB",
    borderRadius: 4,
    padding: "6px 10px",
    fontSize: 14,
    color: "#1A1A1A",
    outline: "none",
    boxSizing: "border-box" as const,
  },
  error: {
    background: "#FEF2F2",
    border: "1px solid #FCA5A5",
    color: "#B91C1C",
    borderRadius: 6,
    padding: "12px 16px",
    fontSize: 14,
    margin: "0 0 16px",
  },
  infoBox: {
    background: "#ECFDF5",
    border: "1px solid #6EE7B7",
    color: "#065F46",
    borderRadius: 6,
    padding: "12px 16px",
    fontSize: 13,
    margin: "0 0 16px",
    lineHeight: 1.6,
  },
  button: {
    background: "#1B4332",
    color: "#FFFFFF",
    border: "none",
    borderRadius: 6,
    padding: "14px 32px",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    width: "100%",
    letterSpacing: "0.02em",
  },
  spinner: {
    width: 40,
    height: 40,
    border: "3px solid #E5E7EB",
    borderTop: "3px solid #1B4332",
    borderRadius: "50%",
    margin: "0 auto 24px",
    animation: "spin 1s linear infinite",
  },
};
