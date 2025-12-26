// src/App.tsx
import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  Server,
  Globe,
  Search,
  X,
  Accessibility,
  Lock,
} from "lucide-react";
import "./App.css";

// --- INTERFACES ZAP (SEGURANÇA) ---
interface Instance {
  uri: string;
  method: string;
  evidence: string;
}
interface Alert {
  pluginid: string;
  alert: string;
  riskcode: string;
  riskdesc: string;
  desc: string;
  solution: string;
  count: string;
  instances: Instance[];
}
interface Site {
  "@name": string;
  alerts: Alert[];
}
interface ZapReport {
  site: Site[];
  "@generated": string;
}

// --- INTERFACES AXE (ACESSIBILIDADE) ---
interface AxeNode {
  html: string;
  target: string[];
  failureSummary: string;
}
interface AxeViolation {
  id: string;
  impact: string;
  description: string;
  help: string;
  helpUrl: string;
  nodes: AxeNode[];
}
interface AxeReport {
  violations: AxeViolation[];
  timestamp: string;
}

function App() {
  // TABS STATE
  const [activeTab, setActiveTab] = useState<"security" | "accessibility">(
    "security"
  );

  // SECURITY DATA
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [scanTime, setScanTime] = useState("");
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // ACCESSIBILITY DATA
  const [a11yViolations, setA11yViolations] = useState<AxeViolation[]>([]);
  const [expandedA11y, setExpandedA11y] = useState<string | null>(null);

  // FETCH SECURITY (ZAP)
  useEffect(() => {
    fetch("/report.json")
      .then((res) => res.json())
      .then((data: ZapReport) => {
        const allAlerts = data.site.flatMap((site) => site.alerts || []);
        const sortedAlerts = allAlerts.sort(
          (a, b) => Number(b.riskcode) - Number(a.riskcode)
        );
        setAlerts(sortedAlerts);
        setScanTime(data["@generated"]);
      })
      .catch(() => console.log("⚠️ Security report not found (yet)."));
  }, []);

  // FETCH ACCESSIBILITY (AXE)
  useEffect(() => {
    fetch("/accessibility-report.json") // Certifique-se que esse arquivo existe na pasta public
      .then((res) => res.json())
      .then((data: AxeReport) => {
        // O Axe retorna violations array direto ou dentro de um objeto, depende da config.
        // Assumindo estrutura padrão do axe-playwright
        setA11yViolations(data.violations || []);
      })
      .catch(() => console.log("⚠️ Accessibility report not found (yet)."));
  }, []);

  // --- LÓGICA DE SEGURANÇA ---
  const high = alerts.filter((a) => a.riskcode === "3").length;
  const medium = alerts.filter((a) => a.riskcode === "2").length;
  const low = alerts.filter((a) => a.riskcode === "1").length;
  const info = alerts.filter((a) => a.riskcode === "0").length;

  const calculateScore = () => {
    let score = 100;
    score -= high * 15;
    score -= medium * 5;
    score -= low * 1;
    if (score < 0) score = 0;

    if (score >= 90) return { grade: "A", color: "#52c41a", text: "Excellent" };
    if (score >= 80) return { grade: "B", color: "#1890ff", text: "Good" };
    if (score >= 60) return { grade: "C", color: "#faad14", text: "Warning" };
    if (score >= 40) return { grade: "D", color: "#fa8c16", text: "Poor" };
    return { grade: "F", color: "#f5222d", text: "Critical" };
  };
  const securityGrade = calculateScore();

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch = alert.alert
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesRisk = activeFilter ? alert.riskcode === activeFilter : true;
    return matchesSearch && matchesRisk;
  });

  const chartData = [
    { name: "Critical", value: high, color: "#ff4d4f" },
    { name: "Medium", value: medium, color: "#faad14" },
    { name: "Low", value: low, color: "#fadb14" },
    { name: "Info", value: info, color: "#1890ff" },
  ].filter((item) => item.value > 0);

  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Loading...";
    // Tenta formatar, se falhar devolve a string original
    try {
      const date = new Date(`${dateString} UTC`);
      return new Intl.DateTimeFormat("en-US", {
        dateStyle: "full",
        timeStyle: "medium",
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  const toggleExpand = (id: string) =>
    setExpandedAlert(expandedAlert === id ? null : id);
  const toggleA11yExpand = (id: string) =>
    setExpandedA11y(expandedA11y === id ? null : id);

  return (
    <div className="dashboard-container">
      <header className="header">
        <h1>
          <ShieldCheck size={32} color="#1890ff" /> Quality & Security Sidecar
        </h1>
        <p>Generated on: {formatDate(scanTime)}</p>
      </header>

      {/* --- AQUI ESTÃO AS ABAS --- */}
      <div className="tabs-container">
        <button
          className={`tab-button ${activeTab === "security" ? "active" : ""}`}
          onClick={() => setActiveTab("security")}
        >
          <Lock size={18} /> Security Analysis (ZAP)
        </button>
        <button
          className={`tab-button ${
            activeTab === "accessibility" ? "active" : ""
          }`}
          onClick={() => setActiveTab("accessibility")}
        >
          <Accessibility size={18} /> Accessibility (Axe)
          {a11yViolations.length > 0 && (
            <span
              style={{
                background: "#f5222d",
                color: "white",
                padding: "2px 8px",
                borderRadius: "10px",
                fontSize: "0.7rem",
                marginLeft: 5,
              }}
            >
              {a11yViolations.length}
            </span>
          )}
        </button>
      </div>

      {/* =================================================================================
          CONTEÚDO DA ABA DE SEGURANÇA 
         ================================================================================= */}
      {activeTab === "security" && (
        <>
          <div className="stats-grid">
            <div
              className="stat-card high"
              onClick={() => setActiveFilter("3")}
              style={{
                cursor: "pointer",
                opacity: activeFilter && activeFilter !== "3" ? 0.4 : 1,
              }}
            >
              <h3>Critical</h3>
              <p className="count">{high}</p>
            </div>
            <div
              className="stat-card medium"
              onClick={() => setActiveFilter("2")}
              style={{
                cursor: "pointer",
                opacity: activeFilter && activeFilter !== "2" ? 0.4 : 1,
              }}
            >
              <h3>Medium</h3>
              <p className="count">{medium}</p>
            </div>
            <div
              className="stat-card low"
              onClick={() => setActiveFilter("1")}
              style={{
                cursor: "pointer",
                opacity: activeFilter && activeFilter !== "1" ? 0.4 : 1,
              }}
            >
              <h3>Low</h3>
              <p className="count">{low}</p>
            </div>
            <div
              className="stat-card info"
              onClick={() => setActiveFilter("0")}
              style={{
                cursor: "pointer",
                opacity: activeFilter && activeFilter !== "0" ? 0.4 : 1,
              }}
            >
              <h3>Info</h3>
              <p className="count">{info}</p>
            </div>
          </div>

          <div className="main-content">
            <div
              className="left-column"
              style={{ display: "flex", flexDirection: "column", gap: 20 }}
            >
              <div className="chart-section" style={{ padding: "30px 20px" }}>
                <h3 style={{ marginBottom: 10 }}>Security Grade</h3>
                <div
                  style={{
                    fontSize: "4rem",
                    fontWeight: "bold",
                    color: securityGrade.color,
                    lineHeight: 1,
                  }}
                >
                  {securityGrade.grade}
                </div>
                <span
                  style={{
                    color: securityGrade.color,
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    fontSize: "0.9rem",
                  }}
                >
                  {securityGrade.text}
                </span>
              </div>
              <div className="chart-section">
                <h3>Vulnerability Distribution</h3>
                <div style={{ width: "100%", height: 250 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="alerts-section">
              <div
                className="search-bar"
                style={{ display: "flex", gap: 10, marginBottom: 10 }}
              >
                <div style={{ position: "relative", flex: 1 }}>
                  <Search
                    size={18}
                    style={{
                      position: "absolute",
                      left: 12,
                      top: 12,
                      color: "#999",
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Search vulnerabilities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 12px 12px 40px",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      fontSize: "0.95rem",
                    }}
                  />
                </div>
                {(activeFilter || searchTerm) && (
                  <button
                    onClick={() => {
                      setActiveFilter(null);
                      setSearchTerm("");
                    }}
                    style={{
                      padding: "0 15px",
                      borderRadius: "8px",
                      border: "none",
                      background: "#ff4d4f",
                      color: "white",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <X size={16} /> Clear
                  </button>
                )}
              </div>

              {filteredAlerts.length === 0 ? (
                <div
                  style={{ textAlign: "center", padding: 40, color: "#999" }}
                >
                  <p>No vulnerabilities found with these filters.</p>
                </div>
              ) : (
                filteredAlerts.map((alert, idx) => {
                  const uniqueId = `${alert.pluginid}-${idx}`;
                  const isOpen = expandedAlert === uniqueId;
                  return (
                    <div key={uniqueId} className="alert-card">
                      <div
                        className={`alert-header risk-${alert.riskcode}`}
                        onClick={() => toggleExpand(uniqueId)}
                      >
                        <div className="alert-title">
                          <strong>{alert.alert}</strong>
                          <span
                            className={`risk-badge ${
                              alert.riskcode === "3"
                                ? "high"
                                : alert.riskcode === "2"
                                ? "medium"
                                : alert.riskcode === "1"
                                ? "low"
                                : "info"
                            }`}
                          >
                            {alert.riskdesc.split("(")[0]}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          {alert.riskcode === "3" && (
                            <ShieldAlert color="#ff4d4f" />
                          )}
                          {alert.riskcode === "2" && (
                            <AlertTriangle color="#faad14" />
                          )}
                          {alert.riskcode === "1" && <Info color="#fadb14" />}
                          {alert.riskcode === "0" && <Server color="#1890ff" />}
                          {isOpen ? (
                            <ChevronUp size={20} />
                          ) : (
                            <ChevronDown size={20} />
                          )}
                        </div>
                      </div>
                      {isOpen && (
                        <div className="alert-details">
                          <h4>Description:</h4>
                          <p>{stripHtml(alert.desc)}</p>
                          {alert.instances && alert.instances.length > 0 && (
                            <div className="instances-section">
                              <h4>
                                <Globe size={16} style={{ marginBottom: -3 }} />{" "}
                                Affected Endpoints ({alert.instances.length}):
                              </h4>
                              <div className="instances-list">
                                {alert.instances.map((instance, i) => (
                                  <div key={i} className="instance-item">
                                    <span
                                      className={`method-badge ${instance.method.toUpperCase()}`}
                                    >
                                      {instance.method}
                                    </span>
                                    <span className="uri">{instance.uri}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {alert.solution && (
                            <div className="solution-box">
                              <h4>💡 Recommended Solution:</h4>
                              <p>{stripHtml(alert.solution)}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}

      {/* =================================================================================
          CONTEÚDO DA ABA DE ACESSIBILIDADE 
         ================================================================================= */}
      {activeTab === "accessibility" && (
        <div
          className="alerts-section"
          style={{ maxWidth: "900px", margin: "0 auto" }}
        >
          {a11yViolations.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: 60,
                background: "white",
                borderRadius: 12,
              }}
            >
              <Accessibility size={64} color="#52c41a" />
              <h2>Great! No accessibility violations detected.</h2>
              <p style={{ color: "#666" }}>
                Or check if the 'accessibility-report.json' file exists in the
                public folder.
              </p>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 20, textAlign: "center" }}>
                <h2>Found {a11yViolations.length} Accessibility Issues</h2>
                <p>
                  These issues prevent users with disabilities from using your
                  application effectively.
                </p>
              </div>
              {a11yViolations.map((violation) => {
                const isOpen = expandedA11y === violation.id;
                return (
                  <div key={violation.id} className="alert-card">
                    <div
                      className="alert-header"
                      onClick={() => toggleA11yExpand(violation.id)}
                      style={{
                        borderLeft: `6px solid ${
                          violation.impact === "critical"
                            ? "#cf1322"
                            : violation.impact === "serious"
                            ? "#d46b08"
                            : "#7cb305"
                        }`,
                      }}
                    >
                      <div className="alert-title">
                        <strong>{violation.help}</strong>
                        <div>
                          <span
                            className={`a11y-tag impact-${violation.impact}`}
                          >
                            {violation.impact}
                          </span>
                          <span style={{ fontSize: "0.8rem", color: "#666" }}>
                            ID: {violation.id}
                          </span>
                        </div>
                      </div>
                      {isOpen ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </div>

                    {isOpen && (
                      <div className="alert-details">
                        <p>{violation.description}</p>

                        <div
                          className="solution-box"
                          style={{
                            background: "#fff7e6",
                            borderColor: "#ffd591",
                          }}
                        >
                          <h4 style={{ color: "#d46b08" }}>
                            📚 Help & Guideline:
                          </h4>
                          <a
                            href={violation.helpUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: "#1890ff", fontWeight: "bold" }}
                          >
                            Read documentation for this rule ↗
                          </a>
                        </div>

                        {/* Lista de Elementos com Erro */}
                        <div className="instances-section">
                          <h4>Affected Elements ({violation.nodes.length}):</h4>
                          <div className="instances-list">
                            {violation.nodes.map((node, i) => (
                              <div
                                key={i}
                                className="instance-item"
                                style={{
                                  flexDirection: "column",
                                  alignItems: "flex-start",
                                  gap: 5,
                                }}
                              >
                                <code
                                  style={{
                                    background: "#f0f0f0",
                                    padding: 5,
                                    borderRadius: 4,
                                    display: "block",
                                    width: "100%",
                                    wordBreak: "break-all",
                                  }}
                                >
                                  {node.html}
                                </code>
                                <div
                                  style={{
                                    fontSize: "0.85rem",
                                    color: "#666",
                                    marginTop: 5,
                                  }}
                                >
                                  <strong>Fix: </strong> {node.failureSummary}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
