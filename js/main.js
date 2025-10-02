// DOM 加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 配置 marked
    if (typeof marked !== 'undefined') {
        marked.setOptions({
            breaks: true,        // 转换 \n 为 <br>
            gfm: true,           // 启用 GitHub 风格的 Markdown
            smartLists: true,    // 使用智能列表
            smartypants: true,   // 使用智能标点
            pedantic: false,     // 不严谨模式
            sanitize: false,     // 不清理 HTML 标签
            silent: false        // 不静默错误
        });
    }
    // 获取页面元素
    const chatContainer = document.querySelector('.chat-container');
    const inputArea = document.querySelector('.input-area');
    const sendButton = document.querySelector('.send-btn');
    const newChatBtn = document.querySelector('.new-chat-btn');
    const sidebarHeader = document.querySelector('.sidebar-header');
    const chatHistory = document.querySelector('.chat-history');
    
    // 聊天状态变量
    let isWaitingForResponse = false;
    
    // 添加欢迎消息
    showWelcomeMessage();
    
    // 发送按钮点击事件
    sendButton.addEventListener('click', sendMessage);
    
    // 回车发送消息（Shift+Enter 换行）
    inputArea.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // 新建聊天按钮事件
    newChatBtn.addEventListener('click', newChat);
    
    // 侧边栏标题点击事件（模拟展开/收起侧边栏）
    sidebarHeader.addEventListener('click', toggleSidebar);
    
    // 自动调整输入框高度
    inputArea.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
    
    // 替换原有的 sendMessage 函数
function sendMessage() {
    const message = inputArea.value.trim();
    if (message && !isWaitingForResponse) {
        // 添加用户消息
        addMessage(message, 'user');
        
        // 清空输入框
        inputArea.value = '';
        inputArea.style.height = 'auto';
        
        // 禁用发送按钮和输入框
        sendButton.disabled = true;
        inputArea.disabled = true;
        isWaitingForResponse = true;
        
        // 调用后端流式API
        callStreamAPI(message);
    }
}

// 新增：调用后端流式API函数
// 替换现有的 callStreamAPI 函数
function callStreamAPI(prompt) {
    // 显示AI正在输入的指示器
    showAITypingIndicator();
    
    // 使用 fetch API 调用后端流式接口
    fetch('http://127.0.0.1:8081/chataidesign/api/ai/stream', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream'
        },
        body: JSON.stringify({prompt: prompt}),
        credentials: 'include'
    })
    .then(response => {
        // 移除正在输入的指示器
        removeAITypingIndicator();
        
        // 检查响应是否成功
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // 获取响应体的可读流
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        
        // 创建AI消息容器
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message ai';
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'avatar';
        avatarDiv.textContent = 'AI';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = ''; // 初始为空
        
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        chatContainer.appendChild(messageDiv);
        
        // 滚动到底部
        scrollToBottom();
        
        // 存储累积的数据用于处理多行
        let accumulatedData = '';
        
        // 递归读取流数据
        function readStream() {
            reader.read().then(({ done, value }) => {
                if (done) {
                    // 流结束，重新启用输入
                    sendButton.disabled = false;
                    inputArea.disabled = false;
                    isWaitingForResponse = false;
                    inputArea.focus();
                    return;
                }
                
                // 解码数据
                const chunk = decoder.decode(value, { stream: true });
                accumulatedData += chunk;
                
                // 按行处理数据
                const lines = accumulatedData.split('\n');
                accumulatedData = lines.pop(); // 保留不完整的最后一行
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.substring(6); // 移除 'data: ' 前缀
                        if (data === '[DONE]') {
                            // 流结束
                            sendButton.disabled = false;
                            inputArea.disabled = false;
                            isWaitingForResponse = false;
                            inputArea.focus();
                            return;
                        } else {
                            // 处理内容数据
                            const content = data.replace(/\\n/g, '\n').replace(/\\r/g, '\r');
                            // 处理自定义占位符
                            const processedContent = content.replace(/<\|newline\|>/g, '\n');
                            contentDiv.textContent += processedContent;
                            contentDiv.innerHTML = formatMessageContent(contentDiv.textContent);
                            scrollToBottom();
                        }
                    }
                }
                
                // 继续读取
                readStream();
            }).catch(error => {
                console.error('Stream reading error:', error);
                contentDiv.innerHTML += '<br><span style="color: red;">连接出错，请重试</span>';
                sendButton.disabled = false;
                inputArea.disabled = false;
                isWaitingForResponse = false;
                inputArea.focus();
            });
        }
        
        // 开始读取流
        readStream();
    })
    .catch(error => {
        console.error('API call error:', error);
        removeAITypingIndicator();
        // 显示错误消息
        addMessage('抱歉，请求失败：' + error.message, 'ai');
        sendButton.disabled = false;
        inputArea.disabled = false;
        isWaitingForResponse = false;
        inputArea.focus();
    });
}

// 新增：处理流数据块
function processStreamChunk(chunk, contentDiv) {
    // 将接收到的数据添加到内容中
    contentDiv.textContent += chunk;
    
    // 格式化内容（处理换行等）
    contentDiv.innerHTML = formatMessageContent(contentDiv.textContent);
    
    // 滚动到底部以显示最新内容
    scrollToBottom();
}
    
    // 添加消息到聊天容器
    function addMessage(content, sender) {
        // 移除欢迎消息（如果存在）
        const welcomeMessage = document.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.dataset.sender = sender;
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'avatar';
        avatarDiv.textContent = sender === 'user' ? 'U' : 'AI';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = formatMessageContent(content);
        
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        
        chatContainer.appendChild(messageDiv);
        
        // 滚动到底部
        scrollToBottom();
    }
    
    // 显示AI正在输入的指示器
    function showAITypingIndicator() {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message ai typing-indicator';
        messageDiv.id = 'typing-indicator';
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'avatar';
        avatarDiv.textContent = 'AI';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = '<div class="loading"></div> AI 正在思考...';
        
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        
        chatContainer.appendChild(messageDiv);
        
        // 滚动到底部
        scrollToBottom();
    }
    
    // 移除AI正在输入的指示器
    function removeAITypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    // 格式化消息内容（简单的格式化处理）
    // 格式化消息内容（简单的格式化处理）
    function formatMessageContent(content) {
        try {
            if (typeof content !== 'string') {
                content = String(content);
            }
            
            return content
        } catch (error) {
            console.error('Content parsing error:', error);
            // 回退方案：直接替换占位符为换行符
            return content.replace(/<\|newline\|>/g, '\n');
        }
    }

        
    // 显示欢迎消息
    function showWelcomeMessage() {
        // 如果已经存在欢迎消息，不重复添加
        if (document.querySelector('.welcome-message')) {
            return;
        }
        
        const welcomeDiv = document.createElement('div');
        welcomeDiv.className = 'welcome-message';
        
        welcomeDiv.innerHTML = `
            <h1>Chat AI</h1>
            <p>这是ChatXZC AI小助手。在下方输入框中输入您的问题，AI 将会回复您。</p>
            <div style="margin-top: 30px; font-size: 14px; color: #aaa;">
                <p><strong>使用说明：</strong></p>
                <p>• 在下方输入框输入问题，按回车或点击发送按钮</p>
                <p>• 点击左侧"新建聊天"开始新的对话</p>
                <p>• 点击左上角可以折叠/展开侧边栏</p>
            </div>
        `;
        
        chatContainer.appendChild(welcomeDiv);
    }
    
    // 模拟AI回复
    function generateAIResponse(userMessage) {
        // 更智能的回复模拟
        const lowerMessage = userMessage.toLowerCase();
        
        if (lowerMessage.includes('你好') || lowerMessage.includes('hello')) {
            return "你好！我是Chat AI助手，很高兴为你服务。有什么我可以帮助你的吗？";
        } else if (lowerMessage.includes('天气')) {
            return "我无法获取实时天气信息，建议你查看天气应用或网站获取准确的天气预报。";
        } else if (lowerMessage.includes('时间') || lowerMessage.includes('几点')) {
            return `现在是 ${new Date().toLocaleString('zh-CN')}`;
        } else if (lowerMessage.includes('谢谢') || lowerMessage.includes('感谢')) {
            return "不客气！如果你还有其他问题，随时可以问我。";
        } else if (lowerMessage.includes('你是谁') || lowerMessage.includes('介绍')) {
            return "我是Chat AI助手，一个基于人工智能技术的对话系统。我可以回答问题、提供信息和协助完成各种任务。";
        } else {
            const responses = [
                `我理解你的问题是关于"${userMessage}"。在实际应用中，我会根据这个问题提供详细的回答。`,
                `这是一个很好的问题！关于"${userMessage}"，我可以告诉你...（在真实应用中这里会有具体内容）`,
                `感谢你提出"${userMessage}"。在实际的AI系统中，我会基于大量数据为你提供准确和有用的回答。`,
                `关于"${userMessage}"，我可以提供以下见解：（在真实应用中这里会有详细内容）`,
                `你问了一个很有意思的问题。对于"${userMessage}"，我的看法是...（在真实场景中这里会有AI生成的内容）`
            ];
            return responses[Math.floor(Math.random() * responses.length)];
        }
    }
    
    // 滚动到底部
    function scrollToBottom() {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    
    // 新建聊天
    function newChat() {
        // 清空聊天记录
        chatContainer.innerHTML = '';
        
        // 显示欢迎消息
        showWelcomeMessage();
        
        // 清空输入框
        inputArea.value = '';
        inputArea.style.height = 'auto';
        
        // 重新启用输入
        sendButton.disabled = false;
        inputArea.disabled = false;
        isWaitingForResponse = false;
        
        // 聚焦到输入框
        inputArea.focus();
    }
    
    // 切换侧边栏（移动端）
    function toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        if (window.innerWidth <= 768) {
            sidebar.style.width = sidebar.style.width === '260px' ? '0' : '260px';
            sidebar.style.padding = sidebar.style.width === '260px' ? '10px' : '0';
        }
    }
    
    // 窗口大小改变时的处理
    window.addEventListener('resize', function() {
        const sidebar = document.querySelector('.sidebar');
        if (window.innerWidth > 768) {
            sidebar.style.width = '260px';
            sidebar.style.padding = '10px';
        } else {
            sidebar.style.width = '0';
            sidebar.style.padding = '0';
        }
    });
    
    // 初始化时聚焦到输入框
    inputArea.focus();
});