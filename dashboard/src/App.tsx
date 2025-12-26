// src/App.tsx
import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ShieldAlert, ShieldCheck, AlertTriangle, Info, ChevronDown, ChevronUp, Server, Globe, Search, Filter, X } from "lucide-react";
import "./App.css";

interface Instance { uri: string; method: string; evidence: string; }
interface Alert { pluginid: string; alert: string; riskcode: string; riskdesc: string; desc: string; solution: string; count: string; instances: Instance[]; }
interface Site { "@name": string; alerts: Alert[]; }
interface ZapReport { site: Site[]; "@generated": string; }

function App() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [scanTime, setScanTime] = useState("");
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null); // '3', '2', '1', '0' ou null

  useEffect(() => {
    fetch("/report.json")
      .then((res) => res.json())
      .then((data: ZapReport) => {
        const allAlerts = data.site.flatMap((site) => site.alerts || []);
        const sortedAlerts = allAlerts.sort((a, b) => Number(b.riskcode) - Number(a.riskcode));
        setAlerts(sortedAlerts);
        setScanTime(data["@generated"]);
      })
      .catch((err) => console.error("Error loading JSON:", err));
  }, []);

  // Lógica de Estatísticas
  const high = alerts.filter((a) => a.riskcode === "3").length;
  const medium = alerts.filter((a) => a.riskcode === "2").length;
  const low = alerts.filter((a) => a.riskcode === "1").length;
  const info = alerts.filter((a) => a.riskcode === "0").length;

  // LÓGICA NOVA: CÁLCULO DE NOTA (Security Score)
  const calculateScore = () => {
    let score = 100;
    score -= (high * 15);   // Cada crítico tira 15 pontos
    score -= (medium * 5);  // Cada médio tira 5 pontos
    score -= (low * 1);     // Cada baixo tira 1 ponto
    if (score < 0) score = 0;
    
    if (score >= 90) return { grade: 'A', color: '#52c41a', text: 'Excellent' };
    if (score >= 80) return { grade: 'B', color: '#1890ff', text: 'Good' };
    if (score >= 60) return { grade: 'C', color: '#faad14', text: 'Warning' };
    if (score >= 40) return { grade: 'D', color: '#fa8c16', text: 'Poor' };
    return { grade: 'F', color: '#f5222d', text: 'Critical' };
  };

  const securityGrade = calculateScore();

  // LÓGICA NOVA: FILTRAGEM
  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.alert.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = activeFilter ? alert.riskcode === activeFilter : true;
    return matchesSearch && matchesRisk;
  });

  const chartData = [
    { name: "Critical", value: high, color: "#ff4d4f" },
    { name: "Medium", value: medium, color: "#faad14" },
    { name: "Low", value: low, color: "#fadb14" },
    { name: "Info", value: info, color: "#1890ff" },
  ].filter(item => item.value > 0);

  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Loading...";
    const date = new Date(`${dateString} UTC`);
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'full', timeStyle: 'medium' }).format(date);
  };

  const toggleExpand = (id: string) => {
    setExpandedAlert(expandedAlert === id ? null : id);
  };

  return (
    <div className="dashboard-container">
      <header className="header">
        <h1><ShieldCheck size={32} color="#1890ff" /> Sidecar Security Report</h1>
        <p>Generated on: {formatDate(scanTime)}</p>
      </header>

      {/* STATS GRID */}
      <div className="stats-grid">
        <div className="stat-card high" onClick={() => setActiveFilter('3')} style={{cursor: 'pointer', opacity: activeFilter && activeFilter !== '3' ? 0.4 : 1}}>
          <h3>Critical</h3>
          <p className="count">{high}</p>
        </div>
        <div className="stat-card medium" onClick={() => setActiveFilter('2')} style={{cursor: 'pointer', opacity: activeFilter && activeFilter !== '2' ? 0.4 : 1}}>
          <h3>Medium</h3>
          <p className="count">{medium}</p>
        </div>
        <div className="stat-card low" onClick={() => setActiveFilter('1')} style={{cursor: 'pointer', opacity: activeFilter && activeFilter !== '1' ? 0.4 : 1}}>
          <h3>Low</h3>
          <p className="count">{low}</p>
        </div>
        <div className="stat-card info" onClick={() => setActiveFilter('0')} style={{cursor: 'pointer', opacity: activeFilter && activeFilter !== '0' ? 0.4 : 1}}>
          <h3>Info</h3>
          <p className="count">{info}</p>
        </div>
      </div>

      <div className="main-content">
        {/* LADO ESQUERDO: GRÁFICO + NOTA */}
        <div className="left-column" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            {/* CARD DE NOTA */}
            <div className="chart-section" style={{ padding: '30px 20px' }}>
                <h3 style={{ marginBottom: 10 }}>Security Grade</h3>
                <div style={{ fontSize: '4rem', fontWeight: 'bold', color: securityGrade.color, lineHeight: 1 }}>
                    {securityGrade.grade}
                </div>
                <span style={{ color: securityGrade.color, fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.9rem' }}>
                    {securityGrade.text}
                </span>
            </div>

            <div className="chart-section">
            <h3>Vulnerability Distribution</h3>
            <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                        {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                </ResponsiveContainer>
            </div>
            </div>
        </div>

        {/* LADO DIREITO: LISTA COM FILTROS */}
        <div className="alerts-section">
          
          {/* BARRA DE BUSCA (NOVO) */}
          <div className="search-bar" style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            <div style={{ position: 'relative', flex: 1 }}>
                <Search size={18} style={{ position: 'absolute', left: 12, top: 12, color: '#999' }} />
                <input 
                    type="text" 
                    placeholder="Search vulnerabilities..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%', padding: '12px 12px 12px 40px', 
                        borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.95rem'
                    }}
                />
            </div>
            {/* Botão limpar filtros */}
            {(activeFilter || searchTerm) && (
                <button 
                    onClick={() => { setActiveFilter(null); setSearchTerm(""); }}
                    style={{
                        padding: '0 15px', borderRadius: '8px', border: 'none', 
                        background: '#ff4d4f', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5
                    }}
                >
                    <X size={16} /> Clear
                </button>
            )}
          </div>

          {/* LISTAGEM */}
          {filteredAlerts.length === 0 ? (
             <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                 <Filter size={40} style={{ marginBottom: 10, opacity: 0.5 }} />
                 <p>No vulnerabilities found with these filters.</p>
             </div>
          ) : (
            filteredAlerts.map((alert, idx) => {
                const uniqueId = `${alert.pluginid}-${idx}`;
                const isOpen = expandedAlert === uniqueId;

                return (
                <div key={uniqueId} className="alert-card">
                    <div className={`alert-header risk-${alert.riskcode}`} onClick={() => toggleExpand(uniqueId)}>
                    <div className="alert-title">
                        <strong>{alert.alert}</strong>
                        <span className={`risk-badge ${
                            alert.riskcode === '3' ? 'high' : alert.riskcode === '2' ? 'medium' : alert.riskcode === '1' ? 'low' : 'info'
                        }`}>
                        {alert.riskdesc.split('(')[0]}
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {alert.riskcode === '3' && <ShieldAlert color="#ff4d4f" />}
                        {alert.riskcode === '2' && <AlertTriangle color="#faad14" />}
                        {alert.riskcode === '1' && <Info color="#fadb14" />}
                        {alert.riskcode === '0' && <Server color="#1890ff" />}
                        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                    </div>

                    {isOpen && (
                    <div className="alert-details">
                        <h4>Description:</h4>
                        <p>{stripHtml(alert.desc)}</p>

                        {alert.instances && alert.instances.length > 0 && (
                            <div className="instances-section">
                                <h4><Globe size={16} style={{ marginBottom: -3 }}/> Affected Endpoints ({alert.instances.length}):</h4>
                                <div className="instances-list">
                                    {alert.instances.map((instance, i) => (
                                        <div key={i} className="instance-item">
                                            <span className={`method-badge ${instance.method.toUpperCase()}`}>{instance.method}</span>
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
    </div>
  );
}

export default App;