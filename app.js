const state = { data: [], selected: null };
const $ = (selector) => document.querySelector(selector);
const form = $("#calculator-form");
const center = $("#center");
const career = $("#career");
const calendar = $("#calendar");
const average = $("#average");
const centerSearch = $("#center-search");
const careerSearch = $("#career-search");

function option(value, label) { const node = document.createElement("option"); node.value = value; node.textContent = label; return node; }
function currentRecords() { return state.data.filter((item) => item.calendar === calendar.value); }
function renderCenters() {
  const previous = center.value;
  const query = centerSearch.value.trim().toLocaleLowerCase("es-MX");
  const centers = [...new Set(currentRecords().map((item) => `${item.center}||${item.campus}`))]
    .filter((value) => value.toLocaleLowerCase("es-MX").includes(query)).sort((a,b) => a.localeCompare(b, "es"));
  center.replaceChildren(option("", centers.length ? "Selecciona un centro universitario" : "No hay coincidencias"));
  centers.forEach((value) => { const [name, campus] = value.split("||"); center.append(option(value, `${name} · ${campus}`)); });
  center.disabled = false;
  if (centers.includes(previous)) center.value = previous;
}
function renderCareers() {
  const previous = career.value;
  const query = careerSearch.value.trim().toLocaleLowerCase("es-MX");
  const [selectedCenter, selectedCampus] = center.value.split("||");
  const records = currentRecords().filter((item) => item.center === selectedCenter && item.campus === selectedCampus && item.career.toLocaleLowerCase("es-MX").includes(query));
  career.replaceChildren(option("", center.value ? (records.length ? "Selecciona una carrera" : "No hay coincidencias") : "Selecciona un centro universitario"));
  records.sort((a,b) => a.career.localeCompare(b.career,"es")).forEach((item, index) => career.append(option(String(index), item.career)));
  career.dataset.records = JSON.stringify(records);
  career.disabled = !center.value;
  careerSearch.disabled = !center.value;
  if (previous && [...career.options].some((item) => item.value === previous)) career.value = previous;
}
function clearResult() { $("#result").className = "result-card empty"; $("#result").innerHTML = '<p class="eyebrow">RESULTADO</p><h3>Tu meta aparecerá aquí.</h3><p>Indica tu promedio, centro y carrera para calcular la referencia de examen.</p>'; }
function calculate(event) {
  event?.preventDefault();
  const inputAverage = Number(average.value);
  const items = JSON.parse(career.dataset.records || "[]");
  const record = items[Number(career.value)];
  if (!Number.isFinite(inputAverage) || inputAverage < 60 || inputAverage > 100 || !record) { $("#form-error").textContent = "Revisa tu promedio y selecciona un centro y una carrera."; clearResult(); return; }
  $("#form-error").textContent = "";
  const raw = record.minimumScore - inputAverage;
  const needed = Math.max(0, raw);
  const recommended = Math.min(100, needed + 5);
  const examVisual = Math.min(100, needed);
  const alert = raw < 0 ? "Tu promedio ya iguala o supera el corte histórico; aun así debes presentar el examen y competir contra el puntaje de la generación." : raw > 100 ? "Con este promedio, el corte histórico seleccionado requeriría más de 100 puntos normalizados en el examen. Considera mejorar el promedio si aún es posible, explorar otra opción o revisar otros calendarios." : "";
  const result = $("#result"); result.className = "result-card ready";
  result.innerHTML = `<p class="eyebrow">RESULTADO · ${record.calendar}</p><h3 class="result-title">${record.career}</h3><p class="result-subtitle">${record.center} · ${record.campus}</p><div class="metrics"><div class="metric"><span>Corte histórico</span><strong>${record.minimumScore.toFixed(2)}</strong></div><div class="metric"><span>Tu promedio</span><strong>${inputAverage.toFixed(2)}</strong></div><div class="metric"><span>Examen para igualar</span><strong>${needed.toFixed(2)}</strong></div><div class="metric"><span>Meta con margen</span><strong>${recommended.toFixed(2)}</strong></div></div><div class="score-visual"><div class="score-label"><span>Promedio + examen</span><span>de 200 puntos</span></div><div class="score-bar" aria-label="${inputAverage.toFixed(2)} puntos de promedio y ${examVisual.toFixed(2)} puntos de examen"><span class="bar-average" style="width:${inputAverage / 2}%"></span><span class="bar-${raw > 100 ? "overflow" : "exam"}" style="width:${examVisual / 2}%"></span></div></div>${alert ? `<p class="alert">${alert}</p>` : ""}<p class="context">La UdeG admite según el cupo y los puntajes más altos de cada proceso. Este cálculo usa un corte histórico y no predice la admisión.</p><a class="result-link" href="https://escolar.udg.mx/estadisticas-puntajes-minimos" target="_blank" rel="noreferrer">Ver fuente oficial de puntajes UdeG</a><p class="fine-print">Los puntajes cambian por calendario, carrera, sede, demanda y cupo.</p>`;
}
async function loadData() {
  try { const payload = window.UDG_SCORES || await fetch("data/udg-scores.json").then((response) => { if (!response.ok) throw new Error("No se pudieron cargar los cortes."); return response.json(); }); state.data = payload.records; $("#data-updated").textContent = `Fecha de actualización de los datos: ${new Intl.DateTimeFormat("es-MX", { dateStyle: "long" }).format(new Date(payload.updatedAt * 1000))}.`; renderCenters(); renderCareers(); } catch (error) { $("#form-error").textContent = "No se pudieron cargar los datos de cortes. Intenta recargar la página."; center.replaceChildren(option("", "Error al cargar datos")); $("#data-updated").textContent = "Fecha de actualización de los datos: no disponible."; }
}
calendar.addEventListener("change", () => { centerSearch.value = ""; careerSearch.value = ""; renderCenters(); renderCareers(); clearResult(); });
centerSearch.addEventListener("input", () => { renderCenters(); renderCareers(); }); center.addEventListener("change", () => { careerSearch.value = ""; renderCareers(); clearResult(); }); careerSearch.addEventListener("input", renderCareers); career.addEventListener("change", calculate); average.addEventListener("change", () => { if (career.value) calculate(); }); form.addEventListener("submit", calculate);
$("#reset-button").addEventListener("click", () => { form.reset(); centerSearch.value = ""; careerSearch.value = ""; renderCenters(); renderCareers(); $("#form-error").textContent = ""; clearResult(); });
document.querySelectorAll(".checks input").forEach((box) => box.addEventListener("change", () => { const count = document.querySelectorAll(".checks input:checked").length; $("#profile-message").textContent = count >= 3 ? "Tu perfil parece alinearse con varios criterios de referencia. La selección depende del proceso oficial." : "La selección depende del proceso oficial."; }));
loadData();
