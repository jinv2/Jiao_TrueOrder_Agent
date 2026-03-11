/*
 * © 2026 Shensi-ST / 天算AI实验室 保留所有权利.
 * 【狡 · 真单日报】接单智能体
 * Architecture V7 / 1.0M Context
 */

document.addEventListener('DOMContentLoaded', () => {
    // === DOM Elements ===
    const skillTags = document.querySelectorAll('.skill-tag');
    const startScoutBtn = document.getElementById('startScoutBtn');
    const btnText = document.getElementById('btnText');
    const btnLoader = document.getElementById('btnLoader');
    const orderDashboard = document.getElementById('orderDashboard');
    const dashboardTitle = document.getElementById('dashboardTitle');
    const apiKeyInput = document.getElementById('apiKey');
    const mcpUrlInput = document.getElementById('mcpEndpoint');
    const aiModelSelect = document.getElementById('aiModelSelect');
    const aiScanToggle = document.getElementById('aiScanToggle');
    const toggleAdvanced = document.getElementById('toggleAdvanced');
    const advancedSettings = document.getElementById('advancedSettings');
    const budgetInput = document.getElementById('budgetInput');
    
    // === Modal DOM Elements ===
    const orderModal = document.getElementById('order-modal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalFooter = document.getElementById('modalFooter');

    // === Local Storage keys ===
    const STORAGE_KEY_API_KEY = 'jiao_api_key';
    const STORAGE_KEY_MCP_URL = 'jiao_mcp_url';
    const STORAGE_KEY_BUDGET = 'jiao_budget';
    const STORAGE_KEY_SKILLS = 'jiao_skills';
    const STORAGE_KEY_AI_MODEL = 'jiao_ai_model';

    // === Database representing the "Jungle of Outsourcing" ===
    let mockOrders = [];

    // === Initialization (BYOK State from LocalStorage) ===
    async function init() {
        if (localStorage.getItem(STORAGE_KEY_API_KEY)) {
            apiKeyInput.value = localStorage.getItem(STORAGE_KEY_API_KEY);
        }
        if (localStorage.getItem(STORAGE_KEY_MCP_URL)) {
            mcpUrlInput.value = localStorage.getItem(STORAGE_KEY_MCP_URL);
        }
        if (localStorage.getItem(STORAGE_KEY_BUDGET)) {
            budgetInput.value = localStorage.getItem(STORAGE_KEY_BUDGET);
        }
        if (localStorage.getItem(STORAGE_KEY_AI_MODEL)) {
            aiModelSelect.value = localStorage.getItem(STORAGE_KEY_AI_MODEL);
        }
        
        const savedSkills = JSON.parse(localStorage.getItem(STORAGE_KEY_SKILLS)) || [];
        if (savedSkills.length > 0) {
            skillTags.forEach(tag => {
                if(savedSkills.includes(tag.dataset.skill)) {
                    tag.classList.add('active');
                } else {
                    tag.classList.remove('active');
                }
            });
        }

        // Fetch Order Data
        try {
            const response = await fetch('daily_orders.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const rawData = await response.json();
            
            // Handle both legacy array format and new Metadata wrapped format
            if (Array.isArray(rawData)) {
                mockOrders = rawData;
                updateFreshness(null);
            } else {
                mockOrders = rawData.orders || [];
                updateFreshness(rawData.last_updated);
            }
            
            console.log(`[Jiao Engine] Successfully loaded ${mockOrders.length} orders from the deep web.`);
        } catch (error) {
            console.error("[Jiao Engine] Context Fetch Error: ", error);
            orderDashboard.innerHTML = `
                <div style="color: #ff6b6b; text-align: center; padding: 32px 0; grid-column: span 2;">
                    网络探针连线失败。若您在本地运行，请务必使用 HTTP Server (例如: <code>npx http-server</code>)。
                </div>
            `;
        }
    }
    
    // === Freshness Engine ===
    function updateFreshness(isoDateStr) {
        const freshnessEl = document.getElementById('dataFreshness');
        if (!freshnessEl) return;
        
        if (!isoDateStr) {
            freshnessEl.innerHTML = '<i class="fa-solid fa-clock-rotate-left"></i> 状态：正在等待同步';
            return;
        }

        const updatedTime = new Date(isoDateStr);
        const now = new Date();
        const diffMs = now - updatedTime;
        const diffHrs = diffMs / (1000 * 60 * 60);

        if (diffHrs <= 1) {
            freshnessEl.innerHTML = '<i class="fa-solid fa-satellite-dish fa-beat" style="color: var(--quantum-cyan);"></i> 状态：正在全网搜寻好单子...';
            freshnessEl.style.color = 'var(--quantum-cyan)';
            freshnessEl.style.borderColor = 'rgba(0, 229, 255, 0.3)';
            freshnessEl.style.background = 'rgba(0, 229, 255, 0.05)';
            if (aiScanToggle && aiScanToggle.checked && document.getElementById('mcpEndpoint').value.trim() !== '') {
                freshnessEl.classList.add('pulse-green');
            }
        } else {
            freshnessEl.innerHTML = '<i class="fa-solid fa-clock-rotate-left"></i> 状态：正在等待同步';
            freshnessEl.style.color = 'var(--text-secondary)';
            freshnessEl.style.borderColor = 'var(--surface-border)';
            freshnessEl.style.background = 'rgba(255,255,255,0.05)';
            freshnessEl.classList.remove('pulse-green');
        }
    }
    // === Skill Tag Interaction ===
    skillTags.forEach(tag => {
        tag.addEventListener('click', () => {
            tag.classList.toggle('active');
        });
    });

    // === UI Toggles ===
    if (toggleAdvanced && advancedSettings) {
        toggleAdvanced.addEventListener('click', () => {
            if (advancedSettings.style.display === 'none') {
                advancedSettings.style.display = 'block';
                toggleAdvanced.style.color = 'var(--quantum-cyan)';
            } else {
                advancedSettings.style.display = 'none';
                toggleAdvanced.style.color = 'var(--text-secondary)';
            }
        });
    }

    if (aiScanToggle) {
        aiScanToggle.addEventListener('change', () => {
            // Re-trigger freshness state visually when toggle changes
            init(); 
        });
    }

    // === Core Engine Function: Sniffing the Truth ===
    async function startScouting() {
        // Validation
        const apiKey = apiKeyInput.value.trim();
        const expectedBudget = parseInt(budgetInput.value.trim() || '1', 10);
        
        const activeSkills = Array.from(skillTags)
                                .filter(tag => tag.classList.contains('active'))
                                .map(tag => tag.dataset.skill);

        if (activeSkills.length === 0) {
            alert('警告：请至少选择一项技能，以便“狡”为您进行精准嗅探。');
            return;
        }

        // Save to local storage for BYOK persistence
        localStorage.setItem(STORAGE_KEY_API_KEY, apiKey);
        localStorage.setItem(STORAGE_KEY_MCP_URL, mcpUrlInput.value.trim());
        localStorage.setItem(STORAGE_KEY_BUDGET, expectedBudget);
        localStorage.setItem(STORAGE_KEY_SKILLS, JSON.stringify(activeSkills));
        if(aiModelSelect) localStorage.setItem(STORAGE_KEY_AI_MODEL, aiModelSelect.value);

        // UI Transition
        btnText.innerHTML = '瑞兽出巡，正在玉山百里内搜寻丰收机缘...';
        btnLoader.style.display = 'block';
        startScoutBtn.disabled = true;
        startScoutBtn.style.opacity = '0.7';
        orderDashboard.innerHTML = '';
        dashboardTitle.style.display = 'none';

        // Fake network delay (Edge Computation Mock)
        setTimeout(() => {
            // "Agent Filter algorithm"
            const filteredOrders = mockOrders.filter(order => {
                // 1. Must match at least one skill. ALL jobs (Real or Unverified) are now shown! 
                // We've stripped out the 'order.isReal' filter and removed ALL minimum budget thresholds to ensure 100% Granular Harvesting.
                const hasSkill = order.skills.some(skill => activeSkills.includes(skill));
                if(!hasSkill) return false;

                return true;
            });

            renderDashboard(filteredOrders);

            // Restore UI
            btnText.innerHTML = '看完了，再帮我找找新的';
            btnLoader.style.display = 'none';
            startScoutBtn.disabled = false;
            startScoutBtn.style.opacity = '1';
        }, 1500); // 1.5s delay to simulate the "Scout" searching the web
    }

    // === Rendering Output ===
    function renderDashboard(orders) {
        dashboardTitle.style.display = 'block';
        dashboardTitle.innerHTML = `<i class="fa-solid fa-bolt"></i> 最新列装单库（颗粒归仓）`;
        orderDashboard.innerHTML = '';

        if(orders.length === 0) {
            orderDashboard.innerHTML = `
                <div style="color: var(--text-secondary); text-align: center; padding: 32px 0; grid-column: span 2;">
                    神兽蛰伏，此刻玉山脚下暂无机缘降临。建议放宽要求以开启全量嗅探。
                </div>
            `;
            return;
        }

        orders.forEach((order, index) => {
            // "Providence" (机缘) cards rendering
            setTimeout(() => {
                const card = document.createElement('div');
                card.className = 'order-card';
                
                let tags = '';
                if(order.is_urgent) tags += `<span style="background: rgba(255,107,107,0.2); color: #ff6b6b; padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; margin-right: 6px;">急招</span>`;
                if(order.is_guaranteed) tags += `<span style="background: rgba(245, 208, 32, 0.2); color: var(--scout-yellow); padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; margin-right: 6px;">担保交易</span>`;

                // Render stars for difficulty (1-5)
                let stars = '';
                for(let i=1; i<=5; i++) {
                    if (i <= (order.difficulty_level || 1)) stars += '<i class="fa-solid fa-star"></i>';
                    else stars += '<i class="fa-regular fa-star"></i>';
                }

                card.innerHTML = `
                    <div class="order-header">
                        <div class="order-title">${tags}${order.title}</div>
                        <div class="order-budget">¥${order.budget}</div>
                    </div>
                    <div class="order-metrics" style="flex-wrap: wrap;">
                        <div class="metric"><i class="fa-solid fa-layer-group metric-highlight"></i> ${order.skills.join(', ')}</div>
                        <div class="metric"><i class="fa-solid fa-map-location-dot metric-highlight"></i> ${order.city}</div>
                        <div class="metric"><i class="fa-solid fa-globe metric-highlight"></i> ${order.platform}</div>
                        <div class="metric"><i class="fa-solid fa-shield-halved metric-highlight"></i> 门槛: ${order.professional_barrier || '未知'}</div>
                        <div class="metric" style="color: var(--scout-yellow); font-size: 0.65rem; margin-top:2px;">${stars}</div>
                    </div>
                    <div class="match-score">算力匹配: ${order.score}%</div>
                    <div class="order-card-actions">
                        <button class="view-btn" onclick="window.showModal('${order.id}', event)">立即接单</button>
                    </div>
                `;
                orderDashboard.appendChild(card);
            }, index * 100); // Faster stagger for large lists
        });
    }

    // === Modal Logic ===
    // Expose to window for inline onclick handler
    window.showModal = function(orderId, event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        
        // Find order from mockOrders
        const order = mockOrders.find(o => o.id === orderId);
        if(!order) return;

        // Reset Modal Content
        modalTitle.textContent = order.title;
        modalBody.innerHTML = '';
        modalFooter.innerHTML = '';
        
        // Basic Order Info
        let starsInfo = '';
        for(let i=1; i<=5; i++) {
            if (i <= (order.difficulty_level || 1)) starsInfo += '<i class="fa-solid fa-star"></i>';
            else starsInfo += '<i class="fa-regular fa-star"></i>';
        }

        let contentHtml = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
                <div>
                    <div style="font-size: 0.75rem; color: var(--quantum-cyan); margin-bottom: 4px;"><i class="fa-solid fa-shield-check"></i> 该单已通过 Matrix 算力审计，真实度 98%</div>
                    <p style="font-size: 1.5rem; color: var(--scout-yellow); font-weight: 700;">¥${order.budget}</p>
                </div>
                <button class="btn-action" style="padding: 4px 8px; font-size: 0.75rem; border-color: rgba(255,255,255,0.1);" onclick="window.open('${order.platform_url}', '_blank')"><i class="fa-solid fa-camera"></i> 源站快照</button>
            </div>
            
            <div style="display: flex; gap: 24px; margin-bottom: 16px;">
                 <div>
                    <p style="color: var(--text-secondary); margin-bottom: 4px;">来源矩阵节点</p>
                    <p><i class="fa-solid fa-globe"></i> ${order.platform}</p>
                 </div>
                 <div>
                    <p style="color: var(--text-secondary); margin-bottom: 4px;">公司与结算</p>
                    <p><i class="fa-solid fa-building"></i> ${order.company_background || '验证实体'}</p>
                    <p style="color: var(--scout-yellow); font-size: 0.85rem; margin-top:2px;">${order.payment_method || '日结保障'}</p>
                 </div>
            </div>

            <div style="margin-bottom: 16px;">
                <p style="color: var(--text-secondary); margin-bottom: 4px;">【避坑指南】</p>
                <p style="color: #ff6b6b; font-size: 0.85rem;"><i class="fa-solid fa-triangle-exclamation"></i> ${order.safety_tips || '注意资金安全，平台外交易无保障'}</p>
            </div>

            <div style="margin-bottom: 16px; background: rgba(255,255,255,0.02); padding: 12px; border-radius: var(--radius-sm); border: 1px dashed rgba(255,255,255,0.1);">
                <p style="color: var(--text-secondary); margin-bottom: 8px;">【任务流程架构】</p>
                <p style="font-size: 0.85rem; color: #ddd;">${order.task_flow || '接受任务 -> 独立实施 -> 提交审核 -> 结算'}</p>
            </div>

            <div style="margin-bottom: 16px;">
                <p style="color: var(--text-secondary); margin-bottom: 8px;">【极密档案 / 详细要求】</p>
                <p style="font-size: 0.9rem; color: #ccc; line-height: 1.6;">${order.detail_description || '暂无更多补充，请按行业标准交付。'}</p>
            </div>
        `;
        
        // Isolate Platform and Number
        let platformName = "Phone";
        let rawContact = order.contact_info;
        if (order.contact_info.includes(':')) {
            const parts = order.contact_info.split(':');
            platformName = parts[0].trim();
            rawContact = parts[1].trim();
        }

        let maskedContact = rawContact;
        if (maskedContact && maskedContact.length === 11 && !isNaN(maskedContact)) {
            maskedContact = maskedContact.substring(0, 3) + '****' + maskedContact.substring(7);
        }

        let badgeHtml = '';
        if (platformName === 'WeChat') {
            badgeHtml = `<i class="fa-brands fa-weixin" style="color: #07c160; margin-right:4px;"></i>`;
        } else if (platformName === 'Phone') {
            badgeHtml = `<a href="tel:${rawContact}" style="color: #00E5FF; margin-right:4px; text-decoration: none;"><i class="fa-solid fa-phone"></i></a>`;
        }

        contentHtml += `
            <div class="modal-success-box" id="contactRevealBox" style="display: none;">
                <div style="margin-bottom: 12px; font-weight: 600; color: #fff;">
                    <i class="fa-solid fa-user-secret"></i> 目标脱水真身
                </div>
                <div><strong>联系方式:</strong> ${badgeHtml}<span id="contactDisplaySpan" style="user-select: all; font-size: 1.1rem; letter-spacing: 1px;">${maskedContact} (点击下方解锁并复制)</span></div>
                <div style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed rgba(255,255,255,0.1); font-size: 0.70rem; color: var(--text-secondary); line-height: 1.6;">
                    <div style="color: #ff6b6b; font-size: 0.75rem; font-weight: 600; margin-bottom: 6px;">
                        【⚠️ 安全提醒：正规接单不收押金，凡是要求预付保证金的均有欺诈风险！】
                    </div>
                    <div>[数据源：网络公开嗅探 | AI 聚合]</div>
                    <div>【量子预警】：AI 嗅探可能存在偏差，请务必核实对方实名。</div>
                </div>
            </div>
        `;
        
        // Dynamic Button Setup
        let btnCopyText = "一键解密并复制手机号";
        if (platformName === 'WeChat') {
            btnCopyText = "复制微信号并打开微信";
        }

        modalFooter.innerHTML = `
            <button class="btn-action" id="btnCancel">关闭追踪</button>
            <button class="btn-action highlight" id="btnReveal">
                <i class="fa-solid fa-eye"></i> 获取联系方式
            </button>
            <button class="btn-action highlight" id="btnCopy" data-contact="${rawContact}" data-platform="${platformName}" style="display: none;">
                <i class="fa-solid fa-copy"></i> ${btnCopyText}
            </button>
        `;
        
        modalBody.innerHTML = contentHtml;
        orderModal.classList.add('show');
        
        document.getElementById('btnCancel').addEventListener('click', closeOrderModal);
        
        const btnReveal = document.getElementById('btnReveal');
        const btnCopy = document.getElementById('btnCopy');
        const contactRevealBox = document.getElementById('contactRevealBox');

        // Reveal logic
        btnReveal.addEventListener('click', () => {
            contactRevealBox.style.display = 'block';
            btnReveal.style.display = 'none';
            btnCopy.style.display = 'block';
        });

        // Hardcore Copy Action
        btnCopy.addEventListener('click', async (e) => {
            const btn = e.currentTarget;
            const contact = btn.getAttribute('data-contact');
            const platform = btn.getAttribute('data-platform');
            const displaySpan = document.getElementById('contactDisplaySpan');
            
            try {
                await navigator.clipboard.writeText(contact);
                
                // Decrypt Visually
                if(displaySpan) displaySpan.innerHTML = `<span style="color: var(--quantum-cyan);">${contact}</span>`;
                
                if (platform === 'WeChat') {
                    btn.innerHTML = '<i class="fa-solid fa-check"></i> 复制成功，正在唤醒微信...';
                    setTimeout(() => { window.location.href = 'weixin://'; }, 300);
                } else {
                    btn.innerHTML = '<i class="fa-solid fa-check"></i> 老板手机号已存入剪贴板，快去添加微信吧！';
                }

                btn.style.background = 'rgba(245, 208, 32, 0.2)';
                btn.style.color = 'var(--scout-yellow)';
                btn.style.borderColor = 'var(--scout-yellow)';
            } catch (err) {
                // Decrypt Visually anyway
                if(displaySpan) displaySpan.innerHTML = `<span style="color: #ff6b6b;">${contact}</span>`;

                // Fallback for secure contexts or legacy browsers
                btn.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> 复制失败，请手动选取上方蓝字！';
                btn.style.borderColor = '#ff6b6b';
                btn.style.color = '#ff6b6b';
            }
            
            // Revert state
            setTimeout(() => {
                if(btn && orderModal.classList.contains('show')) {
                    btn.innerHTML = `<i class="fa-solid fa-copy"></i> ${btnCopyText}`;
                    btn.style.background = '';
                    btn.style.color = '';
                    btn.style.borderColor = '';
                }
            }, 3000);
        });
    }

    function closeOrderModal() {
        orderModal.classList.remove('show');
    }

    closeModalBtn.addEventListener('click', closeOrderModal);

    
    // Close modal if clicked outside of the inner content layer
    orderModal.addEventListener('click', (e) => {
        if (e.target === orderModal) closeOrderModal();
    });

    // === Event Listeners ===
    startScoutBtn.addEventListener('click', startScouting);

    // Global listener for dynamic view-btn clicks
    document.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('view-btn')) {
            console.log('接单动作触发');
        }
    });

    // Boot Up
    init();
});
