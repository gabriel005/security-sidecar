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
} from "lucide-react";
import "./App.css";

// Interface for instances (URLs)
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

function App() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [scanTime, setScanTime] = useState("");
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);

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
      .catch((err) => console.error("Error loading JSON:", err));
  }, []);

  const high = alerts.filter((a) => a.riskcode === "3").length;
  const medium = alerts.filter((a) => a.riskcode === "2").length;
  const low = alerts.filter((a) => a.riskcode === "1").length;
  const info = alerts.filter((a) => a.riskcode === "0").length;

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

  const toggleExpand = (id: string) => {
    setExpandedAlert(expandedAlert === id ? null : id);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Carregando...";

    // Converte a string de data para um objeto Date, assumindo UTC
    const date = new Date(`${dateString} UTC`);

    return new Intl.DateTimeFormat("en-EN", {
      dateStyle: "full",
      timeStyle: "medium",
    }).format(date);
  };

  return (
    <div className="dashboard-container">
      <header className="header">
        <h1>
          <ShieldCheck size={32} color="#1890ff" />
          Sidecar Security Report
        </h1>
        <p>Generated on: {formatDate(scanTime)}</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card high">
          <h3>Critical</h3>
          <p className="count">{high}</p>
        </div>
        <div className="stat-card medium">
          <h3>Medium</h3>
          <p className="count">{medium}</p>
        </div>
        <div className="stat-card low">
          <h3>Low</h3>
          <p className="count">{low}</p>
        </div>
        <div className="stat-card info">
          <h3>Informational</h3>
          <p className="count">{info}</p>
        </div>
      </div>

      <div className="main-content">
        <div className="chart-section">
          <h3>Vulnerability Distribution</h3>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
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

        <div className="alerts-section">
          {alerts.map((alert, idx) => {
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
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    {alert.riskcode === "3" && <ShieldAlert color="#ff4d4f" />}
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

                    {/* --- ENDPOINTS SECTION --- */}
                    {alert.instances && alert.instances.length > 0 && (
                      <div className="instances-section">
                        <h4>
                          <Globe size={16} style={{ marginBottom: -3 }} />
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
          })}
        </div>
      </div>
    </div>
  );
}

export default App;
