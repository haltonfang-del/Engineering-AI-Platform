import { useState } from "react";
import {
  BookOpen,
  CircleCheck,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  Presentation,
  RefreshCw,
  Search,
  ShieldCheck,
} from "lucide-react";

const API = import.meta.env.VITE_API_BASE_URL || "";
const exampleQuestion = "ABS 螺絲柱設計需要注意哪些事項？";
const examplePoints = [
  "螺絲柱壁厚與周圍肉厚需要一起評估。",
  "應檢查補強肋及根部應力集中。",
  "必須確認鎖附扭力與材料條件。",
];

function FileIcon({ type }) {
  if (type === "xlsx") return <FileSpreadsheet size={17} />;
  if (type === "pptx") return <Presentation size={17} />;
  return <FileText size={17} />;
}

function locationOf(item) {
  if (item.page_number) return `第 ${item.page_number} 頁`;
  if (item.slide_number) return `第 ${item.slide_number} 張投影片`;
  if (item.sheet_name) return `${item.sheet_name} · ${item.cell_reference || "工作表"}`;
  if (item.table_number) return `表格 ${item.table_number} · 第 ${item.paragraph_number || 1} 列`;
  if (item.section_name || item.paragraph_number) {
    return `${item.section_name ? `${item.section_name} · ` : ""}第 ${item.paragraph_number || ""} 段`;
  }
  return "來源位置尚未標記";
}

function updatedAt(value) {
  if (!value) return "更新時間未知";
  return `更新於 ${new Date(value).toLocaleDateString("zh-TW")}`;
}

export default function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState("");

  const question = searched ? query : exampleQuestion;
  const bullets = searched ? results.slice(0, 3).map((item) => item.content) : examplePoints;

  async function search(event) {
    event?.preventDefault();
    const q = query.trim();
    if (!q) {
      setError("請輸入工程問題或文件關鍵字。");
      return;
    }
    setLoading(true);
    setError("");
    setSearched(true);
    try {
      const response = await fetch(`${API}/api/v1/knowledge/search?q=${encodeURIComponent(q)}&limit=30`);
      if (!response.ok) throw new Error(`搜尋服務回應 ${response.status}`);
      const data = await response.json();
      setResults(data.results || []);
    } catch (err) {
      setError(`目前無法連線至搜尋 API。(${err.message})`);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  async function scanFolder() {
    setScanning(true);
    setScanMessage("");
    try {
      const response = await fetch(`${API}/api/v1/knowledge/scan`, { method: "POST" });
      if (!response.ok) throw new Error(`索引服務回應 ${response.status}`);
      const data = await response.json();
      setScanMessage(`已檢查 ${data.files_scanned} 個檔案；新增或更新 ${data.files_indexed} 個，未變更 ${data.files_unchanged} 個。`);
    } catch (err) {
      setScanMessage(`無法更新索引。請確認後端與資料夾設定。(${err.message})`);
    } finally {
      setScanning(false);
    }
  }

  return (
    <main className="answer-page">
      <article className="answer-card">
        <header className="answer-header">
          <div className="answer-title">
            <BookOpen size={20} strokeWidth={1.8} />
            <h1>Engineering Answer</h1>
          </div>
          <span className="version-badge">V1 UI</span>
        </header>

        <p className="demo-notice">
          {searched
            ? "以下顯示本機關鍵字搜尋結果；尚未啟用 AI 工程答案生成，請以原始文件為準。"
            : "以下使用假資料示範版面，不代表公司設計規範。"}
        </p>

        <form className="answer-search" onSubmit={search}>
          <Search size={19} />
          <input
            aria-label="搜尋工程文件"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="輸入工程問題、材料、尺寸或公差關鍵字..."
          />
          <button type="submit" disabled={loading}>{loading ? "搜尋中" : "搜尋"}</button>
          <button className="scan-button" type="button" onClick={scanFolder} disabled={scanning} title="更新本機索引" aria-label="更新本機索引">
            <RefreshCw size={17} className={scanning ? "spin" : ""} />
          </button>
        </form>
        {error && <p className="error-msg">{error}</p>}
        {scanMessage && <p className="scan-message">{scanMessage}</p>}

        <h2 className="question-line"><span>問題：</span>{question}</h2>

        <section className="summary-box" aria-label="搜尋摘要">
          <h3><CircleCheck size={18} />{searched ? "搜尋命中摘要" : "設計重點摘要"}</h3>
          {bullets.length ? (
            <ul>{bullets.map((point, index) => <li key={`${index}-${point}`}>{point}</li>)}</ul>
          ) : (
            <p className="summary-empty">目前沒有找到匹配內容。可以試試文件中的材料名稱或設計用語。</p>
          )}
        </section>

        <section className="answer-section">
          <h3>A. 工程結構圖示</h3>
          <div className="diagram-placeholder">
            <div className="diagram-icon"><ImageIcon size={30} strokeWidth={1.5} /></div>
            <strong>{searched && results[0] ? results[0].source_name : "工程圖預覽區"}</strong>
            <p>目前索引尚未擷取文件中的圖面。後續會在此呈現原始圖示並連結文件位置。</p>
            {searched && results[0] && <span>{locationOf(results[0])}</span>}
          </div>
        </section>

        <section className="answer-section source-section">
          <h3>B. 原始文件依據</h3>
          {searched && results.length ? (
            <div className="source-list">
              {results.map((item, index) => (
                <article className="source-item" key={`${item.source_path}-${index}`}>
                  <div className="source-heading">
                    <FileIcon type={item.file_type} />
                    <div>
                      <strong>{item.source_name}</strong>
                      <small>{item.source_path}</small>
                    </div>
                  </div>
                  <span className="location-chip">{locationOf(item)}</span>
                  <p>{item.content}</p>
                  <div className="source-foot">
                    <span>{item.match_count} 個關鍵字命中</span>
                    <span>{updatedAt(item.source_modified_at)}</span>
                  </div>
                </article>
              ))}
            </div>
          ) : searched ? (
            <div className="no-sources"><ShieldCheck size={18} />沒有可引用的來源。請調整關鍵字後再搜尋。</div>
          ) : (
            <div className="no-sources"><ExternalLink size={18} />執行搜尋後，這裡會顯示文件名稱與頁碼、投影片或儲存格位置。</div>
          )}
        </section>

        <footer className="answer-footer">
          <span>Engineering Design Guide · Local prototype</span>
          {!searched && <span>示範內容僅用於版面預覽</span>}
        </footer>
      </article>
    </main>
  );
}
