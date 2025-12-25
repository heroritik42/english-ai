/***********************
 * CONFIG
 ***********************/
const API_KEY = "AIzaSyACrNRVb0q-veZxOXN6ye5cQKWKJA3v2-U";

const API_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

/***********************
 * VOICE INPUT
 ***********************/
function startVoice() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    alert("Speech Recognition not supported in this browser");
    return;
  }
  const recognition = new SR();
  recognition.lang = "en-IN";
  recognition.start();

  recognition.onresult = (e) => {
    document.getElementById("userInput").value =
      e.results[0][0].transcript;
  };
}

/***********************
 * TEXT TO SPEECH
 ***********************/
function speak(text) {
  if (!text) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-IN";
  utter.rate = 0.9;
  window.speechSynthesis.speak(utter);
}

/***********************
 * SEND MESSAGE (AI)
 ***********************/
async function sendMessage() {
  updateProgress();

  const input = document.getElementById("userInput").value.trim();
  const mode = document.getElementById("mode").value;
  const out = document.getElementById("response");

  if (!input) {
    out.innerText = "Please type or speak something.";
    return;
  }

  let prompt = "";

  if (mode === "chat") {
    prompt = `You are an English teacher.
Correct mistakes, improve vocabulary and explain simply.

Sentence:
"${input}"`;
  } 
  else if (mode === "translate") {
    prompt = `Translate the following Hindi sentence into natural spoken English and suggest a better version if possible:

"${input}"`;
  } 
  else if (mode === "gd") {
    prompt = `Act as a group discussion partner.
Respond to me, ask one counter question and give feedback.

Topic / Message:
"${input}"`;
  } 
  else if (mode === "ielts") {
    prompt = `You are an IELTS speaking examiner.
Evaluate my answer, correct grammar, improve vocabulary,
give band score (0–9) and tips.

Answer:
"${input}"`;
  }

  out.innerText = "⏳ Thinking...";

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          { parts: [{ text: prompt }] }
        ]
      })
    });

    const data = await res.json();
    console.log("Gemini API Response:", data);

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text
      || "No response from AI";

    out.innerText = reply;
    speak(reply);

  } catch (err) {
    console.error("API Error:", err);
    out.innerText = "❌ API Error. Check console.";
  }
}

/***********************
 * DAILY TASK
 ***********************/
async function dailyTask() {
  const out = document.getElementById("response");
  out.innerText = "⏳ Loading today's task...";

  const prompt = `Give today's English practice:
1 speaking sentence
1 grammar correction
1 new vocabulary word with example`;

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await res.json();

    const task =
      data?.candidates?.[0]?.content?.parts?.[0]?.text
      || "No task generated";

    out.innerText = task;
    speak(task);

  } catch {
    out.innerText = "❌ Unable to load daily task";
  }
}

/***********************
 * PRONUNCIATION SCORING
 ***********************/
function pronunciationTest() {
  const expected = "I want to improve my English speaking skills";

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    alert("Speech Recognition not supported");
    return;
  }

  const recognition = new SR();
  recognition.lang = "en-IN";
  recognition.start();

  recognition.onresult = (e) => {
    const spoken = e.results[0][0].transcript.toLowerCase();
    const expectedWords = expected.toLowerCase().split(" ");
    const spokenWords = spoken.split(" ");

    const matched = expectedWords.filter(w =>
      spokenWords.includes(w)
    ).length;

    const score = Math.round(
      (matched / expectedWords.length) * 100
    );

    const box = document.getElementById("pronunciationResult");
    box.innerHTML = `
      🎤 You said: <b>${spoken}</b><br>
      ✅ Expected: <b>${expected}</b><br>
      📊 Pronunciation Score: <b>${score}%</b>
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
  const sentence =
    offlinePractice[Math.floor(Math.random() * offlinePractice.length)];

  const out = document.getElementById("response");
  out.innerHTML = `📴 Offline Practice:<br><b>${sentence}</b>`;
  speak(sentence);
}

/***********************
 * PROGRESS TRACKER
 ***********************/
function updateProgress() {
  let count = Number(localStorage.getItem("practice") || 0);
  count++;
  localStorage.setItem("practice", count);

  document.getElementById("progress").innerText =
    `📊 Total Practices: ${count}`;
}

updateProgress();
