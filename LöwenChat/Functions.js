const form = document.getElementById("chat-form");
const input = document.getElementById("chat-input");
const messages = document.getElementById("chat-messages");
const speechButton = document.getElementById("speech-button");
const typingIndicator = document.getElementById("typing-indicator");
const apiKey = "OpenAI-API"; // <<<<<<<<<<<<<<<<--------------------------- hier kommt das API-Key 

const selectionWindow = document.getElementById("selection-window");
const responseTypeSelect = document.getElementById("response-type");
const startButton = document.getElementById("start-button");
const chatWindow = document.getElementById("chat-window");
const chatTitle = document.getElementById("chat-title");
const backButton = document.getElementById("back-button");
const logoContainer = document.getElementById("logo-container");

let conversationHistory = [];
let currentUtterance = null;
let isSpeaking = false;

let recognition;

function startSpeechRecognition() {
  if (!('webkitSpeechRecognition' in window)) {
    alert("Dein Browser unterstützt keine Spracherkennung.");
    return;
  }

  recognition = new webkitSpeechRecognition();
  recognition.lang = 'de-DE';
  recognition.interimResults = false;

  recognition.onstart = function() {
    speechButton.innerHTML = '🎙️';
  };

  recognition.onresult = function(event) {
    const speechResult = event.results[0][0].transcript;
    input.value = speechResult;
  };

  recognition.onerror = function(event) {
    console.error("Fehler bei der Spracherkennung:", event.error);
    speechButton.innerHTML = '🎤';
  };

  recognition.onend = function() {
    speechButton.innerHTML = '🎤';
  };

  recognition.start();
}

function stopSpeechRecognition() {
  if (recognition) {
    recognition.stop();
    speechButton.innerHTML = '🎤';
  }
}

speechButton.addEventListener('mousedown', startSpeechRecognition);
speechButton.addEventListener('mouseup', stopSpeechRecognition);
speechButton.addEventListener('mouseleave', stopSpeechRecognition);
speechButton.addEventListener('touchstart', startSpeechRecognition);
speechButton.addEventListener('touchend', stopSpeechRecognition);

function addBotMessage(message) {
  const cleanedMessage = cleanTextForSpeech(message);
  const messageId = `msg-${Math.random().toString(36).substr(2, 9)}`;
  messages.innerHTML += `<div class="message bot-message" id="${messageId}">
    <img src="pictures/web-icon.png" alt="bot icon"> 
    <span>${message}</span>
    <button class="copy-button" onclick="copyToClipboard('${messageId}', this)">
      <img src="pictures/pngwing.com.png" alt="copy icon" style="width: 16px; height: 16px;">
    </button>
    <button class="tts-button" onclick="toggleSpeech('${cleanedMessage}', this)">
      <img src="pictures/speaker-icon.png" alt="TTS icon" style="width: 16px; height: 16px;">
    </button>
    </div>`;
  scrollToBottom();
}

function scrollToBottom() {
  messages.scrollTop = messages.scrollHeight;
}

function copyToClipboard(messageId, buttonElement) {
  const messageElement = document.getElementById(messageId).querySelector('span');
  const textToCopy = messageElement.innerText;
  
  navigator.clipboard.writeText(textToCopy).then(() => {
    buttonElement.innerHTML = '<img src="pictures/pngwing.com (1).png" alt="check icon" style="width: 16px; height: 16px;">';
    setTimeout(() => {
      buttonElement.innerHTML = '<img src="pictures/pngwing.com.png" alt="copy icon" style="width: 16px; height: 16px;">';
    }, 2000); 
  }).catch(err => {
    console.error('Fehler beim Kopieren des Textes: ', err);
  });
}

function toggleSpeech(text, buttonElement) {
  if (isSpeaking) {
    window.speechSynthesis.cancel();
    isSpeaking = false;
    buttonElement.innerHTML = '<img src="pictures/speaker-icon.png" alt="TTS icon" style="width: 16px; height: 16px;">'; 
  } else {
    speakMessage(text, buttonElement);
  }
}

function speakMessage(text, buttonElement) {
  const speechSynthesis = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'de-DE'; 

  utterance.onstart = () => {
    isSpeaking = true;
    buttonElement.innerHTML = '<img src="pictures/stop-button.png" alt="Stop icon" style="width: 16px; height: 16px;">'; 
  };

  utterance.onend = () => {
    isSpeaking = false;
    buttonElement.innerHTML = '<img src="pictures/speaker-icon.png" alt="TTS icon" style="width: 16px; height: 16px;">'; 
  };

  speechSynthesis.speak(utterance);
  currentUtterance = utterance; 
}

function cleanTextForSpeech(text) {
  return text
    .replace(/["„“”]/g, '') 
    .replace(/'/g, '') 
    .replace(/[\u2018\u2019\u201C\u201D]/g, '') 
    .replace(/–/g, '-') 
    .replace(/(\r\n|\n|\r)/gm, ''); 
}

startButton.addEventListener("click", () => {
  selectionWindow.style.display = "none";
  chatWindow.style.display = "block";
  logoContainer.style.display = "none";

  const selectedOption = responseTypeSelect.value;
  switch (selectedOption) {
    case "funny":
      chatTitle.textContent = "Lustige Geschichten";
      addBotMessage("Sag mir ein Wort oder mehrere und ich mache daraus eine lustige Geschichte!");
      break;
    case "sad":
      chatTitle.textContent = "Traurige Geschichten";
      addBotMessage("Sag mir ein Wort oder mehrere und ich mache daraus eine traurige Geschichte.");
      break;
    case "informative":
      chatTitle.textContent = "Informationen/Einfache Erklärungen";
      addBotMessage("Gib mir ein Thema und ich erkläre es einfach.");
      break;
    case "correction":
      chatTitle.textContent = "Korrektur";
      addBotMessage("Schreibe einen Text und ich werde ihn korrigieren.");
      break;
    case "chat":
      chatTitle.textContent = "Einfach Chatten";
      addBotMessage("Gib mir eine Nachricht und wir plaudern!");
      break;
    default:
      chatTitle.textContent = "Chatbot";
  }
  scrollToBottom(); 
});

backButton.addEventListener("click", () => {
  chatWindow.style.display = "none";
  selectionWindow.style.display = "block";
  logoContainer.style.display = "block";
  messages.innerHTML = '';
  input.value = '';
  conversationHistory = []; 
  chatTitle.textContent = "Chatbot";

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      isSpeaking = false;
    }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userMessage = input.value;
  input.value = "";

  messages.innerHTML += `<div class="message user-message">
    <img src="pictures/user.png" alt="user icon"> <span>${userMessage}</span>
    </div>`;
  scrollToBottom(); 

  const botMessagePlaceholder = document.createElement("div");
  botMessagePlaceholder.classList.add("message", "bot-message");
  botMessagePlaceholder.innerHTML = `
    <img src="pictures/web-icon.png" alt="bot icon"> <!-- Blinken mit CSS-Klasse -->
    <span class="blinking">Löwe schreibt...</span>
  `;
  messages.appendChild(botMessagePlaceholder);
  scrollToBottom(); 

  const responseType = responseTypeSelect.value;
  let prompt = '';

  switch (responseType) {
    case "funny":
      prompt = `Erstelle eine lustige Geschichte über das/die folgende(n) Wort/Wörter: "${userMessage}". Mach sie unterhaltsam und humorvoll!`;
      break;
    case "sad":
      prompt = `Erstelle eine traurige Geschichte über das/die folgende(n) Wort/Wörter: "${userMessage}". Sie sollte emotional und ergreifend sein.`;
      break;
    case "informative":
      prompt = `Gib mir eine einfache Erklärung oder Information über das/die folgende(n) Wort/Wörter: "${userMessage}". Halte es informativ und leicht verständlich.`;
      break;
    case "correction":
      prompt = `Korrigiere und verbessere den folgenden Text: "${userMessage}"`;
      break;
    case "chat":
      prompt = userMessage;
      break;
  }

  if (responseType === "chat") {
    conversationHistory.push({ role: "user", content: userMessage });
  } else {
    conversationHistory = [{ role: "user", content: prompt }];
  }

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: conversationHistory, 
        temperature: 1,
        max_tokens: 1000,
        top_p: 1,
        frequency_penalty: 0.5,
        presence_penalty: 0.3,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    const chatbotResponse = response.data.choices[0].message.content;
    botMessagePlaceholder.remove();

    if (responseType === "chat") {
      conversationHistory.push({ role: "assistant", content: chatbotResponse });
    }

    addBotMessage(chatbotResponse); 
  } catch (error) {
    console.error("Fehler bei der Kommunikation mit der OpenAI API:", error);
    botMessagePlaceholder.remove();
    botMessagePlaceholder.classList.remove("blinking");
    addBotMessage("Oops! Etwas ist schiefgelaufen. Bitte versuche es später erneut.");
  }
});
