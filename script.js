const promptInput = document.getElementById("promptInput");
const output = document.getElementById("output");
const charCount = document.getElementById("charCount");
const wordCount = document.getElementById("wordCount");
const category = document.getElementById("category");
const label = document.getElementById("label");
const tagsInput = document.getElementById("tags");
const datasetList = document.getElementById("datasetList");
const search = document.getElementById("search");

const totalCount = document.getElementById("totalCount");
const posCount = document.getElementById("posCount");
const neuCount = document.getElementById("neuCount");
const negCount = document.getElementById("negCount");

const darkToggle = document.getElementById("darkToggle");
const exportBtn = document.getElementById("exportBtn");

/* Counters */
promptInput.addEventListener("input", () => {
  charCount.innerText = promptInput.value.length + " Characters";
  wordCount.innerText =
    promptInput.value.trim().split(/\s+/).filter(w => w).length + " Words";
});

/* Prompt Tools */
function formatPrompt() {
  if (!promptInput.value.trim()) return alert("Enter a prompt!");
  output.textContent =
`Role: Expert AI Assistant
Category: ${category.value}
Task: ${promptInput.value}

Instructions:
- Be clear and structured
- Provide examples
- Avoid unnecessary text`;
}

function enhancePrompt() {
  if (!promptInput.value.trim()) return alert("Enter a prompt!");
  output.textContent =
`You are a domain expert AI model.

Goal:
${promptInput.value}

Response Requirements:
- Step-by-step explanation
- Bullet points
- Real-world examples
- Concise and accurate`;
}

function copyPrompt() {
  navigator.clipboard.writeText(output.textContent);
  alert("Copied to clipboard!");
}

function clearPrompt() {
  promptInput.value = "";
  output.textContent = "";
}

/* Auto Label */
function autoDetectLabel(text) {
  const positive = ["good","great","success","happy","improve","best","fast"];
  const negative = ["bad","fail","error","issue","problem","slow","bug"];
  let score = 0;
  positive.forEach(w => text.toLowerCase().includes(w) && score++);
  negative.forEach(w => text.toLowerCase().includes(w) && score--);
  if (score > 0) return "Positive";
  if (score < 0) return "Negative";
  return "Neutral";
}

/* Save */
function savePrompt() {
  if (!promptInput.value.trim()) return alert("Prompt empty!");

  const detectedLabel = label.value === "Auto Detect"
    ? autoDetectLabel(promptInput.value)
    : label.value;

  const dataset = JSON.parse(localStorage.getItem("dataset")) || [];
  dataset.push({
    text: promptInput.value,
    category: category.value,
    label: detectedLabel,
    tags: tagsInput.value,
    time: new Date().toLocaleString()
  });

  localStorage.setItem("dataset", JSON.stringify(dataset));
  tagsInput.value = "";
  loadDataset();
}

/* Load + Analytics */
function loadDataset() {
  datasetList.innerHTML = "";
  const dataset = JSON.parse(localStorage.getItem("dataset")) || [];

  let pos = 0, neu = 0, neg = 0;

  dataset.forEach((item, index) => {
    if (item.label === "Positive") pos++;
    if (item.label === "Neutral") neu++;
    if (item.label === "Negative") neg++;

    const li = document.createElement("li");
    li.innerHTML = `
      <b>${item.category}</b> | ${item.label}<br>
      ${item.text}<br>
      <small>Tags: ${item.tags || "none"} | ${item.time}</small>
      <button onclick="deletePrompt(${index})">🗑</button>
    `;
    datasetList.appendChild(li);
  });

  totalCount.innerText = dataset.length;
  posCount.innerText = pos;
  neuCount.innerText = neu;
  negCount.innerText = neg;
}

/* Delete */
function deletePrompt(index) {
  const dataset = JSON.parse(localStorage.getItem("dataset")) || [];
  dataset.splice(index, 1);
  localStorage.setItem("dataset", JSON.stringify(dataset));
  loadDataset();
}

/* Search */
search.addEventListener("input", () => {
  const value = search.value.toLowerCase();
  document.querySelectorAll("#datasetList li").forEach(li => {
    li.style.display = li.innerText.toLowerCase().includes(value) ? "block" : "none";
  });
});

/* Export CSV */
exportBtn.addEventListener("click", () => {
  const dataset = JSON.parse(localStorage.getItem("dataset")) || [];
  if (!dataset.length) return alert("No data to export!");

  let csv = "Text,Category,Label,Tags,Time\n";
  dataset.forEach(d => {
    csv += `"${d.text}","${d.category}","${d.label}","${d.tags}","${d.time}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "prompt_dataset.csv";
  a.click();
});

/* Voice Input */
let recognition;
if ("webkitSpeechRecognition" in window) {
  recognition = new webkitSpeechRecognition();
  recognition.lang = "en-US";
}

function startVoice() {
  if (!recognition) return alert("Voice not supported!");
  recognition.start();
}

if (recognition) {
  recognition.onresult = e => {
    promptInput.value += " " + e.results[0][0].transcript;
    promptInput.dispatchEvent(new Event("input"));
  };
}

/* Text to Speech */
function speakOutput() {
  if (!output.textContent) return alert("Nothing to read!");
  const speech = new SpeechSynthesisUtterance(output.textContent);
  window.speechSynthesis.speak(speech);
}

/* Dark Mode */
darkToggle.onclick = () => document.body.classList.toggle("dark");

/* Init */
loadDataset();
