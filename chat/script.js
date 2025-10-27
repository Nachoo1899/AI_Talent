const OPENAI_API_KEY = "TU_API_KEY";

const chatWindow = document.querySelector(".hirelens-chat #chat-window");
const userInput = document.querySelector(".hirelens-chat #user-input");
const sendBtn = document.querySelector(".hirelens-chat #send-btn");
const fileInput = document.querySelector(".hirelens-chat #file-input");

let context = [];
let fileText = "";

sendBtn.addEventListener("click", async () => {
  const text = userInput.value.trim();
  if (!text) return;

  addMessage("user", text);
  userInput.value = "";

  await sendToBot(text);
});

userInput.addEventListener("keypress", async (e) => {
  if (e.key === "Enter") sendBtn.click();
});

fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    fileText = reader.result;
    addMessage("bot", "Archivo cargado correctamente, ya puedo analizarlo.");
  };
  reader.readAsText(file);
});

function addMessage(sender, text) {
  const div = document.createElement("div");
  div.className = "message " + sender;
  div.textContent = (sender === "user" ? "Tú: " : "HireLens AI: ") + text;
  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

async function sendToBot(userMsg) {
  const messages = [
    { role: "system", content: "Sos HireLens AI, un asistente experto en analizar CVs." },
  ];

  if (fileText) messages.push({ role: "system", content: "Contenido del archivo:\n" + fileText });

  context.forEach(m => messages.push(m));
  messages.push({ role: "user", content: userMsg });

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: messages
      })
    });

    const data = await res.json();
    const botMsg = data.choices[0].message.content;

    addMessage("bot", botMsg);

    context.push({ role: "user", content: userMsg });
    context.push({ role: "assistant", content: botMsg });
  } catch (err) {
    addMessage("bot", "Error al comunicarse con el modelo: " + err.message);
  }
}


