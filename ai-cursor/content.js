(() => {
  if (window.__aiCursorInstalled) return;
  window.__aiCursorInstalled = true;

  const ROOT_ID = "__ai_cursor_overlay__";
  let root = null;
  let cursor = null;
  let label = null;
  let highlight = null;

  function ensureOverlay() {
    if (root?.isConnected) return;
    root = document.createElement("div");
    root.id = ROOT_ID;
    root.style.cssText = "all:initial;position:fixed;inset:0;z-index:2147483647;pointer-events:none;";
    cursor = document.createElement("div");
    cursor.style.cssText = "position:fixed;left:40px;top:40px;width:0;height:0;filter:drop-shadow(0 2px 3px #0008);transition:left .65s cubic-bezier(.2,.8,.2,1),top .65s cubic-bezier(.2,.8,.2,1);";
    cursor.innerHTML = '<svg width="30" height="36" viewBox="0 0 30 36" aria-hidden="true"><path d="M3 2 L3 27 L10 20 L15 32 L20 30 L15 18 L25 18 Z" fill="#8b70ff" stroke="white" stroke-width="2" stroke-linejoin="round"/></svg>';
    label = document.createElement("div");
    label.textContent = "AI";
    label.style.cssText = "position:absolute;left:19px;top:23px;padding:3px 7px;border-radius:7px;background:#7657ed;color:white;font:600 11px system-ui;box-shadow:0 2px 8px #0005;";
    cursor.appendChild(label);
    root.appendChild(cursor);
    document.documentElement.appendChild(root);
  }

  function clearHighlight() {
    if (highlight?.isConnected) {
      highlight.style.outline = highlight.dataset.aiCursorOldOutline || "";
      highlight.style.outlineOffset = highlight.dataset.aiCursorOldOffset || "";
      delete highlight.dataset.aiCursorOldOutline;
      delete highlight.dataset.aiCursorOldOffset;
    }
    highlight = null;
  }

  function moveTo(element) {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    if (!rect.width || !rect.height) return false;
    ensureOverlay();
    cursor.style.left = Math.max(4, Math.min(innerWidth - 34, rect.left + rect.width / 2)) + "px";
    cursor.style.top = Math.max(4, Math.min(innerHeight - 38, rect.top + rect.height / 2)) + "px";
    clearHighlight();
    highlight = element;
    highlight.dataset.aiCursorOldOutline = highlight.style.outline || "";
    highlight.dataset.aiCursorOldOffset = highlight.style.outlineOffset || "";
    highlight.style.outline = "3px solid #8b70ff";
    highlight.style.outlineOffset = "3px";
    return true;
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type !== "AI_CURSOR") return;
    if (message.action === "show") {
      ensureOverlay();
      cursor.style.left = "40px";
      cursor.style.top = "40px";
      sendResponse({ message: "AI-курсор показан на этой вкладке." });
    } else if (message.action === "demo") {
      const target = document.querySelector("main button, button, input:not([type=hidden]), a[href], [role=button]");
      if (target && moveTo(target)) {
        sendResponse({ message: "Нашёл элемент и подсветил его. Нажатий не выполнялось." });
      } else {
        ensureOverlay();
        sendResponse({ message: "Курсор показан. Подходящий элемент не найден." });
      }
    } else if (message.action === "hide") {
      clearHighlight();
      root?.remove();
      root = cursor = label = null;
      sendResponse({ message: "AI-курсор скрыт." });
    }
    return true;
  });
})();