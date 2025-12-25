/***********************
 * CONFIG
 ***********************/
const API_KEY = "AIzaSyAaif6GKOUgYC-TQDHJ2r2PZTI9MfoBRDM"; // ⛔ paste locally, never commit real keys
const API_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;

/***********************
 * VOICE INPUT
 ***********************/
function startVoice() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return alert("Speech Recognition not supported.");
  const recognition = new SR();
  recognition.lang = "en-IN";
  recognition.start();
  recognition.onresult = (e) => {
    document.getElementById("userInput").value = e.results[0][0].transcript;
  };
}

/***********************
 * TEXT TO SPEECH
 ***********************/
function speak(text) {
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-IN";
  u.rate = 0.9;
  window.speechSynthesis.speak(u);
}

/***********************
 * SEND MESSAGE (AI)
 ***********************/
async function sendMessage() {
  updateProgress();

  const input = document.getElementById("userInput").value.trim();
  const mode = document.getElementById("mode").value;
  const out = document.getElementById("response");
  if (!input) return;

  let prompt = "";
  if (mode === "chat") {
    prompt = `You are an English teacher. Correct mistakes, improve vocabulary, explain simply.\nSentence:\n"${input}"`;
  } else if (mode === "translate") {
    prompt = `Translate Hindi to natural spoken English and suggest better usage:\n"${input}"`;
  } else if (mode === "gd") {
    prompt = `Act as a GD partner. Respond, ask one counter-question, then give feedback.\nTopic/Message:\n"${input}"`;
  } else if (mode === "ielts") {
    prompt = `You are an IELTS examiner. Ask one question. After my answer, correct grammar, improve vocabulary, give band score (0–9) and tips.\nAnswer:\n"${input}"`;
  }

  out.textContent = "⏳ Thinking...";
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
    out.textContent = reply;
    speak(reply);
  } catch (e) {
    out.textContent = "Error contacting AI.";
  }
}

/***********************
 * DAILY TASK
 ***********************/
async function dailyTask() {
  const out = document.getElementById("response");
  out.textContent = "⏳ Loading daily task...";
  const prompt = `Give today's English practice: 1 speaking sentence, 1 grammar fix, 1 vocabulary word with example.`;
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await res.json();
    const txt = data.candidates[0].content.parts[0].text;
    out.textContent = txt;
    speak(txt);
  } catch {
    out.textContent = "Error loading task.";
  }
}

/***********************
 * PRONUNCIATION SCORING
 ***********************/
function pronunciationTest() {
  const expected = "I want to improve my English speaking skills";
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return alert("Speech Recognition not supported.");

  const r = new SR();
  r.lang = "en-IN";
  r.start();
  r.onresult = (e) => {
    const spoken = e.results[0][0].transcript.toLowerCase();
    const ew = expected.toLowerCase().split(" ");
    const sw = spoken.split(" ");
    const match = ew.filter(w => sw.includes(w)).length;
    const score = Math.round((match / ew.length) * 100);

    const box = document.getElementById("pronunciationResult");
    box.innerHTML = `
      🎤 You said: <b>${spoken}</b><br>
      ✅ Expected: <b>${expected}</b><br>
      📊 Score: <b>${score}%</b>
    `;
    speak(`Your pronunciation score is ${score} percent`);
  };
}

/***********************
 * OFFLINE MODE
 ***********************/
const offlinePractice = [
  "I am learning English every day",
  "Practice makes a person perfect",
  "Confidence improves communication",
  "I want to speak English fluently"
];
function offlineMode() {
  const s = offlinePractice[Math.floor(Math.random() * offlinePractice.length)];
  const out = document.getElementById("response");
  out.innerHTML = `📴 Offline Practice:<br><b>${s}</b>`;
  speak(s);
}

/***********************
 * PROGRESS TRACKER
 ***********************/
function updateProgress() {
  let c = Number(localStorage.getItem("practice") || 0);
  c++;
  localStorage.setItem("practice", c);
  document.getElementById("progress").textContent = `📊 Total Practices: ${c}`;
}
updateProgress();
