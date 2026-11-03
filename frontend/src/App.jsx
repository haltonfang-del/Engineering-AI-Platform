import { useEffect, useState } from "react";
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

function groupSources(items) {
  const grouped = new Map();
  for (const item of items) {
    const source = grouped.get(item.source_path) || {
      source_name: item.source_name,
      source_path: item.source_path,
      file_type: item.file_type,
      source_modified_at: item.source_modified_at,
      matches: [],
    };
    source.matches.push(item);
    if ((item.source_modified_at || "") > (source.source_modified_at || "")) {
      source.source_modified_at = item.source_modified_at;
    }
    grouped.set(item.source_path, source);
  }
  return [...grouped.values()];
}

export default function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState("");
  const [visuals, setVisuals] = useState([]);
  const [visualsLoading, setVisualsLoading] = useState(false);

  const question = searched ? query : exampleQuestion;
  const bullets = searched ? results.slice(0, 3).map((item) => item.content) : examplePoints;
  const sourceGroups = groupSources(results);
  const latestPptxSource = sourceGroups
    .filter((source) => source.file_type === "pptx")
    .sort((a, b) => new Date(b.source_modified_at || 0) - new Date(a.source_modified_at || 0))[0] || null;
  const visualSource = latestPptxSource?.matches[0] || results[0];

  useEffect(() => {
    let active = true;
    setVisuals([]);
    if (!searched || !visualSource || (!visualSource.page_number && !visualSource.slide_number)) {
      setVisualsLoading(false);
      return () => { active = false; };
    }

    const params = new URLSearchParams({ path: visualSource.source_path });
    if (visualSource.page_number) params.set("page_number", visualSource.page_number);
    if (visualSource.slide_number) params.set("slide_number", visualSource.slide_number);
    setVisualsLoading(true);
    fetch(`${API}/api/v1/knowledge/visuals?${params.toString()}`)
      .then((response) => {
        if (!response.ok) throw new Error(`圖面服務回應 ${response.status}`);
        return response.json();
      })
      .then((data) => {
        if (active) setVisuals(data.assets || []);
      })
      .catch(() => {
        if (active) setVisuals([]);
      })
      .finally(() => {
        if (active) setVisualsLoading(false);
      });

    return () => { active = false; };
  }, [searched, visualSource?.source_path, visualSource?.page_number, visualSource?.slide_number]);

  async function performSearch(q, ordering) {
    setLoading(true);
    setError("");
    setSearched(true);
    try {
      const response = await fetch(`${API}/api/v1/knowledge/search?q=${encodeURIComponent(q)}&limit=100&sort_by=${ordering}`);
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

  async function search(event) {
    event?.preventDefault();
    const q = query.trim();
    if (!q) {
      setError("請輸入工程問題或文件關鍵字。");
      return;
    }
    await performSearch(q, "relevance");
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
          <div className={`diagram-placeholder ${visuals.length ? "has-visuals" : ""}`}>
            {visuals.length ? (
              <>
                <div className="diagram-images">
                  {visuals.map((asset, index) => <img key={`${asset.filename}-${index}`} src={`data:${asset.content_type};base64,${asset.data_base64}`} alt={`${visualSource.source_name} ${locationOf(visualSource)} embedded image ${index + 1}`} />)}
                </div>
                <strong>{visualSource.source_name}</strong>
                <span>{locationOf(visualSource)} · 原始文件嵌入圖片</span>
              </>
            ) : (
              <>
                <div className="diagram-icon"><ImageIcon size={30} strokeWidth={1.5} /></div>
                <strong>{searched && visualSource ? visualSource.source_name : "工程圖預覽區"}</strong>
                <p>{visualsLoading ? "正在讀取原始文件圖片…" : searched ? "此頁或投影片沒有可直接抽取的嵌入圖片；若圖面由向量元素組成，需再以原始頁面或投影片渲染。" : "搜尋後會嘗試顯示命中頁面或投影片中的原始嵌入圖片。"}</p>
                {searched && visualSource && <span>{locationOf(visualSource)}</span>}
              </>
            )}
          </div>
        </section>

        <section className="answer-section source-section">
          <h3>B. 原始文件依據</h3>
          {searched && latestPptxSource ? (
            <article className="source-item latest-source">
              <div className="source-heading">
                <FileIcon type={latestPptxSource.file_type} />
                <div>
                  <strong>{latestPptxSource.source_name}</strong>
                  <small>依檔案修改時間排序</small>
                </div>
                <span className="latest-badge">最新更新</span>
              </div>
              <div className="source-foot"><span>{updatedAt(latestPptxSource.source_modified_at)}</span></div>
            </article>
          ) : searched ? (
            <div className="no-sources"><ShieldCheck size={18} />沒有找到符合關鍵字的 PPTX 文件。</div>
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
