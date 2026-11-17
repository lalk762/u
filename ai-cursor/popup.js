const status = document.getElementById("status");

async function send(action) {
  status.textContent = "Выполняю…";
  try {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    if (!tab?.id || !/^https?:/.test(tab.url || "")) {
      status.textContent = "Открой обычную веб-страницу (http или https).";
      return;
    }
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["content.js"] });
    const response = await chrome.tabs.sendMessage(tab.id, { type: "AI_CURSOR", action });
    status.textContent = response?.message || "Готово.";
  } catch (error) {
    status.textContent = "Не удалось запустить на этой странице. Попробуй обычный сайт.";
  }
}

document.getElementById("show").addEventListener("click", () => send("show"));
document.getElementById("demo").addEventListener("click", () => send("demo"));
document.getElementById("hide").addEventListener("click", () => send("hide"));