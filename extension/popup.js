const source = document.getElementById("source");
const status = document.getElementById("status");
document.getElementById("capture").addEventListener("click", async () => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  source.value = (tabs[0] && tabs[0].url) || "";
  status.textContent = source.value ? "Página actual capturada." : "No se pudo leer la pestaña actual.";
});
document.getElementById("send").addEventListener("click", async () => {
  const value = source.value.trim();
  if (!value) { status.textContent = "Pega un DOI o captura la página actual."; return; }
  await chrome.storage.local.set({ pendingNexusSource: value });
  await chrome.tabs.create({ url: "https://nexus-intellect.vercel.app/?source=" + encodeURIComponent(value) });
  status.textContent = "Fuente enviada a Nexus.";
});
