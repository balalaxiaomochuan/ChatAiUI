// arkweb.js - 页面交互逻辑

/**
 * 页面加载完成后初始化所有功能
 */
document.addEventListener('DOMContentLoaded', function() {
    // 初始化菜单功能
    initMenu();
    
    // 初始化标签页功能
    initTabs();
    
    // 设置默认激活页面
    activatePage('device');
});

/**
 * 初始化菜单功能
 */
function initMenu() {
    // 处理可展开菜单项
    const expandableItems = document.querySelectorAll('.has-submenu > .nav-link');
    expandableItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // 切换子菜单展开状态
            const parentItem = this.parentElement;
            parentItem.classList.toggle('active');
        });
    });
    
    // 处理菜单项点击
    const menuLinks = document.querySelectorAll('.nav-link, .submenu-link');
    menuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 获取目标页面
            const targetPage = this.getAttribute('data-page');
            if (targetPage) {
                activatePage(targetPage);
            }
        });
    });
}

/**
 * 初始化标签页功能
 */
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            activateTab(tabId);
        });
    });
}

/**
 * 激活指定页面
 * @param {string} pageName - 页面名称
 */
function activatePage(pageName) {
    // 隐藏所有页面
    const allPages = document.querySelectorAll('.content-page');
    allPages.forEach(page => {
        page.classList.remove('active');
    });
    
    // 移除所有菜单项激活状态
    const allNavItems = document.querySelectorAll('.nav-item');
    allNavItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // 显示目标页面
    let targetPageId = '';
    switch(pageName) {
        case 'traversal':
            targetPageId = 'traversal-page';
            break;
        case 'environment':
            targetPageId = 'environment-page';
            break;
        case 'execution':
            targetPageId = 'execution-page';
            break;
        case 'arkweb':
            targetPageId = 'arkweb-page';
            break;
        case 'global':
            targetPageId = 'global-page';
            break;
        case 'ux':
            targetPageId = 'ux-page';
            break;
        case 'device':
            targetPageId = 'device-page';
            break;
        default:
            targetPageId = 'device-page';
    }
    
    const targetPage = document.getElementById(targetPageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // 激活对应菜单项
    activateMenuItem(pageName);
}

/**
 * 激活菜单项
 * @param {string} pageName - 页面名称
 */
function activateMenuItem(pageName) {
    // 查找对应的菜单项
    const menuLinks = document.querySelectorAll('.nav-link, .submenu-link');
    menuLinks.forEach(link => {
        if (link.getAttribute('data-page') === pageName) {
            // 激活菜单项
            const navItem = link.closest('.nav-item');
            if (navItem) {
                navItem.classList.add('active');
                
                // 如果是子菜单项，展开父级菜单
                if (link.classList.contains('submenu-link')) {
                    const parentItem = navItem.parentElement.closest('.nav-item');
                    if (parentItem) {
                        parentItem.classList.add('active');
                    }
                }
            }
        }
    });
}

/**
 * 激活标签页
 * @param {string} tabId - 标签页ID
 */
function activateTab(tabId) {
    // 移除所有标签按钮激活状态
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 隐藏所有标签内容
    const tabPanes = document.querySelectorAll('.tab-pane');
    tabPanes.forEach(pane => {
        pane.classList.remove('active');
    });
    
    // 激活目标标签按钮
    const targetButton = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    if (targetButton) {
        targetButton.classList.add('active');
    }
    
    // 显示目标标签内容
    const targetPane = document.getElementById(`${tabId}-tab`);
    if (targetPane) {
        targetPane.classList.add('active');
    }
}

// arkweb.js - 页面交互逻辑

/**
 * 页面加载完成后初始化所有功能
 */
document.addEventListener('DOMContentLoaded', function() {
    // 初始化菜单功能
    initMenu();
    
    // 初始化标签页功能
    initTabs();
    
    // 初始化设置按钮功能
    initSettings();
    
    // 设置默认激活页面
    activatePage('device');
});

/**
 * 初始化设置按钮功能
 */
function initSettings() {
    // 物理设备设置按钮
    const physicalSettingsBtn = document.getElementById('physical-settings');
    if (physicalSettingsBtn) {
        physicalSettingsBtn.addEventListener('click', function() {
            showSettingsModal('物理设备设置', '这里是物理设备的设置内容');
        });
    }
    
    // 云设备设置按钮
    const cloudSettingsBtn = document.getElementById('cloud-settings');
    if (cloudSettingsBtn) {
        cloudSettingsBtn.addEventListener('click', function() {
            showSettingsModal('云设备设置', '这里是云设备的设置内容');
        });
    }
}

/**
 * 显示设置弹窗
 * @param {string} title - 弹窗标题
 * @param {string} content - 弹窗内容
 */
function showSettingsModal(title, content) {
    // 创建弹窗元素
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'settingsModal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <span class="close">&times;</span>
            </div>
            <div class="modal-body">
                <p>${content}</p>
                <div class="form-group">
                    <label for="setting-input">设置项:</label>
                    <input type="text" id="setting-input" class="form-input" placeholder="请输入设置值">
                </div>
            </div>
            <div class="modal-footer">
                <button class="modal-btn btn-secondary" id="cancelBtn">取消</button>
                <button class="modal-btn btn-primary" id="saveBtn">保存</button>
            </div>
        </div>
    `;
    
    // 添加到页面
    document.body.appendChild(modal);
    
    // 显示弹窗
    modal.style.display = 'block';
    
    // 绑定关闭事件
    const closeBtn = modal.querySelector('.close');
    const cancelBtn = modal.querySelector('#cancelBtn');
    const saveBtn = modal.querySelector('#saveBtn');
    
    const closeModal = function() {
        modal.style.display = 'none';
        document.body.removeChild(modal);
    };
    
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    saveBtn.addEventListener('click', function() {
        const inputValue = document.getElementById('setting-input').value;
        alert(`设置已保存: ${inputValue}`);
        closeModal();
    });
    
    // 点击弹窗外部关闭
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
}