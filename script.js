const container = document.querySelector(".container");
const chatsContainer = document.querySelector(".chats-container");
const promptForm = document.querySelector(".prompt-form");
const promptInput = promptForm.querySelector(".prompt-input");
const fileInput = promptForm.querySelector("#file-input");
const fileUploadWrapper = promptForm.querySelector(".file-upload-wrapper");

// API Setup
const API_KEY = "AIzaSyAcpO4848jO-_utqbvudfg-ilKskBvsH3A";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

const chatHistory = [];
let userData = { message: "", file: {} };

// Function to create message elements
const createMsgElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};

// Scrool to the bottom of the container
const scrollToBottom = () =>
  container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });

// Simulate typing effect for bot responses
const typingEffect = (text, textElement, botMsgDiv) => {
  textElement.textContent = "";
  const words = text.split("  ");
  let wordIndex = 0;

  // Set an interval to type each word
  const typingInterval = setInterval(() => {
    if (wordIndex < words.length) {
      textElement.textContent +=
        (wordIndex === 0 ? "" : "") + words[wordIndex++];
      botMsgDiv.classList.remove("loading");
      scrollToBottom();
    } else {
      clearInterval(typingInterval);
    }
  }, 40);
};

// Make the API call and generate the bot's response
const generateResponse = async (botMsgDiv) => {
  const textElement = botMsgDiv.querySelector(".message-text");
  // Add user message to the chat history
  chatHistory.push({
    role: "user",
    parts: [{ text: userMessage }],
  });

  try {
    // Send the chat history to the API to get a response
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: chatHistory }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);

    // console.log(data);
    // Process the response text and display it
    const responseText = data.candidates[0].content.parts[0].text
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .trim();
    typingEffect(responseText, textElement, botMsgDiv);
  } catch (error) {
    console.log(error);
  }
};

// Handle the form submission
const handleFormSubmit = (e) => {
  e.preventDefault();
  const userMessage = promptInput.value.trim();
  if (!userMessage) return;

  promptInput.value = "";
  userData.message = userMessage;

  // Generate user message HTML and add in the chats container
  const userMsgHTML = `<p class="message-text"></p>`;
  const userMsgDiv = createMsgElement(userMsgHTML, "user-message");

  userMsgDiv.querySelector(".message-text").textContent = userMessage;
  chatsContainer.appendChild(userMsgDiv);
  scrollToBottom();

  setTimeout(() => {
    // Generate user message HTML and in the chats container 600ms
    const botMsgHTML = `<img src="gemini-chatbot-logo.svg" class="avatar"/><p class="message-text">Just a sec...</p>`;
    const botMsgDiv = createMsgElement(botMsgHTML, "bot-message", "loading");
    chatsContainer.appendChild(botMsgDiv);
    scrollToBottom();
    generateResponse(botMsgDiv);
  }, 600);
};

// Handle file input change (file upload)
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;

  // console.log(file);

  const isImage = file.type.startsWith("image/");
  const reader = new FileReader();
  reader.readAsDataURL(file);

  reader.onload = (e) => {
    fileInput.value = "";
    const base62String = e.target.result.trim(",")[1];
    fileUploadWrapper.querySelector(".file-preview").src = e.target.result;
    fileUploadWrapper.classList.add(
      "active",
      isImage ? "img-attached" : "file-attached"
    );

    // Store file data in userData obj
    userData.file = {
      fileName: file.name,
      data: base62String,
      mime_type: file.type,
      isImage,
    };
  };
});

// Cancel file upload
document.querySelector("#cancel-file-btn").addEventListener("click", () => {
  fileUploadWrapper.classList.remove("active", "img-attached", "file-attached");
});

promptForm.addEventListener("submit", handleFormSubmit);
promptForm
  .querySelector("#add-file-btn")
  .addEventListener("click", () => fileInput.click());
