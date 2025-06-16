// CSV-Parsing: erkennt ; , Leerzeichen oder Tab als Trennzeichen
function parseCSV(text) {
  return text
    .trim()
    .split(/\r?\n/)
    .map((line) =>
      line
        .trim()
        .split(/[; ,\t]+/)
        .map(Number)
    );
}

let adjMatrix = null;

function showMessage(html) {
  document.getElementById("output").innerHTML = html;
}

document.getElementById("loadBtn").onclick = () => {
  const file = document.getElementById("fileInput").files[0];
  if (!file) return alert("Bitte CSV-Datei auswählen");
  const reader = new FileReader();
  reader.onload = (e) => {
    adjMatrix = parseCSV(e.target.result);
    showMessage(
      `<div class='result-line'>Graph geladen: ${adjMatrix.length} Knoten.</div>`
    );
  };
  reader.readAsText(file);
};

document.getElementById("runBtn").onclick = () => {
  if (!adjMatrix) return alert("Bitte zuerst Graph laden");
  const alg = document.getElementById("algorithm").value;
  const funcs = {
    metrics: computeMetrics,
    bfs: () => bfs(0),
    dfs: () => dfs(0),
    dijkstra: () => dijkstra(0),
    components: findComponents,
    articulation: findArticulations,
    bridges: findBridges,
    euler: findEulerianCycle,
    spanning: findSpanningTree,
    scc: findSCC,
    blocks: findBlocks,
  };
  const res = funcs[alg]();
  formatOutput(alg, res);
};

function formatOutput(alg, res) {
  let html = `<div class='result-title'>Ergebnis: ${
    document.getElementById("algorithm").selectedOptions[0].text
  }</div>`;
  switch (alg) {
    case "metrics":
      html +=
        `<div class='result-line'>Radius: ${res.radius}</div>` +
        `<div class='result-line'>Durchmesser: ${res.diameter}</div>` +
        `<div class='result-line'>Zentrum: ${res.center.join(", ")}</div>`;
      break;
    case "bfs":
    case "dfs":
      html += `<div class='result-line'>Reihenfolge: ${res.order.join(
        " → "
      )}</div>`;
      break;
    case "dijkstra":
      html +=
        `<div class='result-line'>Distanzen:</div>` +
        res.dist
          .map(
            (d, i) =>
              `<div class='result-line'>&nbsp;&nbsp;Knoten ${i}: ${d}</div>`
          )
          .join("");
      break;
    case "components":
      res.components.forEach((c, i) => {
        html += `<div class='result-line'>Komponente ${i + 1}: ${c.join(
          ", "
        )}</div>`;
      });
      break;
    case "articulation":
      html += `<div class='result-line'>Artikulationspunkte: ${res.articulations.join(
        ", "
      )}</div>`;
      break;
    case "bridges":
      res.bridges.forEach(
        (b) =>
          (html += `<div class='result-line'>Brücke: ${b[0]} – ${b[1]}</div>`)
      );
      break;
    case "euler":
      html += res.eulerian
        ? `<div class='result-line'>Euler-Zyklus: ${res.cycle.join(
            " → "
          )}</div>`
        : `<div class='result-line'>Kein Euler-Pfad/-Zyklus</div>`;
      break;
    case "spanning":
      res.spanningTree.forEach(
        (e) => (html += `<div class='result-line'>${e[0]} – ${e[1]}</div>`)
      );
      break;
    case "scc":
      res.scc.forEach(
        (c, i) =>
          (html += `<div class='result-line'>SCC ${i + 1}: ${c.join(
            ", "
          )}</div>`)
      );
      break;
    case "blocks":
      res.blocks.forEach(
        (b, i) =>
          (html += `<div class='result-line'>Block ${i + 1}: ${b
            .map((e) => e.join("-"))
            .join(", ")}</div>`)
      );
      break;
    default:
      html += `<div class='result-line'>Unbekannter Algorithmus</div>`;
  }
  showMessage(html);
}

function buildGraph(mat) {
  const g = {};
  mat.forEach((row, i) => {
    g[i] = [];
    row.forEach((val, j) => {
      if (val > 0) g[i].push(j);
    });
  });
  return g;
}

function computeMetrics() {
  const graph = buildGraph(adjMatrix);
  const n = adjMatrix.length;
  const dist = Array.from({ length: n }, () => Array(n).fill(Infinity));
  for (let i = 0; i < n; i++) {
    const q = [i];
    dist[i][i] = 0;
    while (q.length) {
      const u = q.shift();
      graph[u].forEach((v) => {
        if (dist[i][v] === Infinity) {
          dist[i][v] = dist[i][u] + 1;
          q.push(v);
        }
      });
    }
  }
  const ecc = dist.map((r) => Math.max(...r.filter((d) => d < Infinity)));
  const radius = Math.min(...ecc);
  const diameter = Math.max(...ecc);
  const center = ecc
    .map((e, i) => (e === radius ? i : null))
    .filter((x) => x !== null);
  return { radius, diameter, center };
}

//اجرای الگوریتم جستجوی سطح‌به‌سطح
function bfs(start) {
  const graph = buildGraph(adjMatrix);
  const visited = new Set(),
    order = [];
  const q = [start];
  visited.add(start);
  while (q.length) {
    const u = q.shift();
    order.push(u);
    graph[u].forEach((v) => {
      if (!visited.has(v)) {
        visited.add(v);
        q.push(v);
      }
    });
  }
  return { order };
}

//اجرای الگوریتم جستجوی عمقی
function dfs(start) {
  const graph = buildGraph(adjMatrix);
  const visited = new Set(),
    order = [];
  (function visit(u) {
    visited.add(u);
    order.push(u);
    graph[u].forEach((v) => {
      if (!visited.has(v)) visit(v);
    });
  })(start);
  return { order };
}

//محاسبه کوتاه‌ترین فاصله‌ها 
function dijkstra(start) {
  const graph = buildGraph(adjMatrix);
  const n = adjMatrix.length;
  const dist = Array(n).fill(Infinity);
  dist[start] = 0;
  const pq = new Set([...Array(n).keys()]);
  while (pq.size) {
    let u = null,
      best = Infinity;
    pq.forEach((x) => {
      if (dist[x] < best) {
        best = dist[x];
        u = x;
      }
    });
    pq.delete(u);
    graph[u].forEach((v) => {
      const alt = dist[u] + 1;
      if (alt < dist[v]) dist[v] = alt;
    });
  }
  return { dist };
}

// یافتن مؤلفه‌های هم‌بند در گراف بدون جهت
function findComponents() {
  const graph = buildGraph(adjMatrix);
  const n = adjMatrix.length;
  const visited = Array(n).fill(false);
  const comps = [];
  for (let i = 0; i < n; i++) {
    if (!visited[i]) {
      const comp = [],
        q = [i];
      visited[i] = true;
      while (q.length) {
        const u = q.shift();
        comp.push(u);
        graph[u].forEach((v) => {
          if (!visited[v]) {
            visited[v] = true;
            q.push(v);
          }
        });
      }
      comps.push(comp);
    }
  }
  return { components: comps };
}

//پیدا کردن نقاط بحرانی گره‌هایی که با حذف آن‌ها، گراف ناپیوسته می‌شود.

function findArticulations() {
  const graph = buildGraph(adjMatrix);
  const n = adjMatrix.length;
  let time = 0;
  const disc = Array(n).fill(-1),
    low = Array(n).fill(-1),
    parent = Array(n).fill(-1);
  const visited = Array(n).fill(false),
    ap = Array(n).fill(false);
  function dfsAP(u) {
    visited[u] = true;
    disc[u] = low[u] = time++;
    let children = 0;
    graph[u].forEach((v) => {
      if (!visited[v]) {
        children++;
        parent[v] = u;
        dfsAP(v);
        low[u] = Math.min(low[u], low[v]);
        if (parent[u] === -1 && children > 1) ap[u] = true;
        if (parent[u] !== -1 && low[v] >= disc[u]) ap[u] = true;
      } else if (v !== parent[u]) low[u] = Math.min(low[u], disc[v]);
    });
  }
  for (let i = 0; i < n; i++) if (!visited[i]) dfsAP(i);
  return {
    articulations: ap.map((v, i) => (v ? i : null)).filter((x) => x !== null),
  };
}

//یافتن یال‌های بحرانی  یال‌هایی که حذف آن‌ها باعث افزایش تعداد مؤلفه‌های هم‌بند می‌شود.

function findBridges() {
  const graph = buildGraph(adjMatrix);
  const n = adjMatrix.length;
  let time = 0;
  const disc = Array(n).fill(-1),
    low = Array(n).fill(-1),
    parent = Array(n).fill(-1);
  const visited = Array(n).fill(false);
  const bridges = [];
  function dfsBr(u) {
    visited[u] = true;
    disc[u] = low[u] = time++;
    graph[u].forEach((v) => {
      if (!visited[v]) {
        parent[v] = u;
        dfsBr(v);
        low[u] = Math.min(low[u], low[v]);
        if (low[v] > disc[u]) bridges.push([u, v]);
      } else if (v !== parent[u]) low[u] = Math.min(low[u], disc[v]);
    });
  }
  for (let i = 0; i < n; i++) if (!visited[i]) dfsBr(i);
  return { bridges };
}

//بررسی اینکه آیا گراف دارای مسیر یا دور اویلری هست
function findEulerianCycle() {
  const graph = buildGraph(adjMatrix);
  const n = adjMatrix.length;
  const deg = Object.values(graph).map((nei) => nei.length);
  const odd = deg.filter((d) => d % 2).length;
  if (![0, 2].includes(odd)) return { eulerian: false };
  const start =
    deg.findIndex((d) => d % 2) !== -1 ? deg.findIndex((d) => d % 2) : 0;
  const gCopy = {};
  Object.keys(graph).forEach((u) => (gCopy[u] = graph[u].slice()));
  const stack = [start],
    path = [];
  const edgeCount =
    Object.values(graph).reduce((s, nei) => s + nei.length, 0) / 2;
  while (stack.length) {
    const u = stack[stack.length - 1];
    if (gCopy[u].length) {
      const v = gCopy[u].pop();
      const idx = gCopy[v].indexOf(parseInt(u));
      if (idx >= 0) gCopy[v].splice(idx, 1);
      stack.push(v);
    } else path.push(stack.pop());
  }
  if (path.length !== edgeCount + 1) return { eulerian: false };
  return { eulerian: true, cycle: path.reverse() };
}

//تولید یک درخت پوشای گراف بدون وزن 
function findSpanningTree() {
  const graph = buildGraph(adjMatrix);
  const n = adjMatrix.length;
  const visited = Array(n).fill(false);
  const edges = [];
  const q = [0];
  visited[0] = true;
  while (q.length) {
    const u = q.shift();
    graph[u].forEach((v) => {
      if (!visited[v]) {
        visited[v] = true;
        edges.push([u, v]);
        q.push(v);
      }
    });
  }
  return { spanningTree: edges };
}
function findSCC() {
  const graph = buildGraph(adjMatrix);
  const n = adjMatrix.length;
  const visited = Array(n).fill(false),
    order = [];
  function dfs1(u) {
    visited[u] = true;
    graph[u].forEach((v) => {
      if (!visited[v]) dfs1(v);
    });
    order.push(u);
  }
  for (let i = 0; i < n; i++) if (!visited[i]) dfs1(i);
  const rev = {};
  for (let i = 0; i < n; i++) rev[i] = [];
  Object.keys(graph).forEach((u) =>
    graph[u].forEach((v) => rev[v].push(parseInt(u)))
  );
  const visited2 = Array(n).fill(false),
    comps = [];
  function dfs2(u, comp) {
    visited2[u] = true;
    comp.push(u);
    rev[u].forEach((v) => {
      if (!visited2[v]) dfs2(v, comp);
    });
  }
  order.reverse().forEach((u) => {
    if (!visited2[u]) {
      const comp = [];
      dfs2(u, comp);
      comps.push(comp);
    }
  });
  return { scc: comps };
}

function findBlocks() {
  const graph = buildGraph(adjMatrix);
  const n = adjMatrix.length;
  let time = 0;
  const disc = Array(n).fill(0),
    low = Array(n).fill(0),
    parent = Array(n).fill(-1);
  const stack = [],
    bcc = [];
  function dfsB(u) {
    disc[u] = low[u] = ++time;
    graph[u].forEach((v) => {
      if (disc[v] === 0) {
        parent[v] = u;
        stack.push([u, v]);
        dfsB(v);
        low[u] = Math.min(low[u], low[v]);
        if (low[v] >= disc[u]) {
          const block = [];
          let e;
          do {
            e = stack.pop();
            block.push(e);
          } while (e[0] !== u || e[1] !== v);
          bcc.push(block);
        }
      } else if (v !== parent[u] && disc[v] < disc[u]) {
        low[u] = Math.min(low[u], disc[v]);
        stack.push([u, v]);
      }
    });
  }
  for (let i = 0; i < n; i++) if (disc[i] === 0) dfsB(i);
  return { blocks: bcc };
}
