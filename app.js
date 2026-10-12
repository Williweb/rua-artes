// RUA ARTES — catálogo estático y visor local. No almacena credenciales.
const ONEDRIVE_FOLDER_URL = "https://ruasasv-my.sharepoint.com/:f:/g/personal/wmontano_ruasa_com_sv/IgBS6_JVg1fRTovZk7GgriQ6AbB4QRFdwx6glm3xi-UJEx0?e=zuU8C";
const state = { items: [], active: null, zoom: 1, rotation: 0, flipH: 1, flipV: 1 };

const $ = id => document.getElementById(id);
$("openFolder").href = ONEDRIVE_FOLDER_URL;

async function loadCatalog() {
  $("refreshButton").disabled = true;
  $("resultLabel").textContent = "Actualizando catálogo…";
  try {
    const response = await fetch("artes.json", { cache: "no-store" });
    if (!response.ok) throw new Error("No se pudo cargar artes.json");
    const data = await response.json();
    state.items = Array.isArray(data) ? data : (data.items || []);
    render();
    $("setupNotice").hidden = state.items.length > 0;
  } catch (error) {
    state.items = [];
    render();
    $("setupNotice").hidden = false;
    $("resultLabel").textContent = "No se pudo leer el catálogo";
  } finally {
    $("refreshButton").disabled = false;
  }
}
function typeOf(item) {
  const kind = (item.type || item.format || "").toLowerCase();
  const url = (item.url || item.preview || "").toLowerCase();
  return kind.includes("pdf") || url.split("?")[0].endsWith(".pdf") ? "pdf" : "image";
}
function filteredItems() {
  const q = $("searchInput").value.trim().toLocaleLowerCase("es");
  const type = $("typeFilter").value;
  return state.items.filter(item => {
    const haystack = [item.name, item.client, item.code, item.product, item.description].filter(Boolean).join(" ").toLocaleLowerCase("es");
    return (!q || haystack.includes(q)) && (type === "all" || typeOf(item) === type);
  }).sort((a,b) => (a.name || "").localeCompare(b.name || "", "es"));
}
function render() {
  const items = filteredItems();
  $("totalCount").textContent = state.items.length;
  $("imageCount").textContent = state.items.filter(x => typeOf(x) === "image").length;
  $("pdfCount").textContent = state.items.filter(x => typeOf(x) === "pdf").length;
  $("resultLabel").textContent = `${items.length} ${items.length === 1 ? "resultado" : "resultados"}`;
  $("artGrid").innerHTML = "";
  $("emptyState").hidden = items.length !== 0;
  for (const item of items) {
    const type = typeOf(item);
    const card = document.createElement("article");
    card.className = "art-card";
    card.tabIndex = 0;
    card.setAttribute("role","button");
    card.setAttribute("aria-label", `Abrir ${item.name || "arte"}`);
    const preview = document.createElement("div");
    preview.className = "art-preview";
    const pill = document.createElement("span");
    pill.className = "type-pill";
    pill.textContent = type === "pdf" ? "PDF" : (item.extension || "IMAGEN").toUpperCase();
    preview.appendChild(pill);
    if (item.thumbnail || (type === "image" && item.url)) {
      const img = document.createElement("img");
      img.src = item.thumbnail || item.url;
      img.alt = "";
      img.loading = "lazy";
      img.onerror = () => { img.remove(); preview.appendChild(makePlaceholder(type)); };
      preview.appendChild(img);
    } else preview.appendChild(makePlaceholder(type));
    const body = document.createElement("div");
    body.className = "art-card-body";
    const title = document.createElement("h3"); title.textContent = item.name || "Arte sin nombre";
    const client = document.createElement("div"); client.className = "art-client"; client.textContent = item.client || item.product || "Sin cliente indicado";
    const foot = document.createElement("div"); foot.className = "art-card-foot";
    const code = document.createElement("span"); code.className = "art-code"; code.textContent = item.code || "Sin código";
    const view = document.createElement("span"); view.className = "view-link"; view.textContent = "VER ARTE ↗";
    foot.append(code,view); body.append(title,client,foot); card.append(preview,body);
    card.addEventListener("click", () => openViewer(item));
    card.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openViewer(item); }});
    $("artGrid").appendChild(card);
  }
}
function makePlaceholder(type) {
  const div = document.createElement("div"); div.className = "preview-placeholder";
  const icon = document.createElement("span"); icon.className = "doc-icon"; icon.textContent = type === "pdf" ? "▤" : "▧";
  const label = document.createElement("small"); label.textContent = type === "pdf" ? "PDF DOCUMENT" : "ARTWORK";
  div.append(icon,label); return div;
}
function openViewer(item) {
  state.active = item; resetTransform();
  const type = typeOf(item);
  $("viewerTitle").textContent = item.name || "Arte";
  $("viewerSubtitle").textContent = [item.client, item.code, item.product].filter(Boolean).join(" · ") || "Referencia de montaje";
  $("viewerType").textContent = type.toUpperCase();
  $("openOriginal").href = item.url || item.preview || ONEDRIVE_FOLDER_URL;
  $("viewerImage").hidden = true; $("viewerPdf").hidden = true; $("viewerPlaceholder").hidden = true;
  if (type === "pdf" && item.url) {
    $("viewerPdf").src = item.url;
    $("viewerPdf").hidden = false;
  } else if (item.url) {
    $("viewerImage").src = item.url;
    $("viewerImage").alt = item.name || "Arte";
    $("viewerImage").hidden = false;
    $("viewerImage").onerror = () => { $("viewerImage").hidden = true; $("viewerPlaceholder").hidden = false; $("viewerPlaceholder").textContent = "No se pudo mostrar la vista previa. Usa “Abrir original” para consultar el archivo en OneDrive."; };
  } else {
    $("viewerPlaceholder").hidden = false;
    $("viewerPlaceholder").textContent = "Este elemento aún no tiene un enlace directo de vista previa. Puedes abrir la carpeta compartida de OneDrive.";
  }
  $("viewerModal").classList.add("open");
  $("viewerModal").setAttribute("aria-hidden","false");
  document.body.style.overflow = "hidden";
}
function closeViewer() {
  $("viewerModal").classList.remove("open");
  $("viewerModal").setAttribute("aria-hidden","true");
  $("viewerPdf").src = "about:blank";
  document.body.style.overflow = "";
}
function applyTransform() {
  $("viewerImage").style.transform = `rotate(${state.rotation}deg) scale(${state.zoom * state.flipH}, ${state.zoom * state.flipV})`;
  $("zoomLabel").textContent = `${Math.round(state.zoom * 100)}%`;
}
function resetTransform() { state.zoom = 1; state.rotation = 0; state.flipH = 1; state.flipV = 1; applyTransform(); }
$("searchInput").addEventListener("input", render);
$("typeFilter").addEventListener("change", render);
$("refreshButton").addEventListener("click", loadCatalog);
$("closeViewer").addEventListener("click", closeViewer);
$("viewerModal").addEventListener("click", e => { if (e.target.dataset.close) closeViewer(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closeViewer(); });
$("zoomIn").addEventListener("click", () => { state.zoom = Math.min(4, state.zoom + .2); applyTransform(); });
$("zoomOut").addEventListener("click", () => { state.zoom = Math.max(.2, state.zoom - .2); applyTransform(); });
$("rotateLeft").addEventListener("click", () => { state.rotation -= 90; applyTransform(); });
$("rotateRight").addEventListener("click", () => { state.rotation += 90; applyTransform(); });
$("flipH").addEventListener("click", () => { state.flipH *= -1; applyTransform(); });
$("flipV").addEventListener("click", () => { state.flipV *= -1; applyTransform(); });
$("resetView").addEventListener("click", resetTransform);
loadCatalog();
