class GeminiChat {
  constructor() {
    this.messagesContainer = document.getElementById('chatMessages');
    this.messageInput = document.getElementById('messageInput');
    this.sendButton = document.getElementById('sendButton');
    this.charCount = document.querySelector('.char-count');

    this.isTyping = false;
    this.messageHistory = [];

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.adjustTextareaHeight();
    this.scrollToBottom();
  }

  setupEventListeners() {
    // 發送按鈕點擊
    this.sendButton.addEventListener('click', () => this.sendMessage());

    // Enter 鍵發送 (Shift+Enter 換行)
    this.messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // 輸入框變化
    this.messageInput.addEventListener('input', () => {
      this.updateSendButton();
      this.updateCharCount();
      this.adjustTextareaHeight();
    });

    // 輸入框聚焦
    this.messageInput.addEventListener('focus', () => {
      this.updateSendButton();
    });

    // 輸入框失焦
    this.messageInput.addEventListener('blur', () => {
      this.updateSendButton();
    });
  }

  sendMessage() {
    const message = this.messageInput.value.trim();
    if (!message || this.isTyping) return;

    this.addMessage(message, 'user');
    this.messageInput.value = '';
    this.updateCharCount();
    this.adjustTextareaHeight();
    this.updateSendButton();

    // 模擬 AI 回應
    this.simulateAIResponse(message);
  }

  addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;

    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';

    if (sender === 'ai') {
      avatarDiv.innerHTML = `
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      `;
    } else {
      avatarDiv.innerHTML = `
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      `;
    }

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    const textDiv = document.createElement('div');
    textDiv.className = 'message-text';
    textDiv.textContent = text;

    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    timeDiv.textContent = this.getCurrentTime();

    contentDiv.appendChild(textDiv);
    contentDiv.appendChild(timeDiv);

    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);

    this.messagesContainer.appendChild(messageDiv);
    this.scrollToBottom();

    this.messageHistory.push({ text, sender, timestamp: new Date() });
  }

  showTypingIndicator() {
    if (this.isTyping) return;

    this.isTyping = true;
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai-message typing-indicator';
    typingDiv.id = 'typingIndicator';

    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    avatarDiv.innerHTML = `
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
    `;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    const textDiv = document.createElement('div');
    textDiv.className = 'message-text';
    textDiv.innerHTML = `
      Gemini 正在思考
      <div class="typing-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    `;

    contentDiv.appendChild(textDiv);
    typingDiv.appendChild(avatarDiv);
    typingDiv.appendChild(contentDiv);

    this.messagesContainer.appendChild(typingDiv);
    this.scrollToBottom();
  }

  hideTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
    this.isTyping = false;
  }

  simulateAIResponse(userMessage) {
    this.showTypingIndicator();

    // 模擬不同的回應時間
    const responseTime = Math.random() * 2000 + 1000;

    setTimeout(() => {
      this.hideTypingIndicator();
      const response = this.generateAIResponse(userMessage);
      this.addMessage(response, 'ai');
    }, responseTime);
  }

  generateAIResponse(userMessage) {
    const responses = [
      "我理解你的問題。讓我為你詳細說明...",
      "這是一個很有趣的問題！根據我的了解...",
      "謝謝你的提問。我可以提供以下資訊...",
      "我很高興能夠幫助你。讓我們來探討這個主題...",
      "你的問題很有深度。讓我從幾個角度來分析...",
      "這是一個常見的問題。以下是我的看法...",
      "我注意到你對這個主題很感興趣。讓我分享一些相關知識...",
      "很好問題！我可以給你一些實用的建議...",
      "讓我為你整理一下相關資訊...",
      "這確實是一個值得討論的話題。以下是我的觀點..."
    ];

    const followUps = [
      "\n\n如果你有其他問題，歡迎隨時詢問！",
      "\n\n希望這個回答對你有幫助。如果需要更詳細的說明，請告訴我。",
      "\n\n如果你想深入了解這個主題，我可以提供更多資訊。",
      "\n\n這只是簡要的說明，如果你需要更具體的細節，請讓我知道。",
      "\n\n很高興能夠為你解答！還有什麼我可以幫助你的嗎？"
    ];

    const baseResponse = responses[Math.floor(Math.random() * responses.length)];
    const followUp = followUps[Math.floor(Math.random() * followUps.length)];

    // 根據用戶訊息生成相關回應
    let contextualResponse = baseResponse;

    if (userMessage.includes('你好') || userMessage.includes('嗨')) {
      contextualResponse = "你好！很高興見到你。我是 Gemini AI，很樂意為你提供幫助。你今天想聊些什麼呢？";
    } else if (userMessage.includes('天氣')) {
      contextualResponse = "關於天氣問題，我建議你查看當地的天氣預報應用程式或網站，因為我無法即時獲取最新的天氣資料。不過我可以告訴你一些關於氣候的一般知識！";
    } else if (userMessage.includes('時間') || userMessage.includes('幾點')) {
      contextualResponse = `現在是 ${new Date().toLocaleString('zh-TW')}。如果你需要設定提醒或鬧鐘，我可以幫你規劃時間管理。`;
    } else if (userMessage.includes('謝謝') || userMessage.includes('感謝')) {
      contextualResponse = "不客氣！很高興能夠幫助你。如果還有其他問題，隨時都可以問我。😊";
    }

    return contextualResponse + followUp;
  }

  updateSendButton() {
    const hasText = this.messageInput.value.trim().length > 0;
    this.sendButton.disabled = !hasText || this.isTyping;

    if (hasText && !this.isTyping) {
      this.sendButton.style.opacity = '1';
    } else {
      this.sendButton.style.opacity = '0.5';
    }
  }

  updateCharCount() {
    const count = this.messageInput.value.length;
    this.charCount.textContent = `${count} / 2000`;
  }

  adjustTextareaHeight() {
    this.messageInput.style.height = 'auto';
    this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
  }

  scrollToBottom() {
    setTimeout(() => {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }, 100);
  }

  getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

// 初始化聊天應用
document.addEventListener('DOMContentLoaded', () => {
  new GeminiChat();
});