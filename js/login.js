// login.js - 登录页面的交互逻辑

/**
 * 页面加载完成后初始化事件监听器
 */
document.addEventListener('DOMContentLoaded', function() {
    // 获取登录表单元素
    const loginForm = document.getElementById('loginForm');
    // 添加表单提交事件监听器
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // 添加密码输入框回车事件监听
    const passwordInput = document.querySelector('input[name="password"]');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                loginForm.dispatchEvent(new Event('submit'));
            }
        });
    }
    
    // 获取注册表单元素
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // 切换表单事件
    const showRegisterLink = document.getElementById('showRegister');
    const showLoginLink = document.getElementById('showLogin');
    const loginCard = document.querySelector('.login-card');
    const registerCard = document.getElementById('registerCard');
    
    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', function(e) {
            e.preventDefault();
            loginCard.style.display = 'none';
            registerCard.style.display = 'block';
        });
    }
    
    if (showLoginLink) {
        showLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            registerCard.style.display = 'none';
            loginCard.style.display = 'block';
        });
    }
});

/**
 * 处理登录表单提交事件
 * @param {Event} e - 表单提交事件对象
 */
function handleLogin(e) {
    console.log('handleLogin');
    // 阻止表单默认提交行为
    e.preventDefault();
    
    // 获取用户名和密码输入框
    const usernameInput = document.querySelector('input[name="username"]');
    const passwordInput = document.querySelector('input[name="password"]');
    
    // 获取输入值并去除首尾空格
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    
    // 基本输入验证
    if (!username) {
        showMessage('请输入用户名', 'error');
        usernameInput.focus();
        return;
    }
    
    if (!password) {
        showMessage('请输入密码', 'error');
        passwordInput.focus();
        return;
    }
    
    // 执行登录操作
    performLogin(username, password);
}

/**
 * 处理注册表单提交事件
 * @param {Event} e - 表单提交事件对象
 */
function handleRegister(e) {
    console.log('handleRegister');
    // 阻止表单默认提交行为
    e.preventDefault();
    
    // 获取注册表单输入框
    const regUsernameInput = document.querySelector('input[name="regUsername"]');
    const emailInput = document.querySelector('input[name="email"]');
    const regPasswordInput = document.querySelector('input[name="regPassword"]');
    const confirmPasswordInput = document.querySelector('input[name="confirmPassword"]');
    
    // 获取输入值
    const regUsername = regUsernameInput.value.trim();
    const email = emailInput.value.trim();
    const regPassword = regPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    // 基本输入验证
    if (!regUsername) {
        showMessage('请输入用户名', 'error');
        regUsernameInput.focus();
        return;
    }
    
    if (!email) {
        showMessage('请输入邮箱', 'error');
        emailInput.focus();
        return;
    }
    
    // 简单邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage('请输入有效的邮箱地址', 'error');
        emailInput.focus();
        return;
    }
    
    if (!regPassword) {
        showMessage('请输入密码', 'error');
        regPasswordInput.focus();
        return;
    }
    
    if (regPassword.length < 6) {
        showMessage('密码长度至少6位', 'error');
        regPasswordInput.focus();
        return;
    }
    
    if (regPassword !== confirmPassword) {
        showMessage('两次输入的密码不一致', 'error');
        confirmPasswordInput.focus();
        return;
    }
    
    // 执行注册操作
    performRegister(regUsername, email, regPassword);
}
/**
 * 执行登录操作，调用后端接口
 * @param {string} username - 用户名
 * @param {string} password - 密码
 */
function performLogin(username, password) {
    // 获取登录按钮并设置加载状态
    const loginBtn = document.querySelector('.login-btn');
    const originalText = loginBtn.textContent;
    loginBtn.textContent = '登录中...';
    loginBtn.disabled = true;
    
    // 构造请求数据
    const loginData = {
        username: username,
        password: password
    };
    
    // 调用后端登录接口
    fetch('http://127.0.0.1:8080/chataidesign/user/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData),
        credentials: 'include' 
    })
    .then(response => {
        // 检查响应状态
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // 显示后端返回的消息
        showMessage(data.message, data.code === 200 ? 'success' : 'error');
        
        if (data.code === 200) {
            // 登录成功，跳转到主页面
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            // 登录失败
            resetLoginButton(loginBtn, originalText);
        }
    })
    .catch(error => {
        // 网络错误或服务器错误处理
        console.error('Login error:', error);
        showMessage('登录失败，请稍后重试', 'error');
        resetLoginButton(loginBtn, originalText);
    });
}
/**
 * 执行注册操作，调用后端接口
 * @param {string} username - 用户名
 * @param {string} email - 邮箱
 * @param {string} password - 密码
 */
function performRegister(username, email, password) {
    // 获取注册按钮并设置加载状态
    const registerBtns = document.querySelectorAll('.login-btn');
    const registerBtn = Array.from(registerBtns).find(btn => btn.closest('#registerForm'));
    const originalText = registerBtn.textContent;
    registerBtn.textContent = '注册中...';
    registerBtn.disabled = true;

    // 构造请求数据 - 根据接口要求添加额外字段
    const registerData = {
        username: username,
        password: password, // 注意：实际应该加密处理
        email: email,
        nickname: username, // 使用用户名作为昵称
        status: 1, // 默认激活状态
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    // 调用后端注册接口
    fetch('http://127.0.0.1:8080/chataidesign/user/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(registerData)
    })
    .then(response => {
        // 检查响应状态
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // 显示后端返回的消息
        showMessage(data.message, data.code === 200 ? 'success' : 'error');
        
        if (data.code === 200) {
            // 注册成功，延迟切换到登录表单
            setTimeout(() => {
                document.getElementById('showLogin').click();
                // 清空注册表单
                document.getElementById('registerForm').reset();
            }, 1500);
        }
        resetRegisterButton(registerBtn, originalText);
    })
    .catch(error => {
        // 网络错误或服务器错误处理
        console.error('Register error:', error);
        showMessage('注册失败，请稍后重试', 'error');
        resetRegisterButton(registerBtn, originalText);
    });
}

/**
 * 重置登录按钮状态
 * @param {HTMLElement} button - 登录按钮元素
 * @param {string} originalText - 按钮原始文本
 */
function resetLoginButton(button, originalText) {
    button.textContent = originalText;
    button.disabled = false;
}

/**
 * 重置注册按钮状态
 * @param {HTMLElement} button - 注册按钮元素
 * @param {string} originalText - 按钮原始文本
 */
function resetRegisterButton(button, originalText) {
    button.textContent = originalText;
    button.disabled = false;
}

/**
 * 显示消息提示
 * @param {string} message - 消息内容
 * @param {string} type - 消息类型 ('success' 或 'error')
 */
function showMessage(message, type) {
    // 移除已存在的消息提示
    const existingMessage = document.querySelector('.login-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // 创建消息元素
    const messageEl = document.createElement('div');
    messageEl.className = `login-message ${type}`;
    messageEl.textContent = message;
    
    // 设置消息样式
    Object.assign(messageEl.style, {
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '12px 24px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '500',
        zIndex: '1000',
        textAlign: 'center',
        minWidth: '200px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    });
    
    // 根据消息类型设置背景色
    if (type === 'success') {
        messageEl.style.background = 'linear-gradient(135deg, #27ae60, #2ecc71)';
    } else {
        messageEl.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
    }
    
    // 添加到页面并设置自动移除
    document.body.appendChild(messageEl);
    setTimeout(() => {
        if (messageEl.parentNode) {
            messageEl.parentNode.removeChild(messageEl);
        }
    }, 3000);
}

// 增强输入框交互体验
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('.form-input');
    
    inputs.forEach(input => {
        // 聚焦时的动画效果
        input.addEventListener('focus', function() {
            this.style.transform = 'scale(1.02)';
        });
        
        // 失焦时恢复原状
        input.addEventListener('blur', function() {
            this.style.transform = 'scale(1)';
        });
    });
});