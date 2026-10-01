import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

const RandomKnowledge: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
  return (
    <div class={classNames(displayClass, "random-knowledge")}>
      <button type="button" class="rk-btn">
        🎲 随机知识点
      </button>
    </div>
  )
}

RandomKnowledge.css = `
.random-knowledge {
  margin-bottom: 1rem;
}
.random-knowledge .rk-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  width: 100%;
  padding: 0.55rem 0.75rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--darkgray);
  background: var(--light);
  border: 1px solid var(--lightgray);
  border-radius: 6px;
  cursor: pointer;
  transition: color 0.15s ease, border-color 0.15s ease;
}
.random-knowledge .rk-btn:hover {
  color: var(--secondary);
  border-color: var(--secondary);
}
.random-knowledge .rk-btn:focus-visible {
  outline: 2px solid var(--secondary);
  outline-offset: 2px;
}
`

RandomKnowledge.afterDOMLoaded = `
document.addEventListener("click", function (e) {
  var target = e.target;
  if (!target || !target.closest) return;
  var btn = target.closest(".rk-btn");
  if (!btn) return;
  e.preventDefault();
  var base = document.body.dataset.basepath || "";
  var load =
    typeof fetchData !== "undefined" && fetchData
      ? fetchData
      : fetch(base + "/static/contentIndex.json").then(function (r) {
          return r.json();
        });
  load.then(function (index) {
    var pool = [];
    var keys = Object.keys(index || {});
    for (var i = 0; i < keys.length; i++) {
      var entry = index[keys[i]];
      if (
        entry &&
        typeof entry.filePath === "string" &&
        entry.filePath.indexOf("知识点/") === 0 &&
        typeof entry.slug === "string" &&
        entry.slug.slice(-6) !== "/index"
      ) {
        pool.push(entry);
      }
    }
    if (pool.length === 0) {
      alert("知识点文件夹还是空的，先往 content/知识点/ 里加笔记吧");
      return;
    }
    var pick = pool[Math.floor(Math.random() * pool.length)];
    var url = new URL(base + "/" + pick.slug, window.location.href);
    if (typeof window.spaNavigate === "function") {
      window.spaNavigate(url, false);
    } else {
      window.location.href = url.href;
    }
  }).catch(function () {
    alert("加载知识点列表失败，请刷新页面后重试");
  });
});
`

export default (() => RandomKnowledge) satisfies QuartzComponentConstructor
