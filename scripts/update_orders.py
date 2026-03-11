import json
import random
import os

def update_orders():
    # Because we are in ./scripts, we need to access JSON in parent
    json_path = "../daily_orders.json"
    
    if not os.path.exists(json_path):
        json_path = "./daily_orders.json"
        
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            orders = json.load(f)
            
        for order in orders:
            # Generate fake contact
            if random.random() > 0.5:
                contact = f"WeChat: wx_{random.randint(1000, 9999)}_{order['id']}"
            else:
                contact = f"DingTalk: dt_user_{random.randint(100, 999)}"
                
            order["contact_info"] = contact
            
            # Generate fake URL
            platform_slug = order.get("platform", "unk").replace(" ", "").lower()
            order["platform_url"] = f"https://{platform_slug}.matrix.link/order/{order['id']}"
            
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(orders, f, ensure_ascii=False, indent=4)
            
        print(f"Successfully updated {len(orders)} orders.")
    except Exception as e:
        print(f"Error updating orders: {e}")

if __name__ == "__main__":
    update_orders()
