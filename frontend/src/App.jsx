import { useMemo, useState } from "react";
import { Search, BookOpen, FileText, FileSpreadsheet, Presentation, ChevronRight, ExternalLink, SlidersHorizontal, Sparkles, ShieldCheck, CircleHelp, RefreshCw } from "lucide-react";

const API = import.meta.env.VITE_API_BASE_URL || "";
const demoResults = [
  { source_name: "Mechanical Design Guide.pdf", source_path: "Mechanical/Mechanical Design Guide.pdf", file_type: "pdf", page_number: 32, content: "Screw boss design considerations and local wall thickness. Verify boss geometry against the approved drawing and material specification.", match_count: 3 },
  { source_name: "Plastic Part Design.pptx", source_path: "Materials/Plastic Part Design.pptx", file_type: "pptx", slide_number: 18, content: "Rib and boss arrangement. Avoid abrupt thickness transitions and review the root fillet.", match_count: 2 },
  { source_name: "Fastener Standard.xlsx", source_path: "Standards/Fastener Standard.xlsx", file_type: "xlsx", sheet_name: "Boss", cell_reference: "B12", content: "Fastener reference table. Confirm screw size, pilot hole, and tightening conditions in the controlled document.", match_count: 1 },
];

function FileIcon({ type }) {
  if (type === "xlsx") return <FileSpreadsheet size={18} />;
  if (type === "pptx") return <Presentation size={18} />;
  return <FileText size={18} />;
}
function locationOf(item) {
  if (item.page_number) return `Page ${item.page_number}`;
  if (item.slide_number) return `Slide ${item.slide_number}`;
  if (item.sheet_name) return `${item.sheet_name} · ${item.cell_reference || "Sheet"}`;
  if (item.section_name || item.paragraph_number) return `${item.section_name ? `${item.section_name} · ` : ""}Paragraph ${item.paragraph_number || ""}`;
  if (item.table_number) return `Table ${item.table_number}`;
  return "Source location unavailable";
}

export default function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [demo, setDemo] = useState(false);
  const [filter, setFilter] = useState("all");
  const [scanning, setScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState("");
  const visible = useMemo(() => results.filter(r => filter === "all" || r.file_type === filter), [results, filter]);

  async function search(event) {
    event?.preventDefault();
    const q = query.trim();
    if (!q) { setError("請輸入工程問題、材料名稱或文件關鍵字。"); return; }
    setLoading(true); setError(""); setSearched(true); setSelected(null); setDemo(false);
    try {
      const response = await fetch(`${API}/api/v1/knowledge/search?q=${encodeURIComponent(q)}&limit=30`);
      if (!response.ok) throw new Error(`搜尋服務回應 ${response.status}`);
      const data = await response.json();
      setResults(data.results || []);
    } catch (err) {
      setError(`目前無法連線至搜尋 API。請確認後端已啟動。(${err.message})`);
      setResults([]);
    } finally { setLoading(false); }
  }
  function loadDemo() {
    setQuery("螺絲柱設計"); setResults(demoResults); setSelected(demoResults[0]); setSearched(true); setDemo(true); setError("");
  }
  async function scanFolder() {
    setScanning(true); setScanMessage("");
    try {
      const response = await fetch(`${API}/api/v1/knowledge/scan`, { method: "POST" });
      if (!response.ok) throw new Error(`索引服務回應 ${response.status}`);
      const data = await response.json();
      setScanMessage(`已檢查 ${data.files_scanned} 個檔案：新增或更新 ${data.files_indexed} 個，未變更 ${data.files_unchanged} 個。`);
    } catch (err) {
      setScanMessage(`無法更新本機索引。請確認後端與資料夾設定。(${err.message})`);
    } finally { setScanning(false); }
  }

  return <div className="app-shell">
    <header className="topbar"><div className="brand"><div className="brand-mark">E</div><div><strong>ENGINEERING</strong><span>DESIGN GUIDE</span></div></div><div className="top-meta"><span className="secure"><ShieldCheck size={15}/> Internal Knowledge</span><span className="avatar">RD</span></div></header>
    <main className={searched ? "workspace" : "hero-wrap"}>
      <section className={searched ? "search-head compact" : "search-head hero"}>
        <div className="eyebrow"><span></span> ENGINEERING KNOWLEDGE CENTER</div>
        <h1>{searched ? "搜尋結果" : <>Find the answer.<br/><em>Design with confidence.</em></>}</h1>
        <p>搜尋公司 Design Guide、設計標準與工程知識，快速找到原始依據。</p>
        <form className="search-box" onSubmit={search}><Search size={21}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="搜尋材料、尺寸、公差、機構設計或工程問題..."/><button disabled={loading}>{loading ? "搜尋中" : "搜尋"}<ChevronRight size={17}/></button></form>
        {error && <div className="error-msg">{error}</div>}
        {!searched && <div className="suggestions"><span>熱門搜尋</span>{["螺絲柱設計","ABS 材料","齒輪間隙","尺寸公差"].map(x=><button key={x} onClick={()=>setQuery(x)}>{x}</button>)}</div>}
      </section>
      {!searched ? <section className="landing-grid"><div className="welcome-card"><div className="card-icon"><BookOpen/></div><div><h3>Engineering Knowledge</h3><p>集中搜尋工程規範、設計指南與標準文件，讓每個設計決策都有來源可查。</p><button className="text-btn" onClick={scanFolder} disabled={scanning}><RefreshCw size={15}/>{scanning ? "索引更新中" : "更新本機文件索引"}</button><button className="text-btn" onClick={loadDemo}>預覽搜尋介面 <ChevronRight size={16}/></button>{scanMessage && <small className="scan-message">{scanMessage}</small>}</div></div><div className="mini-stat"><span>DOCUMENT TYPES</span><strong>PDF · PPTX · XLSX · DOCX</strong><small>Local read-only source</small></div><div className="mini-stat"><span>ACCESS</span><strong>Company Intranet</strong><small>Permission-aware rollout</small></div></section> : <section className="results-layout">
        <div className="results-panel"><div className="results-toolbar"><div><strong>{visible.length}</strong> 筆相關內容 <span className="muted">{demo ? "· 示範資料" : "· 來源依關鍵字排序"}</span></div><div className="filter"><SlidersHorizontal size={15}/><select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">所有格式</option><option value="pdf">PDF</option><option value="pptx">PPTX</option><option value="xlsx">XLSX</option><option value="docx">DOCX</option></select></div></div>
          {visible.length ? visible.map((item,i)=><button className={selected===item?"result-card active":"result-card"} key={item.source_path+i} onClick={()=>setSelected(item)}><div className="result-file"><FileIcon type={item.file_type}/><span>{item.file_type.toUpperCase()}</span></div><div className="result-copy"><strong>{item.source_name}</strong><small>{item.source_path}</small><p>{item.content}</p><div className="result-foot"><span><BookOpen size={13}/>{locationOf(item)}</span><span>{item.match_count} 個關鍵字命中</span><span>更新 {item.source_modified_at ? new Date(item.source_modified_at).toLocaleDateString("zh-TW") : "—"}</span></div></div><ChevronRight className="result-arrow" size={18}/></button>) : <div className="empty"><CircleHelp size={28}/><strong>沒有找到符合的文件</strong><span>試試其他關鍵字，或確認文件已完成索引。</span></div>}
        </div>
        <aside className="evidence-panel">{selected ? <><div className="aside-title"><span>DOCUMENT EVIDENCE</span><ExternalLink size={16}/></div><div className="source-heading"><FileIcon type={selected.file_type}/><div><strong>{selected.source_name}</strong><small>{selected.source_path}</small></div></div><div className="location-chip">{locationOf(selected)}</div><h3>相關內容</h3><p className="evidence-text">{selected.content}</p><div className="citation-note"><ShieldCheck size={16}/><span>此內容來自搜尋索引。正式上線需提供 NAS 原始文件開啟及權限驗證。</span></div><button className="open-source" disabled><ExternalLink size={15}/> 原始文件定位（待 NAS 整合）</button></> : <div className="evidence-empty"><Sparkles size={25}/><strong>工程依據預覽</strong><p>選擇左側搜尋結果，即可查看段落內容及來源位置。</p><small>AI 問答將在模型與資料權限核准後啟用。</small></div>}</aside>
      </section>}
    </main>
    <footer><span>Engineering Design Guide Search Platform</span><span>V1 · Prototype <i/> Source-first engineering knowledge</span></footer>
  </div>;
}
