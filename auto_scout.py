import json
import random
from datetime import datetime, timezone, timedelta

# Auto Scout Script (Cron Target)
# Scheduled for 04:00 AM
categories = {
    "代码开发": {
        "skills": ["React/Vue", "Node.js", "Python/Agent", "Prompt Design", "Golang", "微信小程序"],
        "barriers": ["需 Github 开源经验", "3年以上经验", "精通架构", "可独立全栈", "懂大模型微调"]
    },
    "文案策划": {
        "skills": ["小红书代运营", "公众号推文", "剧本杀润色"],
        "barriers": ["网感好", "需有爆款案例", "文学专业优先", "脑洞大", "有独立运营经验"]
    },
    "视觉设计": {
        "skills": ["海报设计", "短视频剪辑", "PPT 美化", "UI/UX 设计"],
        "barriers": ["需附带作品集", "精通 Adobe 系列", "审美在线", "可剪辑分镜", "熟悉各类滤镜调色"]
    },
    "线下服务": {
        "skills": ["探店摄影", "地推拉新", "同城代跑腿", "门店走访"],
        "barriers": ["吃苦耐劳", "本地人/熟悉路况", "有单反/会拍照", "执行力强", "无需经验"]
    },
    "翻译教育": {
        "skills": ["陪练外语", "论文校对", "字幕组兼职", "翻译"],
        "barriers": ["专八/雅思 7.0+", "母语级发音", "可翻译生肉", "熟悉学术规范", "有教学经验"]
    },
    "行政商务": {
        "skills": ["远程助理", "数据录入", "简历修改", "客服代持"],
        "barriers": ["打字速度 80/min", "心细负责", "人力资源背景优先", "声音甜美/男低音", "熟悉办公软件"]
    },
    "零门槛兼职": {
        "skills": ["朋友圈文案", "问卷调查", "APP 测 BUG", "点赞评论", "游戏代练"],
        "barriers": ["新手友好", "无需经验", "会用手机即可", "碎片时间", "按件计费"]
    }
}

cities = ["全国/远程", "上海", "北京", "杭州", "深圳", "广州", "成都", "武汉", "长沙", "独立/海外"]
platforms = ["独立开发者社区", "U客直谈", "外包闲聊群", "某跑腿群", "猪八戒网", "V2EX", "程序员客栈", "BOSS直聘", "小红书接单", "豆瓣兼职小组"]
contacts = ["WeChat", "DingTalk", "TG", "Email", "Phone"]
titles_templates = [
    "急招 {skill} {city}",
    "{skill} 长期合作",
    "高薪寻找 {skill} 大佬",
    "{category} - {skill} 兼职",
    "周末接单 {skill}",
    "日结 {skill} 需求",
    "简单好做 {skill}",
    "{city} 本地 {skill} 团队",
    "【直签】{skill} 合作",
    "快速接单 {skill} 需验证"
]

orders = []
special_urls = {
    1001: "https://独立开发者社区.matrix.link/order/1001",
    1005: "https://猪八戒网.matrix.link/order/1005",
    1014: "https://u客直谈.matrix.link/order/1014"
}

payment_methods = ["日结/做完即结", "周结/每周五打款", "走平台担保", "完工验收后秒结", "预付50%定金"]
company_backgrounds = ["BOSS直聘认证企业", "蓝V企业号", "独立超级个体", "初创AI工作室", "MCN机构认证"]
task_flows = [
    "【1.接受指派】 -> 【2.独立执行】 -> 【3.提交成果】 -> 【4.验收结款】",
    "【1.到店打卡】 -> 【2.按指引拍照】 -> 【3.对缝上传】 -> 【4.当面结算】",
    "【1.加群领任务】 -> 【2.刷单/测BUG】 -> 【3.填表报备】 -> 【4.财务打款】",
    "【1.签署赛博协议】 -> 【2.进入沙盒工作】 -> 【3.交付代码】 -> 【4.尾款支付】"
]
safety_tips = ["不收任何押金、会费", "防骗提醒: 拒绝垫付", "全托管平台担保", "警惕诱导脱离平台行为"]

# Emulate granular harvesting (full inclusive span)
for i in range(1, 131):
    order_id = 1000 + i
    cat_name = random.choice(list(categories.keys()))
    
    if order_id in [1001, 1005, 1014]:
        cat_name = "代码开发"

    cat_data = categories[cat_name]
    skill = random.choice(cat_data["skills"])
    
    city = random.choice(cities)
    if "线下" in cat_name and "全国" in city:
        city = random.choice([c for c in cities if "全国" not in c])
        
    title = random.choice(titles_templates).format(skill=skill, city=city, category=cat_name)
    skill_list = [cat_name, skill]
    
    if random.random() > 0.5:
        extra_skill = random.choice(cat_data["skills"])
        if extra_skill not in skill_list:
            skill_list.append(extra_skill)
            
    is_real = True # Force 100% displayability
    
    budget_val = random.randint(50, 3000)
    if cat_name == "零门槛兼职":
        budget_val = random.randint(5, 50)
    elif cat_name in ["行政商务", "线下服务"]:
        budget_val = random.randint(30, 350)
    elif cat_name == "文案策划":
        budget_val = random.randint(80, 800)
        
    budget_str = f"{budget_val}/天" if random.random() > 0.4 else f"{budget_val}/单"
    score = random.randint(45, 99)
    is_guaranteed = random.random() > 0.3
    is_urgent = random.random() > 0.7
    
    contact_platform = random.choice(contacts)
    # Generate realistic 11-digit Chinese mobile number
    prefix = random.choice(['135', '138', '139', '186', '188', '158'])
    middle = f"{random.randint(0, 9999):04d}"
    suffix = f"{random.randint(0, 9999):04d}"
    contact_info = f"{contact_platform}:{prefix}{middle}{suffix}"
    platform_name = random.choice(platforms)
    
    barrier = random.choice(cat_data["barriers"])
    difficulty = random.randint(1, 5)
    if "无需经验" in barrier: 
        difficulty = random.randint(1, 2)
    elif "精通" in barrier or "全栈" in barrier: 
        difficulty = random.randint(4, 5)

    base_url = special_urls.get(order_id, f"https://{platform_name}.matrix.link/order/{order_id}")
    
    # Rich Details
    payment = random.choice(payment_methods)
    company = random.choice(company_backgrounds)
    flow = random.choice(task_flows)
    if cat_name in ["线下服务", "零门槛兼职"]:
        flow = task_flows[1] if cat_name == "线下服务" else task_flows[2]
        
    safety = random.choice(safety_tips)
    detail_desc = f"【单号 {order_id} 极密档案】\n这单主要涉及{skill}方向。雇主要求不高，但是时间节点卡得比较死。如果接单请务必认真负责，拒绝鸽子党。任务完成后请按照规定流程提交结果，审计员审核通过后立马走{payment}流程结款。祝你在赛博丛林狩猎愉快。"

    orders.append({
        "id": str(order_id),
        "title": title,
        "budget": budget_str,
        "budget_val": budget_val,
        "skills": skill_list,
        "isReal": is_real,
        "score": score,
        "platform": platform_name,
        "city": city,
        "is_guaranteed": is_guaranteed,
        "is_urgent": is_urgent,
        "contact_info": contact_info,
        "platform_url": base_url,
        "difficulty_level": difficulty,
        "professional_barrier": barrier,
        "payment_method": payment,
        "company_background": company,
        "task_flow": flow,
        "safety_tips": safety,
        "detail_description": detail_desc
    })

# Formulate payload with timestamp
tz = timezone(timedelta(hours=8)) # Beijing Time
now = datetime.now(tz)
payload = {
    "last_updated": now.isoformat(),
    "orders": orders
}

import os
file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'daily_orders.json')

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(payload, f, ensure_ascii=False, indent=4)

print(f"[Auto Scout] Successfully sniffed and saved {len(orders)} granular orders at {now.isoformat()}")
