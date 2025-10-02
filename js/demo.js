// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 获取表单元素
    const userForm = document.getElementById('user-form');
    
    // 监听表单提交事件
    userForm.addEventListener('submit', function(e) {
        e.preventDefault(); // 阻止默认提交行为
        
        // 获取表单数据
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const gender = document.getElementById('gender').value;
        const bio = document.getElementById('bio').value;
        
        // 简单验证
        if (name && email) {
            alert(`用户添加成功！\n姓名: ${name}\n邮箱: ${email}`);
            userForm.reset(); // 重置表单
        } else {
            alert('请填写必填字段！');
        }
    });
    
    // 监听编辑按钮点击
    document.querySelectorAll('.btn-edit').forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-id');
            alert(`编辑用户 ID: ${userId}`);
        });
    });
    
    // 监听删除按钮点击
    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-id');
            if (confirm(`确定要删除用户 ID: ${userId} 吗？`)) {
                alert(`用户 ID: ${userId} 已删除`);
            }
        });
    });
    
    // 导航链接平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});