class AdvancedChatBot {
    constructor() {
        this.userId = localStorage.getItem('userId') || this.generateUserId();
        this.botName = localStorage.getItem('botName') || 'Alex';
        this.conversationStyle = localStorage.getItem('conversationStyle') || 'friendly';
        this.isTyping = false;
        
        this.initializeElements();
        this.bindEvents();
        this.loadUserSettings();
        this.loadConversationHistory();
    }
    
    generateUserId() {
        const userId = 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
        localStorage.setItem('userId', userId);
        return userId;
    }
    
    initializeElements() {
        // Core elements
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.chatContainer = document.getElementById('chatContainer');
        this.typingIndicator = document.getElementById('typingIndicator');
        
        // Control elements
        this.botNameInput = document.getElementById('botNameInput');
        this.styleSelect = document.getElementById('styleSelect');
        this.settingsButton = document.getElementById('settingsButton');
        this.clearChatButton = document.getElementById('clearChatButton');
        this.statsButton = document.getElementById('statsButton');
        
        // Modal elements
        this.settingsModal = document.getElementById('settingsModal');
        this.statsModal = document.getElementById('statsModal');
        this.closeModalButtons = document.querySelectorAll('.close-modal');
        
        // Form elements
        this.settingsForm = document.getElementById('settingsForm');
        this.personalityTraitsContainer = document.getElementById('personalityTraits');
        
        // Stats elements
        this.statsContent = document.getElementById('statsContent');
    }
    
    bindEvents() {
        // Message sending
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Auto-resize textarea
        this.messageInput.addEventListener('input', () => this.autoResizeTextarea());
        
        // Controls
        this.botNameInput.addEventListener('change', (e) => this.updateBotName(e.target.value));
        this.styleSelect.addEventListener('change', (e) => this.updateConversationStyle(e.target.value));
        this.settingsButton.addEventListener('click', () => this.showSettingsModal());
        this.clearChatButton.addEventListener('click', () => this.clearChat());
        this.statsButton.addEventListener('click', () => this.showStatsModal());
        
        // Modals
        this.closeModalButtons.forEach(btn => {
            btn.addEventListener('click', () => this.closeModals());
        });
        
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) this.closeModals();
        });
        
        this.statsModal.addEventListener('click', (e) => {
            if (e.target === this.statsModal) this.closeModals();
        });
        
        // Settings form
        this.settingsForm.addEventListener('submit', (e) => this.saveSettings(e));
        
        // Update personality traits when style changes
        document.getElementById('conversationStyle').addEventListener('change', (e) => {
            this.updatePersonalityTraits(e.target.value);
        });
    }
    
    autoResizeTextarea() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
    }
    
    async loadUserSettings() {
        try {
            const response = await fetch(`/api/chat/settings/${this.userId}`);
            const settings = await response.json();
            
            if (response.ok) {
                this.applySettings(settings);
            }
        } catch (error) {
            console.error('Failed to load user settings:', error);
        }
    }
    
    applySettings(settings) {
        this.botName = settings.botName;
        this.conversationStyle = settings.conversationStyle;
        
        // Update UI
        this.botNameInput.value = this.botName;
        this.styleSelect.value = this.conversationStyle;
        
        // Update localStorage
        localStorage.setItem('botName', this.botName);
        localStorage.setItem('conversationStyle', this.conversationStyle);
    }
    
    async updateBotName(newName) {
        if (!newName.trim()) return;
        
        this.botName = newName.trim();
        localStorage.setItem('botName', this.botName);
        
        try {
            await fetch(`/api/chat/settings/${this.userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ botName: this.botName })
            });
        } catch (error) {
            console.error('Failed to update bot name:', error);
        }
    }
    
    async updateConversationStyle(style) {
        this.conversationStyle = style;
        localStorage.setItem('conversationStyle', this.conversationStyle);
        
        try {
            await fetch(`/api/chat/settings/${this.userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conversationStyle: this.conversationStyle })
            });
        } catch (error) {
            console.error('Failed to update conversation style:', error);
        }
    }
    
    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || this.isTyping) return;
        
        // Add user message to chat
        this.addMessage(message, 'user');
        this.messageInput.value = '';
        this.autoResizeTextarea();
        this.sendButton.disabled = true;
        
        // Show typing indicator
        this.showTypingIndicator();
        this.isTyping = true;
        
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: message,
                    userId: this.userId
                })
            });
            
            const data = await response.json();
            
            this.hideTypingIndicator();
            this.isTyping = false;
            this.sendButton.disabled = false;
            
            if (response.ok) {
                this.addMessage(data.response, 'bot');
                
                // Update bot name if changed from server
                if (data.botName && data.botName !== this.botName) {
                    this.botName = data.botName;
                    this.botNameInput.value = this.botName;
                    localStorage.setItem('botName', this.botName);
                }
            } else {
                this.addMessage(data.error || 'Sorry, I encountered an error. Please try again! 😊', 'bot');
            }
            
        } catch (error) {
            this.hideTypingIndicator();
            this.isTyping = false;
            this.sendButton.disabled = false;
            this.addMessage('Oops! Looks like there was a connection issue. Please check your internet and try again! 🌐', 'bot');
        }
    }
    
    addMessage(content, sender) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}`;
        
        const avatar = document.createElement('div');
        avatar.className = 'avatar';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        
        if (sender === 'user') {
            avatar.textContent = 'You';
            avatar.title = 'You';
        } else {
            avatar.textContent = this.botName.charAt(0).toUpperCase();
            avatar.title = this.botName;
            
            const senderName = document.createElement('div');
            senderName.className = 'message-sender';
            senderName.textContent = this.botName;
            messageContent.appendChild(senderName);
        }
        
        bubble.innerHTML = this.formatMessage(content);
        
        const timestamp = document.createElement('div');
        timestamp.className = 'timestamp';
        timestamp.textContent = new Date().toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        bubble.appendChild(timestamp);
        messageContent.appendChild(bubble);
        messageElement.appendChild(avatar);
        messageElement.appendChild(messageContent);
        
        // Remove welcome message if it's the first user message
        const welcomeMessage = this.chatContainer.querySelector('.welcome-message');
        if (welcomeMessage && sender === 'user') {
            welcomeMessage.remove();
        }
        
        this.chatContainer.appendChild(messageElement);
        this.scrollToBottom();
    }
    
    formatMessage(content) {
        // Simple formatting for URLs and basic markdown
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>')
            .replace(/\n/g, '<br>');
    }
    
    showTypingIndicator() {
        this.typingIndicator.style.display = 'flex';
        this.scrollToBottom();
    }
    
    hideTypingIndicator() {
        this.typingIndicator.style.display = 'none';
    }
    
    scrollToBottom() {
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }
    
    async loadConversationHistory() {
        try {
            const response = await fetch(`/api/chat/conversation/${this.userId}`);
            const data = await response.json();
            
            if (data.messages && data.messages.length > 0) {
                // Clear welcome message
                const welcomeMessage = this.chatContainer.querySelector('.welcome-message');
                if (welcomeMessage) welcomeMessage.remove();
                
                // Add all messages
                data.messages.forEach(msg => {
                    this.addMessage(msg.content, msg.sender);
                });
            }
        } catch (error) {
            console.error('Failed to load conversation history:', error);
        }
    }
    
    async clearChat() {
        if (confirm('Are you sure you want to clear the chat history? This action cannot be undone.')) {
            try {
                await fetch(`/api/chat/conversation/${this.userId}`, {
                    method: 'DELETE'
                });
                
                // Clear UI
                this.chatContainer.innerHTML = '<div class="welcome-message">Chat cleared! What would you like to talk about? 😊</div>';
                
            } catch (error) {
                console.error('Failed to clear chat:', error);
                alert('Failed to clear chat. Please try again.');
            }
        }
    }
    
    showSettingsModal() {
        this.populateSettingsForm();
        this.settingsModal.style.display = 'flex';
    }
    
    showStatsModal() {
        this.loadStatistics();
        this.statsModal.style.display = 'flex';
    }
    
    closeModals() {
        this.settingsModal.style.display = 'none';
        this.statsModal.style.display = 'none';
    }
    
    populateSettingsForm() {
        const form = this.settingsForm;
        
        form.botName.value = this.botName;
        form.conversationStyle.value = this.conversationStyle;
        form.userName.value = localStorage.getItem('userName') || '';
        form.userInterests.value = localStorage.getItem('userInterests') || '';
        
        this.updatePersonalityTraits(this.conversationStyle);
    }
    
    updatePersonalityTraits(style) {
        const traitMap = {
            'friendly': ['empathetic', 'curious', 'encouraging'],
            'professional': ['wise', 'curious'],
            'funny': ['humorous', 'playful'],
            'supportive': ['empathetic', 'encouraging', 'wise'],
            'enthusiastic': ['playful', 'curious', 'encouraging']
        };
        
        const traits = traitMap[style] || ['empathetic', 'curious'];
        this.personalityTraitsContainer.innerHTML = traits
            .map(trait => `<span class="trait-tag">${trait}</span>`)
            .join('');
    }
    
    async saveSettings(event) {
        event.preventDefault();
        const formData = new FormData(this.settingsForm);
        
        const settings = {
            botName: formData.get('botName'),
            conversationStyle: formData.get('conversationStyle'),
            userInfo: {
                name: formData.get('userName'),
                interests: formData.get('userInterests').split(',').map(i => i.trim()).filter(i => i)
            },
            preferences: {
                useEmojis: formData.get('useEmojis') === 'on',
                askQuestions: formData.get('askQuestions') === 'on',
                shareFacts: formData.get('shareFacts') === 'on',
                memoryEnabled: formData.get('memoryEnabled') === 'on'
            }
        };
        
        try {
            const response = await fetch(`/api/chat/settings/${this.userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            
            if (response.ok) {
                this.applySettings(settings);
                this.closeModals();
                alert('Settings saved successfully! 🎉');
            } else {
                alert('Failed to save settings. Please try again.');
            }
        } catch (error) {
            console.error('Failed to save settings:', error);
            alert('Failed to save settings. Please check your connection.');
        }
    }
    
    async loadStatistics() {
        try {
            const response = await fetch(`/api/chat/stats/${this.userId}`);
            const stats = await response.json();
            
            if (response.ok) {
                this.displayStatistics(stats);
            }
        } catch (error) {
            console.error('Failed to load statistics:', error);
            this.statsContent.innerHTML = '<p>Failed to load statistics.</p>';
        }
    }
    
    displayStatistics(stats) {
        this.statsContent.innerHTML = `
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-value">${stats.totalMessages}</span>
                    <span class="stat-label">Total Messages</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${stats.userMessages}</span>
                    <span class="stat-label">Your Messages</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${stats.botMessages}</span>
                    <span class="stat-label">${this.botName}'s Messages</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${stats.firstMessage ? new Date(stats.firstMessage).toLocaleDateString() : 'N/A'}</span>
                    <span class="stat-label">First Message</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${stats.lastMessage ? new Date(stats.lastMessage).toLocaleDateString() : 'N/A'}</span>
                    <span class="stat-label">Last Message</span>
                </div>
            </div>
        `;
    }
}

// Initialize chatbot when page loads
document.addEventListener('DOMContentLoaded', () => {
    new AdvancedChatBot();
});