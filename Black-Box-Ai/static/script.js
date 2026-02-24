let currentModel = "blackboxai/openai/gpt-4o";

document.getElementById("modelBtn").onclick = () => {
    document.getElementById("modelMenu").classList.toggle("hidden");
};

document.querySelectorAll("#modelMenu div[data-model]").forEach(item => {
    item.onclick = () => {
        currentModel = item.dataset.model;
        document.getElementById("modelBtn").innerText = item.innerText + " ▾";
        document.getElementById("modelMenu").classList.add("hidden");
    };
});

async function sendMessage() {
    const input = document.getElementById("message");
    const message = input.value.trim();
    if (!message) return;

    addMessage(message, "user", false);
    input.value = "";

    const loading = addMessage("Typing...", "bot", false);

    const response = await fetch("/chat", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            message: message,
            model: currentModel
        })
    });

    const data = await response.json();
    loading.remove();
    addMessage(data.reply, "bot", true);
}

function addMessage(text, sender, markdown) {
    const div = document.createElement("div");
    div.classList.add("message", sender);

    if (markdown) {
        div.innerHTML = marked.parse(text);
        enhanceCode(div);
    } else {
        div.innerText = text;
    }

    document.getElementById("chat-box").appendChild(div);
    return div;
}

function enhanceCode(container) {
    container.querySelectorAll("pre code").forEach(block => {
        hljs.highlightElement(block);

        const btn = document.createElement("button");
        btn.innerText = "Copy";
        btn.classList.add("copy-btn");

        btn.onclick = () => {
            navigator.clipboard.writeText(block.innerText);
            btn.innerText = "Copied!";
            setTimeout(() => btn.innerText = "Copy", 1500);
        };

        block.parentElement.appendChild(btn);
    });
      }
