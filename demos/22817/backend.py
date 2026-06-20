import copy
import json
import mimetypes
import queue
import re
import shutil
import subprocess
import threading
import time
from datetime import datetime, timedelta
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parent
SESSION_ROOT = ROOT / "sessions"
LOGIN_URL = "https://vbooking.ctrip.com/ivbk/accountV2/login"
PRODUCT_LIST_URL = "https://vbooking.ctrip.com/tour-activity-vbk-ssr/product-list"
ACTIVITY_EDIT_URL = "https://vbooking.ctrip.com/activity-vbk/product-edit?productId={product_id}&source=PriceStock&tabName=PriceAndStock"
TTD_EDIT_URL = "https://vbooking.ctrip.com/ttd-product-new/product-edit?productId={product_id}&tabName=PriceAndStock"
DOUYIN_HOME_URL = "https://life.douyin.com/"
DOUYIN_GOODS_LIST_URL = "https://life.douyin.com/p/goods-list?industry=tobias"
FLIGGY_HOME_URL = "https://fsc.fliggy.com/#/new/home"
FLIGGY_ONSALE_URL = "https://fsc.fliggy.com/#/seller-center/item/manage/onsale"
FLIGGY_ITEM_LIST_URL = "https://sell.fliggy.com/icenter/itemlist/ajx/itemList.htm?_input_charset=UTF-8&_output_charset=UTF-8"
FLIGGY_STOCK_URL = "https://sell.fliggy.com/sell/v3/saveSkuQuantity.htm?id={item_id}"
MEITUAN_HOME_URL = "https://mpc.meituan.com/"
MEITUAN_PRODUCT_LIST_URL = "https://mpc.meituan.com/v2/ngty/index.html#/gty/jwgtyproduct/list"
MEITUAN_GROUP_LIST_API = "https://lvyou.meituan.com/supply/op/group/list/search"
MEITUAN_GROUP_DETAIL_API = "https://lvyou.meituan.com/supply/op/group/product/detail"
TONGCHENG_HOME_URL = "http://ebk.17u.cn/localactivity/#/index"
TONGCHENG_PRODUCT_LIST_URL = "http://ebk.17u.cn/localactivity/#/dayTrip/productManageList"
HOST = "0.0.0.0"
PORT = 8766
CHANNEL_CONFIGS = {
    "ctrip": {
        "label": "携程",
        "loginUrl": LOGIN_URL,
    },
    "douyin_life": {
        "label": "抖音来客",
        "loginUrl": "https://life.douyin.com/",
    },
    "meituan": {
        "label": "美团",
        "loginUrl": "https://mpc.meituan.com/",
        "manualChrome": True,
    },
    "fliggy": {
        "label": "飞猪",
        "loginUrl": "https://fsc.fliggy.com/#/new/home",
        "manualChrome": True,
    },
    "tongcheng": {
        "label": "同程",
        "loginUrl": "https://ebk.17u.cn/jingqu/Account/Login",
    },
}
ACCOUNT_NAME_HINTS = {
    "acct-1780294091219": "祥源携程",
    "acct-1780465491348": "狸咖携程",
}

SESSION_ROOT.mkdir(exist_ok=True)

playwright = None
contexts = {}
lock = threading.Lock()
task_lock = threading.Lock()
browser_job_queue = queue.Queue()
browser_worker_ready = threading.Event()
browser_worker_started = False
browser_sync_semaphore = threading.Semaphore(2)


def now_text():
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def account_dir(account_id):
    safe_id = "".join(ch for ch in account_id if ch.isalnum() or ch in ("-", "_")) or "default"
    path = SESSION_ROOT / safe_id
    path.mkdir(exist_ok=True)
    return path


def normalize_channel(channel):
    return channel if channel in CHANNEL_CONFIGS else "ctrip"


def account_meta_file(account_id):
    return account_dir(account_id) / "account_meta.json"


def read_account_meta(account_id):
    path = account_meta_file(account_id)
    if not path.exists():
        channel = "ctrip"
        return {
            "accountId": account_id,
            "channel": channel,
            "channelLabel": CHANNEL_CONFIGS[channel]["label"],
            "loginUrl": CHANNEL_CONFIGS[channel]["loginUrl"],
        }
    try:
        meta = json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        meta = {}
    channel = normalize_channel(meta.get("channel") or "ctrip")
    meta.update({
        "accountId": account_id,
        "channel": channel,
        "channelLabel": CHANNEL_CONFIGS[channel]["label"],
        "loginUrl": CHANNEL_CONFIGS[channel]["loginUrl"],
    })
    return meta


def write_account_meta(account_id, updates=None):
    meta = read_account_meta(account_id)
    if updates:
        clean_updates = {key: value for key, value in updates.items() if value not in (None, "")}
        meta.update(clean_updates)
    channel = normalize_channel(meta.get("channel") or "ctrip")
    meta.update({
        "accountId": account_id,
        "channel": channel,
        "channelLabel": CHANNEL_CONFIGS[channel]["label"],
        "loginUrl": CHANNEL_CONFIGS[channel]["loginUrl"],
        "updatedAt": now_text(),
    })
    account_meta_file(account_id).write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")
    return meta


def channel_uses_manual_chrome(channel):
    config = CHANNEL_CONFIGS.get(normalize_channel(channel), {})
    return bool(config.get("manualChrome"))


def chrome_executable():
    candidates = [
        shutil.which("chrome"),
        shutil.which("chrome.exe"),
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    ]
    for candidate in candidates:
        if candidate and Path(candidate).exists():
            return candidate
    raise RuntimeError("未找到系统 Chrome，请先安装 Chrome 或把 chrome.exe 加入 PATH")


def manual_chrome_port(account_id):
    return 9300 + (sum(ord(ch) for ch in account_id) % 500)


def manual_chrome_profile_dir(account_id):
    path = account_dir(account_id) / "manual_chrome_profile"
    path.mkdir(exist_ok=True)
    return path


def launch_manual_chrome(account_id, login_url):
    port = manual_chrome_port(account_id)
    profile_dir = manual_chrome_profile_dir(account_id)
    args = [
        chrome_executable(),
        f"--user-data-dir={profile_dir}",
        f"--remote-debugging-port={port}",
        "--no-first-run",
        "--no-default-browser-check",
        "--start-maximized",
        login_url,
    ]
    creationflags = getattr(subprocess, "CREATE_NO_WINDOW", 0)
    subprocess.Popen(args, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, creationflags=creationflags)
    meta = write_account_meta(account_id, {
        "manualChrome": True,
        "debugPort": port,
        "manualProfileDir": str(profile_dir),
        "lastManualOpenAt": now_text(),
    })
    return {
        "ok": True,
        "accountId": account_id,
        "channel": meta.get("channel"),
        "channelLabel": meta.get("channelLabel"),
        "loginUrl": login_url,
        "mode": "manualChrome",
        "debugPort": port,
    }


def capture_manual_chrome_session(account_id, login_playwright):
    meta = read_account_meta(account_id)
    port = int(meta.get("debugPort") or manual_chrome_port(account_id))
    endpoint = f"http://127.0.0.1:{port}"
    browser = None
    try:
        browser = login_playwright.chromium.connect_over_cdp(endpoint)
        contexts_for_browser = browser.contexts
        if not contexts_for_browser:
            raise RuntimeError("普通 Chrome 已打开，但未找到可读取的浏览器上下文")
        context = contexts_for_browser[0]
        cookies = context.cookies()
        storage_path = account_dir(account_id) / "storage_state.json"
        try:
            context.storage_state(path=str(storage_path))
        except Exception:
            pass
        return summary_from_cookies(account_id, cookies)
    except Exception as error:
        raise RuntimeError(f"读取普通 Chrome Cookie 失败：请确认该账号的登录窗口还开着，并已完成登录。原始错误：{error}")
    finally:
        if browser:
            try:
                browser.close()
            except Exception:
                pass


def summary_from_cookies(account_id, cookies):
    meta = read_account_meta(account_id)
    domains = sorted({cookie.get("domain", "").lstrip(".") for cookie in cookies if cookie.get("domain")})
    names = sorted({cookie.get("name", "") for cookie in cookies if cookie.get("name")})
    summary = {
        "accountId": account_id,
        "channel": meta.get("channel") or "ctrip",
        "channelLabel": meta.get("channelLabel") or "携程",
        "loginUrl": meta.get("loginUrl") or LOGIN_URL,
        "recorded": bool(cookies),
        "cookieCount": len(cookies),
        "domains": domains,
        "cookieNames": names[:12],
        "updatedAt": now_text(),
        "storageFile": str(account_dir(account_id) / "storage_state.json"),
    }
    (account_dir(account_id) / "session_summary.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    return summary


def read_summary(account_id):
    path = account_dir(account_id) / "session_summary.json"
    if not path.exists():
        meta = read_account_meta(account_id)
        return {
            "accountId": account_id,
            "channel": meta.get("channel") or "ctrip",
            "channelLabel": meta.get("channelLabel") or "携程",
            "loginUrl": meta.get("loginUrl") or LOGIN_URL,
            "recorded": False,
        "cookieCount": 0,
        "domains": [],
            "cookieNames": [],
            "updatedAt": "",
            "storageFile": str(account_dir(account_id) / "storage_state.json"),
        }
    summary = json.loads(path.read_text(encoding="utf-8"))
    meta = read_account_meta(account_id)
    summary.setdefault("channel", meta.get("channel") or "ctrip")
    summary.setdefault("channelLabel", meta.get("channelLabel") or "携程")
    summary.setdefault("loginUrl", meta.get("loginUrl") or LOGIN_URL)
    return summary


def products_file(account_id):
    return account_dir(account_id) / "products.json"


def traffic_file(account_id):
    return account_dir(account_id) / "traffic.json"


def imported_traffic_file():
    return ROOT / "imported_traffic.json"


def tasks_file():
    return ROOT / "tasks.json"


def read_tasks():
    path = tasks_file()
    if not path.exists():
        return []
    return json.loads(path.read_text(encoding="utf-8"))


def write_tasks(tasks):
    tasks_file().write_text(json.dumps(tasks, ensure_ascii=False, indent=2), encoding="utf-8")


def update_task(task_id, **changes):
    with task_lock:
        tasks = read_tasks()
        for task in tasks:
            if task["id"] == task_id:
                task.update(changes)
                break
        write_tasks(tasks)


def append_task_item(task_id, item):
    with task_lock:
        tasks = read_tasks()
        for task in tasks:
            if task["id"] == task_id:
                task.setdefault("items", []).append(item)
                break
        write_tasks(tasks)


def get_task(task_id):
    tasks = read_tasks()
    return next((task for task in tasks if task["id"] == task_id), None)


def mark_interrupted_tasks_on_startup():
    with task_lock:
        tasks = read_tasks()
        changed = False
        for task in tasks:
            if task.get("status") in ("排队中", "执行中"):
                task.update({
                    "status": "失败",
                    "progress": 100,
                    "currentStep": "任务执行中断",
                    "finishedAt": now_text(),
                    "result": task.get("result") or "任务未完成",
                    "error": "后端服务重启，后台执行线程已中断；请重新运行该任务",
                })
                changed = True
        if changed:
            write_tasks(tasks)


def task_worker(task_id):
    task = get_task(task_id)
    if not task:
        return
    try:
        execute_batch_task(task_id, task)
    except Exception as error:
        update_task(
            task_id,
            status="失败",
            progress=100,
            currentStep="任务执行异常",
            finishedAt=now_text(),
            error=str(error),
        )


def create_batch_task(payload):
    task_id = f"BT{int(time.time() * 1000)}"
    task = {
        "id": task_id,
        "name": payload.get("name") or "库存价格批量任务",
        "accountId": payload.get("accountId", ""),
        "accountName": payload.get("accountName", ""),
        "operationType": payload.get("operationType", ""),
        "operationLabel": payload.get("operationLabel", ""),
        "syncType": payload.get("syncType", ""),
        "targetAccounts": payload.get("targetAccounts", []),
        "params": payload.get("params", {}),
        "productIds": payload.get("productIds", []),
        "productRefs": payload.get("productRefs", []),
        "skuScope": payload.get("skuScope", "all"),
        "skuText": payload.get("skuText", ""),
        "dateStart": payload.get("dateStart", ""),
        "dateEnd": payload.get("dateEnd", ""),
        "priceMode": payload.get("priceMode", ""),
        "priceValue": payload.get("priceValue", ""),
        "stockValue": payload.get("stockValue", ""),
        "inventoryAction": payload.get("inventoryAction", ""),
        "status": "排队中",
        "progress": 0,
        "currentStep": "已提交后台",
        "createdAt": now_text(),
        "finishedAt": "",
        "result": "",
        "error": "",
        "items": [],
    }
    with task_lock:
        tasks = read_tasks()
        tasks.insert(0, task)
        write_tasks(tasks)
    threading.Thread(target=task_worker, args=(task_id,), daemon=True).start()
    return task


def run_existing_task(task_id):
    task = get_task(task_id)
    if not task:
        raise ValueError("任务不存在")
    previous_items = task.get("items") or []
    update_task(
        task_id,
        status="排队中",
        progress=0,
        currentStep="已重新提交后台执行器",
        finishedAt="",
        result="",
        error="",
        items=[],
        previousItems=previous_items,
    )
    threading.Thread(target=task_worker, args=(task_id,), daemon=True).start()
    return get_task(task_id)


def clean_line(text):
    return re.sub(r"\s+", " ", text.replace("\xa0", " ")).strip()


def as_number(value):
    if value in (None, ""):
        return 0
    try:
        return float(str(value).replace(",", "").replace("￥", "").strip())
    except Exception:
        match = re.search(r"-?\d+(?:\.\d+)?", str(value))
        return float(match.group(0)) if match else 0


def parse_product_text(text):
    table_start = text.find("产品信息")
    if table_start >= 0:
        text = text[table_start:]
    matches = list(re.finditer(r"ID:\s*(\d+)", text))
    products = []
    seen = set()
    for index, match in enumerate(matches):
        product_id = match.group(1)
        if len(product_id) < 6:
            continue
        if product_id in seen:
            continue
        seen.add(product_id)
        chunk_start = max(0, match.start() - 120)
        chunk_end = matches[index + 1].start() if index + 1 < len(matches) else min(len(text), match.end() + 900)
        chunk = text[chunk_start:chunk_end]
        lines = [clean_line(line) for line in chunk.splitlines()]
        lines = [line for line in lines if line]
        id_line = next((i for i, line in enumerate(lines) if re.search(rf"ID:\s*{product_id}\b", line)), -1)
        if id_line < 0:
            continue
        title = lines[id_line + 1] if id_line + 1 < len(lines) else ""
        category = lines[id_line + 2] if id_line + 2 < len(lines) else ""
        venue_parts = []
        cursor = id_line + 3
        while cursor < len(lines) and lines[cursor] != "|" and not lines[cursor].startswith("资源ID"):
            venue_parts.append(lines[cursor])
            cursor += 1
        location = ""
        if cursor + 1 < len(lines) and lines[cursor] == "|":
            location = lines[cursor + 1]
        sale_line = next((line for line in lines[id_line:] if "售卖中" in line or "不在售" in line or "已下线" in line), "")
        info_status = next((line for line in lines[id_line:] if line in ("健康", "需优化", "-", "待完善")), "")
        audit_status = "审核通过" if "审核通过" in chunk else ("审核中" if "审核中" in chunk else "")
        on_sale = 0
        off_sale = 0
        sale_match = re.search(r"售卖中\s*(\d+)", sale_line)
        off_match = re.search(r"不在售\s*(\d+)", sale_line)
        if sale_match:
            on_sale = int(sale_match.group(1))
        if off_match:
            off_sale = int(off_match.group(1))
        products.append({
            "productId": product_id,
            "title": title,
            "category": category,
            "venue": "".join(venue_parts),
            "location": location,
            "saleStatus": sale_line,
            "onSaleResourceCount": on_sale,
            "offSaleResourceCount": off_sale,
            "auditStatus": audit_status,
            "infoStatus": info_status,
            "syncedAt": now_text(),
        })
    return products


def read_products(account_id):
    path = products_file(account_id)
    if not path.exists():
        return {
            "accountId": account_id,
            "total": 0,
            "syncedAt": "",
            "products": [],
        }
    return json.loads(path.read_text(encoding="utf-8"))


def list_backend_accounts():
    accounts = []
    if not SESSION_ROOT.exists():
        return accounts
    for account_path in sorted(SESSION_ROOT.iterdir()):
        if not account_path.is_dir() or not account_path.name.startswith("acct-"):
            continue
        account_id = account_path.name
        summary = read_summary(account_id)
        meta = read_account_meta(account_id)
        products_data = read_products(account_id)
        products = products_data.get("products") or []
        product_count = len(products)
        sku_count = sum(len(product.get("skus") or []) for product in products)
        account_name = meta.get("name") or ACCOUNT_NAME_HINTS.get(account_id, account_id)
        accounts.append({
            "id": account_id,
            "name": account_name,
            "channel": meta.get("channel") or "ctrip",
            "channelLabel": meta.get("channelLabel") or "携程",
            "loginUrl": meta.get("loginUrl") or LOGIN_URL,
            "login": "已授权" if summary.get("recorded") else "等待登录",
            "shopName": meta.get("shopName") or account_name,
            "storeName": meta.get("shopName") or account_name,
            "phone": meta.get("phone") or "-",
            "mobile": meta.get("phone") or "-",
            "remark": meta.get("remark") or "",
            "note": meta.get("remark") or "后端已保存账号",
            "createdAt": meta.get("createdAt") or summary.get("updatedAt") or products_data.get("syncedAt") or "",
            "sessionSummary": summary,
            "sessionRef": summary.get("storageFile") or "",
            "productCount": product_count,
            "skuCount": sku_count,
            "productSyncedAt": products_data.get("syncedAt") or "",
        })
    return accounts


def get_context(account_id):
    global playwright
    with lock:
        if playwright is None:
            playwright = sync_playwright().start()
        if account_id in contexts:
            return contexts[account_id]
        profile_dir = account_dir(account_id) / "chrome_profile"
        try:
            context = playwright.chromium.launch_persistent_context(
                user_data_dir=str(profile_dir),
                channel="chrome",
                headless=False,
                args=["--start-maximized"],
            )
        except Exception:
            context = playwright.chromium.launch_persistent_context(
                user_data_dir=str(profile_dir),
                headless=False,
                args=["--start-maximized"],
            )
        contexts[account_id] = context
        return context


def start_browser_worker():
    global browser_worker_started
    if browser_worker_started:
        return
    with lock:
        if browser_worker_started:
            return
        browser_worker_started = True
        threading.Thread(target=browser_worker_loop, daemon=True).start()
    browser_worker_ready.wait(timeout=30)


def browser_worker_loop():
    login_playwright = sync_playwright().start()
    login_contexts = {}
    browser_worker_ready.set()
    while True:
        func, result_queue = browser_job_queue.get()
        try:
            result_queue.put(("ok", func(login_playwright, login_contexts)))
        except Exception as error:
            result_queue.put(("error", str(error)))


def run_browser_job(func, timeout=120):
    start_browser_worker()
    result_queue = queue.Queue(maxsize=1)
    browser_job_queue.put((func, result_queue))
    try:
        status, payload = result_queue.get(timeout=timeout)
    except queue.Empty:
        raise RuntimeError("浏览器后台线程响应超时，请稍后重试")
    if status == "error":
        raise RuntimeError(payload)
    return payload


def run_isolated_browser_job(func):
    with browser_sync_semaphore:
        with sync_playwright() as active_playwright:
            return func(active_playwright, {})


def get_login_context(login_playwright, login_contexts, account_id):
    context = login_contexts.get(account_id)
    if context:
        try:
            _ = len(context.pages)
            return context
        except Exception:
            login_contexts.pop(account_id, None)
    profile_dir = account_dir(account_id) / "chrome_profile"
    try:
        context = login_playwright.chromium.launch_persistent_context(
            user_data_dir=str(profile_dir),
            channel="chrome",
            headless=False,
            args=["--start-maximized"],
        )
    except Exception:
        context = login_playwright.chromium.launch_persistent_context(
            user_data_dir=str(profile_dir),
            headless=False,
            args=["--start-maximized"],
        )
    login_contexts[account_id] = context
    return context


def reset_login_context(login_contexts, account_id):
    context = login_contexts.pop(account_id, None)
    if context:
        try:
            context.close()
        except Exception:
            pass


def get_login_page(login_playwright, login_contexts, account_id):
    last_error = None
    for _ in range(2):
        context = get_login_context(login_playwright, login_contexts, account_id)
        try:
            pages = context.pages
            return context, pages[0] if pages else context.new_page()
        except Exception as error:
            last_error = error
            reset_login_context(login_contexts, account_id)
    raise last_error or RuntimeError("打开登录窗口失败")


def start_login(account_id, channel="ctrip", account_name="", shop_name="", phone="", remark=""):
    existing_meta = read_account_meta(account_id)
    meta = write_account_meta(account_id, {
        "channel": normalize_channel(channel),
        "name": account_name,
        "shopName": shop_name,
        "phone": phone,
        "remark": remark,
        "createdAt": existing_meta.get("createdAt") or now_text(),
    })
    login_url = meta.get("loginUrl") or LOGIN_URL
    if channel_uses_manual_chrome(meta.get("channel")):
        return launch_manual_chrome(account_id, login_url)
    def job(login_playwright, login_contexts):
        _, page = get_login_page(login_playwright, login_contexts, account_id)
        page.goto(login_url, wait_until="domcontentloaded")
        try:
            page.bring_to_front()
        except Exception:
            pass
        return {"ok": True, "accountId": account_id, "channel": meta.get("channel"), "channelLabel": meta.get("channelLabel"), "loginUrl": login_url}
    return run_browser_job(job)


def capture_session(account_id, channel="", account_name="", shop_name="", phone="", remark=""):
    if channel or account_name or shop_name or phone or remark:
        write_account_meta(account_id, {
            "channel": normalize_channel(channel) if channel else None,
            "name": account_name,
            "shopName": shop_name,
            "phone": phone,
            "remark": remark,
        })
    def job(login_playwright, login_contexts):
        meta = read_account_meta(account_id)
        if channel_uses_manual_chrome(meta.get("channel")):
            return capture_manual_chrome_session(account_id, login_playwright)
        last_error = None
        for _ in range(2):
            context = get_login_context(login_playwright, login_contexts, account_id)
            try:
                cookies = context.cookies()
                storage_path = account_dir(account_id) / "storage_state.json"
                context.storage_state(path=str(storage_path))
                return summary_from_cookies(account_id, cookies)
            except Exception as error:
                last_error = error
                reset_login_context(login_contexts, account_id)
        raise last_error or RuntimeError("检查 Cookie 失败")
    return run_browser_job(job)



def next_product_page(page):
    selectors = [
        "li.ant-pagination-next:not(.ant-pagination-disabled) button",
        "li.ant-pagination-next:not(.ant-pagination-disabled)",
        "[title='下一页']:not(.ant-pagination-disabled)",
    ]
    for selector in selectors:
        locator = page.locator(selector)
        if locator.count():
            locator.first.click(force=True, timeout=8000)
            page.wait_for_timeout(1800)
            return True
    return False


def sync_products_in_browser(active_playwright, account_id, max_pages=30):
    browser = None
    context = None
    products = []
    seen = set()
    total_hint = 0
    try:
        storage_path = account_dir(account_id) / "storage_state.json"
        browser = active_playwright.chromium.launch(channel="chrome", headless=True)
        context = browser.new_context(
            storage_state=str(storage_path) if storage_path.exists() else None,
            viewport={"width": 1440, "height": 1000},
            locale="zh-CN",
            timezone_id="Asia/Shanghai",
        )
        page = context.new_page()
        page.goto(PRODUCT_LIST_URL, wait_until="domcontentloaded", timeout=60000)
        page.wait_for_timeout(3000)
        for page_no in range(1, max_pages + 1):
            text = page.locator("body").inner_text(timeout=15000)
            total_match = re.search(r"共\s*(\d+)\s*条", text)
            if total_match:
                total_hint = int(total_match.group(1))
            for product in parse_product_text(text):
                if product["productId"] not in seen:
                    seen.add(product["productId"])
                    product["pageNo"] = page_no
                    products.append(product)
            partial_payload = {
                "accountId": account_id,
                "total": len(products),
                "totalHint": total_hint,
                "syncedAt": now_text(),
                "sourceUrl": PRODUCT_LIST_URL,
                "products": products,
            }
            products_file(account_id).write_text(json.dumps(partial_payload, ensure_ascii=False, indent=2), encoding="utf-8")
            if total_hint and len(products) >= total_hint:
                break
            if not next_product_page(page):
                break
        payload = {
            "accountId": account_id,
            "total": len(products),
            "totalHint": total_hint,
            "syncedAt": now_text(),
            "sourceUrl": PRODUCT_LIST_URL,
            "products": products,
        }
        products_file(account_id).write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        return payload
    finally:
        if context:
            context.close()
        if browser:
            browser.close()


def sync_products(account_id, max_pages=30):
    channel = read_account_meta(account_id).get("channel")
    if channel == "douyin_life":
        return run_isolated_browser_job(
            lambda active_playwright, _contexts: sync_douyin_products_in_browser(active_playwright, account_id, max_pages=max_pages),
        )
    if channel == "fliggy":
        return run_isolated_browser_job(
            lambda active_playwright, _contexts: sync_fliggy_products_in_browser(active_playwright, account_id, max_pages=max_pages),
        )
    if channel == "meituan":
        return run_isolated_browser_job(
            lambda active_playwright, _contexts: sync_meituan_products_in_browser(active_playwright, account_id, max_pages=max_pages),
        )
    if channel == "tongcheng":
        return run_isolated_browser_job(
            lambda active_playwright, _contexts: sync_tongcheng_products_in_browser(active_playwright, account_id, max_pages=max_pages),
        )
    return run_isolated_browser_job(
        lambda active_playwright, _contexts: sync_products_in_browser(active_playwright, account_id, max_pages=max_pages),
    )


def fliggy_full_url(url):
    if not url:
        return ""
    if url.startswith("//"):
        return "https:" + url
    if url.startswith("http:///"):
        return "https://" + url[len("http:///"):]
    if url.startswith("http://") or url.startswith("https://"):
        return url
    return url


def fliggy_text_list(values):
    return " · ".join(clean_line(str(value or "")) for value in values or [] if clean_line(str(value or "")))


def fliggy_item_status_from_tags(tags):
    labels = [str(tag.get("text") or "") for tag in tags or [] if isinstance(tag, dict)]
    tips = [str(tag.get("tip") or "") for tag in tags or [] if isinstance(tag, dict)]
    return " ".join(labels + tips)


def fliggy_fetch_item_list(page, page_no=1, size=50, tab="onsale"):
    return page.evaluate(
        """
        async ({ url, pageNo, size, tab }) => {
          const token = document.querySelector('input[name="_tb_token_"]')?.value
            || (document.cookie.match(/_tb_token_=([^;]+)/) || [])[1]
            || "";
          const form = new FormData();
          form.append("_tb_token_", token);
          form.append("page", String(pageNo));
          form.append("size", String(size));
          form.append("tab", tab);
          const response = await fetch(url, {
            method: "POST",
            credentials: "include",
            body: form,
          });
          return await response.json();
        }
        """,
        {"url": FLIGGY_ITEM_LIST_URL, "pageNo": page_no, "size": size, "tab": tab},
    )


def map_fliggy_product(item):
    item_id = str(item.get("itemId") or "")
    title = clean_line(str(item.get("title") or item.get("showTitle") or ""))
    short_title = clean_line(str(item.get("showTitle") or title))
    features = item.get("travelFeatures") or []
    location = fliggy_text_list(features)
    tags_text = fliggy_item_status_from_tags(item.get("tags") or [])
    price = as_number(item.get("price"))
    quantity = int(as_number(item.get("quantity")) or 0)
    sold_text = str(item.get("soldQuantity") or "0")
    sold_qty = int(re.sub(r"\D+", "", sold_text) or 0)
    category = "飞猪玩乐"
    if "行程天数:1天" in location:
        category = "一日游"
    elif item.get("categoryId"):
        category = f"类目 {item.get('categoryId')}"
    sku = {
        "id": item_id,
        "skuId": item_id,
        "packageId": item_id,
        "resourceId": item_id,
        "name": short_title,
        "packageName": short_title,
        "resourceName": short_title,
        "skuSource": "fliggy_item_list",
        "price": price,
        "originPrice": price,
        "stock": quantity,
        "stockText": str(quantity),
        "soldQty": sold_qty,
        "state": "在售",
        "rowText": f"售价 {price:g} / 库存 {quantity} / 销量 {sold_text}",
    }
    return {
        "productId": item_id,
        "id": item_id,
        "title": title,
        "category": category,
        "venue": short_title,
        "location": location,
        "saleStatus": "出售中",
        "onSaleResourceCount": 1,
        "offSaleResourceCount": 0,
        "auditStatus": "出售中",
        "infoStatus": "健康",
        "channel": "fliggy",
        "source": "fliggy",
        "sourceUrl": FLIGGY_ONSALE_URL,
        "soldStart": "",
        "soldEnd": str(item.get("endDate") or "").split(" ")[0],
        "stockTotal": quantity,
        "soldQty": sold_qty,
        "skus": [sku],
        "skuSyncStatus": "待同步库存",
        "skuSyncedAt": "",
        "syncedAt": now_text(),
        "raw": {
            "categoryId": item.get("categoryId"),
            "travelItemId": item.get("travelItemId"),
            "businessType": item.get("businessType"),
            "tags": tags_text,
            "gmtCreate": item.get("gmtCreate"),
            "gmtModified": item.get("gmtModified"),
            "detailUrl": fliggy_full_url(item.get("detailUrl") or item.get("pcDetailUrl")),
            "stockUrl": FLIGGY_STOCK_URL.format(item_id=item_id),
        },
    }


def sync_fliggy_products_in_browser(active_playwright, account_id, max_pages=30):
    browser = None
    context = None
    try:
        storage_path = account_dir(account_id) / "storage_state.json"
        browser = active_playwright.chromium.launch(channel="chrome", headless=True)
        context = browser.new_context(
            storage_state=str(storage_path) if storage_path.exists() else None,
            viewport={"width": 1440, "height": 1000},
            locale="zh-CN",
            timezone_id="Asia/Shanghai",
        )
        page = context.new_page()
        page.goto(FLIGGY_ONSALE_URL, wait_until="domcontentloaded", timeout=60000)
        page.wait_for_timeout(8000)
        products = []
        seen = set()
        total_hint = 0
        page_size = 50
        for page_no in range(1, max_pages + 1):
            data = fliggy_fetch_item_list(page, page_no=page_no, size=page_size)
            if not data.get("success"):
                raise RuntimeError(data.get("errorMsg") or data.get("msg") or "飞猪产品列表接口失败")
            result = data.get("result") or {}
            total_hint = int(result.get("total") or total_hint or 0)
            rows = result.get("items") or []
            for row in rows:
                product = map_fliggy_product(row)
                product_id = product.get("productId")
                if product_id and product_id not in seen:
                    seen.add(product_id)
                    product["pageNo"] = page_no
                    products.append(product)
            payload = {
                "accountId": account_id,
                "channel": "fliggy",
                "total": len(products),
                "totalHint": total_hint,
                "syncedAt": now_text(),
                "sourceUrl": FLIGGY_ONSALE_URL,
                "products": products,
            }
            products_file(account_id).write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
            if not rows or (total_hint and len(products) >= total_hint):
                break
        return payload
    finally:
        if context:
            context.close()
        if browser:
            browser.close()


DOUYIN_ALL_SELECTED_PARAMS = json.dumps({
    "SearchAllAccountPoiType": 0,
    "ExpandToPoiAccount": True,
    "SearchAllAccountPoiStatus": 0,
    "RelationTypes": [1, 8, 10, 12],
    "SettleStatusBeforeClaim": [],
    "PermissionKeyList": ["hermes.goods.product_create"],
    "Selections": [],
}, ensure_ascii=False, separators=(",", ":"))

DOUYIN_PRODUCT_TABS = [
    (9, 5, "已上架", "全部售卖中"),
    (11, 5, "违规即将下架", "部分售卖中"),
    (5, 5, "审核中", "部分售卖中"),
    (8, 5, "待商家审核", "部分售卖中"),
    (4, 5, "审核驳回", "全部不在售"),
    (3, 5, "已下架", "全部不在售"),
    (7, 5, "草稿箱", "全部不在售"),
]


def money_from_cent(value):
    try:
        return round(float(value or 0) / 100, 2)
    except Exception:
        return 0


def douyin_context_params(page):
    page.goto(DOUYIN_HOME_URL, wait_until="domcontentloaded", timeout=60000)
    page.wait_for_timeout(5000)
    state = page.evaluate("""
    () => {
      const roots = [];
      try {
        const raw = localStorage.getItem("root_life_account_id");
        if (raw) {
          const parsed = JSON.parse(raw);
          Object.values(parsed || {}).forEach(value => value && roots.push(String(value)));
        }
      } catch (error) {}
      const urls = performance.getEntriesByType("resource").map(item => item.name).concat([location.href]);
      const rootFromUrl = urls.map(url => (url.match(/root_life_account_id=(\\d+)/) || [])[1]).filter(Boolean);
      const groupFromUrl = urls.map(url => (url.match(/(?:groupid|groupId|accountId)=(\\d+)/) || [])[1]).filter(Boolean);
      return {
        rootLifeAccountId: roots[0] || rootFromUrl[0] || "",
        groupId: groupFromUrl[0] || "",
        url: location.href,
      };
    }
    """)
    if not state.get("rootLifeAccountId"):
        raise RuntimeError("未识别到抖音来客 root_life_account_id，请先重新检查 Cookie")
    return state


def douyin_product_payload(cursor="0", count=50, list_tab=9, sub_filter_status=5):
    return {
        "sorter": {"search_sort_by": 2, "desc": True},
        "page": {"cursor": str(cursor), "count": count},
        "data_access": {
            "perm_point_keys": [
                "default/list/view-online",
                "default/list/booking_stock-online",
                "default/list/calendar_stock-online",
                "default/list/batch_check_box-online",
                "default/list/copy_id-online",
                "default/list/edit_stock-online",
            ],
            "from_platform": 1,
        },
        "search_param": {
            "appointment_type": 0,
            "only_self_product": False,
            "need_attach_assignment": True,
            "need_bind_times_card": True,
            "exclude_poi_info": True,
            "list_tab": list_tab,
            "sub_filter_status": sub_filter_status,
            "category_ids": [],
            "SourceView": 100,
            "search_param_str": DOUYIN_ALL_SELECTED_PARAMS,
        },
        "permission_common_param": {
            "all_selected_params": DOUYIN_ALL_SELECTED_PARAMS,
        },
    }


def douyin_fetch_json(page, path, payload=None, root_life_account_id=""):
    separator = "&" if "?" in path else "?"
    url = f"{path}{separator}root_life_account_id={root_life_account_id}&life_biz_view_id=22&life_account_biz_ids="
    return page.evaluate(
        """
        async ({ url, payload }) => {
          const options = payload
            ? { method: "POST", credentials: "include", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) }
            : { method: "GET", credentials: "include" };
          const response = await fetch(url, options);
          const text = await response.text();
          try { return JSON.parse(text); } catch (error) { return { status_code: response.status, raw: text }; }
        }
        """,
        {"url": url, "payload": payload},
    )


def douyin_status_ok(data):
    base = data.get("BaseResp") or {}
    return data.get("status_code", 0) == 0 and base.get("StatusCode", 0) == 0


def douyin_format_date(timestamp):
    try:
        if not timestamp:
            return ""
        return datetime.fromtimestamp(int(timestamp)).strftime("%Y-%m-%d")
    except Exception:
        return ""


def map_douyin_product(item, tab_label, sale_label):
    product = item.get("product") or {}
    product_id = str(product.get("product_id") or "")
    category = str(product.get("category_full_name") or "").split("·")[-1] or product.get("category_full_name") or "团购商品"
    mini = item.get("mini_manage_account_info") or {}
    skus = []
    total_stock = 0
    sold_qty = 0
    for sku in item.get("sku_list") or []:
        sku_id = str(sku.get("sku_id") or product_id)
        stock_num = sku.get("stock_num")
        stock_limit_type = sku.get("stock_qty_limit_type")
        if stock_limit_type == 2 or stock_num == 10000000000:
            stock_text = "不限"
            normalized_stock = 0
        else:
            normalized_stock = int(stock_num or 0)
            stock_text = str(normalized_stock)
            total_stock += normalized_stock
        sold = int(sku.get("sold_qty") or 0)
        sold_qty += sold
        resource_id = sku_id
        bind_list = sku.get("bind_sku_list") or []
        if bind_list and bind_list[0].get("sku_ids"):
            resource_id = str(bind_list[0]["sku_ids"][0])
        skus.append({
            "id": sku_id,
            "skuId": sku_id,
            "packageId": product_id,
            "resourceId": resource_id,
            "name": product.get("product_name") or sku_id,
            "packageName": product.get("product_name") or "",
            "resourceName": product.get("product_name") or "",
            "skuSource": "douyin_goods_list",
            "price": money_from_cent(sku.get("actual_amount")),
            "originPrice": money_from_cent(sku.get("origin_amount")),
            "stock": normalized_stock,
            "stockText": stock_text,
            "soldQty": sold,
            "state": "在售" if "售卖" in sale_label else "不在售",
            "rowText": f"售价 {money_from_cent(sku.get('actual_amount'))} / 库存 {stock_text} / 已售 {sold}",
        })
    on_sale = len(skus) if "售卖" in sale_label else 0
    off_sale = 0 if "售卖" in sale_label else len(skus)
    return {
        "productId": product_id,
        "id": product_id,
        "title": product.get("product_name") or "",
        "category": category,
        "venue": mini.get("account_name") or "",
        "location": product.get("category_full_name") or "",
        "saleStatus": tab_label,
        "onSaleResourceCount": on_sale,
        "offSaleResourceCount": off_sale,
        "auditStatus": tab_label,
        "infoStatus": "健康" if "驳回" not in tab_label else "需优化",
        "channel": "douyin_life",
        "source": "douyin_life",
        "sourceUrl": DOUYIN_GOODS_LIST_URL,
        "poiCount": item.get("poi_count") or 0,
        "soldStart": douyin_format_date(product.get("sold_start_time")),
        "soldEnd": douyin_format_date(product.get("sold_end_time")),
        "stockTotal": total_stock,
        "soldQty": sold_qty,
        "skus": skus,
        "skuSyncStatus": "已同步明细",
        "skuSyncedAt": now_text(),
        "syncedAt": now_text(),
        "raw": {
            "status": item.get("status"),
            "productType": product.get("product_type"),
            "productSubType": product.get("product_sub_type"),
        },
    }


def sync_douyin_products_in_browser(active_playwright, account_id, max_pages=30):
    browser = None
    context = None
    try:
        storage_path = account_dir(account_id) / "storage_state.json"
        browser = active_playwright.chromium.launch(channel="chrome", headless=True)
        context = browser.new_context(
            storage_state=str(storage_path) if storage_path.exists() else None,
            viewport={"width": 1440, "height": 1000},
            locale="zh-CN",
            timezone_id="Asia/Shanghai",
        )
        page = context.new_page()
        ctx = douyin_context_params(page)
        root_id = ctx["rootLifeAccountId"]
        products = []
        seen = set()
        counts = {}
        try:
            count_data = douyin_fetch_json(
                page,
                "/life/tobias/merge/products/count",
                {
                    "search_param": {
                        "need_bind_times_card": True,
                        "exclude_poi_info": True,
                        "list_tab": 9,
                        "sub_filter_status": 5,
                        "category_ids": [],
                        "need_attach_assignment": True,
                        "appointment_type": 0,
                        "only_self_product": False,
                        "SourceView": 100,
                        "search_param_str": DOUYIN_ALL_SELECTED_PARAMS,
                        "need_times_card_bind": True,
                    },
                    "permission_common_param": {"all_selected_params": DOUYIN_ALL_SELECTED_PARAMS},
                },
                root_id,
            )
            counts = count_data.get("count_map") or {}
        except Exception:
            counts = {}
        for list_tab, sub_status, tab_label, sale_label in DOUYIN_PRODUCT_TABS:
            cursor = "0"
            for page_no in range(1, max_pages + 1):
                data = douyin_fetch_json(
                    page,
                    "/life/tobias/merge/products/list",
                    douyin_product_payload(cursor=cursor, count=50, list_tab=list_tab, sub_filter_status=sub_status),
                    root_id,
                )
                if not douyin_status_ok(data):
                    break
                rows = data.get("product_detail_list") or []
                for row in rows:
                    product = map_douyin_product(row, tab_label, sale_label)
                    if product["productId"] and product["productId"] not in seen:
                        seen.add(product["productId"])
                        product["pageNo"] = page_no
                        products.append(product)
                next_cursor = str(data.get("cursor") or "")
                if not rows or not next_cursor or next_cursor == cursor:
                    break
                cursor = next_cursor
        payload = {
            "accountId": account_id,
            "channel": "douyin_life",
            "total": len(products),
            "totalHint": sum(int(value or 0) for value in counts.values()) if counts else len(products),
            "statusCounts": counts,
            "syncedAt": now_text(),
            "sourceUrl": DOUYIN_GOODS_LIST_URL,
            "context": ctx,
            "products": products,
        }
        products_file(account_id).write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        return payload
    finally:
        if context:
            context.close()
        if browser:
            browser.close()


TONGCHENG_PRODUCT_LIST_PAYLOAD = {
    "productName": "",
    "productSecondCategoryId": "-1",
    "productNo": "",
    "saleStatus": "-1",
    "auditStatus": "-1",
    "journeyDays": "-1",
    "explainType": None,
    "leavePortCityId": "",
    "destinationCityId": "",
    "productCategoryIdList": [],
    "poiId": "",
    "poiName": "",
    "supplierProductName": "",
    "supplierProductNo": "",
    "futureDaysOffline": "",
}

TONGCHENG_SALE_STATUS = {
    0: "不在售",
    1: "售卖中",
}

TONGCHENG_AUDIT_STATUS = {
    0: "未提交",
    1: "待审核",
    2: "审核通过",
    3: "审核驳回",
}


def tongcheng_fetch_json(page, path, payload=None, method=None):
    return page.evaluate(
        """
        async ({ path, payload, method }) => {
          const options = {
            method: method || (payload ? "POST" : "GET"),
            credentials: "include",
            headers: payload ? { "content-type": "application/json" } : {},
          };
          if (payload) options.body = JSON.stringify(payload);
          const response = await fetch(path, options);
          const text = await response.text();
          try { return JSON.parse(text); } catch (error) { return { code: response.status, msg: text }; }
        }
        """,
        {"path": path, "payload": payload, "method": method},
    )


def tongcheng_status_label(mapping, value, default=""):
    try:
        return mapping.get(int(value), default or str(value))
    except Exception:
        return default or str(value or "")


def map_tongcheng_product(item):
    product_no = str(item.get("productNo") or "")
    internal_id = str(item.get("productId") or "")
    category = " / ".join(
        clean_line(str(value or ""))
        for value in (item.get("firstCategoryName"), item.get("secondCategoryName"))
        if clean_line(str(value or ""))
    )
    sale_status = tongcheng_status_label(TONGCHENG_SALE_STATUS, item.get("saleStatus"), "未知")
    audit_status = tongcheng_status_label(TONGCHENG_AUDIT_STATUS, item.get("auditStatus"), "未知")
    return {
        "productId": product_no or internal_id,
        "id": product_no or internal_id,
        "internalProductId": internal_id,
        "title": clean_line(str(item.get("productName") or "")),
        "category": category or "日游玩乐",
        "venue": clean_line(str(item.get("subTitle") or "")),
        "location": clean_line(str(item.get("departureCity") or item.get("leavePortCity") or "")),
        "saleStatus": sale_status,
        "onSaleResourceCount": 1 if sale_status == "售卖中" else 0,
        "offSaleResourceCount": 0 if sale_status == "售卖中" else 1,
        "auditStatus": audit_status,
        "infoStatus": "健康" if audit_status == "审核通过" else audit_status,
        "channel": "tongcheng",
        "source": "tongcheng",
        "sourceUrl": TONGCHENG_PRODUCT_LIST_URL,
        "soldStart": "",
        "soldEnd": "",
        "stockTotal": 0,
        "soldQty": 0,
        "skus": [],
        "skuSyncStatus": "待同步库存",
        "skuSyncedAt": "",
        "syncedAt": now_text(),
        "raw": {
            "supplierId": item.get("supplierId"),
            "firstCategoryId": item.get("firstCategoryId"),
            "secondCategoryId": item.get("secondCategoryId"),
            "productNo": product_no,
            "productId": internal_id,
            "minSellPrice": item.get("minSellPrice"),
            "minPriceDate": item.get("minPriceDate"),
            "maxPriceDate": item.get("maxPriceDate"),
            "canNotAdvanceReasonDesc": item.get("canNotAdvanceReasonDesc"),
            "tagNameList": item.get("tagNameList") or [],
            "updateDate": item.get("updateDate"),
        },
    }


def sync_tongcheng_products_in_browser(active_playwright, account_id, max_pages=30):
    browser = None
    context = None
    try:
        storage_path = account_dir(account_id) / "storage_state.json"
        browser = active_playwright.chromium.launch(channel="chrome", headless=True)
        context = browser.new_context(
            storage_state=str(storage_path) if storage_path.exists() else None,
            viewport={"width": 1440, "height": 1000},
            locale="zh-CN",
            timezone_id="Asia/Shanghai",
        )
        page = context.new_page()
        page.goto(TONGCHENG_PRODUCT_LIST_URL, wait_until="networkidle", timeout=90000)
        page.wait_for_timeout(1200)
        products = []
        seen = set()
        total_hint = 0
        page_size = 50
        state_counts = {}
        for page_no in range(1, max_pages + 1):
            payload = dict(TONGCHENG_PRODUCT_LIST_PAYLOAD)
            payload.update({"pgNum": page_no, "pgSize": page_size})
            data = tongcheng_fetch_json(page, "/localactivity/product/queryList", payload)
            if str(data.get("code")) != "200":
                raise RuntimeError(data.get("msg") or "同程产品列表接口失败")
            body = data.get("data") or {}
            total_hint = int(body.get("totalCount") or total_hint or 0)
            state_counts = body.get("stateList") or state_counts
            rows = body.get("productList") or []
            for row in rows:
                product = map_tongcheng_product(row)
                product_id = product.get("productId")
                if product_id and product_id not in seen:
                    seen.add(product_id)
                    product["pageNo"] = page_no
                    products.append(product)
            payload_data = {
                "accountId": account_id,
                "channel": "tongcheng",
                "total": len(products),
                "totalHint": total_hint,
                "statusCounts": state_counts,
                "syncedAt": now_text(),
                "sourceUrl": TONGCHENG_PRODUCT_LIST_URL,
                "products": products,
            }
            products_file(account_id).write_text(json.dumps(payload_data, ensure_ascii=False, indent=2), encoding="utf-8")
            if not rows or (total_hint and len(products) >= total_hint):
                break
            page.wait_for_timeout(300)
        return payload_data
    finally:
        if context:
            context.close()
        if browser:
            browser.close()


def tongcheng_month_periods(months=3):
    today = datetime.now().date()
    periods = []
    cursor = today.replace(day=1)
    for _ in range(months):
        periods.append({"year": cursor.year, "month": cursor.month})
        cursor = (cursor.replace(day=28) + timedelta(days=4)).replace(day=1)
    return periods


def tongcheng_price_stock_summary(days):
    open_days = [day for day in days if day.get("sale")]
    stocks = [day.get("unUsed") for day in days if isinstance(day.get("unUsed"), (int, float))]
    prices = [day.get("salePrice") for day in days if isinstance(day.get("salePrice"), (int, float)) and day.get("salePrice") > 0]
    return {
        "rowCount": len(days),
        "dateCount": len({day.get("day") for day in days if day.get("day")}),
        "openCount": len(open_days),
        "closedCount": len(days) - len(open_days),
        "minStock": min(stocks) if stocks else None,
        "maxStock": max(stocks) if stocks else None,
        "minPrice": min(prices) if prices else None,
        "maxPrice": max(prices) if prices else None,
        "sampleStart": min((day.get("day") for day in days if day.get("day")), default=""),
        "sampleEnd": max((day.get("day") for day in days if day.get("day")), default=""),
    }


def tongcheng_parse_day_key(value):
    text = str(value or "")
    match = re.search(r"(\d{4})-(\d{2})-(\d{2})", text)
    if match:
        return "".join(match.groups())
    return text[:10].replace("-", "")


def tongcheng_flatten_price_days(price_data):
    days = []
    for week in price_data or []:
        for item in week or []:
            price_rows = item.get("priceList") or []
            row = price_rows[0] if price_rows else {}
            day_key = tongcheng_parse_day_key(item.get("date") or row.get("priceDate"))
            if not day_key:
                continue
            total = row.get("stockTotalNum")
            used = row.get("stockUseNum") or 0
            unused = None
            if isinstance(total, (int, float)):
                unused = max(total - used, 0) if isinstance(used, (int, float)) else total
            sale = bool(row.get("isCanSell")) and row.get("sellPrice") not in (None, "")
            days.append({
                "day": day_key,
                "sale": sale,
                "stockSale": sale,
                "salePrice": as_number(row.get("sellPrice")),
                "costPrice": as_number(row.get("settlementPrice")),
                "total": total,
                "unUsed": unused,
                "used": used,
                "raw": row,
            })
    return days


def tongcheng_sync_product_price_stock(page, product):
    internal_id = str(product.get("internalProductId") or (product.get("raw") or {}).get("productId") or "")
    if not internal_id:
        raise RuntimeError("缺少同程内部产品 ID，请先重新同步产品")
    sub_data = tongcheng_fetch_json(page, "/localactivity/resource/subResource/selectSubResourceList", {
        "mainResourceId": internal_id,
        "hasSku": True,
    })
    if str(sub_data.get("code")) != "200":
        raise RuntimeError(sub_data.get("msg") or "同程场次接口失败")
    sub_resources = sub_data.get("data") or []
    if not sub_resources:
        raise RuntimeError("同程产品没有可同步的场次")
    try:
        setmeal_data = tongcheng_fetch_json(page, f"/localactivity/resource/setmeal/selectSetmealResourceListNew?mainResourceId={internal_id}")
    except Exception:
        setmeal_data = {}
    setmeal_lookup = {}
    for row in setmeal_data.get("rows") or []:
        key = str(row.get("subResourceId") or row.get("masterSubResourceId") or "")
        if key:
            setmeal_lookup[key] = row
    resources = []
    skus = []
    all_days = []
    for sub_resource in sub_resources:
        sub_id = str(sub_resource.get("id") or "")
        if not sub_id:
            continue
        sku_data = tongcheng_fetch_json(page, f"/localactivity/resource/subResource/selectSkuBySubResourceId?subResourceId={sub_id}")
        if str(sku_data.get("code")) != "200":
            raise RuntimeError(sku_data.get("msg") or f"同程 SKU 接口失败：{sub_id}")
        for sku in sku_data.get("data") or []:
            sku_id = str(sku.get("id") or "")
            if not sku_id:
                continue
            days = []
            for period in tongcheng_month_periods(3):
                price_data = tongcheng_fetch_json(page, "/localactivity/resource/skuPrice/selectPriceList", {
                    "subResourceId": int(sub_id),
                    "skuResourceId": int(sku_id),
                    "year": period["year"],
                    "month": period["month"],
                    "subSupplierId": "",
                })
                if str(price_data.get("code")) != "200":
                    raise RuntimeError(price_data.get("msg") or f"同程库存日历接口失败：{sku_id}")
                days.extend(tongcheng_flatten_price_days(price_data.get("data") or []))
                page.wait_for_timeout(120)
            seen_days = {}
            for day in days:
                seen_days[day["day"]] = day
            days = [seen_days[key] for key in sorted(seen_days)]
            summary = tongcheng_price_stock_summary(days)
            setmeal = setmeal_lookup.get(sub_id) or {}
            package_name = clean_line(str(setmeal.get("setmealName") or sub_resource.get("title") or sub_resource.get("serialId") or ""))
            resource_name = clean_line(str(sku.get("name") or package_name or sku.get("serialId") or ""))
            resources.append({
                "packageId": sub_resource.get("serialId") or sub_id,
                "resourceId": sku.get("serialId") or sku_id,
                "packageName": package_name,
                "resourceName": resource_name,
                "summary": summary,
                "days": days,
                "raw": {
                    "subResourceId": sub_id,
                    "skuResourceId": sku_id,
                    "setmealResourceId": setmeal.get("setmealResourceId"),
                },
            })
            all_days.extend(days)
            stock_total = max((day.get("unUsed") or 0 for day in days), default=0)
            prices = [day.get("salePrice") for day in days if day.get("salePrice")]
            price = min(prices) if prices else as_number(sku.get("minSellPrice"))
            skus.append({
                "id": sku.get("serialId") or sku_id,
                "skuId": sku.get("serialId") or sku_id,
                "packageId": sub_resource.get("serialId") or sub_id,
                "resourceId": sku.get("serialId") or sku_id,
                "name": resource_name,
                "packageName": package_name,
                "resourceName": resource_name,
                "skuSource": "tongcheng_price_calendar",
                "price": price,
                "originPrice": as_number(sku.get("marketPrice")) or price,
                "stock": stock_total,
                "stockText": str(stock_total),
                "soldQty": 0,
                "state": "在售" if summary.get("openCount") else "不在售",
                "rowText": f"{resource_name} / 价格 {price:g} / 库存 {stock_total}",
                "raw": {
                    "subResourceId": sub_id,
                    "skuResourceId": sku_id,
                    "subResourceSerialId": sub_resource.get("serialId"),
                    "skuSerialId": sku.get("serialId"),
                },
            })
    if not resources:
        raise RuntimeError("同程库存页没有解析到 SKU / 库存")
    summary = tongcheng_price_stock_summary(all_days)
    return {
        "skus": skus,
        "priceStock": {
            "status": "成功",
            "syncedAt": now_text(),
            "source": "tongcheng_price_calendar",
            "datePeriods": tongcheng_month_periods(3),
            "summary": {**summary, "resourceCount": len(resources)},
            "resources": resources,
            "raw": {
                "mainResourceId": internal_id,
                "subResourceCount": len(sub_resources),
            },
        },
    }


def sync_tongcheng_product_price_stock_in_browser(active_playwright, account_id, max_products=0, product_id_filter="", category_filter=""):
    data = read_products(account_id)
    products = data.get("products") or []
    if not products:
        data = sync_tongcheng_products_in_browser(active_playwright, account_id, max_pages=80)
        products = data.get("products") or []
    if product_id_filter:
        wanted = set(split_ids(product_id_filter))
        products = [
            product for product in products
            if str(product.get("productId") or product.get("id")) in wanted
            or str(product.get("internalProductId") or "") in wanted
        ]
    if category_filter:
        products = [product for product in products if category_filter in str(product.get("category") or "")]
    if max_products:
        products = products[:max_products]
    browser = None
    context = None
    progress = {"total": len(products), "processed": 0, "synced": 0, "failed": 0, "skipped": 0}
    try:
        storage_path = account_dir(account_id) / "storage_state.json"
        browser = active_playwright.chromium.launch(channel="chrome", headless=True)
        context = browser.new_context(
            storage_state=str(storage_path) if storage_path.exists() else None,
            viewport={"width": 1440, "height": 1000},
            locale="zh-CN",
            timezone_id="Asia/Shanghai",
        )
        page = context.new_page()
        page.goto(TONGCHENG_PRODUCT_LIST_URL, wait_until="networkidle", timeout=90000)
        page.wait_for_timeout(1200)
        lookup = {str(product.get("productId") or product.get("id")): product for product in data.get("products") or []}
        for product in products:
            progress["processed"] += 1
            product_id = str(product.get("productId") or product.get("id") or "")
            target = lookup.get(product_id, product)
            try:
                parsed = tongcheng_sync_product_price_stock(page, target)
                target["skus"] = parsed["skus"]
                target["onSaleResourceCount"] = len([sku for sku in parsed["skus"] if sku.get("state") == "在售"])
                target["offSaleResourceCount"] = len([sku for sku in parsed["skus"] if sku.get("state") != "在售"])
                target["stockTotal"] = sum(int(as_number(sku.get("stock")) or 0) for sku in parsed["skus"])
                target["skuSyncStatus"] = "已同步库存套餐"
                target["skuSyncedAt"] = now_text()
                target["priceStock"] = parsed["priceStock"]
                target["priceStockStatus"] = "成功"
                target["priceStockSyncedAt"] = parsed["priceStock"].get("syncedAt")
                target["priceStockError"] = ""
                progress["synced"] += 1
            except Exception as error:
                target["priceStockStatus"] = "失败"
                target["priceStockError"] = str(error)
                target["priceStockSyncedAt"] = now_text()
                progress["failed"] += 1
            data["priceStockSyncedAt"] = now_text()
            data["priceStockSyncProgress"] = dict(progress)
            products_file(account_id).write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        return {
            "ok": True,
            "accountId": account_id,
            "priceStockSyncedAt": data.get("priceStockSyncedAt", ""),
            "priceStockSyncProgress": data.get("priceStockSyncProgress", {}),
        }
    finally:
        if context:
            context.close()
        if browser:
            browser.close()


def collect_resource_nodes(node, nodes=None):
    if nodes is None:
        nodes = []
    if isinstance(node, dict):
        if node.get("id") and node.get("name") and isinstance(node.get("subResourceList"), list):
            nodes.append(node)
        for value in node.values():
            collect_resource_nodes(value, nodes)
    elif isinstance(node, list):
        for value in node:
            collect_resource_nodes(value, nodes)
    return nodes


def extract_skus_from_template(data):
    skus = []
    seen = set()
    for resource in collect_resource_nodes(data):
        package_id = str(resource.get("id") or "")
        package_name = clean_line(str(resource.get("name") or ""))
        children = resource.get("subResourceList") or []
        if children:
            for child in children:
                resource_id = str(child.get("id") or "")
                resource_name = clean_line(str(child.get("name") or ""))
                sku_id = resource_id or package_id
                if not sku_id or sku_id in seen:
                    continue
                seen.add(sku_id)
                skus.append({
                    "id": sku_id,
                    "name": " / ".join(part for part in (package_name, resource_name) if part),
                    "packageId": package_id,
                    "packageName": package_name,
                    "resourceId": resource_id,
                    "resourceName": resource_name,
                    "state": "未知",
                })
        elif package_id and package_id not in seen:
            seen.add(package_id)
            skus.append({
                "id": package_id,
                "name": package_name,
                "packageId": package_id,
                "packageName": package_name,
                "resourceId": "",
                "resourceName": "",
                "state": "未知",
            })
    return skus


def package_key_from_name(name):
    name = clean_line(str(name or ""))
    match = re.match(r"^([A-Z][A-Z0-9]?)(?:-|$)", name)
    return match.group(1) if match else name


def enrich_package_ids_from_template(skus, template_skus):
    by_key = {}
    for template_sku in template_skus:
        package_name = clean_line(template_sku.get("packageName") or template_sku.get("name") or "")
        package_id = str(template_sku.get("packageId") or template_sku.get("id") or "")
        if package_name and package_id and package_name not in by_key:
            by_key[package_name] = package_id
        package_key = package_key_from_name(package_name)
        if package_key and package_id and package_key not in by_key:
            by_key[package_key] = package_id
    for sku in skus:
        if sku.get("packageId"):
            continue
        key = package_key_from_name(sku.get("name") or sku.get("packageInventoryName") or "")
        package_id = by_key.get(key)
        if package_id:
            sku["packageId"] = package_id
            sku["packageName"] = key
    return skus


def click_price_stock_tab(page, product):
    url = product_edit_url(product)
    page.goto(url, wait_until="domcontentloaded", timeout=60000)
    page.wait_for_timeout(2500)
    for selector in [
        "text=我已仔细阅读并同意",
        "button:has-text('确 定')",
        "button:has-text('确定')",
        ".ant-modal button:has-text('确 定')",
        ".ant-modal button:has-text('确定')",
    ]:
        try:
            locator = page.locator(selector)
            if locator.count() and locator.first.is_visible(timeout=600):
                locator.first.click(force=True, timeout=3000)
                page.wait_for_timeout(800)
        except Exception:
            continue
    if "登录" in page.locator("body").inner_text(timeout=15000) and "产品" not in page.locator("body").inner_text(timeout=15000):
        raise RuntimeError("携程登录态失效，请重新登录账号")
    for selector in [
        "text=套餐&报价",
        "a:has-text('套餐&报价')",
        ".ant-tabs-tab:has-text('套餐&报价')",
        ".ant-tabs-tab:has-text('价格/库存')",
        ".ant-tabs-tab:has-text('套餐库存')",
        "a:has-text('价格/库存')",
        "[role='tab']:has-text('价格/库存')",
        "text=价格/库存",
    ]:
        try:
            locator = page.locator(selector)
            if locator.count() and locator.first.is_visible(timeout=800):
                locator.first.click(force=True, timeout=5000)
                page.wait_for_timeout(1800)
                break
        except Exception:
            continue


def normalize_package_sku_text(text):
    text = clean_line(text)
    for token in ("编辑套餐信息", "维护价格库存", "已维护", "未维护", "有效", "无效"):
        text = text.replace(token, " ")
    text = re.sub(r"\s+", " ", text).strip()
    return text


def extract_package_rows_from_page(page):
    return page.evaluate(
        """
        () => {
          const visible = (el) => {
            const rect = el.getBoundingClientRect();
            const style = window.getComputedStyle(el);
            return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
          };
          const rowLike = Array.from(document.querySelectorAll('tr.ant-table-row, .ant-table-row, [class*="package_table_tr"]'))
            .filter(visible)
            .map((row, index) => {
              const cells = Array.from(row.querySelectorAll('td,.ant-table-cell'))
                .filter(visible)
                .map(cell => (cell.innerText || cell.textContent || '').replace(/\\s+/g, ' ').trim())
                .filter(Boolean);
              const text = (row.innerText || row.textContent || '').replace(/\\s+/g, ' ').trim();
              return {index, text, cells};
            })
            .filter(row => row.text && row.text.includes('编辑套餐信息') && !row.text.includes('资源ID-'));
          return rowLike;
        }
        """
    )


def is_ttd_product(product):
    category = product.get("category", "")
    return "一日游" in category


def package_id_is_resource_id(product):
    return False


def normalize_resource_ids_for_product(product, skus):
    if not package_id_is_resource_id(product):
        return skus
    for sku in skus or []:
        package_id = str(sku.get("packageId") or "")
        if package_id and not sku.get("resourceId"):
            sku["resourceId"] = package_id
            sku["resourceName"] = sku.get("resourceName") or sku.get("packageName") or sku.get("name") or ""
            if not sku.get("id") or str(sku.get("id")) == str(sku.get("name") or ""):
                sku["id"] = package_id
    return skus


def looks_like_ttd_package_name(text):
    if not text:
        return False
    if len(text) > 90:
        return False
    if not re.match(r"^[A-Z][A-Z0-9]?-", text):
        return False
    blocked = (
        "套餐售卖设置",
        "设置价格",
        "库存",
        "复制套餐",
        "编辑套餐",
        "场次ID",
        "产品名称",
        "产品类型",
        "选择套餐",
        "批量维护",
    )
    return not any(token in text for token in blocked)


def extract_ttd_package_names_from_text(text):
    lines = [clean_line(line) for line in text.splitlines()]
    blocks = []
    for index, line in enumerate(lines):
        if line != "套餐":
            continue
        block = []
        for item in lines[index + 1:index + 90]:
            if item.startswith("套餐售卖设置") or re.match(r"^20\d{2}\s*年\s*\d+\s*月$", item):
                break
            block.append(item)
            if item in ("设置价格/库存", "开/关班"):
                break
        if any("场次ID" in item or "复制套餐" in item or "编辑套餐" in item for item in block):
            blocks.extend(block)

    names = []
    seen = set()
    for line in blocks:
        if not line:
            continue
        compact = line.replace("　", " ")
        parts = re.split(r"(?=(?:^|\s)[A-Z][A-Z0-9]?-[^\s]+)", compact)
        for part in parts:
            part = clean_line(part)
            if not part:
                continue
            part = re.sub(r"\s+\d{6,}.*$", "", part)
            part = re.split(r"\s+(?:场次ID|复制套餐|编辑套餐|套餐售卖设置|最多|提供|导游|车辆|编辑)$", part)[0]
            part = clean_line(part)
            part = re.sub(r"(\d{1,2}):\s+(\d{2})", r"\1:\2", part)
            if looks_like_ttd_package_name(part) and part not in seen:
                seen.add(part)
                names.append(part)
    return names


def extract_ttd_package_inventory_page(page, product):
    click_price_stock_tab(page, product)
    product_id = str(product.get("productId") or product.get("id") or "")
    html = page.evaluate("() => document.documentElement.innerHTML")
    skus = extract_ttd_package_resource_skus_from_html(html, product_id)
    if skus:
        return skus
    body_text = page.locator("body").inner_text(timeout=15000)
    names = extract_ttd_package_names_from_text(body_text)
    if not names:
        element_texts = page.evaluate(
            """
            () => {
              const visible = (el) => {
                const rect = el.getBoundingClientRect();
                const style = window.getComputedStyle(el);
                return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
              };
              return Array.from(document.querySelectorAll('div,span,li,p,h1,h2,h3,h4,button'))
                .filter(visible)
                .map(el => (el.innerText || el.textContent || '').replace(/\\s+/g, ' ').trim())
                .filter(text => text && text.length <= 180 && /[A-Z][A-Z0-9]?-/.test(text));
            }
            """
        )
        names = extract_ttd_package_names_from_text("\n套餐\n" + "\n".join(element_texts) + "\n场次ID")

    skus = []
    for page_index, name in enumerate(names, start=1):
        skus.append({
            "id": name,
            "productId": product_id,
            "name": name,
            "skuSource": "套餐库存",
            "packageInventoryName": name,
            "packagePage": 1,
            "packageOrder": page_index,
            "state": "未知",
        })
    return skus


def extract_ttd_package_resource_skus_from_html(html, product_id=""):
    decoder = json.JSONDecoder()
    skus = []
    seen = set()
    for match in re.finditer(r'\{"packageId":', html or ""):
        try:
            package, _ = decoder.raw_decode(html[match.start():])
        except Exception:
            continue
        if not isinstance(package, dict) or not package.get("subPkgList"):
            continue
        package_id = str(package.get("packageId") or "")
        package_code = clean_line(str(package.get("packageName") or ""))
        highlights = clean_line(str(package.get("highlights") or ""))
        package_name = "-".join(part for part in (package_code, highlights) if part)
        for sub_package in package.get("subPkgList") or []:
            sub_package_id = str(sub_package.get("subPackageId") or "")
            resources = sub_package.get("resourceProInfoList") or sub_package.get("resourceSimpleInfoList") or []
            if not resources:
                key = f"{product_id}:{package_id}:{sub_package_id}"
                if package_id and key not in seen:
                    seen.add(key)
                    skus.append({
                        "id": sub_package_id or package_id,
                        "productId": product_id,
                        "name": package_name,
                        "skuSource": "套餐库存",
                        "packageInventoryName": package_name,
                        "packageId": package_id,
                        "packageName": package_name,
                        "subPackageId": sub_package_id,
                        "resourceId": "",
                        "resourceName": "",
                        "state": "有效" if package.get("active") is True else ("无效" if package.get("active") is False else "未知"),
                    })
                continue
            for resource in resources:
                resource_id = str(resource.get("resourceId") or "")
                resource_name = clean_line(str(resource.get("resourceName") or resource.get("code") or ""))
                key = f"{product_id}:{package_id}:{sub_package_id}:{resource_id}"
                if not package_id or key in seen:
                    continue
                seen.add(key)
                skus.append({
                    "id": resource_id or sub_package_id or package_id,
                    "productId": product_id,
                    "name": " / ".join(part for part in (package_name, resource_name) if part),
                    "skuSource": "套餐库存",
                    "packageInventoryName": package_name,
                    "packageId": package_id,
                    "packageName": package_name,
                    "subPackageId": sub_package_id,
                    "resourceId": resource_id,
                    "resourceName": resource_name,
                    "quantityMin": resource.get("quantityMin"),
                    "quantityMax": resource.get("quantityMax"),
                    "state": "有效" if resource.get("active") is True and package.get("active") is not False else ("无效" if resource.get("active") is False or package.get("active") is False else "未知"),
                })
    return skus


def next_package_page(page):
    selectors = [
        "li.ant-pagination-next:not(.ant-pagination-disabled) button",
        "li.ant-pagination-next:not(.ant-pagination-disabled)",
        ".ant-pagination-next:not(.ant-pagination-disabled) button",
        ".ant-pagination-next:not(.ant-pagination-disabled)",
    ]
    for selector in selectors:
        try:
            locator = page.locator(selector)
            if locator.count() and locator.first.is_visible(timeout=500):
                before = page.locator("body").inner_text(timeout=8000)[:3000]
                locator.first.click(force=True, timeout=5000)
                page.wait_for_timeout(1600)
                after = page.locator("body").inner_text(timeout=8000)[:3000]
                return before != after
        except Exception:
            continue
    return False


def extract_skus_from_package_inventory_page(page, product):
    click_price_stock_tab(page, product)
    skus = []
    seen = set()
    page_no = 1
    for _ in range(30):
        rows = extract_package_rows_from_page(page)
        for row in rows:
            cells = [clean_line(cell) for cell in row.get("cells") or [] if clean_line(cell)]
            raw_text = clean_line(row.get("text") or "")
            sku_parts = [
                cell for cell in cells
                if cell not in ("已维护", "未维护", "有效", "无效", "编辑套餐信息")
                and "编辑套餐信息" not in cell
            ]
            name = normalize_package_sku_text(" ".join(sku_parts) or raw_text)
            if not name or name in seen:
                continue
            seen.add(name)
            state_text = "有效" if "有效" in raw_text and "无效" not in raw_text else ("无效" if "无效" in raw_text else "未知")
            skus.append({
                "id": name,
                "name": name,
                "skuSource": "套餐库存",
                "packageInventoryName": name,
                "packagePage": page_no,
                "rowText": raw_text,
                "state": state_text,
            })
        if not next_package_page(page):
            break
        page_no += 1
    return skus


def extract_skus_from_product_draft(data):
    package_info = data.get("productPackageInfo") or {}
    packages = package_info.get("packageInfoList") or package_info.get("packageResourceInfo") or []
    resource_packages = package_info.get("packageResourceInfo") or []
    skus = []
    seen = set()
    for package in resource_packages:
        package_id = str(package.get("packageId") or package.get("id") or "")
        package_name = normalize_package_sku_text(str(package.get("packageName") or package.get("name") or ""))
        resources = package.get("resourceInfoList") or package.get("resourceSimpleInfoList") or []
        for resource in resources:
            resource_id = str(resource.get("resourceId") or resource.get("id") or "")
            resource_name = normalize_package_sku_text(str(resource.get("resourceName") or resource.get("name") or ""))
            key = f"{package_id}:{resource_id or resource_name}"
            if not package_id or key in seen:
                continue
            seen.add(key)
            skus.append({
                "id": resource_id or package_id,
                "name": " / ".join(part for part in (package_name, resource_name) if part),
                "skuSource": "套餐库存",
                "packageInventoryName": package_name,
                "packageId": package_id,
                "packageName": package_name,
                "resourceId": resource_id,
                "resourceName": resource_name,
                "quantityMin": resource.get("quantityMin"),
                "quantityMax": resource.get("quantityMax"),
                "state": "有效" if resource.get("active") is True and package.get("active") is not False else ("无效" if resource.get("active") is False or package.get("active") is False else "未知"),
            })
    if skus:
        return skus
    for package in packages:
        package_id = str(package.get("packageId") or package.get("id") or "")
        package_name = normalize_package_sku_text(str(package.get("packageName") or package.get("name") or ""))
        if not package_name:
            continue
        key = package_name
        if key in seen:
            continue
        seen.add(key)
        skus.append({
            "id": key,
            "name": package_name,
            "skuSource": "套餐库存",
            "packageInventoryName": package_name,
            "packageId": package_id,
            "packageName": package_name,
            "resourceId": "",
            "resourceName": "",
            "state": "有效" if package.get("active") is True else ("无效" if package.get("active") is False else "未知"),
        })
    return skus


def fetch_package_inventory_skus(page, product_id):
    data = call_vbooking_api(
        page,
        "getProductDraft",
        {
            "productId": int(product_id),
            "draftTypes": ["ProductInfo", "PackageInfo"],
            "requestBaseData": {
                "extParameterList": [
                    {"key": "page_version", "value": "5.3"},
                    {"key": "needValidatePermission", "value": "true"},
                ]
            },
        },
    )
    return extract_skus_from_product_draft(data)


def sync_product_skus_in_browser(active_playwright, account_id, max_products=0, product_id_filter="", category_filter="", fallback_only=False):
    data = read_products(account_id)
    products = data.get("products", [])
    if product_id_filter:
        products = [
            product for product in products
            if str(product.get("productId") or product.get("id") or "") == str(product_id_filter)
        ]
    if category_filter == "ttd":
        products = [product for product in products if is_ttd_product(product)]
    if fallback_only:
        products = [
            product for product in products
            if any((sku.get("skuSource") == "资源模板") for sku in (product.get("skus") or []))
        ]
    total = len(products)
    limit = max_products if max_products and max_products > 0 else total
    browser = None
    context = None
    synced = 0
    failed = 0
    try:
        storage_path = account_dir(account_id) / "storage_state.json"
        browser = active_playwright.chromium.launch(channel="chrome", headless=True)
        context = browser.new_context(
            storage_state=str(storage_path) if storage_path.exists() else None,
            viewport={"width": 1440, "height": 1000},
            locale="zh-CN",
            timezone_id="Asia/Shanghai",
        )
        page = context.new_page()
        page.goto(PRODUCT_LIST_URL, wait_until="domcontentloaded", timeout=60000)
        page.wait_for_timeout(1500)
        for index, product in enumerate(products[:limit], start=1):
            product_id = str(product.get("productId") or product.get("id") or "")
            if not product_id:
                continue
            try:
                try:
                    skus = fetch_package_inventory_skus(page, product_id)
                except Exception:
                    skus = []
                if not skus and is_ttd_product(product):
                    try:
                        skus = extract_ttd_package_inventory_page(page, product)
                        template = call_vbooking_api(
                            page,
                            "getSyncRelationTemplate",
                            {
                                "productId": int(product_id),
                                "requestBaseData": {
                                    "extParameterList": [
                                        {"key": "page_version", "value": "5.3"},
                                        {"key": "needValidatePermission", "value": "true"},
                                    ]
                                },
                            },
                        )
                        enrich_package_ids_from_template(skus, extract_skus_from_template(template))
                    except Exception:
                        skus = []
                if not skus:
                    template = call_vbooking_api(
                        page,
                        "getSyncRelationTemplate",
                        {
                            "productId": int(product_id),
                            "requestBaseData": {
                                "extParameterList": [
                                    {"key": "page_version", "value": "5.3"},
                                    {"key": "needValidatePermission", "value": "true"},
                                ]
                            },
                        },
                    )
                    skus = extract_skus_from_template(template)
                    for sku in skus:
                        sku["skuSource"] = "资源模板"
                if not skus:
                    skus = extract_skus_from_package_inventory_page(page, product)
                for sku in skus:
                    sku["productId"] = product_id
                normalize_resource_ids_for_product(product, skus)
                product["skus"] = skus
                product["skuCount"] = len(skus)
                product["skuSyncedAt"] = now_text()
                product["skuSyncStatus"] = "成功" if skus else "无SKU"
                product["skuSyncError"] = ""
                synced += 1
            except Exception as error:
                product["skuSyncStatus"] = "失败"
                product["skuSyncError"] = str(error)
                product["skuSyncedAt"] = now_text()
                failed += 1
            data["skuSyncedAt"] = now_text()
            data["skuSyncProgress"] = {
                "processed": index,
                "total": limit,
                "synced": synced,
                "failed": failed,
            }
            products_file(account_id).write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        data["skuSyncedAt"] = now_text()
        data["skuSyncProgress"] = {
            "processed": min(limit, total),
            "total": limit,
            "synced": synced,
            "failed": failed,
        }
        products_file(account_id).write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        return data
    finally:
        if context:
            context.close()
        if browser:
            browser.close()


def sync_product_skus(account_id, max_products=0, product_id_filter="", category_filter="", fallback_only=False):
    return run_browser_job(
        lambda active_playwright, _contexts: sync_product_skus_in_browser(
            active_playwright,
            account_id,
            max_products=max_products,
            product_id_filter=product_id_filter,
            category_filter=category_filter,
            fallback_only=fallback_only,
        ),
        timeout=1800,
    )


def product_lookup(account_id):
    data = read_products(account_id)
    return {str(item.get("productId") or item.get("id")): item for item in data.get("products", [])}


def product_edit_url(product):
    product_id = str(product.get("productId") or product.get("id"))
    if is_ttd_product(product):
        return TTD_EDIT_URL.format(product_id=product_id)
    return ACTIVITY_EDIT_URL.format(product_id=product_id)


def is_activity_edit_product(product):
    return "activity-vbk" in product_edit_url(product)


def requires_manual_price_assist(product):
    category = product.get("category", "") or ""
    title = product.get("title", "") or product.get("productTitle", "") or ""
    if "一日游" in category:
        return False
    return "园内讲解" in category or "人工讲解" in category or "人工讲解" in title


def direct_activity_price_ui_product(product):
    return is_activity_edit_product(product) and not is_ttd_product(product)


def successful_price_item_keys(task, product_id):
    keys = set()
    for item in task.get("previousItems") or []:
        if item.get("status") != "成功":
            continue
        if str(item.get("productId") or "") != str(product_id):
            continue
        resource_id = str(item.get("resourceId") or item.get("skuId") or "")
        day = str(item.get("day") or "")
        if resource_id and day:
            keys.add((resource_id, day))
    return keys


def visible_first(page, selector):
    locator = page.locator(selector)
    count = locator.count()
    for index in range(count):
        item = locator.nth(index)
        try:
            if item.is_visible(timeout=500):
                return item
        except Exception:
            continue
    return None


def click_first_text(page, texts, timeout=3000):
    for text in texts:
        selectors = [
            f"button:has-text('{text}')",
            f"a:has-text('{text}')",
            f"[role='button']:has-text('{text}')",
            f"text={text}",
        ]
        for selector in selectors:
            locator = page.locator(selector)
            try:
                count = locator.count()
                for index in range(count):
                    item = locator.nth(index)
                    if item.is_visible(timeout=500) and item.is_enabled(timeout=500):
                        item.click(timeout=timeout)
                        page.wait_for_timeout(1000)
                        return text
            except Exception:
                continue
    return ""


def close_open_dialog(page):
    try:
        modal = page.locator(".ant-modal:visible").last
        if modal.count():
            text = modal.inner_text(timeout=1000)
            if "公告详情" in text and "我已仔细阅读" in text:
                for selector in [
                    ".ant-modal:visible label:has-text('我已仔细阅读')",
                    ".ant-modal:visible .ant-checkbox-wrapper",
                    ".ant-modal:visible input[type='checkbox']",
                ]:
                    try:
                        locator = page.locator(selector)
                        if locator.count() and locator.last.is_visible(timeout=300):
                            locator.last.click(timeout=1000, force=True)
                            page.wait_for_timeout(300)
                            break
                    except Exception:
                        continue
                for selector in [
                    ".ant-modal:visible button:has-text('确定')",
                    ".ant-modal:visible button:has-text('确 定')",
                ]:
                    try:
                        locator = page.locator(selector)
                        if locator.count() and locator.last.is_visible(timeout=300):
                            locator.last.click(timeout=1200, force=True)
                            page.wait_for_timeout(800)
                            return True
                    except Exception:
                        continue
    except Exception:
        pass
    for selector in [
        ".ant-modal-close",
        "button[aria-label='Close']",
        "button:has-text('取消')",
    ]:
        locator = page.locator(selector)
        try:
            count = locator.count()
            for index in range(count):
                item = locator.nth(index)
                if item.is_visible(timeout=300) and item.is_enabled(timeout=300):
                    item.click(timeout=1000)
                    page.wait_for_timeout(500)
                    return True
        except Exception:
            continue
    return False


def click_bottom_action(page, labels):
    # Prefer the fixed action bar in the price stock section; avoid tab text and modal text.
    candidates = []
    for label in labels:
        candidates.extend([
            f".product-footer button:has-text('{label}')",
            f".footer button:has-text('{label}')",
            f".fixed button:has-text('{label}')",
            f"button.ant-btn:has-text('{label}')",
            f"button:has-text('{label}')",
        ])
    for selector in candidates:
        locator = page.locator(selector)
        try:
            count = locator.count()
            for index in range(count):
                item = locator.nth(index)
                if item.is_visible(timeout=500) and item.is_enabled(timeout=500):
                    item.scroll_into_view_if_needed(timeout=1000)
                    item.click(timeout=3000)
                    page.wait_for_timeout(1000)
                    return item.inner_text(timeout=1000).strip()
        except Exception:
            continue
    return ""


def click_visible_confirmation(page):
    for scope_selector in [
        ".ant-modal-confirm:visible",
        ".ant-popover:visible",
        ".ant-modal:visible",
    ]:
        for text in ["确定", "确 定", "确认", "确 认", "提交", "我知道了"]:
            for selector in [
                f"{scope_selector} button:has-text('{text}')",
                f"{scope_selector} .ant-btn-primary:has-text('{text}')",
                f"{scope_selector} span:has-text('{text}')",
            ]:
                try:
                    locator = page.locator(selector)
                    if locator.count() and locator.last.is_visible(timeout=500) and locator.last.is_enabled(timeout=500):
                        locator.last.click(timeout=2000, force=True)
                        page.wait_for_timeout(1000)
                        return text
                except Exception:
                    continue
    return ""


def submit_activity_page_review(page):
    action = click_bottom_action(page, ["提交审核", "提交 审核"])
    if not action:
        return {"submitted": False, "actionButton": "", "confirmButton": "", "reason": "not-found"}
    confirm = ""
    for _ in range(3):
        clicked = click_visible_confirmation(page)
        if not clicked:
            break
        confirm = clicked
        page.wait_for_timeout(1000)
    page.wait_for_timeout(3500)
    return {"submitted": True, "actionButton": action, "confirmButton": confirm}


def ensure_price_stock_area(page):
    if page.locator("button:has-text('开/关班')").count() or page.locator("button:has-text('设置价格/库存')").count():
        return True
    page.mouse.wheel(0, 1000)
    page.wait_for_timeout(800)
    if page.locator("button:has-text('开/关班')").count() or page.locator("button:has-text('设置价格/库存')").count():
        return True
    # Only click obvious navigation tabs, not every text node named 价格/库存.
    for selector in [
        ".ant-tabs-tab:has-text('价格/库存')",
        ".ant-tabs-tab:has-text('套餐&报价')",
        "a:has-text('价格/库存')",
        "a:has-text('套餐&报价')",
        "[role='tab']:has-text('价格/库存')",
        "[role='tab']:has-text('套餐&报价')",
    ]:
        locator = page.locator(selector)
        try:
            if locator.count() and locator.first.is_visible(timeout=500):
                locator.first.click(timeout=2000)
                page.wait_for_timeout(1200)
                break
        except Exception:
            continue
    page.mouse.wheel(0, 1200)
    page.wait_for_timeout(800)
    return page.locator("button:has-text('开/关班')").count() or page.locator("button:has-text('设置价格/库存')").count()


def fill_visible_inputs(scope, selectors, value, max_count=1):
    filled = 0
    for selector in selectors:
        locator = scope.locator(selector)
        try:
            count = locator.count()
            for index in range(count):
                if filled >= max_count:
                    return filled
                item = locator.nth(index)
                if item.is_visible(timeout=500) and item.is_enabled(timeout=500):
                    item.fill(str(value), timeout=2000)
                    filled += 1
        except Exception:
            continue
    return filled


def fill_input_by_nearby_label(page, labels, value, scope_selector=".ant-modal"):
    try:
        return int(page.evaluate(
            """
            ({labels, value, scopeSelector}) => {
              const visible = el => {
                const style = window.getComputedStyle(el);
                const rect = el.getBoundingClientRect();
                return style.display !== 'none' && style.visibility !== 'hidden'
                  && rect.width > 0 && rect.height > 0;
              };
              const scopes = Array.from(document.querySelectorAll(scopeSelector)).filter(visible);
              const scope = scopes.length ? scopes[scopes.length - 1] : document.body;
              const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
              const inputVisible = el => {
                const type = (el.getAttribute('type') || 'text').toLowerCase();
                const placeholder = el.getAttribute('placeholder') || '';
                const wrapperClass = String(el.closest('.ant-picker, .ant-select, .ant-picker-input')?.className || '');
                return visible(el) && !el.disabled && !el.readOnly
                  && ['text', 'number', ''].includes(type)
                  && !placeholder.includes('日期')
                  && !wrapperClass.includes('ant-picker')
                  && !wrapperClass.includes('ant-select');
              };
              const fill = input => {
                input.focus();
                setter.call(input, String(value));
                input.dispatchEvent(new Event('input', {bubbles: true}));
                input.dispatchEvent(new Event('change', {bubbles: true}));
                input.dispatchEvent(new FocusEvent('blur', {bubbles: true}));
                return 1;
              };
              const labelHit = text => labels.some(label => text.includes(label));
              const blocks = Array.from(scope.querySelectorAll(
                '.ant-form-item, .ant-row, .ant-col, .ant-space-item, tr, td'
              )).filter(visible);
              for (const block of blocks) {
                if (block.querySelectorAll('input').length > 3) continue;
                const text = (block.textContent || '').replace(/\\s+/g, '');
                if (!labelHit(text)) continue;
                const input = Array.from(block.querySelectorAll('input')).find(inputVisible);
                if (input) return fill(input);
              }
              const inputs = Array.from(scope.querySelectorAll('input')).filter(inputVisible);
              for (const input of inputs) {
                const placeholder = input.getAttribute('placeholder') || '';
                const aria = input.getAttribute('aria-label') || '';
                const parentText = (input.closest('.ant-form-item, .ant-row, .ant-col, td, div')?.textContent || '').replace(/\\s+/g, '');
                if (labelHit(placeholder) || labelHit(aria) || labelHit(parentText)) {
                  return fill(input);
                }
              }
              return 0;
            }
            """,
            {"labels": labels, "value": value, "scopeSelector": scope_selector},
        ) or 0)
    except Exception:
        return 0


def pick_ant_date(page, date_text):
    if not date_text:
        return False
    day = str(int(date_text.split("-")[-1]))
    try:
        point = page.evaluate(
            """
            ({dateText}) => {
              const visible = el => {
                const style = window.getComputedStyle(el);
                const rect = el.getBoundingClientRect();
                return style.display !== 'none' && style.visibility !== 'hidden'
                  && rect.width > 0 && rect.height > 0 && rect.top > 0 && rect.left > 0;
              };
              const dropdowns = Array.from(document.querySelectorAll('.ant-picker-dropdown')).filter(visible);
              for (let i = dropdowns.length - 1; i >= 0; i -= 1) {
                const cells = Array.from(dropdowns[i].querySelectorAll(`td[title="${dateText}"], .ant-picker-cell[title="${dateText}"]`))
                  .filter(el => visible(el) && !String(el.className || '').includes('disabled'));
                if (cells.length) {
                  const target = cells[cells.length - 1].querySelector('.ant-picker-cell-inner') || cells[cells.length - 1];
                  const rect = target.getBoundingClientRect();
                  return {x: rect.left + rect.width / 2, y: rect.top + rect.height / 2};
                }
              }
              return null;
            }
            """,
            {"dateText": date_text},
        )
        if point:
            page.mouse.click(point["x"], point["y"])
            page.wait_for_timeout(600)
            return True
    except Exception:
        pass
    selectors = [
        f".ant-picker-cell[title='{date_text}'] .ant-picker-cell-inner",
        f"td[title='{date_text}'] .ant-picker-cell-inner",
        f".ant-picker-dropdown:visible .ant-picker-cell-inner:text-is('{day}')",
        f"xpath=//div[contains(@class,'ant-picker-dropdown')]//*[normalize-space()='{day}']",
        f"text={day}",
    ]
    for selector in selectors:
        try:
            locator = page.locator(selector)
            count = locator.count()
            for index in range(count - 1, -1, -1):
                item = locator.nth(index)
                if item.is_visible(timeout=500):
                    item.click(timeout=2000)
                    page.wait_for_timeout(500)
                    return True
        except Exception:
            continue
    try:
        point = page.evaluate(
            """
            ({day}) => {
              const dropdowns = Array.from(document.querySelectorAll('.ant-picker-dropdown, [class*="picker"], [class*="calendar"]'))
                .filter(el => {
                  const style = window.getComputedStyle(el);
                  const rect = el.getBoundingClientRect();
                  return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0
                    && rect.top > 0 && rect.left > 0;
              });
              const root = dropdowns[dropdowns.length - 1] || document;
              const candidates = Array.from(root.querySelectorAll('*')).filter(el => {
                const text = (el.textContent || '').trim();
                const rect = el.getBoundingClientRect();
                const className = String(el.className || '');
                return text === day && rect.width > 0 && rect.height > 0
                  && !className.includes('disabled')
                  && !className.includes('outside')
                  && !className.includes('prev')
                  && !className.includes('next');
              });
              const targetText = candidates[candidates.length - 1];
              if (!targetText) return null;
              const target = targetText.closest('td, .ant-picker-cell, button') || targetText;
              const rect = target.getBoundingClientRect();
              return {x: rect.left + rect.width / 2, y: rect.top + rect.height / 2};
            }
            """,
            {"day": day},
        )
        if point:
            page.mouse.click(point["x"], point["y"])
            page.wait_for_timeout(600)
            return True
    except Exception:
        pass
    return False


def force_pick_visible_day(page, date_text):
    if not date_text:
        return False
    day = str(int(date_text.split("-")[-1]))
    try:
        point = page.evaluate(
            """
            ({day}) => {
              const visible = el => {
                const style = window.getComputedStyle(el);
                const rect = el.getBoundingClientRect();
                return style.display !== 'none' && style.visibility !== 'hidden'
                  && rect.width > 0 && rect.height > 0 && rect.top > 0 && rect.left > 0;
              };
              const layers = Array.from(document.querySelectorAll('.ant-modal:has(.ant-picker), .ant-modal, .ant-picker-dropdown, [class*="calendar"], [class*="picker"]'))
                .filter(visible)
                .sort((a, b) => b.getBoundingClientRect().top - a.getBoundingClientRect().top);
              for (const root of layers) {
                const cells = Array.from(root.querySelectorAll('td, button, div, span'))
                  .filter(el => {
                    if (!visible(el)) return false;
                    const text = (el.textContent || '').trim();
                    const className = String(el.className || '');
                    return text === day
                      && !className.includes('disabled')
                      && !className.includes('outside')
                      && !className.includes('prev')
                      && !className.includes('next');
                  });
                if (cells.length) {
                  const target = cells[cells.length - 1].closest('td, button, [role="button"]') || cells[cells.length - 1];
                  const rect = target.getBoundingClientRect();
                  return {x: rect.left + rect.width / 2, y: rect.top + rect.height / 2};
                }
              }
              return null;
            }
            """,
            {"day": day},
        )
        if point:
            page.mouse.click(point["x"], point["y"])
            page.wait_for_timeout(600)
            return True
    except Exception:
        pass
    return False


def activity_fullcalendar_selection_info(page):
    try:
        return page.evaluate(
            """
            () => {
              const visible = el => {
                const style = window.getComputedStyle(el);
                const rect = el.getBoundingClientRect();
                return style.display !== 'none' && style.visibility !== 'hidden'
                  && rect.width > 0 && rect.height > 0;
              };
              const modal = Array.from(document.querySelectorAll('.ant-modal')).filter(visible).pop();
              if (!modal) return {hasCalendar: false, selectedText: ''};
              const calendar = Array.from(modal.querySelectorAll('.ant-fullcalendar, [class*="fullcalendar"]')).filter(visible).pop();
              if (!calendar) return {hasCalendar: false, selectedText: ''};
              const calRect = calendar.getBoundingClientRect();
              const panels = Array.from(modal.querySelectorAll('div')).filter(el => {
                if (!visible(el)) return false;
                const rect = el.getBoundingClientRect();
                return rect.left > calRect.right - 10 && rect.top >= calRect.top - 20
                  && rect.height > 60 && rect.width > 80;
              }).sort((a, b) => (b.getBoundingClientRect().width * b.getBoundingClientRect().height) - (a.getBoundingClientRect().width * a.getBoundingClientRect().height));
              const selectedText = panels.map(el => (el.textContent || '').trim()).filter(Boolean).join('\\n').slice(0, 300);
              const activeCells = Array.from(calendar.querySelectorAll('[class*="selected"], [class*="active"], [class*="range"]'))
                .filter(visible)
                .map(el => (el.textContent || '').trim())
                .filter(Boolean);
              return {hasCalendar: true, selectedText, activeCells};
            }
            """
        )
    except Exception:
        return {"hasCalendar": False, "selectedText": ""}


def pick_activity_fullcalendar_date(page, date_text):
    if not date_text:
        return False
    try:
        point = page.evaluate(
            """
            ({dateText}) => {
              const visible = el => {
                const style = window.getComputedStyle(el);
                const rect = el.getBoundingClientRect();
                return style.display !== 'none' && style.visibility !== 'hidden'
                  && rect.width > 0 && rect.height > 0;
              };
              const modal = Array.from(document.querySelectorAll('.ant-modal')).filter(visible).pop();
              if (!modal) return null;
              const calendar = Array.from(modal.querySelectorAll('.ant-fullcalendar, [class*="fullcalendar"]')).filter(visible).pop();
              if (!calendar) return null;
              const day = String(parseInt(dateText.slice(-2), 10));
              const cells = Array.from(calendar.querySelectorAll('td, [role="gridcell"], .ant-fullcalendar-cell, .ant-fullcalendar-date'))
                .filter(el => {
                  if (!visible(el)) return false;
                  const text = (el.textContent || '').trim();
                  const className = String(el.className || '');
                  const title = el.getAttribute('title') || el.getAttribute('aria-label') || '';
                  const exactTitle = title.includes(dateText);
                  const exactText = text === day || text.split(/\\s+/)[0] === day;
                  return (exactTitle || exactText)
                    && !className.includes('disabled')
                    && !className.includes('prev')
                    && !className.includes('next')
                    && !className.includes('last-month')
                    && !className.includes('next-month');
                });
              if (!cells.length) return null;
              let target = cells.find(el => (el.getAttribute('title') || '').includes(dateText)) || cells[cells.length - 1];
              target = target.querySelector('.ant-fullcalendar-date, [class*="date"], [role="button"]') || target;
              const rect = target.getBoundingClientRect();
              return {x: rect.left + rect.width / 2, y: rect.top + rect.height / 2};
            }
            """,
            {"dateText": date_text},
        )
        if not point:
            return False
        before = activity_fullcalendar_selection_info(page).get("selectedText", "")
        for attempt in range(4):
            page.mouse.move(point["x"], point["y"])
            page.mouse.down()
            page.wait_for_timeout(80)
            page.mouse.move(point["x"] + 6 + attempt, point["y"] + 3)
            page.wait_for_timeout(80)
            page.mouse.up()
            if attempt in (1, 3):
                page.mouse.dblclick(point["x"], point["y"])
            try:
                page.keyboard.press("Enter")
            except Exception:
                pass
            page.wait_for_timeout(500)
            after = activity_fullcalendar_selection_info(page)
            selected_text = after.get("selectedText", "")
            active_cells = after.get("activeCells") or []
            if (selected_text and selected_text != before) or active_cells:
                return True
        return False
    except Exception:
        return False


def fill_modal_date_range(page, modal, start, end):
    if not start:
        return 0
    try:
        info = activity_fullcalendar_selection_info(page)
        if info.get("hasCalendar"):
            picked_start = pick_activity_fullcalendar_date(page, start)
            picked_end = True
            if end and end != start:
                picked_end = pick_activity_fullcalendar_date(page, end)
            info = activity_fullcalendar_selection_info(page)
            if (picked_start and picked_end) and (info.get("selectedText") or info.get("activeCells")):
                return 2 if end else 1
            return 0
    except Exception:
        pass
    filled = 0
    try:
        injected = page.evaluate(
            """
            ({start, end}) => {
              const visible = el => {
                const style = window.getComputedStyle(el);
                const rect = el.getBoundingClientRect();
                return style.display !== 'none' && style.visibility !== 'hidden'
                  && rect.width > 0 && rect.height > 0;
              };
              const modal = Array.from(document.querySelectorAll('.ant-modal')).filter(visible).pop();
              if (!modal) return {filled: 0, values: []};
              const inputs = Array.from(modal.querySelectorAll('.ant-picker-input input, input[placeholder*="开始"], input[placeholder*="结束"], input[placeholder*="日期"]'))
                .filter(visible);
              const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
              const emit = el => {
                el.dispatchEvent(new Event('input', {bubbles: true}));
                el.dispatchEvent(new Event('change', {bubbles: true}));
                el.dispatchEvent(new FocusEvent('blur', {bubbles: true}));
              };
              if (inputs[0]) {
                inputs[0].focus();
                setter.call(inputs[0], start);
                emit(inputs[0]);
              }
              if (inputs[1]) {
                inputs[1].focus();
                setter.call(inputs[1], end || start);
                emit(inputs[1]);
              }
              return {filled: Math.min(inputs.length, end ? 2 : 1), values: inputs.slice(0, 2).map(el => el.value || '')};
            }
            """,
            {"start": start, "end": end or start},
        )
        values = injected.get("values") if isinstance(injected, dict) else []
        if values and values[0] and (not end or (len(values) > 1 and values[1])):
            try:
                page.keyboard.press("Enter")
                page.keyboard.press("Escape")
            except Exception:
                pass
            page.wait_for_timeout(500)
            return int(injected.get("filled") or len(values))
    except Exception:
        pass
    try:
        inputs = modal.locator(".ant-picker-input input, input[placeholder*='开始'], input[placeholder*='日期']")
        if inputs.count():
            inputs.nth(0).click(timeout=2000)
            page.wait_for_timeout(500)
            if pick_ant_date(page, start) or force_pick_visible_day(page, start):
                filled += 1
            if end:
                if pick_ant_date(page, end) or force_pick_visible_day(page, end):
                    filled += 1
            try:
                if page.locator(".ant-picker-dropdown:visible").count():
                    ok_button = page.locator(".ant-picker-dropdown:visible button:has-text('确定'), .ant-picker-dropdown:visible button:has-text('OK')")
                    if ok_button.count() and ok_button.last.is_visible(timeout=300):
                        ok_button.last.click(timeout=1200)
                    else:
                        page.keyboard.press("Enter")
                    page.wait_for_timeout(500)
            except Exception:
                pass
        if filled >= (2 if end else 1):
            return filled
    except Exception:
        pass
    filled += fill_visible_inputs(
        modal,
        [
            "input[placeholder*='开始']",
            "input[placeholder*='起始']",
            "input[placeholder*='开始日期']",
            ".ant-picker-input input",
            "input[autocomplete='off']",
        ],
        start,
        max_count=1,
    )
    if end:
        filled += fill_visible_inputs(
            modal,
            [
                "input[placeholder*='结束']",
                "input[placeholder*='截止']",
                "input[placeholder*='结束日期']",
                ".ant-picker-input input",
                "input[autocomplete='off']",
            ],
            end,
            max_count=1,
        )
    try:
        page.keyboard.press("Enter")
    except Exception:
        pass
    try:
        if page.locator(".ant-picker-dropdown:visible, [class*='calendar']:visible").count():
            if pick_ant_date(page, start) or force_pick_visible_day(page, start):
                filled += 1
            if end and (pick_ant_date(page, end) or force_pick_visible_day(page, end)):
                filled += 1
    except Exception:
        pass
    return filled


def click_modal_radio_text(page, modal, text):
    selectors = [
        f"label:has-text('{text}')",
        f".ant-radio-wrapper:has-text('{text}')",
        f"text={text}",
    ]
    for selector in selectors:
        try:
            locator = modal.locator(selector)
            count = locator.count()
            for index in range(count):
                item = locator.nth(index)
                if item.is_visible(timeout=500):
                    item.click(timeout=1500)
                    page.wait_for_timeout(500)
                    return True
        except Exception:
            continue
    return False


def choose_activity_sell_price_mode(page, modal):
    clicked = False
    confirmed = False
    for selector in [
        "span:has-text('设置卖价')",
        "button:has-text('设置卖价')",
        "text=设置卖价",
    ]:
        try:
            locator = modal.locator(selector)
            if locator.count() and locator.first.is_visible(timeout=500):
                locator.first.click(timeout=1500, force=True)
                clicked = True
                page.wait_for_timeout(700)
                break
        except Exception:
            continue
    if clicked:
        for selector in [
            ".ant-popover:visible button:has-text('确定')",
            ".ant-popover:visible button:has-text('确 定')",
            "button:has-text('确定')",
            "button:has-text('确 定')",
            "xpath=(//*[normalize-space()='确定' or normalize-space()='确 定'])[last()]",
        ]:
            try:
                locator = page.locator(selector)
                if locator.count() and locator.last.is_visible(timeout=500):
                    locator.last.click(timeout=1500, force=True)
                    confirmed = True
                    page.wait_for_timeout(1200)
                    break
            except Exception:
                continue
    return {"clickedSellMode": clicked, "confirmedSellMode": confirmed}


def fill_task_dialog(page, task):
    modal = page.locator(".ant-modal:visible").last
    try:
        if page.locator(".ant-modal:visible").count():
            modal = page.locator(".ant-modal:visible").last
        else:
            modal = page
    except Exception:
        modal = page
    start = task.get("dateStart", "")
    end = task.get("dateEnd", "") or start
    operation = task.get("operationType", "")
    if operation in ("openInventory", "closeInventory"):
        target = "关闭销售" if operation == "closeInventory" else "打开销售"
        for selector in [
            f"label:has-text('{target}')",
            f".ant-radio-wrapper:has-text('{target}')",
            f"text={target}",
        ]:
            try:
                locator = modal.locator(selector)
                if locator.count() and locator.first.is_visible(timeout=500):
                    locator.first.click(timeout=1500)
                    page.wait_for_timeout(500)
                    break
            except Exception:
                continue
    for selector in ["label:has-text('按日期设置')", ".ant-radio-wrapper:has-text('按日期设置')", "text=按日期设置"]:
        try:
            locator = modal.locator(selector)
            if locator.count() and locator.first.is_visible(timeout=500):
                locator.first.click(timeout=1500)
                page.wait_for_timeout(500)
                break
        except Exception:
            continue
    filled_dates = fill_modal_date_range(page, modal, start, end)

    if operation in ("openInventory", "closeInventory"):
        return {"filledDates": filled_dates, "saleType": "关闭销售" if operation == "closeInventory" else "打开销售"}

    numeric_value = task.get("stockValue") if operation == "setStock" else task.get("priceValue")
    filled_numbers = 0
    if numeric_value != "":
        selectors = ["input[type='number']", "input[placeholder*='价格']", "input[placeholder*='库存']", "input"]
        filled_numbers = fill_visible_inputs(modal, selectors, numeric_value, max_count=4)
    return {"filledDates": filled_dates, "filledNumbers": filled_numbers}


def save_dialog_and_page(page):
    clicked_dialog = ""
    for selector in [
        ".ant-modal:visible .ant-modal-footer button.ant-btn-primary",
        ".ant-modal:visible button:has-text('保存')",
        ".ant-modal:visible button:has-text('确定')",
        ".ant-modal:visible button:has-text('确认')",
        ".ant-modal:visible button:has-text('提交')",
    ]:
        try:
            locator = page.locator(selector)
            count = locator.count()
            for index in range(count - 1, -1, -1):
                item = locator.nth(index)
                if item.is_visible(timeout=500) and item.is_enabled(timeout=500):
                    item.scroll_into_view_if_needed(timeout=1000)
                    clicked_dialog = item.inner_text(timeout=1000).strip() or "modal-primary"
                    item.click(timeout=3000)
                    page.wait_for_timeout(1500)
                    break
            if clicked_dialog:
                break
        except Exception:
            continue
    if not clicked_dialog:
        clicked_dialog = click_first_text(page, ["确定", "确认", "保存", "提交"])
    page.wait_for_timeout(1200)
    modal_still_open = False
    try:
        modal_still_open = page.locator(".ant-modal:visible").count() > 0
    except Exception:
        modal_still_open = False
    clicked_page = click_bottom_action(page, ["保 存", "保存"])
    page.wait_for_timeout(1500)
    return {"dialogButton": clicked_dialog, "pageButton": clicked_page, "modalStillOpen": modal_still_open}


def day_token_to_iso(day):
    value = str(day or "").strip()
    if re.match(r"^\d{8}$", value):
        return f"{value[:4]}-{value[4:6]}-{value[6:8]}"
    return value


def select_activity_price_resource(page, detail):
    tokens = unique_preserve_order([
        detail.get("resourceId"),
        detail.get("skuId"),
        detail.get("packageName"),
        detail.get("resourceName"),
    ])
    if not tokens:
        return {"selected": False, "reason": "no-token"}
    selectors = [
        ".product-footer .ant-select-selector",
        ".footer .ant-select-selector",
        ".fixed .ant-select-selector",
        ".ant-select-selector",
    ]
    for selector in selectors:
        try:
            locator = page.locator(selector)
            count = locator.count()
            for index in range(count - 1, -1, -1):
                item = locator.nth(index)
                if not item.is_visible(timeout=300):
                    continue
                text = item.inner_text(timeout=500)
                if any(token and str(token) in text for token in tokens):
                    return {"selected": True, "selector": selector, "matched": text.strip()}
                item.click(timeout=1200)
                page.wait_for_timeout(500)
                for token in tokens:
                    option = page.locator(f".ant-select-dropdown:visible .ant-select-item-option:has-text('{token}')")
                    if option.count() and option.first.is_visible(timeout=500):
                        option.first.click(timeout=1500)
                        page.wait_for_timeout(800)
                        return {"selected": True, "selector": selector, "matched": str(token)}
        except Exception:
            continue
    return {"selected": False, "reason": "not-found", "tokens": tokens}


def detail_resource_tokens(detail):
    return unique_preserve_order([
        detail.get("resourceId"),
        detail.get("skuId"),
        detail.get("packageName"),
        detail.get("resourceName"),
    ])


def select_activity_modal_resources(page, modal, details):
    tokens = []
    for detail in details or []:
        tokens.extend(detail_resource_tokens(detail))
    tokens = unique_preserve_order(tokens)
    if not tokens:
        return {"selected": 0, "reason": "no-token"}
    try:
        trigger = modal.locator("button:has-text('已选'), .ant-dropdown-trigger:has-text('已选'), button:has-text('选择')")
        if trigger.count() and trigger.first.is_visible(timeout=500):
            trigger.first.click(timeout=1500, force=True)
            page.wait_for_timeout(700)
        else:
            return {"selected": 0, "reason": "trigger-not-found", "tokens": tokens[:8]}
    except Exception as error:
        return {"selected": 0, "reason": f"trigger-error:{error}", "tokens": tokens[:8]}
    selected = 0
    matched = []
    for token in tokens:
        if not token:
            continue
        try:
            option = page.locator(
                f".ant-dropdown:visible label:has-text('{token}'), "
                f".ant-dropdown:visible .ant-checkbox-wrapper:has-text('{token}'), "
                f".ant-dropdown:visible li:has-text('{token}'), "
                f".ant-dropdown:visible div:has-text('{token}')"
            )
            count = option.count()
            for index in range(count):
                item = option.nth(index)
                if not item.is_visible(timeout=250):
                    continue
                text = item.inner_text(timeout=500)
                if token and str(token) not in text:
                    continue
                checkbox = item.locator("input[type='checkbox'], .ant-checkbox-input")
                already_checked = False
                try:
                    if checkbox.count():
                        already_checked = checkbox.first.is_checked(timeout=300)
                except Exception:
                    already_checked = "ant-checkbox-wrapper-checked" in (item.get_attribute("class") or "")
                if not already_checked:
                    item.click(timeout=1200, force=True)
                    page.wait_for_timeout(150)
                selected += 1
                matched.append(str(token))
                break
        except Exception:
            continue
    try:
        page.keyboard.press("Escape")
        page.wait_for_timeout(300)
    except Exception:
        pass
    return {"selected": selected, "matched": unique_preserve_order(matched), "tokens": tokens[:12]}


def fill_activity_price_modal(page, detail):
    modal = page.locator(".ant-modal:visible").last
    day_iso = day_token_to_iso(detail.get("day"))
    date_mode_clicked = click_modal_radio_text(page, modal, "按日期设置")
    filled_dates = fill_modal_date_range(page, modal, day_iso, day_iso)
    price = detail.get("newPrice")
    filled_price = fill_visible_inputs(
        modal,
        [
            "input[placeholder*='参考卖价']",
            "input[placeholder*='外网价']",
            "input[placeholder*='外网价格']",
            "input[placeholder*='卖价']",
            "input[placeholder*='售价']",
        ],
        price,
        max_count=1,
    )
    if not filled_price:
        # Last resort for older activity pages: choose the first editable text input after date fields.
        try:
            inputs = modal.locator("input.ant-input:not([readonly]):not([disabled])")
            count = inputs.count()
            for index in range(count):
                item = inputs.nth(index)
                placeholder = item.get_attribute("placeholder") or ""
                if "底价" in placeholder or "库存" in placeholder or "预警" in placeholder:
                    continue
                if item.is_visible(timeout=300) and item.is_enabled(timeout=300):
                    item.fill(str(price), timeout=1200)
                    filled_price = 1
                    break
        except Exception:
            pass
    floor_price = detail.get("costPrice")
    if floor_price in ("", None):
        floor_price = detail.get("oldPrice") or price
    filled_floor = fill_visible_inputs(
        modal,
        [
            "input[placeholder*='底价']",
            "input[placeholder*='结算价']",
            "input[placeholder*='成本价']",
        ],
        floor_price,
        max_count=1,
    )
    if not filled_floor:
        filled_floor = fill_input_by_nearby_label(page, ["底价", "结算价", "成本价"], floor_price)
    stock_total = detail.get("stockTotal")
    filled_stock = 0
    if stock_total not in ("", None):
        filled_stock = fill_visible_inputs(
            modal,
            [
                "input[placeholder*='库存数量']",
                "input[placeholder*='总库存']",
                "input[placeholder*='库存']",
            ],
            stock_total,
            max_count=1,
        )
        if not filled_stock:
            filled_stock = fill_input_by_nearby_label(page, ["库存数量", "库存总量", "总库存", "日库存", "库存"], stock_total)
    return {
        "filledDates": filled_dates,
        "dateModeClicked": date_mode_clicked,
        "filledPrice": filled_price,
        "targetPrice": price,
        "filledFloor": filled_floor,
        "floorPrice": floor_price,
        "filledStock": filled_stock,
        "stockTotal": stock_total,
    }


def fill_activity_weekday_date_range(page, modal, start, end):
    values = {"start": start, "end": end or start}
    def display_date(value):
        value = day_token_to_iso(value)
        return value.replace("-", "/")
    try:
        inputs = modal.locator(".ant-picker-input input[placeholder*='日期'], input[placeholder*='开始日期'], input[placeholder*='结束日期']")
        if inputs.count() >= 2:
            inputs.nth(0).click(timeout=1200, force=True)
            page.wait_for_timeout(400)
            picked_start = pick_ant_date(page, day_token_to_iso(start)) or force_pick_visible_day(page, day_token_to_iso(start))
            page.wait_for_timeout(400)
            inputs.nth(1).click(timeout=1200, force=True)
            page.wait_for_timeout(400)
            picked_end = pick_ant_date(page, day_token_to_iso(end or start)) or force_pick_visible_day(page, day_token_to_iso(end or start))
            page.wait_for_timeout(600)
            try:
                ok_button = page.locator(".ant-picker-dropdown:visible button:has-text('确定'), .ant-picker-dropdown:visible button:has-text('OK')")
                if ok_button.count() and ok_button.last.is_visible(timeout=300):
                    ok_button.last.click(timeout=1000)
                    page.wait_for_timeout(400)
            except Exception:
                pass
            if picked_start and picked_end:
                return 2
    except Exception:
        pass
    try:
        result = page.evaluate(
            """
            ({start, end}) => {
              const visible = el => {
                const style = window.getComputedStyle(el);
                const rect = el.getBoundingClientRect();
                return style.display !== 'none' && style.visibility !== 'hidden'
                  && rect.width > 0 && rect.height > 0;
              };
              const modal = Array.from(document.querySelectorAll('.ant-modal')).filter(visible).pop();
              if (!modal) return {filled: 0, values: []};
              const inputs = Array.from(modal.querySelectorAll('input'))
                .filter(visible)
                .filter(el => {
                  const placeholder = el.getAttribute('placeholder') || '';
                  return placeholder.includes('开始日期') || placeholder.includes('结束日期');
                });
              const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
              const emit = el => {
                el.dispatchEvent(new Event('input', {bubbles: true}));
                el.dispatchEvent(new Event('change', {bubbles: true}));
                el.dispatchEvent(new FocusEvent('blur', {bubbles: true}));
              };
              if (inputs[0]) {
                inputs[0].focus();
                setter.call(inputs[0], start);
                emit(inputs[0]);
              }
              if (inputs[1]) {
                inputs[1].focus();
                setter.call(inputs[1], end || start);
                emit(inputs[1]);
              }
              return {filled: Math.min(inputs.length, 2), values: inputs.slice(0, 2).map(el => el.value || '')};
            }
            """,
            values,
        )
        filled = int((result or {}).get("filled") or 0)
        current_values = (result or {}).get("values") or []
        if filled >= 2 and all(current_values[:2]):
            return filled
    except Exception:
        pass
    filled = 0
    for selector, value in [
        ("input[placeholder*='开始日期']", start),
        ("input[placeholder*='结束日期']", end or start),
    ]:
        try:
            locator = modal.locator(selector)
            if locator.count():
                item = locator.first
                item.click(timeout=1000, force=True)
                try:
                    item.fill(display_date(value), timeout=1000, force=True)
                except Exception:
                    page.keyboard.press("Control+A")
                    page.keyboard.type(display_date(value))
                try:
                    page.keyboard.press("Enter")
                except Exception:
                    pass
                try:
                    if item.input_value(timeout=500):
                        filled += 1
                except Exception:
                    filled += 1
                page.wait_for_timeout(300)
        except Exception:
            continue
    return filled


def fill_activity_weekday_price_modal(page, task, detail):
    modal = page.locator(".ant-modal:visible").last
    start_iso = day_token_to_iso(detail.get("dateStart") or detail.get("day"))
    end_iso = day_token_to_iso(detail.get("dateEnd") or detail.get("day") or detail.get("dateStart"))
    price_mode_info = choose_activity_sell_price_mode(page, modal)
    if page.locator(".ant-modal:visible").count():
        modal = page.locator(".ant-modal:visible").last
    weekday_mode_clicked = click_modal_radio_text(page, modal, "按星期设置")
    filled_dates = fill_activity_weekday_date_range(page, modal, start_iso, end_iso)
    if not page.locator(".ant-modal:visible").count():
        return {
            "mode": "按星期设置",
            **price_mode_info,
            "weekdayModeClicked": weekday_mode_clicked,
            "filledDates": filled_dates,
            "dateStart": start_iso,
            "dateEnd": end_iso,
            "filledPrice": 0,
            "error": "modal-closed-after-date-fill",
        }
    modal = page.locator(".ant-modal:visible").last
    every_day_clicked = False
    for selector in [
        "label:has-text('每天')",
        ".ant-checkbox-wrapper:has-text('每天')",
        "text=每天",
    ]:
        try:
            locator = modal.locator(selector)
            if locator.count() and locator.first.is_visible(timeout=300):
                locator.first.click(timeout=1200, force=True)
                page.wait_for_timeout(300)
                every_day_clicked = True
                break
        except Exception:
            continue
    price = detail.get("newPrice")
    price_labels = ["参考卖价", "外网价", "外网价格", "卖价", "售价"]
    filled_price = fill_visible_inputs(
        modal,
        [
            "input[placeholder*='参考卖价']",
            "input[placeholder*='外网价']",
            "input[placeholder*='外网价格']",
            "input[placeholder*='卖价']",
            "input[placeholder*='售价']",
        ],
        price,
        max_count=1,
    )
    if not filled_price:
        filled_price = fill_input_by_nearby_label(page, price_labels, price)
    if not filled_price:
        try:
            filled_price = int(page.evaluate(
                """
                ({value, labels}) => {
                  const visible = el => {
                    const style = window.getComputedStyle(el);
                    const rect = el.getBoundingClientRect();
                    return style.display !== 'none' && style.visibility !== 'hidden'
                      && rect.width > 0 && rect.height > 0;
                  };
                  const modal = Array.from(document.querySelectorAll('.ant-modal')).filter(visible).pop();
                  if (!modal) return 0;
                  const input = Array.from(modal.querySelectorAll('input')).find(el => {
                    const placeholder = el.getAttribute('placeholder') || '';
                    return visible(el) && !el.disabled && !el.readOnly
                      && labels.some(label => placeholder.includes(label));
                  });
                  if (!input) return 0;
                  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
                  input.focus();
                  setter.call(input, String(value));
                  input.dispatchEvent(new Event('input', {bubbles: true}));
                  input.dispatchEvent(new Event('change', {bubbles: true}));
                  input.dispatchEvent(new FocusEvent('blur', {bubbles: true}));
                  return 1;
                }
                """,
                {"value": price, "labels": price_labels},
            ) or 0)
        except Exception:
            pass
    floor_price = detail.get("costPrice")
    if floor_price in ("", None):
        floor_price = detail.get("oldPrice") or price
    filled_floor = fill_visible_inputs(
        modal,
        [
            "input[placeholder*='底价']",
            "input[placeholder*='结算价']",
            "input[placeholder*='成本价']",
        ],
        floor_price,
        max_count=1,
    )
    stock_total = detail.get("stockTotal")
    filled_stock = 0
    if stock_total not in ("", None):
        filled_stock = fill_visible_inputs(
            modal,
            [
                "input[placeholder*='库存数量']",
                "input[placeholder*='库存总量']",
                "input[placeholder*='总库存']",
                "input[placeholder*='库存']",
            ],
            stock_total,
            max_count=1,
        )
    return {
        "mode": "按星期设置",
        **price_mode_info,
        "weekdayModeClicked": weekday_mode_clicked,
        "everyDayClicked": every_day_clicked,
        "filledDates": filled_dates,
        "dateStart": start_iso,
        "dateEnd": end_iso,
        "filledPrice": filled_price,
        "targetPrice": price,
        "filledFloor": filled_floor,
        "floorPrice": floor_price,
        "filledStock": filled_stock,
        "stockTotal": stock_total,
    }


def visible_modal_diagnostics(page):
    try:
        return page.evaluate(
            """
            () => {
              const visible = el => {
                const style = window.getComputedStyle(el);
                const rect = el.getBoundingClientRect();
                return style.display !== 'none' && style.visibility !== 'hidden'
                  && rect.width > 0 && rect.height > 0;
              };
              const modal = Array.from(document.querySelectorAll('.ant-modal')).filter(visible).pop();
              if (!modal) return {};
              const inputs = Array.from(modal.querySelectorAll('input')).filter(visible).map((el, index) => ({
                index,
                type: el.type || '',
                placeholder: el.getAttribute('placeholder') || '',
                value: el.value || '',
                readonly: !!el.readOnly,
                disabled: !!el.disabled,
                className: String(el.className || ''),
                wrapperClass: String((el.closest('.ant-picker, .ant-picker-input, .ant-select') || {}).className || ''),
              }));
              const alerts = Array.from(modal.querySelectorAll('.ant-form-item-explain-error, .ant-form-item-extra, .ant-alert-message, .ant-message-notice-content, [class*="error"], [class*="Error"]'))
                .filter(visible)
                .map(el => (el.textContent || '').trim())
                .filter(Boolean);
              return {inputs, alerts, text: (modal.textContent || '').trim().slice(0, 1000)};
            }
            """
        )
    except Exception:
        return {}


def group_activity_ui_details(details):
    grouped = {}
    for detail in details or []:
        key = (
            str(detail.get("newPrice") or ""),
            str(detail.get("costPrice") or ""),
            str(detail.get("stockTotal") or ""),
        )
        grouped.setdefault(key, []).append(detail)
    ranges = []
    for key, group in grouped.items():
        by_day = {}
        for detail in group:
            day = str(detail.get("day") or "")
            by_day.setdefault(day, []).append(detail)
        sorted_days = sorted(day for day in by_day if re.match(r"^\d{8}$", day))
        index = 0
        while index < len(sorted_days):
            start = sorted_days[index]
            days = [start]
            resources = {str(item.get("resourceId") or item.get("skuId") or "") for item in by_day[start]}
            cursor = datetime.strptime(start, "%Y%m%d")
            index += 1
            while index < len(sorted_days):
                next_day = sorted_days[index]
                next_resources = {str(item.get("resourceId") or item.get("skuId") or "") for item in by_day[next_day]}
                expected = (cursor + timedelta(days=1)).strftime("%Y%m%d")
                if next_day != expected or next_resources != resources:
                    break
                days.append(next_day)
                cursor += timedelta(days=1)
                index += 1
            range_details = []
            for day in days:
                range_details.extend(by_day.get(day) or [])
            sample = range_details[0]
            ranges.append({
                "dateStart": days[0],
                "dateEnd": days[-1],
                "details": range_details,
                "sample": {
                    **sample,
                    "dateStart": days[0],
                    "dateEnd": days[-1],
                    "day": days[0],
                },
                "resourceCount": len(resources),
                "dayCount": len(days),
                "key": key,
            })
        for day, day_details in by_day.items():
            if not re.match(r"^\d{8}$", day):
                sample = day_details[0]
                ranges.append({
                    "dateStart": day,
                    "dateEnd": day,
                    "details": day_details,
                    "sample": {**sample, "dateStart": day, "dateEnd": day, "day": day},
                    "resourceCount": len(day_details),
                    "dayCount": 1,
                    "key": key,
                })
    return ranges


def execute_activity_price_group_ui(page, task, product, details, task_id=""):
    if not details:
        return []
    product_id = str(product.get("productId") or product.get("id") or details[0].get("productId") or "")
    page.goto(product_edit_url(product), wait_until="domcontentloaded", timeout=60000)
    page.wait_for_timeout(3000)
    body_text = page.locator("body").inner_text(timeout=15000)
    if "登录" in body_text and "产品" not in body_text:
        raise RuntimeError("携程登录态失效，请重新登录账号")
    close_open_dialog(page)
    ensure_price_stock_area(page)
    output = []
    for range_index, group in enumerate(group_activity_ui_details(details), start=1):
        if task_id:
            update_task(
                task_id,
                currentStep=(
                    f"活动页批量保存 {product_id}："
                    f"{group['dateStart']}-{group['dateEnd']}，"
                    f"{group['resourceCount']} 个资源"
                ),
            )
        sample = group["sample"]
        selection = select_activity_price_resource(page, sample)
        action = click_bottom_action(page, ["设置价格/库存", "批量设置价格库存"])
        if not action:
            raise RuntimeError("未找到携程页面上的设置价格/库存按钮")
        if not page.locator(".ant-modal:visible").count():
            raise RuntimeError("活动页价格弹窗未打开")
        modal = page.locator(".ant-modal:visible").last
        modal_selection = select_activity_modal_resources(page, modal, group["details"])
        if group["resourceCount"] > 1 and int(modal_selection.get("selected") or 0) <= 0:
            raise RuntimeError(f"未能在弹窗内批量选中目标资源，已停止保存避免误改默认资源：{modal_selection}")
        if group["resourceCount"] <= 1 and not selection.get("selected") and int(modal_selection.get("selected") or 0) <= 0:
            raise RuntimeError(f"未能选中目标资源，已停止保存避免误改默认资源：selection={selection} modalSelection={modal_selection}")
        if requires_manual_price_assist(product):
            dialog_info = fill_activity_weekday_price_modal(page, task, sample)
        else:
            dialog_info = fill_activity_price_modal(page, sample)
        dialog_info["batchRange"] = {
            "dateStart": group["dateStart"],
            "dateEnd": group["dateEnd"],
            "dayCount": group["dayCount"],
            "resourceCount": group["resourceCount"],
            "detailCount": len(group["details"]),
        }
        if not dialog_info.get("filledPrice"):
            raise RuntimeError("活动页价格弹窗未找到可填写的销售价/外网价输入框")
        if requires_manual_price_assist(product) and not dialog_info.get("filledDates"):
            raise RuntimeError(f"活动页按星期设置未能填写开始/结束日期：{dialog_info}")
        save_info = save_dialog_and_page(page)
        if not save_info.get("dialogButton") and not save_info.get("pageButton"):
            raise RuntimeError("活动页价格弹窗已填写，但未找到保存按钮")
        if save_info.get("modalStillOpen"):
            diagnostics = visible_modal_diagnostics(page)
            screenshot = account_dir(task.get("accountId") or product.get("accountId") or "default") / f"task_{task['id']}_{product_id}_{group['dateStart']}_{range_index}_ui_price_failed.png"
            try:
                page.screenshot(path=str(screenshot), full_page=True)
            except Exception:
                screenshot = ""
            raise RuntimeError(f"活动页价格弹窗保存后仍未关闭，可能日期或必填项未完成；dialog={dialog_info}；save={save_info}；diagnostics={diagnostics}；screenshot={screenshot}")
        for detail in group["details"]:
            output.append({
                **detail,
                "status": "待回读",
                "message": f"{detail.get('day')} 已通过活动页批量保存：{detail.get('oldPrice')} -> {detail.get('newPrice')}",
                "api": "activity-ui-weekday-range-modal" if requires_manual_price_assist(product) else "activity-ui-price-range-modal",
                "uiAction": action,
                "uiSelection": selection,
                "modalSelection": modal_selection,
                "dialog": dialog_info,
                "save": save_info,
                "screenshot": "",
                "operationType": task.get("operationType", ""),
                "priceValue": task.get("priceValue", ""),
                "finishedAt": now_text(),
            })
    return output


def execute_activity_price_detail_ui(page, task, product, detail):
    product_id = str(product.get("productId") or product.get("id") or detail.get("productId") or "")
    screenshot = account_dir(task.get("accountId") or product.get("accountId") or "default") / f"task_{task['id']}_{product_id}_{detail.get('day')}_ui_price.png"
    page.goto(product_edit_url(product), wait_until="domcontentloaded", timeout=60000)
    page.wait_for_timeout(3000)
    body_text = page.locator("body").inner_text(timeout=15000)
    if "登录" in body_text and "产品" not in body_text:
        raise RuntimeError("携程登录态失效，请重新登录账号")
    close_open_dialog(page)
    ensure_price_stock_area(page)
    selection = select_activity_price_resource(page, detail)
    action = click_bottom_action(page, ["设置价格/库存", "批量设置价格库存"])
    if not action:
        raise RuntimeError("未找到携程页面上的设置价格/库存按钮")
    if requires_manual_price_assist(product):
        dialog_info = fill_activity_weekday_price_modal(page, task, detail)
    else:
        dialog_info = fill_activity_price_modal(page, detail)
    if not dialog_info.get("filledPrice"):
        raise RuntimeError("活动页价格弹窗未找到可填写的销售价/外网价输入框")
    if requires_manual_price_assist(product) and not dialog_info.get("filledDates"):
        raise RuntimeError(f"活动页按星期设置未能填写开始/结束日期：{dialog_info}")
    save_info = save_dialog_and_page(page)
    if not save_info.get("dialogButton") and not save_info.get("pageButton"):
        raise RuntimeError("活动页价格弹窗已填写，但未找到保存按钮")
    if save_info.get("modalStillOpen"):
        diagnostics = visible_modal_diagnostics(page)
        try:
            page.screenshot(path=str(screenshot), full_page=True)
        except Exception:
            pass
        raise RuntimeError(f"活动页价格弹窗保存后仍未关闭，可能日期或必填项未完成；dialog={dialog_info}；save={save_info}；diagnostics={diagnostics}；screenshot={screenshot}")
    return {
        **detail,
        "status": "待回读",
        "message": f"{detail.get('day')} 已通过活动页{'按星期设置' if requires_manual_price_assist(product) else '价格弹窗'}保存：{detail.get('oldPrice')} -> {detail.get('newPrice')}",
        "api": "activity-ui-weekday-modal" if requires_manual_price_assist(product) else "activity-ui-price-modal",
        "uiAction": action,
        "uiSelection": selection,
        "dialog": dialog_info,
        "save": save_info,
        "screenshot": "",
        "operationType": task.get("operationType", ""),
        "priceValue": task.get("priceValue", ""),
        "finishedAt": now_text(),
    }


def manual_price_assist_item(task, product, detail, reason):
    product_id = str(product.get("productId") or product.get("id") or detail.get("productId") or "")
    return {
        **detail,
        "productId": product_id,
        "productTitle": product.get("title", "") or detail.get("productTitle", ""),
        "category": product.get("category", "") or detail.get("category", ""),
        "status": "待人工",
        "message": (
            f"{detail.get('day')} 需要走携程真实页面人工辅助改价："
            f"{detail.get('oldPrice')} -> {detail.get('newPrice')}。"
            "该园内讲解/人工讲解产品会拒绝后台 submitProductDraft 链接上下文，"
            "请在携程真实页面完成价格库存修改后点击页面底部灰色“保存”。"
            f"原始原因：{reason}"
        ),
        "api": "manual-assisted/activity-page",
        "checkApi": "checkResourcePrices",
        "operationType": task.get("operationType", ""),
        "priceValue": task.get("priceValue", ""),
        "manualAssist": True,
        "manualAction": "open-real-ctrip-page-and-save",
        "finishedAt": now_text(),
    }


def split_identifier_text(text):
    return [item for item in re.split(r"[\s,，;；]+", str(text or "")) if item]


def unique_preserve_order(values):
    seen = set()
    result = []
    for value in values:
        key = str(value or "").strip()
        if not key or key in seen:
            continue
        seen.add(key)
        result.append(key)
    return result


def inventory_batch_identifiers(task, product_refs):
    sku_scope = task.get("skuScope", "all")
    if sku_scope == "custom":
        identifiers = split_identifier_text(task.get("skuText", ""))
        return "resource", identifiers
    return "product", [str(ref.get("productId") or "") for ref in product_refs if ref.get("productId")]


def click_modal_text(modal, page, texts):
    for text in texts:
        for selector in [f"label:has-text('{text}')", f".ant-radio-wrapper:has-text('{text}')", f"text={text}"]:
            try:
                locator = modal.locator(selector)
                if locator.count() and locator.first.is_visible(timeout=800):
                    locator.first.click(timeout=2500)
                    page.wait_for_timeout(500)
                    return text
            except Exception:
                continue
    return ""


def execute_inventory_batch_switch_api(page, task, mode, identifiers):
    operation = task.get("operationType", "")
    date_list = date_tokens(task.get("dateStart", ""), task.get("dateEnd", "") or task.get("dateStart", ""))
    if not date_list:
        raise RuntimeError("没有可用于批量开关班的日期")
    resource_type = 1 if mode == "resource" else 0
    operation_type = True if operation == "openInventory" else False
    payload = {
        "requestBaseData": {
            "extParameterList": [
                {"key": "page_version", "value": "5.3"},
                {"key": "needValidatePermission", "value": "true"},
            ]
        },
        "opType": 1,
        "switchChangeInfo": {
            "resourceType": resource_type,
            "idList": identifiers,
            "operationType": operation_type,
            "dateOperateType": 1,
            "dateList": date_list,
        },
    }
    data = call_vbooking_api(page, "batchSaveProductInfo", payload)
    success_quantity = int(data.get("successQuantity") or 0)
    fail_quantity = int(data.get("failQuantity") or 0)
    failed = data.get("failedIdAndReasonList") or []
    if success_quantity <= 0 and not fail_quantity:
        raise RuntimeError(f"携程批量开关班返回失败：{json.dumps(data, ensure_ascii=False)[:800]}")
    sale_label = "关班" if operation == "closeInventory" else "开班"
    failed_by_id = {}
    for fail_item in failed:
        fail_id = str(
            fail_item.get("id")
            or fail_item.get("resourceId")
            or fail_item.get("productId")
            or fail_item.get("skuId")
            or ""
        ).strip()
        if fail_id:
            failed_by_id[fail_id] = fail_item
    items = []
    for identifier in identifiers:
        fail_item = failed_by_id.get(str(identifier))
        fail_reason = ""
        if fail_item:
            fail_reason = str(
                fail_item.get("reason")
                or fail_item.get("failReason")
                or fail_item.get("message")
                or json.dumps(fail_item, ensure_ascii=False)
            )
        items.append({
            "productId": identifier if mode == "product" else "-",
            "skuId": identifier if mode == "resource" else "",
            "productTitle": "批量开关班",
            "category": mode,
            "accountId": task.get("accountId") or "",
            "accountName": task.get("accountName") or "",
            "status": "失败" if fail_item else "成功",
            "message": (fail_reason if fail_item else f"已调用携程接口提交{sale_label}"),
            "batchMode": mode,
            "selectedMode": "按资源维度批量设置" if mode == "resource" else "按产品维度批量设置",
            "selectedSale": sale_label,
            "selectedPeriod": "按日期设置",
            "filledDates": len(date_list),
            "dateStart": task.get("dateStart") or "",
            "dateEnd": task.get("dateEnd") or task.get("dateStart") or "",
            "api": "batchSaveProductInfo",
            "apiSuccessQuantity": success_quantity,
            "apiFailQuantity": fail_quantity,
            "apiOperationStatus": data.get("operationStatus"),
            "finishedAt": now_text(),
        })
    return {
        "items": items,
        "mode": mode,
        "count": success_quantity,
        "api": "batchSaveProductInfo",
        "apiResponse": {
            "operationStatus": data.get("operationStatus"),
            "totalQuantity": data.get("totalQuantity"),
            "successQuantity": success_quantity,
            "failQuantity": fail_quantity,
            "failedIdAndReasonList": failed,
        },
    }


def execute_inventory_batch_switch_task(page, task, product_refs):
    mode, identifiers = inventory_batch_identifiers(task, product_refs)
    identifiers = unique_preserve_order(identifiers)
    if not identifiers:
        raise RuntimeError("没有可用于批量开关班的产品ID或资源ID")
    page.goto(PRODUCT_LIST_URL, wait_until="domcontentloaded", timeout=60000)
    page.wait_for_timeout(3000)
    body_text = page.locator("body").inner_text(timeout=15000)
    if "登录" in body_text and "产品" not in body_text:
        raise RuntimeError("携程登录态失效，请重新登录账号")
    if mode == "resource":
        return execute_inventory_batch_switch_api(page, task, mode, identifiers)
    operation = task.get("operationType", "")
    click_bottom_action(page, ["批量开关班"])
    page.wait_for_timeout(1200)
    if not page.locator(".ant-modal:visible").count():
        raise RuntimeError("未打开携程批量开关班弹窗")
    modal = page.locator(".ant-modal:visible").last

    if mode == "resource":
        selected_mode = click_modal_text(modal, page, ["按资源维度批量设置"])
    else:
        selected_mode = click_modal_text(modal, page, ["按产品维度批量设置"])
    textarea = modal.locator("textarea").first
    textarea.fill("\n".join(identifiers), timeout=5000)
    sale_label = "关班" if operation == "closeInventory" else "开班"
    selected_sale = click_modal_text(modal, page, [sale_label])
    selected_period = click_modal_text(modal, page, ["按日期设置"])
    filled_dates = fill_modal_date_range(page, modal, task.get("dateStart", ""), task.get("dateEnd", "") or task.get("dateStart", ""))
    if not filled_dates:
        raise RuntimeError("批量开关班弹窗未能填入日期范围")

    clicked = ""
    for selector in [
        ".ant-modal:visible .ant-modal-footer button.ant-btn-primary",
        ".ant-modal:visible button:has-text('确 定')",
        ".ant-modal:visible button:has-text('确定')",
    ]:
        try:
            button = page.locator(selector)
            if button.count() and button.last.is_enabled(timeout=800):
                clicked = button.last.inner_text(timeout=1000).strip() or "确定"
                button.last.click(timeout=5000)
                page.wait_for_timeout(3000)
                break
        except Exception:
            continue
    if not clicked:
        raise RuntimeError("批量开关班弹窗未找到确定按钮")
    modal_open = page.locator(".ant-modal:visible").count() > 0
    screenshot = account_dir(task.get("accountId") or "default") / f"task_{task['id']}_batch_switch.png"
    page.screenshot(path=str(screenshot), full_page=True)
    if modal_open:
        modal_text = page.locator(".ant-modal:visible").last.inner_text(timeout=3000)
        raise RuntimeError(f"已点击确定，但批量开关班弹窗未关闭：{modal_text[:160]}")
    items = []
    for identifier in identifiers:
        items.append({
            "productId": identifier if mode == "product" else "-",
            "skuId": identifier if mode == "resource" else "",
            "productTitle": "批量开关班",
            "category": mode,
            "status": "成功",
            "message": f"已通过产品列表批量开关班提交{sale_label}",
            "batchMode": mode,
            "selectedMode": selected_mode,
            "selectedSale": selected_sale,
            "selectedPeriod": selected_period,
            "filledDates": filled_dates,
            "screenshot": str(screenshot),
            "finishedAt": now_text(),
        })
    return {
        "items": items,
        "mode": mode,
        "count": len(identifiers),
        "button": clicked,
        "screenshot": str(screenshot),
    }


def product_sku_identifiers(product):
    values = set()
    for sku in product.get("skus") or []:
        for key in ("resourceId", "id", "packageId"):
            value = str(sku.get(key) or "").strip()
            if value:
                values.add(value)
    return values


def inventory_resource_account_groups(task, product_refs):
    identifiers = unique_preserve_order(split_identifier_text(task.get("skuText", "")))
    if not identifiers:
        raise RuntimeError("没有可用于批量开关班的资源ID")
    identifier_set = set(identifiers)
    account_ids = unique_preserve_order(
        [str(ref.get("accountId") or "") for ref in product_refs if ref.get("accountId")]
    )
    if task.get("accountId") and task.get("accountId") != "multiple":
        account_ids = unique_preserve_order([task.get("accountId")] + account_ids)
    if not account_ids:
        raise RuntimeError("资源维度批量开关班需要指定账号")

    groups = {account_id: [] for account_id in account_ids}
    matched = set()
    for ref in product_refs:
        account_id = str(ref.get("accountId") or task.get("accountId") or "")
        product_id = str(ref.get("productId") or "")
        if not account_id or not product_id:
            continue
        product = product_lookup(account_id).get(product_id)
        if not product:
            continue
        sku_ids = product_sku_identifiers(product)
        for identifier in identifiers:
            if identifier in sku_ids and identifier not in matched:
                groups.setdefault(account_id, []).append(identifier)
                matched.add(identifier)

    missing = [identifier for identifier in identifiers if identifier not in matched]
    if missing:
        for account_id in account_ids:
            lookup = product_lookup(account_id)
            all_sku_ids = set()
            for product in lookup.values():
                all_sku_ids.update(product_sku_identifiers(product))
            for identifier in list(missing):
                if identifier in all_sku_ids and identifier not in matched:
                    groups.setdefault(account_id, []).append(identifier)
                    matched.add(identifier)
                    missing.remove(identifier)

    if missing and len(account_ids) == 1:
        groups.setdefault(account_ids[0], []).extend(missing)
        matched.update(missing)
        missing = []
    if missing:
        raise RuntimeError(f"无法判断以下资源ID所属账号：{', '.join(missing[:20])}")
    return {account_id: ids for account_id, ids in groups.items() if ids}


def execute_resource_inventory_groups(active_playwright, task_id, task, product_refs):
    groups = inventory_resource_account_groups(task, product_refs)
    total = sum(len(ids) for ids in groups.values())
    if not total:
        raise RuntimeError("没有可用于批量开关班的资源ID")
    success = 0
    failed = 0
    processed = 0
    for account_id, identifiers in groups.items():
        browser = None
        context = None
        try:
            update_task(
                task_id,
                status="执行中",
                progress=min(95, 10 + int(processed / total * 85)),
                currentStep=f"正在按资源维度调用携程批量开关班接口：{account_id}",
            )
            storage_path = account_dir(account_id) / "storage_state.json"
            browser = active_playwright.chromium.launch(channel="chrome", headless=True)
            context = browser.new_context(
                storage_state=str(storage_path) if storage_path.exists() else None,
                viewport={"width": 1440, "height": 1000},
                locale="zh-CN",
                timezone_id="Asia/Shanghai",
            )
            page = context.new_page()
            group_task = dict(task)
            group_task["accountId"] = account_id
            group_task["skuText"] = "\n".join(identifiers)
            batch_result = execute_inventory_batch_switch_task(page, group_task, [])
            for item in batch_result.get("items", []):
                append_task_item(task_id, item)
            success += len([item for item in batch_result.get("items", []) if item.get("status") == "成功"])
            failed += len([item for item in batch_result.get("items", []) if item.get("status") != "成功"])
            processed += len(identifiers)
        except Exception as error:
            failed += len(identifiers)
            processed += len(identifiers)
            for identifier in identifiers:
                append_task_item(task_id, {
                    "productId": "-",
                    "skuId": identifier,
                    "productTitle": "批量开关班",
                    "category": "resource",
                    "status": "失败",
                    "message": str(error),
                    "batchMode": "resource",
                    "finishedAt": now_text(),
                })
        finally:
            if context:
                context.close()
            if browser:
                browser.close()
    status = "成功" if failed == 0 else ("部分失败" if success else "失败")
    update_task(
        task_id,
        status=status,
        progress=100,
        currentStep="执行完成",
        finishedAt=now_text(),
        result=f"成功 {success} 个资源，失败 {failed} 个资源",
        error="" if failed == 0 else "部分资源执行失败，请查看明细",
    )
    return {"success": success, "failed": failed}


def execute_product_task(page, task, product):
    product_id = str(product.get("productId") or product.get("id"))
    operation = task.get("operationType", "")
    url = product_edit_url(product)
    page.goto(url, wait_until="domcontentloaded", timeout=60000)
    page.wait_for_timeout(4000)
    body_text = page.locator("body").inner_text(timeout=15000)
    if "登录" in body_text and "产品" not in body_text:
        raise RuntimeError("携程登录态失效，请重新登录账号")
    close_open_dialog(page)
    ensure_price_stock_area(page)

    if operation in ("openInventory", "closeInventory"):
        action = click_bottom_action(page, ["开/关班", "批量开关班"])
    else:
        action = click_bottom_action(page, ["设置价格/库存", "批量设置价格库存"])
    if not action:
        raise RuntimeError("未找到携程页面上的操作按钮")

    dialog_info = fill_task_dialog(page, task)
    save_info = save_dialog_and_page(page)
    if not save_info.get("dialogButton") and not save_info.get("pageButton"):
        raise RuntimeError("已打开操作入口，但未找到确认/保存按钮")
    if save_info.get("modalStillOpen"):
        raise RuntimeError("已点击保存，但携程弹窗未关闭，可能日期或必填项未完成")
    screenshot = account_dir(task.get("accountId") or "default") / f"task_{task['id']}_{product_id}.png"
    page.screenshot(path=str(screenshot), full_page=True)
    return {
        "productId": product_id,
        "productTitle": product.get("title", ""),
        "category": product.get("category", ""),
        "status": "成功",
        "message": f"已执行 {task.get('operationLabel') or operation}",
        "actionButton": action,
        "dialog": dialog_info,
        "save": save_info,
        "screenshot": str(screenshot),
        "finishedAt": now_text(),
    }


def ctrip_response_error(endpoint, text, data=None):
    data = data or {}
    response_base = data.get("responseBaseData") or {}
    response_status = data.get("ResponseStatus") or {}
    error_code = response_base.get("errorCode") or ""
    message = response_base.get("message") or ""
    extension_message = ""
    for item in response_status.get("Extension") or []:
        if item.get("ContentType") == "Error" and item.get("Value"):
            extension_message = item.get("Value")
            break
    readable = message or extension_message or text[:500]
    if error_code == "key.v2.api.product.dayTrip.wrong.link.error":
        return (
            f"接口 {endpoint} 被携程拒绝：{readable}。"
            "这是携程 DayTrip/活动类产品的页面链接上下文校验失败，不是资源 ID 或库价读取失败；"
            "需要使用携程前端当前页面生成的提交上下文后再保存。"
        )
    if error_code:
        return f"接口 {endpoint} 返回失败：{error_code} {readable}"
    return f"接口 {endpoint} 返回失败：{text[:500]}"


def call_vbooking_api(page, endpoint, payload):
    result = page.evaluate(
        """
        async ({endpoint, payload}) => {
          const response = await fetch(`https://m.ctrip.com/restapi/soa2/16359/json/${endpoint}`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'accept': 'application/json',
              'content-type': 'application/json; charset=utf-8',
              'clienturl': location.href
            },
            body: JSON.stringify(payload)
          });
          const text = await response.text();
          let data = null;
          try { data = JSON.parse(text); } catch (error) {}
          return {ok: response.ok, status: response.status, text, data};
        }
        """,
        {"endpoint": endpoint, "payload": payload},
    )
    if not result.get("ok"):
        raise RuntimeError(f"接口 {endpoint} 返回 HTTP {result.get('status')}")
    data = result.get("data") or {}
    response_base = data.get("responseBaseData") or {}
    ack = (data.get("ResponseStatus") or {}).get("Ack")
    if response_base.get("success") is False or ack == "Failure":
        raise RuntimeError(ctrip_response_error(endpoint, result.get("text", ""), data))
    return data


def call_ctrip_soa_api(page, service_id, endpoint, payload):
    result = page.evaluate(
        """
        async ({serviceId, endpoint, payload}) => {
          const response = await fetch(`https://m.ctrip.com/restapi/soa2/${serviceId}/${endpoint}`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'accept': 'application/json, text/plain, */*',
              'appname': 'vbkbusiness',
              'content-type': 'application/json;charset=UTF-8',
              'clienturl': location.href
            },
            body: JSON.stringify(payload)
          });
          const text = await response.text();
          let data = null;
          try { data = JSON.parse(text); } catch (error) {}
          return {ok: response.ok, status: response.status, text, data};
        }
        """,
        {"serviceId": service_id, "endpoint": endpoint, "payload": payload},
    )
    if not result.get("ok"):
        raise RuntimeError(f"携程数据接口 {endpoint} 返回 HTTP {result.get('status')}")
    data = result.get("data") or {}
    ack = (data.get("ResponseStatus") or {}).get("Ack")
    if ack == "Failure":
        raise RuntimeError(f"携程数据接口 {endpoint} 返回失败：{result.get('text', '')[:500]}")
    return data


TRAFFIC_CONFIG = {
    "oneday": {
        "businessLine": "一日游",
        "label": "一日游",
        "queryId": 367,
        "rankQueryId": 368,
        "metrics": [
            ("odt_dtl_vst_uv", "详情页访问人数"),
            ("odt_dtl_vst_pv", "详情页访问次数"),
            ("odt_edit_vst_uv", "预订页访问人数"),
            ("odt_pay_ord_users", "支付人数"),
        ],
        "rankMetrics": ["odt_dtl_vst_uv", "odt_pay_ord_users|odt_dtl_vst_uv|/", "odt_pay_ord_users"],
        "rankOrder": "odt_dtl_vst_uv",
    },
    "category_activity": {
        "businessLine": "品类活动",
        "label": "品类服务",
        "queryId": 361,
        "rankQueryId": 362,
        "metrics": [
            ("act_dtl_vst_uv", "详情页访问人数"),
            ("act_dtl_vst_pv", "详情页访问次数"),
            ("act_edit_vst_uv", "预订页访问人数"),
            ("ttd_pay_per", "支付人数"),
        ],
        "rankMetrics": ["act_dtl_vst_uv", "ttd_pay_per|act_dtl_vst_uv|/", "ttd_pay_per"],
        "rankOrder": "act_dtl_vst_uv",
    },
}


def metric_date_value(metric_data):
    for row in metric_data.get("dateValueMapList") or []:
        values = row.get("valueDateMap") or {}
        if values:
            key = sorted(values)[-1]
            return values.get(key)
    return None


def metric_mom_value(metric_data):
    subline = (metric_data.get("sublineDataMap") or {}).get("MOMRate") or {}
    for row in subline.get("dataList") or []:
        values = row.get("valueDateMap") or {}
        if values:
            key = sorted(values)[-1]
            return values.get(key)
    return None


def parse_traffic_summary(data, config):
    by_metric = {item.get("metric"): item for item in data.get("resultList") or []}
    cards = []
    for metric, label in config["metrics"]:
        raw = by_metric.get(metric) or {}
        cards.append({
            "metric": metric,
            "label": label,
            "value": metric_date_value(raw),
            "momRate": metric_mom_value(raw),
        })
    return cards


def parse_traffic_trend(data, config):
    by_metric = {item.get("metric"): item for item in data.get("resultList") or []}
    dates = set()
    metric_maps = {}
    for metric, _label in config["metrics"]:
        raw = by_metric.get(metric) or {}
        merged = {}
        for row in raw.get("dateValueMapList") or []:
            for date, value in (row.get("valueDateMap") or {}).items():
                merged[date] = value
                dates.add(date)
        metric_maps[metric] = merged
    rows = []
    first_metric = config["metrics"][0][0]
    third_metric = config["metrics"][2][0]
    fourth_metric = config["metrics"][3][0]
    for date in sorted(dates):
        detail_uv = metric_maps.get(first_metric, {}).get(date) or 0
        booking_uv = metric_maps.get(third_metric, {}).get(date) or 0
        pay_users = metric_maps.get(fourth_metric, {}).get(date) or 0
        rows.append({
            "date": date,
            "detailUv": detail_uv,
            "detailPv": metric_maps.get(config["metrics"][1][0], {}).get(date) or 0,
            "bookingUv": booking_uv,
            "payUsers": pay_users,
            "bookingRate": (booking_uv / detail_uv) if detail_uv else 0,
            "payRate": (pay_users / detail_uv) if detail_uv else 0,
        })
    return rows


def value_map_number(row, key):
    value_map = row.get("valueMap") or {}
    value = (value_map.get(key) or {}).get("value")
    return value


def parse_traffic_rank(data, config):
    rows = []
    metrics = config["rankMetrics"]
    for index, row in enumerate(data.get("resultList") or [], 1):
        dim = row.get("dimMap") or {}
        rows.append({
            "rank": index,
            "productId": str(dim.get("productid") or ""),
            "productName": dim.get("productName") or "",
            "detailUv": value_map_number(row, metrics[0]),
            "payRate": value_map_number(row, metrics[1]),
            "payUsers": value_map_number(row, metrics[2]),
        })
    return rows


def period_start_date(end_date, days):
    end_dt = datetime.strptime(end_date, "%Y-%m-%d")
    return (end_dt - timedelta(days=max(1, int(days)) - 1)).strftime("%Y-%m-%d")


def traffic_rank_payload(config, start, end, page_size=50):
    return {
        "calculator": "sum",
        "tagMap": {},
        "startDate": start,
        "endDate": end,
        "calculate": {"unit": "d", "value": 30},
        "likeTagMap": {},
        "pageNo": 1,
        "pageSize": page_size,
        "queryId": [config["rankQueryId"]],
        "groupTagList": ["productid", "productName"],
        "orderTag": config["rankOrder"],
        "orderType": "desc",
        "orderAgg": "sum",
        "kylinMetricList": [{"metric": metric, "sublineTypeList": ["MOMRate"]} for metric in config["rankMetrics"]],
    }


def sync_traffic_dashboard(account_id, business_keys=None, days=30):
    storage_path = account_dir(account_id) / "storage_state.json"
    if not storage_path.exists():
        raise RuntimeError("账号还没有保存携程登录态，请先在账号管理完成登录")
    business_keys = business_keys or ["oneday", "category_activity"]
    days = max(1, min(int(days or 30), 60))
    today = datetime.now()
    end = (today - timedelta(days=1)).strftime("%Y-%m-%d")
    start = (today - timedelta(days=days)).strftime("%Y-%m-%d")
    dashboard = {
        "accountId": account_id,
        "accountName": ACCOUNT_NAME_HINTS.get(account_id, account_id),
        "dateType": f"近{days}天",
        "days": days,
        "startDate": start,
        "endDate": end,
        "syncedAt": now_text(),
        "businessLines": [],
    }
    task_playwright = sync_playwright().start()
    browser = None
    context = None
    try:
        browser = task_playwright.chromium.launch(channel="chrome", headless=True)
        context = browser.new_context(
            storage_state=str(storage_path),
            locale="zh-CN",
            timezone_id="Asia/Shanghai",
        )
        page = context.new_page()
        page.goto("https://vbooking.ctrip.com/micro/tour-bi-vendor-new/#/tour/traffic/trafficAnalysis", wait_until="domcontentloaded", timeout=60000)
        page.wait_for_timeout(2000)
        for key in business_keys:
            config = TRAFFIC_CONFIG.get(key)
            if not config:
                continue
            summary_payload = {
                "queryId": [config["queryId"]],
                "needAggregate": True,
                "groupTagList": [],
                "calculator": "sum",
                "tagMap": {},
                "startDate": start,
                "endDate": end,
                "metricList": [{"metric": metric, "sublineTypeList": ["MOMRate"]} for metric, _ in config["metrics"]],
                "calculate": {"unit": "d", "value": 7},
            }
            trend_payload = {
                "queryId": [config["queryId"]],
                "needAggregate": False,
                "groupTagList": [],
                "calculator": "sum",
                "tagMap": {},
                "startDate": start,
                "endDate": end,
                "metricList": [{"metric": metric, "sublineTypeList": []} for metric, _ in config["metrics"]],
                "calculate": {"unit": "d", "value": 1},
            }
            summary_data = call_ctrip_soa_api(page, "13807", "getKylinDataWithSublineV2", summary_payload)
            trend_data = call_ctrip_soa_api(page, "13807", "getKylinTrendLineData", trend_payload)
            product_ranks = {}
            for period_key, period_days in [("yesterday", 1), ("7", 7), ("14", 14), ("30", 30)]:
                period_start = period_start_date(end, period_days)
                rank_data = call_ctrip_soa_api(
                    page,
                    "13807",
                    "getSortableKylinDataWithSublineSameTable",
                    traffic_rank_payload(config, period_start, end),
                )
                product_ranks[period_key] = parse_traffic_rank(rank_data, config)
            dashboard["businessLines"].append({
                "key": key,
                "businessLine": config["businessLine"],
                "label": config["label"],
                "summary": parse_traffic_summary(summary_data, config),
                "trend": parse_traffic_trend(trend_data, config),
                "products": product_ranks.get("30", []),
                "productRanks": product_ranks,
                "rawQuery": {
                    "summaryQueryId": config["queryId"],
                    "rankQueryId": config["rankQueryId"],
                },
            })
        traffic_file(account_id).write_text(json.dumps(dashboard, ensure_ascii=False, indent=2), encoding="utf-8")
        return {"ok": True, "traffic": dashboard}
    finally:
        if context:
            context.close()
        if browser:
            browser.close()
        task_playwright.stop()


def read_traffic_dashboard(account_id):
    path = traffic_file(account_id)
    if not path.exists():
        return {
            "accountId": account_id,
            "accountName": ACCOUNT_NAME_HINTS.get(account_id, account_id),
            "dateType": "",
            "startDate": "",
            "endDate": "",
            "syncedAt": "",
            "businessLines": [],
        }
    return json.loads(path.read_text(encoding="utf-8"))


def safe_import_id(value):
    text = str(value or "").strip().lower()
    text = re.sub(r"[^a-z0-9\u4e00-\u9fa5]+", "-", text)
    return text.strip("-") or "unknown"


def as_import_number(value):
    if value in ("", None):
        return 0
    try:
        return float(str(value).replace(",", "").replace("%", "").strip())
    except ValueError:
        return 0


def normalize_import_date(value):
    text = str(value or "").strip().replace("/", "-")
    try:
        return datetime.strptime(text[:10], "%Y-%m-%d").strftime("%Y-%m-%d")
    except ValueError:
        return ""


def import_rank_rows(rows, start_date, end_date):
    product_map = {}
    for row in rows:
        date = row.get("date", "")
        if date < start_date or date > end_date:
            continue
        key = row.get("productId") or row.get("productName") or "unknown"
        item = product_map.setdefault(key, {
            "productId": row.get("productId", ""),
            "productName": row.get("productName", ""),
            "detailUv": 0,
            "payUsers": 0,
        })
        item["detailUv"] += row.get("detailUv", 0)
        item["payUsers"] += row.get("payUsers", 0)
    ranked = sorted(product_map.values(), key=lambda item: item.get("detailUv", 0), reverse=True)
    result = []
    for index, item in enumerate(ranked[:50], 1):
        detail_uv = item.get("detailUv", 0)
        pay_users = item.get("payUsers", 0)
        result.append({
            "rank": index,
            "productId": str(item.get("productId") or ""),
            "productName": item.get("productName") or "",
            "detailUv": detail_uv,
            "payRate": (pay_users / detail_uv) if detail_uv else 0,
            "payUsers": pay_users,
        })
    return result


def build_imported_traffic_dashboards(rows):
    normalized = []
    for row in rows or []:
        date = normalize_import_date(row.get("date"))
        if not date:
            continue
        channel = str(row.get("channel") or "").strip() or "其它渠道"
        account_name = str(row.get("accountName") or row.get("account_name") or "").strip() or channel
        business_line = str(row.get("businessLine") or row.get("business_line") or "").strip() or "综合"
        normalized.append({
            "channel": channel,
            "accountName": account_name,
            "businessLine": business_line,
            "date": date,
            "productId": str(row.get("productId") or row.get("product_id") or "").strip(),
            "productName": str(row.get("productName") or row.get("product_name") or "").strip(),
            "detailUv": as_import_number(row.get("detailUv") or row.get("detail_uv")),
            "detailPv": as_import_number(row.get("detailPv") or row.get("detail_pv")),
            "bookingUv": as_import_number(row.get("bookingUv") or row.get("booking_uv")),
            "payUsers": as_import_number(row.get("payUsers") or row.get("pay_users")),
        })
    grouped = {}
    for row in normalized:
        account_id = f"import-{safe_import_id(row['channel'])}-{safe_import_id(row['accountName'])}"
        block_key = safe_import_id(row["businessLine"])
        grouped.setdefault(account_id, {
            "accountId": account_id,
            "accountName": f"{row['channel']} · {row['accountName']}",
            "channel": row["channel"],
            "source": "imported",
            "dateType": "导入数据",
            "syncedAt": now_text(),
            "business": {},
        })
        grouped[account_id]["business"].setdefault(block_key, {
            "key": block_key,
            "businessLine": row["businessLine"],
            "label": row["businessLine"],
            "source": "imported",
            "rows": [],
        })["rows"].append(row)
    dashboards = []
    for dashboard in grouped.values():
        all_dates = [row["date"] for block in dashboard["business"].values() for row in block["rows"]]
        start = min(all_dates) if all_dates else ""
        end = max(all_dates) if all_dates else ""
        output = {
            "accountId": dashboard["accountId"],
            "accountName": dashboard["accountName"],
            "channel": dashboard["channel"],
            "source": "imported",
            "dateType": "导入数据",
            "startDate": start,
            "endDate": end,
            "syncedAt": dashboard["syncedAt"],
            "businessLines": [],
        }
        for block in dashboard["business"].values():
            by_date = {}
            for row in block["rows"]:
                item = by_date.setdefault(row["date"], {"date": row["date"], "detailUv": 0, "detailPv": 0, "bookingUv": 0, "payUsers": 0})
                item["detailUv"] += row["detailUv"]
                item["detailPv"] += row["detailPv"]
                item["bookingUv"] += row["bookingUv"]
                item["payUsers"] += row["payUsers"]
            trend = []
            for item in sorted(by_date.values(), key=lambda value: value["date"]):
                detail_uv = item["detailUv"]
                item["bookingRate"] = item["bookingUv"] / detail_uv if detail_uv else 0
                item["payRate"] = item["payUsers"] / detail_uv if detail_uv else 0
                trend.append(item)
            totals = {
                "detailUv": sum(item["detailUv"] for item in trend),
                "detailPv": sum(item["detailPv"] for item in trend),
                "bookingUv": sum(item["bookingUv"] for item in trend),
                "payUsers": sum(item["payUsers"] for item in trend),
            }
            product_ranks = {}
            for key, days in [("yesterday", 1), ("7", 7), ("14", 14), ("30", 30)]:
                period_start = period_start_date(end, days) if end else ""
                product_ranks[key] = import_rank_rows(block["rows"], period_start, end) if period_start else []
            output["businessLines"].append({
                "key": block["key"],
                "businessLine": block["businessLine"],
                "label": block["label"],
                "source": "imported",
                "summary": [
                    {"metric": "import_dtl_vst_uv", "label": "详情页访问人数", "value": totals["detailUv"], "momRate": None},
                    {"metric": "import_dtl_vst_pv", "label": "详情页访问次数", "value": totals["detailPv"], "momRate": None},
                    {"metric": "import_edit_vst_uv", "label": "预订页访问人数", "value": totals["bookingUv"], "momRate": None},
                    {"metric": "import_pay_users", "label": "支付人数", "value": totals["payUsers"], "momRate": None},
                ],
                "trend": trend,
                "products": product_ranks.get("30", []),
                "productRanks": product_ranks,
            })
        dashboards.append(output)
    return dashboards


def read_imported_traffic_dashboards():
    path = imported_traffic_file()
    if not path.exists():
        return []
    return json.loads(path.read_text(encoding="utf-8"))


def save_imported_traffic(rows):
    dashboards = build_imported_traffic_dashboards(rows)
    imported_traffic_file().write_text(json.dumps(dashboards, ensure_ascii=False, indent=2), encoding="utf-8")
    return {"ok": True, "traffic": dashboards, "count": len(rows or [])}


def compact_date(value):
    if not value:
        return ""
    return re.sub(r"\D", "", str(value))[:8]


def date_tokens(start, end):
    start_token = compact_date(start)
    end_token = compact_date(end) or start_token
    if not start_token:
        return []
    try:
        start_date = datetime.strptime(start_token, "%Y%m%d")
        end_date = datetime.strptime(end_token, "%Y%m%d")
    except ValueError:
        return [start_token]
    if end_date < start_date:
        end_date = start_date
    days = []
    current = start_date
    while current <= end_date:
        days.append(current.strftime("%Y%m%d"))
        current += timedelta(days=1)
    return days


def collect_sale_entries(node, target_days, entries=None, path=""):
    if entries is None:
        entries = []
    if isinstance(node, dict):
        day = str(node.get("day") or "")
        if day in target_days and "sale" in node:
            entries.append({
                "path": path,
                "day": day,
                "sale": bool(node.get("sale")),
                "salePrice": node.get("salePrice"),
                "costPrice": node.get("costPrice"),
            })
        for key, value in node.items():
            collect_sale_entries(value, target_days, entries, f"{path}.{key}" if path else str(key))
    elif isinstance(node, list):
        for index, value in enumerate(node):
            collect_sale_entries(value, target_days, entries, f"{path}[{index}]")
    return entries


def read_price_stock_status(page, product_id, target_days):
    payload = {
        "productId": int(product_id),
        "draftTypes": ["PriceAndStock", "NegativeGrossProfit", "LowBrokerageRate"],
        "requestBaseData": {
            "extParameterList": [
                {"key": "page_version", "value": "5.3"},
                {"key": "needValidatePermission", "value": "true"},
            ]
        },
    }
    data = call_vbooking_api(page, "getProductDraft", payload)
    entries = collect_sale_entries(data, set(target_days))
    open_count = sum(1 for item in entries if item.get("sale"))
    closed_count = sum(1 for item in entries if not item.get("sale"))
    return {
        "days": target_days,
        "entryCount": len(entries),
        "openCount": open_count,
        "closedCount": closed_count,
        "allOpen": bool(entries) and closed_count == 0,
        "allClosed": bool(entries) and open_count == 0,
        "sample": entries[:8],
    }


def request_base(page_version="6.0"):
    return {
        "extParameterList": [
            {"key": "page_version", "value": page_version},
            {"key": "needValidatePermission", "value": "true"},
        ]
    }


def split_ids(value):
    return [item for item in unique_preserve_order(re.split(r"[\s,，;；]+", str(value or "").strip())) if item]


def build_sku_lookup(product):
    by_resource = {}
    by_package = {}
    for sku in product.get("skus") or []:
        resource_id = str(sku.get("resourceId") or sku.get("id") or "")
        package_id = str(sku.get("packageId") or "")
        api_package_id = str(sku.get("subPackageId") or "")
        if resource_id:
            by_resource[resource_id] = sku
        if package_id:
            by_package[package_id] = sku
        if api_package_id:
            by_package[api_package_id] = sku
    return by_resource, by_package


def planned_price_value(operation, current_price, raw_value):
    if raw_value in ("", None):
        return ""
    try:
        value = float(raw_value)
        price = float(current_price or 0)
    except (TypeError, ValueError):
        return ""
    if operation == "setPrice":
        return int(round(value))
    if operation == "adjustPrice":
        return int(round(max(0, price + value)))
    if operation == "percentPrice":
        return int(round(max(0, price * (1 + value / 100))))
    return ""


def extract_holiday_preview_rows(product, data, target_days, requested_resource_ids, task):
    requested = {str(item) for item in requested_resource_ids if item}
    by_resource, by_package = build_sku_lookup(product)
    price_rows = {}
    for package in data.get("packagePriceAndStockInfoList") or data.get("packagePriceAndStockList") or []:
        api_package_id = str(package.get("packageId") or "")
        price = package.get("price") or {}
        resources = (price.get("resourcePriceList") or []) + (price.get("resourcePriceDraftList") or [])
        for resource in resources:
            resource_id = resource_node_id(resource)
            if requested and resource_id not in requested and api_package_id not in requested:
                continue
            sku = by_resource.get(resource_id) or by_package.get(api_package_id) or {}
            package_id = str(sku.get("packageId") or api_package_id)
            for row in resource.get("priceList") or []:
                day = str(row.get("day") or row.get("date") or "")
                if day not in target_days:
                    continue
                key = (api_package_id, resource_id, day)
                price_rows[key] = {
                    "accountId": product.get("accountId", ""),
                    "productId": str(product.get("productId") or product.get("id") or ""),
                    "productTitle": product.get("title", ""),
                    "category": product.get("category", ""),
                    "packageId": package_id,
                    "apiPackageId": api_package_id,
                    "packageName": sku.get("packageName") or sku.get("packageInventoryName") or "",
                    "resourceId": resource_id,
                    "resourceName": sku.get("resourceName") or sku.get("name") or "",
                    "day": day,
                    "sale": row.get("sale"),
                    "salePrice": row.get("salePrice"),
                    "costPrice": row.get("costPrice"),
                    "marketPrice": row.get("marketPrice"),
                    "ruleId": row.get("ruleId"),
                    "plannedPrice": planned_price_value(task.get("operationType"), row.get("salePrice"), task.get("priceValue")),
                    "plannedStock": task.get("stockValue") if task.get("operationType") == "setStock" else "",
                    "plannedSale": False if task.get("operationType") == "closeInventory" else (True if task.get("operationType") == "openInventory" else ""),
                }
                planned_price = price_rows[key].get("plannedPrice")
                cost_price = as_float(row.get("costPrice"))
                planned_price_number = as_float(planned_price)
                if planned_price_number is not None and cost_price is not None:
                    price_rows[key]["belowCost"] = planned_price_number < cost_price
    for package in data.get("packagePriceAndStockInfoList") or data.get("packagePriceAndStockList") or []:
        api_package_id = str(package.get("packageId") or "")
        stock = package.get("stock") or {}
        resources = (stock.get("resourceStockList") or []) + (stock.get("resourceStockDraftList") or [])
        for resource in resources:
            resource_id = resource_node_id(resource)
            if requested and resource_id not in requested and api_package_id not in requested:
                continue
            for row in resource.get("stockList") or []:
                day = str(row.get("day") or row.get("date") or "")
                key = (api_package_id, resource_id, day)
                if day not in target_days or key not in price_rows:
                    continue
                price_rows[key].update({
                    "stockSale": row.get("sale"),
                    "total": row.get("total"),
                    "used": row.get("used"),
                    "unUsed": row.get("unUsed"),
                })
    return list(price_rows.values())


def number_values(values):
    result = []
    for value in values:
        if value in ("", None):
            continue
        try:
            result.append(float(value))
        except (TypeError, ValueError):
            continue
    return result


def summarize_price_stock_resources(resources):
    days = []
    prices = []
    stocks = []
    open_count = 0
    closed_count = 0
    for resource in resources:
        for row in resource.get("days") or []:
            day = str(row.get("day") or "")
            if day:
                days.append(day)
            if row.get("sale") is True or row.get("stockSale") is True:
                open_count += 1
            elif row.get("sale") is False or row.get("stockSale") is False:
                closed_count += 1
            prices.extend(number_values([row.get("salePrice")]))
            stocks.extend(number_values([row.get("unUsed"), row.get("total")]))
    unique_days = sorted(set(days))
    summary = {
        "resourceCount": len(resources),
        "dateCount": len(unique_days),
        "openCount": open_count,
        "closedCount": closed_count,
        "sampleStart": unique_days[0] if unique_days else "",
        "sampleEnd": unique_days[-1] if unique_days else "",
        "rowCount": sum(len(resource.get("days") or []) for resource in resources),
    }
    if prices:
        summary["minPrice"] = min(prices)
        summary["maxPrice"] = max(prices)
    if stocks:
        summary["minStock"] = min(stocks)
        summary["maxStock"] = max(stocks)
    return summary


def extract_price_stock_snapshot(product, data):
    by_resource, by_package = build_sku_lookup(product)
    resources = {}
    for package in data.get("packagePriceAndStockInfoList") or data.get("packagePriceAndStockList") or []:
        api_package_id = str(package.get("packageId") or "")
        sku_by_package = by_package.get(api_package_id) or {}
        price = package.get("price") or {}
        for resource in price.get("resourcePriceDraftList") or price.get("resourcePriceList") or []:
            resource_id = str(resource.get("resourceId") or "")
            sku = by_resource.get(resource_id) or sku_by_package
            package_id = str(sku.get("packageId") or api_package_id)
            key = (api_package_id, resource_id)
            item = resources.setdefault(key, {
                "packageId": package_id,
                "apiPackageId": api_package_id,
                "packageName": sku.get("packageName") or sku.get("packageInventoryName") or "",
                "resourceId": resource_id,
                "resourceName": sku.get("resourceName") or sku.get("name") or "",
                "days": {},
            })
            for row in resource.get("priceList") or []:
                day = str(row.get("day") or row.get("date") or "")
                if not day:
                    continue
                item["days"].setdefault(day, {"day": day}).update({
                    "sale": row.get("sale"),
                    "salePrice": row.get("salePrice"),
                    "costPrice": row.get("costPrice"),
                    "marketPrice": row.get("marketPrice"),
                    "ruleId": row.get("ruleId"),
                })
        stock = package.get("stock") or {}
        for resource in stock.get("resourceStockDraftList") or stock.get("resourceStockList") or []:
            resource_id = str(resource.get("resourceId") or "")
            sku = by_resource.get(resource_id) or sku_by_package
            package_id = str(sku.get("packageId") or api_package_id)
            key = (api_package_id, resource_id)
            item = resources.setdefault(key, {
                "packageId": package_id,
                "apiPackageId": api_package_id,
                "packageName": sku.get("packageName") or sku.get("packageInventoryName") or "",
                "resourceId": resource_id,
                "resourceName": sku.get("resourceName") or sku.get("name") or "",
                "days": {},
            })
            for row in resource.get("stockList") or []:
                day = str(row.get("day") or row.get("date") or "")
                if not day:
                    continue
                item["days"].setdefault(day, {"day": day}).update({
                    "stockSale": row.get("sale"),
                    "total": row.get("total"),
                    "used": row.get("used"),
                    "unUsed": row.get("unUsed"),
                })
    resource_list = []
    for item in resources.values():
        day_rows = [item["days"][day] for day in sorted(item["days"])]
        resource = {key: value for key, value in item.items() if key != "days"}
        resource["days"] = day_rows
        resource["summary"] = summarize_price_stock_resources([resource])
        resource_list.append(resource)
    return {
        "syncedAt": now_text(),
        "status": "成功" if resource_list else "无库价",
        "resources": resource_list,
        "summary": summarize_price_stock_resources(resource_list),
    }


def price_stock_api_package_ids(product):
    ids = []
    for sku in product.get("skus") or []:
        if is_ttd_product(product):
            value = sku.get("subPackageId") or sku.get("packageId")
        else:
            value = sku.get("packageId") or sku.get("subPackageId")
        if value:
            ids.append(str(value))
    return [int(item) for item in unique_preserve_order(ids) if str(item).isdigit()]


def sync_product_price_stock_in_browser(active_playwright, account_id, max_products=0, product_id_filter="", category_filter=""):
    data = read_products(account_id)
    products = data.get("products", [])
    if product_id_filter:
        products = [
            product for product in products
            if str(product.get("productId") or product.get("id") or "") == str(product_id_filter)
        ]
    else:
        products = [
            product for product in products
            if (product.get("skus") or []) and int(product.get("onSaleResourceCount") or 0) > 0
        ]
    if category_filter:
        products = [
            product for product in products
            if str(category_filter) in str(product.get("category") or "")
        ]
    total = len(products)
    limit = max_products if max_products and max_products > 0 else total
    browser = None
    context = None
    synced = 0
    failed = 0
    skipped = 0
    try:
        storage_path = account_dir(account_id) / "storage_state.json"
        browser = active_playwright.chromium.launch(channel="chrome", headless=True)
        context = browser.new_context(
            storage_state=str(storage_path) if storage_path.exists() else None,
            viewport={"width": 1440, "height": 1000},
            locale="zh-CN",
            timezone_id="Asia/Shanghai",
        )
        page = context.new_page()
        page.goto(PRODUCT_LIST_URL, wait_until="domcontentloaded", timeout=60000)
        page.wait_for_timeout(1500)
        for index, product in enumerate(products[:limit], start=1):
            product_id = str(product.get("productId") or product.get("id") or "")
            if not product_id:
                continue
            try:
                package_ids = price_stock_api_package_ids(product)
                if not package_ids:
                    raise RuntimeError("未找到可查询库价的套餐 ID，请先同步 SKU 明细")
                page.goto(product_edit_url(product), wait_until="domcontentloaded", timeout=60000)
                page.wait_for_timeout(1200)
                body_text = page.locator("body").inner_text(timeout=15000)
                if "登录" in body_text and "产品" not in body_text:
                    raise RuntimeError("携程登录态失效，请重新登录账号")
                response = call_vbooking_api(page, "getPackagePriceStockInRange", {
                    "productId": int(product_id),
                    "packageIdList": package_ids,
                    "requestBaseData": request_base("6.0"),
                })
                snapshot = extract_price_stock_snapshot(product, response)
                product["priceStock"] = snapshot
                product["priceStockStatus"] = snapshot.get("status") or "成功"
                product["priceStockSyncedAt"] = snapshot.get("syncedAt") or now_text()
                product["priceStockError"] = ""
                synced += 1
            except Exception as error:
                product["priceStockStatus"] = "失败"
                product["priceStockError"] = str(error)
                product["priceStockSyncedAt"] = now_text()
                failed += 1
            data["priceStockSyncedAt"] = now_text()
            data["priceStockSyncProgress"] = {
                "processed": index,
                "total": limit,
                "synced": synced,
                "failed": failed,
                "skipped": skipped,
            }
            products_file(account_id).write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        data["priceStockSyncedAt"] = now_text()
        data["priceStockSyncProgress"] = {
            "processed": min(limit, total),
            "total": limit,
            "synced": synced,
            "failed": failed,
            "skipped": skipped,
        }
        products_file(account_id).write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        return {
            "ok": True,
            "accountId": account_id,
            "priceStockSyncedAt": data.get("priceStockSyncedAt", ""),
            "priceStockSyncProgress": data.get("priceStockSyncProgress", {}),
        }
    finally:
        if context:
            context.close()
        if browser:
            browser.close()


def douyin_date_periods(days=90):
    start = datetime.now().date()
    end = start + timedelta(days=days - 1)
    periods = []
    cursor = start.replace(day=1)
    while cursor <= end:
        next_month = (cursor.replace(day=28) + timedelta(days=4)).replace(day=1)
        period_start = max(cursor, start)
        period_end = min(next_month - timedelta(days=1), end)
        periods.append({"start": period_start.isoformat(), "end": period_end.isoformat()})
        cursor = next_month
    return periods


def douyin_stock_summary(days):
    opened = [day for day in days if day.get("sale")]
    closed = [day for day in days if not day.get("sale")]
    stocks = [day.get("unUsed") for day in days if isinstance(day.get("unUsed"), (int, float))]
    prices = [day.get("salePrice") for day in days if isinstance(day.get("salePrice"), (int, float)) and day.get("salePrice") > 0]
    return {
        "rowCount": len(days),
        "dateCount": len(days),
        "openCount": len(opened),
        "closedCount": len(closed),
        "minStock": min(stocks) if stocks else None,
        "maxStock": max(stocks) if stocks else None,
        "minPrice": min(prices) if prices else None,
        "maxPrice": max(prices) if prices else None,
        "sampleStart": days[0]["day"] if days else "",
        "sampleEnd": days[-1]["day"] if days else "",
    }


def douyin_stock_error_message(data):
    return data.get("status_msg") or (data.get("BaseResp") or {}).get("StatusMessage") or "抖音库存接口失败"


def map_douyin_single_products_to_skus(parent_product, single_products):
    skus = []
    total_stock = 0
    sold_qty = 0
    for index, item in enumerate(single_products or [], start=1):
        product_id = str(item.get("product_id") or "")
        if not product_id:
            continue
        stock_num = item.get("stock_num")
        stock_limit_type = item.get("stock_qty_limit_type")
        if stock_limit_type == 2 or stock_num == 10000000000:
            stock_text = "不限"
            normalized_stock = 0
        else:
            normalized_stock = int(stock_num or 0)
            stock_text = str(normalized_stock)
            total_stock += normalized_stock
        sold = int(item.get("sold_qty") or 0)
        sold_qty += sold
        package_name = item.get("combo_pkg_sub_name") or f"套餐{index}"
        resource_name = item.get("product_name") or package_name
        skus.append({
            "id": product_id,
            "skuId": product_id,
            "packageId": str(parent_product.get("productId") or parent_product.get("id") or ""),
            "resourceId": product_id,
            "name": resource_name,
            "packageName": package_name,
            "resourceName": resource_name,
            "skuSource": "douyin_presale_single_product",
            "price": money_from_cent(item.get("actual_amount")),
            "originPrice": money_from_cent(item.get("origin_amount")),
            "stock": normalized_stock,
            "stockText": stock_text,
            "soldQty": sold,
            "state": "在售" if item.get("status") == 1 else "不在售",
            "rowText": f"{package_name} / 售价 {money_from_cent(item.get('actual_amount'))} / 库存 {stock_text} / 已售 {sold}",
        })
    return skus, total_stock, sold_qty


def douyin_fetch_presale_single_products(page, root_id, parent_product_id):
    data = douyin_fetch_json(
        page,
        "/life/tobias/travel_agency/get_single_product",
        {"product_id": str(parent_product_id), "is_draft": False},
        root_id,
    )
    if not douyin_status_ok(data):
        raise RuntimeError(douyin_stock_error_message(data))
    return data.get("single_products") or []


def map_douyin_stock_snapshot(product, stock_product, date_periods):
    state_map = stock_product.get("amount_stock_state_map") or {}
    sku = (product.get("skus") or [{}])[0]
    days = []
    for date_text in sorted(state_map.keys()):
        info = state_map.get(date_text) or {}
        day_key = date_text.replace("-", "")
        room_state = info.get("room_state")
        sale = room_state == 1
        limit_type = info.get("stock_qty_limit_type")
        stock = 999999 if limit_type == 2 else info.get("avail_qty")
        if stock is None:
            stock = sku.get("stock")
        days.append({
            "day": day_key,
            "sale": sale,
            "stockSale": sale,
            "salePrice": sku.get("price"),
            "costPrice": sku.get("price"),
            "total": stock,
            "unUsed": stock,
            "used": info.get("unavail_qty") or 0,
            "raw": info,
        })
    summary = douyin_stock_summary(days)
    resource = {
        "packageId": product.get("productId"),
        "resourceId": sku.get("resourceId") or sku.get("id") or product.get("productId"),
        "packageName": product.get("title", ""),
        "resourceName": product.get("title", ""),
        "summary": summary,
        "days": days,
    }
    return {
        "status": "成功",
        "syncedAt": now_text(),
        "source": "douyin_stock_calendar",
        "datePeriods": date_periods,
        "summary": {**summary, "resourceCount": 1},
        "resources": [resource],
        "raw": {
            "auditStatus": stock_product.get("audit_status"),
            "saleProductId": stock_product.get("sale_product_id"),
        },
    }


def map_douyin_stock_snapshots(product, stock_products, date_periods, source="douyin_stock_calendar"):
    skus = product.get("skus") or []
    sku_lookup = {}
    for sku in skus:
        for key in (sku.get("resourceId"), sku.get("skuId"), sku.get("id")):
            if key:
                sku_lookup[str(key)] = sku
    resources = []
    all_days = []
    for stock_product in stock_products or []:
        sale_product_id = str(stock_product.get("sale_product_id") or "")
        sku = sku_lookup.get(sale_product_id) or (skus[0] if skus else {})
        state_map = stock_product.get("amount_stock_state_map") or {}
        days = []
        for date_text in sorted(state_map.keys()):
            info = state_map.get(date_text) or {}
            day_key = date_text.replace("-", "")
            room_state = info.get("room_state")
            sale = room_state == 1
            limit_type = info.get("stock_qty_limit_type")
            stock = 999999 if limit_type == 2 else info.get("avail_qty")
            if stock is None:
                stock = sku.get("stock")
            days.append({
                "day": day_key,
                "sale": sale,
                "stockSale": sale,
                "salePrice": sku.get("price"),
                "costPrice": sku.get("price"),
                "total": stock,
                "unUsed": stock,
                "used": info.get("unavail_qty") or 0,
                "raw": info,
            })
        summary = douyin_stock_summary(days)
        all_days.extend(days)
        resources.append({
            "packageId": sku.get("packageId") or product.get("productId"),
            "resourceId": sale_product_id or sku.get("resourceId") or sku.get("id") or product.get("productId"),
            "packageName": sku.get("packageName") or product.get("title", ""),
            "resourceName": stock_product.get("product_name") or sku.get("resourceName") or sku.get("name") or product.get("title", ""),
            "summary": summary,
            "days": days,
        })
    summary = douyin_stock_summary(sorted(all_days, key=lambda item: item.get("day", "")))
    summary["rowCount"] = len(all_days)
    summary["dateCount"] = len({day.get("day") for day in all_days if day.get("day")})
    return {
        "status": "成功",
        "syncedAt": now_text(),
        "source": source,
        "datePeriods": date_periods,
        "summary": {**summary, "resourceCount": len(resources)},
        "resources": resources,
        "raw": {
            "resourceCount": len(resources),
            "saleProductIds": [resource["resourceId"] for resource in resources],
        },
    }


def sync_douyin_product_price_stock_in_browser(active_playwright, account_id, max_products=0, product_id_filter="", category_filter=""):
    data = read_products(account_id)
    products = data.get("products") or []
    if not products:
        data = sync_douyin_products_in_browser(active_playwright, account_id, max_pages=80)
        products = data.get("products") or []
    if product_id_filter:
        wanted = set(split_ids(product_id_filter))
        products = [product for product in products if str(product.get("productId") or product.get("id")) in wanted]
    if category_filter:
        products = [product for product in products if product.get("category") == category_filter]
    if max_products:
        products = products[:max_products]
    browser = None
    context = None
    progress = {"total": len(products), "processed": 0, "synced": 0, "failed": 0, "skipped": 0}
    try:
        storage_path = account_dir(account_id) / "storage_state.json"
        browser = active_playwright.chromium.launch(channel="chrome", headless=True)
        context = browser.new_context(
            storage_state=str(storage_path) if storage_path.exists() else None,
            viewport={"width": 1440, "height": 1000},
            locale="zh-CN",
            timezone_id="Asia/Shanghai",
        )
        page = context.new_page()
        ctx = douyin_context_params(page)
        root_id = ctx["rootLifeAccountId"]
        date_periods = douyin_date_periods(days=90)
        lookup = {str(product.get("productId") or product.get("id")): product for product in data.get("products") or []}
        for product in products:
            progress["processed"] += 1
            product_id = str(product.get("productId") or product.get("id") or "")
            try:
                response = douyin_fetch_json(
                    page,
                    "/life/travel_agency/get_stock_calendar",
                    {
                        "data": {
                            "date_period_list": date_periods,
                            "product_id_list": [product_id],
                        },
                        "biz_type": 4,
                        "product_data_type": 1,
                    },
                    root_id,
                )
                if not douyin_status_ok(response):
                    message = douyin_stock_error_message(response)
                    if "SKU查询为空" in message or "预售券" in message:
                        single_products = douyin_fetch_presale_single_products(page, root_id, product_id)
                        if not single_products:
                            raise RuntimeError(message)
                        target = lookup.get(product_id, product)
                        skus, total_stock, sold_qty = map_douyin_single_products_to_skus(target, single_products)
                        if skus:
                            target["skus"] = skus
                            target["onSaleResourceCount"] = len([sku for sku in skus if sku.get("state") == "在售"])
                            target["offSaleResourceCount"] = len([sku for sku in skus if sku.get("state") != "在售"])
                            target["stockTotal"] = total_stock
                            target["soldQty"] = sold_qty
                            target["skuSyncStatus"] = "已同步预售券套餐"
                            target["skuSyncedAt"] = now_text()
                        else:
                            raise RuntimeError("预售券套餐查询为空")
                        response = douyin_fetch_json(
                            page,
                            "/life/travel_agency/get_stock_calendar",
                            {
                                "data": {
                                    "date_period_list": date_periods,
                                    "product_id_list": [sku["resourceId"] for sku in skus],
                                },
                                "biz_type": 4,
                                "product_data_type": 1,
                            },
                            root_id,
                        )
                        if not douyin_status_ok(response):
                            raise RuntimeError(douyin_stock_error_message(response))
                    else:
                        raise RuntimeError(message)
                stock_products = ((response.get("data") or {}).get("product_list") or [])
                target = lookup.get(product_id, product)
                if not stock_products:
                    progress["skipped"] += 1
                    target["priceStockStatus"] = "无库存日历"
                    target["priceStockSyncedAt"] = now_text()
                    continue
                if len(stock_products) == 1:
                    snapshot = map_douyin_stock_snapshot(target, stock_products[0], date_periods)
                else:
                    snapshot = map_douyin_stock_snapshots(target, stock_products, date_periods, source="douyin_presale_stock_calendar")
                target["priceStock"] = snapshot
                target["priceStockStatus"] = "成功"
                target["priceStockSyncedAt"] = snapshot.get("syncedAt")
                target["priceStockError"] = ""
                progress["synced"] += 1
            except Exception as error:
                target = lookup.get(product_id, product)
                target["priceStockStatus"] = "失败"
                target["priceStockError"] = str(error)
                target["priceStockSyncedAt"] = now_text()
                progress["failed"] += 1
            if progress["processed"] % 10 == 0:
                data["priceStockSyncedAt"] = now_text()
                data["priceStockSyncProgress"] = dict(progress)
                products_file(account_id).write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        data["priceStockSyncedAt"] = now_text()
        data["priceStockSyncProgress"] = dict(progress)
        products_file(account_id).write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        return {
            "ok": True,
            "accountId": account_id,
            "priceStockSyncedAt": data.get("priceStockSyncedAt", ""),
            "priceStockSyncProgress": data.get("priceStockSyncProgress", {}),
        }
    finally:
        if context:
            context.close()
        if browser:
            browser.close()


FLIGGY_SKU_TYPES = [
    ("adult", "成人", "adult_skuid", "adultPrice", "adultNum"),
    ("child", "儿童", "child_skuid", "childPrice", "childNum"),
    ("diff", "差价", "diff_skuid", "diffPrice", "diffNum"),
    ("elder", "老人", "elder_skuid", "elderPrice", "elderNum"),
    ("special", "特殊票", "special_skuid", "specialPrice", "specialNum"),
]


def fliggy_stock_summary(days):
    active_days = [day for day in days if day.get("sale")]
    stocks = [day.get("unUsed") for day in days if isinstance(day.get("unUsed"), (int, float))]
    prices = [day.get("salePrice") for day in days if isinstance(day.get("salePrice"), (int, float)) and day.get("salePrice") > 0]
    return {
        "rowCount": len(days),
        "dateCount": len({day.get("day") for day in days if day.get("day")}),
        "openCount": len(active_days),
        "closedCount": len(days) - len(active_days),
        "minStock": min(stocks) if stocks else None,
        "maxStock": max(stocks) if stocks else None,
        "minPrice": min(prices) if prices else None,
        "maxPrice": max(prices) if prices else None,
        "sampleStart": min((day.get("day") for day in days if day.get("day")), default=""),
        "sampleEnd": max((day.get("day") for day in days if day.get("day")), default=""),
    }


def fliggy_parse_stock_page(page, product):
    product_id = str(product.get("productId") or product.get("id") or "")
    page.goto(FLIGGY_STOCK_URL.format(item_id=product_id), wait_until="domcontentloaded", timeout=60000)
    page.wait_for_timeout(2500)
    combo_data = page.evaluate(
        """
        () => {
          const input = document.querySelector('input[name="comboData"]');
          return input ? input.value : "";
        }
        """
    )
    if not combo_data:
        raise RuntimeError("飞猪库存页未找到 comboData")
    data = json.loads(combo_data)
    resources = []
    skus = []
    all_days = []
    for package in data.get("packages") or []:
        package_id = str(package.get("package_id") or "")
        package_name = clean_line(str(package.get("name") or package_id))
        date_map = package.get("data") or {}
        for sku_key, sku_label, sku_id_key, price_key, num_key in FLIGGY_SKU_TYPES:
            sku_id = str(package.get(sku_id_key) or "")
            if not sku_id or sku_id == "0":
                continue
            days = []
            for date_text in sorted(date_map.keys()):
                row = date_map.get(date_text) or {}
                price_raw = row.get(price_key)
                num_raw = row.get(num_key)
                if price_raw in (None, "") and num_raw in (None, ""):
                    continue
                price = as_number(price_raw)
                stock = int(as_number(num_raw) or 0)
                sale = price > 0 and stock > 0
                days.append({
                    "day": date_text.replace("-", ""),
                    "sale": sale,
                    "stockSale": sale,
                    "salePrice": price,
                    "costPrice": price,
                    "total": stock,
                    "unUsed": stock,
                    "used": 0,
                    "raw": row,
                })
            if not days:
                continue
            resource_name = f"{package_name} {sku_label}".strip()
            summary = fliggy_stock_summary(days)
            all_days.extend(days)
            resources.append({
                "packageId": package_id,
                "resourceId": sku_id,
                "packageName": package_name,
                "resourceName": resource_name,
                "summary": summary,
                "days": days,
            })
            stock_total = max((day.get("unUsed") or 0 for day in days), default=0)
            prices = [day.get("salePrice") for day in days if day.get("salePrice")]
            price = min(prices) if prices else 0
            skus.append({
                "id": sku_id,
                "skuId": sku_id,
                "packageId": package_id,
                "resourceId": sku_id,
                "name": resource_name,
                "packageName": package_name,
                "resourceName": resource_name,
                "skuSource": "fliggy_combo_data",
                "price": price,
                "originPrice": price,
                "stock": stock_total,
                "stockText": str(stock_total),
                "soldQty": 0,
                "state": "在售" if summary.get("openCount") else "不在售",
                "rowText": f"{resource_name} / 价格 {price:g} / 库存 {stock_total}",
            })
    if not resources:
        raise RuntimeError("飞猪库存页没有解析到套餐资源")
    summary = fliggy_stock_summary(all_days)
    return {
        "skus": skus,
        "priceStock": {
            "status": "成功",
            "syncedAt": now_text(),
            "source": "fliggy_combo_data",
            "datePeriods": [{"start": data.get("start", ""), "end": data.get("end", "")}],
            "summary": {**summary, "resourceCount": len(resources)},
            "resources": resources,
            "raw": {
                "start": data.get("start"),
                "end": data.get("end"),
                "packageCount": len(data.get("packages") or []),
            },
        },
    }


def sync_fliggy_product_price_stock_in_browser(active_playwright, account_id, max_products=0, product_id_filter="", category_filter=""):
    data = read_products(account_id)
    products = data.get("products") or []
    if not products:
        data = sync_fliggy_products_in_browser(active_playwright, account_id, max_pages=80)
        products = data.get("products") or []
    if product_id_filter:
        wanted = set(split_ids(product_id_filter))
        products = [product for product in products if str(product.get("productId") or product.get("id")) in wanted]
    if category_filter:
        products = [product for product in products if product.get("category") == category_filter]
    if max_products:
        products = products[:max_products]
    browser = None
    context = None
    progress = {"total": len(products), "processed": 0, "synced": 0, "failed": 0, "skipped": 0}
    try:
        storage_path = account_dir(account_id) / "storage_state.json"
        browser = active_playwright.chromium.launch(channel="chrome", headless=True)
        context = browser.new_context(
            storage_state=str(storage_path) if storage_path.exists() else None,
            viewport={"width": 1440, "height": 1000},
            locale="zh-CN",
            timezone_id="Asia/Shanghai",
        )
        page = context.new_page()
        lookup = {str(product.get("productId") or product.get("id")): product for product in data.get("products") or []}
        for product in products:
            progress["processed"] += 1
            product_id = str(product.get("productId") or product.get("id") or "")
            target = lookup.get(product_id, product)
            try:
                parsed = fliggy_parse_stock_page(page, target)
                target["skus"] = parsed["skus"]
                target["onSaleResourceCount"] = len([sku for sku in parsed["skus"] if sku.get("state") == "在售"])
                target["offSaleResourceCount"] = len([sku for sku in parsed["skus"] if sku.get("state") != "在售"])
                target["stockTotal"] = sum(int(as_number(sku.get("stock")) or 0) for sku in parsed["skus"])
                target["skuSyncStatus"] = "已同步库存套餐"
                target["skuSyncedAt"] = now_text()
                target["priceStock"] = parsed["priceStock"]
                target["priceStockStatus"] = "成功"
                target["priceStockSyncedAt"] = parsed["priceStock"].get("syncedAt")
                target["priceStockError"] = ""
                progress["synced"] += 1
            except Exception as error:
                target["priceStockStatus"] = "失败"
                target["priceStockError"] = str(error)
                target["priceStockSyncedAt"] = now_text()
                progress["failed"] += 1
            if progress["processed"] % 5 == 0:
                data["priceStockSyncedAt"] = now_text()
                data["priceStockSyncProgress"] = dict(progress)
                products_file(account_id).write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        data["priceStockSyncedAt"] = now_text()
        data["priceStockSyncProgress"] = dict(progress)
        products_file(account_id).write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        return {
            "ok": True,
            "accountId": account_id,
            "priceStockSyncedAt": data.get("priceStockSyncedAt", ""),
            "priceStockSyncProgress": data.get("priceStockSyncProgress", {}),
        }
    finally:
        if context:
            context.close()
        if browser:
            browser.close()


def meituan_money(value):
    number = as_number(value)
    return round(number / 100, 2) if number else 0


def meituan_title_info(node):
    standard = ((node or {}).get("infoContainerDTO") or {}).get("standardInfoDTO") or {}
    return standard, standard.get("titleInfoDTO") or {}


def meituan_names(values, key):
    return "、".join(
        clean_line(str(item.get(key) or ""))
        for item in values or []
        if isinstance(item, dict) and clean_line(str(item.get(key) or ""))
    )


def meituan_product_category(standard):
    duration = standard.get("travelDurationDTO") or {}
    days = int(as_number(duration.get("days")) or 0)
    nights = int(as_number(duration.get("nights")) or 0)
    if days == 1:
        return "一日游"
    if days > 1 or nights > 0:
        return "多日游"
    return "美团跟团游"


def meituan_status_text(row):
    status = row.get("productStatusInfoDTO") or {}
    if status.get("hidden"):
        return "不在售"
    online_status = status.get("productOnlineStatus")
    if str(online_status) in ("1", "3"):
        return "出售中"
    return f"状态 {online_status}" if online_status is not None else "未知"


def map_meituan_product(row, account_id):
    base = row.get("productBaseInfoDTO") or {}
    standard, title_info = meituan_title_info(row)
    product_id = str(base.get("dealId") or row.get("spuId") or "")
    title = clean_line(str(title_info.get("productName") or title_info.get("recommendTitle") or base.get("partnerProductName") or product_id))
    venue = meituan_names(standard.get("poiDTOS"), "poiName")
    departure = meituan_names(standard.get("departureDTOS"), "cityName")
    destination = meituan_names(standard.get("destinationDTOS"), "cityName")
    sale_status = meituan_status_text(row)
    is_on_sale = sale_status == "出售中"
    update_time = ((row.get("productExtDataDTO") or {}).get("updateTime") or 0) / 1000
    return {
        "productId": product_id,
        "id": product_id,
        "title": title,
        "category": meituan_product_category(standard),
        "venue": venue,
        "location": " / ".join(part for part in [f"出发地：{departure}" if departure else "", f"目的地：{destination}" if destination else ""] if part),
        "saleStatus": sale_status,
        "onSaleResourceCount": 1 if is_on_sale else 0,
        "offSaleResourceCount": 0 if is_on_sale else 1,
        "auditStatus": "审核通过" if str((row.get("productStatusInfoDTO") or {}).get("productAuditStatus")) in ("1", "3") else "",
        "infoStatus": "健康",
        "channel": "meituan",
        "source": "meituan_group_list",
        "sourceUrl": MEITUAN_PRODUCT_LIST_URL,
        "detailUrl": f"{MEITUAN_HOME_URL}v2/ngty/index.html#/vacation/product/main?pageType=edit&dealId={product_id}",
        "soldQty": int(as_number(row.get("sold")) or 0),
        "stockTotal": 0,
        "skus": [],
        "skuSyncStatus": "待同步库存",
        "skuSyncedAt": "",
        "syncedAt": now_text(),
        "raw": {
            "spuId": row.get("spuId"),
            "dealId": base.get("dealId"),
            "partnerId": base.get("partnerId"),
            "partnerProductName": base.get("partnerProductName"),
            "productType": base.get("productType"),
            "bizLineType": base.get("bizLineType"),
            "productOnlineStatus": (row.get("productStatusInfoDTO") or {}).get("productOnlineStatus"),
            "productAuditStatus": (row.get("productStatusInfoDTO") or {}).get("productAuditStatus"),
            "updateTime": datetime.fromtimestamp(update_time).strftime("%Y-%m-%d %H:%M:%S") if update_time else "",
            "accountId": account_id,
        },
    }


def meituan_work_frame(page):
    for _ in range(20):
        for frame in page.frames:
            if "travel-merchant-management" in frame.url and "gty-product-list" in frame.url:
                return frame
        page.wait_for_timeout(500)
    for frame in page.frames:
        if "mpc.meituan.com/#/gty" in frame.url:
            return frame
    return page


def meituan_fetch_json(frame, url, params=None, method="GET", body=None):
    result = frame.evaluate(
        """
        async ({ url, params, method, body }) => {
          const target = new URL(url);
          Object.entries(params || {}).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") target.searchParams.set(key, String(value));
          });
          const options = { method, credentials: "include" };
          if (method !== "GET") {
            options.headers = { "content-type": "application/json" };
            options.body = JSON.stringify(body || {});
          }
          const response = await fetch(target.toString(), options);
          const text = await response.text();
          try {
            return { ok: response.ok, status: response.status, url: response.url, data: JSON.parse(text) };
          } catch (error) {
            return { ok: response.ok, status: response.status, url: response.url, text };
          }
        }
        """,
        {"url": url, "params": params or {}, "method": method, "body": body or {}},
    )
    data = result.get("data")
    if not data:
        raise RuntimeError((result.get("text") or "")[:300] or f"美团接口异常：HTTP {result.get('status')}")
    return data


def sync_meituan_products_in_browser(active_playwright, account_id, max_pages=30):
    browser = None
    context = None
    try:
        storage_path = account_dir(account_id) / "storage_state.json"
        browser = active_playwright.chromium.launch(channel="chrome", headless=True)
        context = browser.new_context(
            storage_state=str(storage_path) if storage_path.exists() else None,
            viewport={"width": 1440, "height": 1000},
            locale="zh-CN",
            timezone_id="Asia/Shanghai",
        )
        page = context.new_page()
        page.goto(MEITUAN_PRODUCT_LIST_URL, wait_until="domcontentloaded", timeout=60000)
        page.wait_for_timeout(9000)
        frame = meituan_work_frame(page)
        products = []
        seen = set()
        total_hint = 0
        page_size = 50
        for page_no in range(1, max_pages + 1):
            data = meituan_fetch_json(frame, MEITUAN_GROUP_LIST_API, {"page": page_no, "pageSize": page_size})
            if not data.get("success"):
                raise RuntimeError(data.get("errMessage") or data.get("message") or "美团产品列表接口失败")
            result = data.get("data") or {}
            total_hint = int(result.get("totalSize") or total_hint or 0)
            rows = result.get("list") or []
            for row in rows:
                product = map_meituan_product(row, account_id)
                product_id = product.get("productId")
                if product_id and product_id not in seen:
                    seen.add(product_id)
                    product["pageNo"] = page_no
                    products.append(product)
            payload = {
                "accountId": account_id,
                "channel": "meituan",
                "total": len(products),
                "totalHint": total_hint,
                "syncedAt": now_text(),
                "sourceUrl": MEITUAN_PRODUCT_LIST_URL,
                "products": products,
            }
            products_file(account_id).write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
            if not rows or (total_hint and len(products) >= total_hint):
                break
        return payload
    finally:
        if context:
            context.close()
        if browser:
            browser.close()


def parse_meituan_sku(sku, product):
    standard = ((sku.get("infoContainerDTO") or {}).get("standardInfoDTO") or {})
    title_info = standard.get("titleInfoDTO") or {}
    sku_id = str(sku.get("skuId") or sku.get("platformSkuId") or "")
    name = clean_line(str(title_info.get("packageName") or title_info.get("shortName") or sku_id))
    day_rows = []
    prices = []
    stocks = []
    open_days = 0
    for row in ((sku.get("priceStockVO") or {}).get("calendarPriceStockVOS") or []):
        day = str(row.get("date") or row.get("day") or "")
        price_units = []
        for price in row.get("priceUnitVOS") or []:
            unit = {
                "marketPrice": meituan_money(price.get("marketPrice")),
                "salePrice": meituan_money(price.get("sellPrice")),
                "settlementPrice": meituan_money(price.get("settlementPrice")),
                "priceItemType": price.get("priceItemType"),
                "status": price.get("status"),
            }
            if unit["salePrice"]:
                prices.append(unit["salePrice"])
            price_units.append(unit)
        stock_units = row.get("stockUnitVOS") or []
        stock = stock_units[0] if stock_units else {}
        cancelled = bool(stock.get("cancelled"))
        sale = (str(stock.get("status")) in ("1", "True", "true")) and not cancelled
        if sale:
            open_days += 1
        total = int(as_number(stock.get("stock")) or 0)
        remain = int(as_number(stock.get("remainStock")) or 0)
        if total:
            stocks.append(total)
        if remain:
            stocks.append(remain)
        sale_prices = [unit["salePrice"] for unit in price_units if unit.get("salePrice")]
        market_prices = [unit["marketPrice"] for unit in price_units if unit.get("marketPrice")]
        day_rows.append({
            "day": day,
            "sale": sale,
            "stockSale": sale,
            "salePrice": min(sale_prices) if sale_prices else 0,
            "marketPrice": max(market_prices) if market_prices else 0,
            "total": total,
            "used": int(as_number(stock.get("sold")) or 0),
            "unUsed": remain,
            "cancelled": cancelled,
            "cancelledReason": stock.get("cancelledReason") or "",
            "priceUnits": price_units,
        })
    day_rows = sorted((row for row in day_rows if row.get("day")), key=lambda item: item["day"])
    resource = {
        "packageId": sku_id,
        "apiPackageId": sku_id,
        "packageName": name,
        "resourceId": sku_id,
        "resourceName": name,
        "days": day_rows,
    }
    resource["summary"] = summarize_price_stock_resources([resource])
    return {
        "id": sku_id,
        "skuId": sku_id,
        "packageId": sku_id,
        "resourceId": sku_id,
        "name": name,
        "packageName": name,
        "resourceName": name,
        "skuSource": "meituan_group_detail",
        "price": min(prices) if prices else 0,
        "originPrice": max(prices) if prices else 0,
        "stock": max(stocks) if stocks else 0,
        "stockText": str(max(stocks) if stocks else 0),
        "state": "在售" if open_days else "不在售",
        "rowText": f"{len(day_rows)} 天库价 / {'在售' if open_days else '不在售'}",
    }, resource


def sync_meituan_product_price_stock_in_browser(active_playwright, account_id, max_products=0, product_id_filter="", category_filter=""):
    data = read_products(account_id)
    products = data.get("products") or []
    if not products:
        data = sync_meituan_products_in_browser(active_playwright, account_id, max_pages=80)
        products = data.get("products") or []
    if product_id_filter:
        wanted = set(split_ids(product_id_filter))
        products = [product for product in products if str(product.get("productId") or product.get("id")) in wanted]
    if category_filter:
        products = [product for product in products if str(category_filter) in str(product.get("category") or "")]
    if max_products:
        products = products[:max_products]
    browser = None
    context = None
    progress = {"total": len(products), "processed": 0, "synced": 0, "failed": 0, "skipped": 0}
    try:
        storage_path = account_dir(account_id) / "storage_state.json"
        browser = active_playwright.chromium.launch(channel="chrome", headless=True)
        context = browser.new_context(
            storage_state=str(storage_path) if storage_path.exists() else None,
            viewport={"width": 1440, "height": 1000},
            locale="zh-CN",
            timezone_id="Asia/Shanghai",
        )
        page = context.new_page()
        page.goto(MEITUAN_PRODUCT_LIST_URL, wait_until="domcontentloaded", timeout=60000)
        page.wait_for_timeout(9000)
        frame = meituan_work_frame(page)
        lookup = {str(product.get("productId") or product.get("id")): product for product in data.get("products") or []}
        for product in products:
            progress["processed"] += 1
            product_id = str(product.get("productId") or product.get("id") or "")
            target = lookup.get(product_id, product)
            try:
                detail = meituan_fetch_json(frame, MEITUAN_GROUP_DETAIL_API, {"dealId": product_id})
                if not detail.get("success"):
                    raise RuntimeError(detail.get("errMessage") or detail.get("message") or "美团详情接口失败")
                detail_data = detail.get("data") or {}
                skus = []
                resources = []
                for sku in detail_data.get("skuVOS") or []:
                    parsed_sku, resource = parse_meituan_sku(sku, target)
                    if parsed_sku.get("skuId"):
                        skus.append(parsed_sku)
                        resources.append(resource)
                target["skus"] = skus
                target["onSaleResourceCount"] = len([sku for sku in skus if sku.get("state") == "在售"])
                target["offSaleResourceCount"] = len([sku for sku in skus if sku.get("state") != "在售"])
                target["stockTotal"] = sum(int(as_number(sku.get("stock")) or 0) for sku in skus)
                target["skuSyncStatus"] = "已同步库存"
                target["skuSyncedAt"] = now_text()
                target["priceStock"] = {
                    "syncedAt": now_text(),
                    "status": "成功" if resources else "无库价",
                    "resources": resources,
                    "summary": summarize_price_stock_resources(resources),
                }
                target["priceStockStatus"] = target["priceStock"]["status"]
                target["priceStockSyncedAt"] = target["priceStock"]["syncedAt"]
                target["priceStockError"] = ""
                progress["synced"] += 1
            except Exception as error:
                target["priceStockStatus"] = "失败"
                target["priceStockError"] = str(error)
                target["priceStockSyncedAt"] = now_text()
                progress["failed"] += 1
            if progress["processed"] % 5 == 0:
                data["priceStockSyncedAt"] = now_text()
                data["priceStockSyncProgress"] = dict(progress)
                products_file(account_id).write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        data["priceStockSyncedAt"] = now_text()
        data["priceStockSyncProgress"] = dict(progress)
        products_file(account_id).write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        return {
            "ok": True,
            "accountId": account_id,
            "priceStockSyncedAt": data.get("priceStockSyncedAt", ""),
            "priceStockSyncProgress": data.get("priceStockSyncProgress", {}),
        }
    finally:
        if context:
            context.close()
        if browser:
            browser.close()


def sync_product_price_stock(account_id, max_products=0, product_id_filter="", category_filter=""):
    channel = read_account_meta(account_id).get("channel")
    if channel == "douyin_life":
        return run_isolated_browser_job(
            lambda active_playwright, _contexts: sync_douyin_product_price_stock_in_browser(
                active_playwright,
                account_id,
                max_products=max_products,
                product_id_filter=product_id_filter,
                category_filter=category_filter,
            ),
        )
    if channel == "fliggy":
        return run_isolated_browser_job(
            lambda active_playwright, _contexts: sync_fliggy_product_price_stock_in_browser(
                active_playwright,
                account_id,
                max_products=max_products,
                product_id_filter=product_id_filter,
                category_filter=category_filter,
            ),
        )
    if channel == "tongcheng":
        return run_isolated_browser_job(
            lambda active_playwright, _contexts: sync_tongcheng_product_price_stock_in_browser(
                active_playwright,
                account_id,
                max_products=max_products,
                product_id_filter=product_id_filter,
                category_filter=category_filter,
            ),
        )
    if channel == "meituan":
        return run_isolated_browser_job(
            lambda active_playwright, _contexts: sync_meituan_product_price_stock_in_browser(
                active_playwright,
                account_id,
                max_products=max_products,
                product_id_filter=product_id_filter,
                category_filter=category_filter,
            ),
        )
    return run_isolated_browser_job(
        lambda active_playwright, _contexts: sync_product_price_stock_in_browser(
            active_playwright,
            account_id,
            max_products=max_products,
            product_id_filter=product_id_filter,
            category_filter=category_filter,
        ),
    )


def preview_oneday_holiday_prices_in_browser(active_playwright, payload):
    product_refs = payload.get("productRefs") or []
    account_id = payload.get("accountId") or (product_refs[0].get("accountId") if product_refs else "")
    if not account_id or account_id == "multiple":
        raise RuntimeError("改价预览需要锁定一个账号")
    target_days = date_tokens(payload.get("dateStart", ""), payload.get("dateEnd", ""))
    if not target_days:
        raise RuntimeError("请选择有效日期范围")
    requested_ids = split_ids(payload.get("skuText", "")) if payload.get("skuScope") == "custom" else []
    lookup = product_lookup(account_id)
    products = []
    if product_refs:
        for ref in product_refs:
            product_id = str(ref.get("productId") or "")
            product = lookup.get(product_id)
            if product:
                products.append({**product, "accountId": account_id})
    elif requested_ids:
        requested_set = set(requested_ids)
        for product in lookup.values():
            if any(str(sku.get("resourceId") or sku.get("id") or sku.get("packageId") or "") in requested_set for sku in product.get("skus") or []):
                products.append({**product, "accountId": account_id})
    if not products:
        raise RuntimeError("当前范围内没有可预览的产品，或资源 ID 未匹配到产品")

    browser = None
    context = None
    try:
        storage_path = account_dir(account_id) / "storage_state.json"
        browser = active_playwright.chromium.launch(channel="chrome", headless=True)
        context = browser.new_context(
            storage_state=str(storage_path) if storage_path.exists() else None,
            viewport={"width": 1440, "height": 1000},
            locale="zh-CN",
            timezone_id="Asia/Shanghai",
        )
        page = context.new_page()
        rows = []
        errors = []
        for product in products:
            product_id = str(product.get("productId") or product.get("id") or "")
            by_resource, _ = build_sku_lookup(product)
            product_resource_ids = requested_ids if requested_ids else [str(sku.get("resourceId") or "") for sku in product.get("skus") or []]
            package_ids = []
            for resource_id in product_resource_ids:
                sku = by_resource.get(str(resource_id))
                if not sku:
                    continue
                if is_ttd_product(product):
                    package_value = sku.get("subPackageId") or sku.get("packageId")
                else:
                    package_value = sku.get("packageId") or sku.get("subPackageId")
                if package_value:
                    package_ids.append(str(package_value))
            if not package_ids:
                package_ids = [str(item) for item in price_stock_api_package_ids(product)]
            package_ids = [int(item) for item in unique_preserve_order(package_ids) if str(item).isdigit()]
            if not package_ids:
                errors.append({"productId": product_id, "message": "未找到可查询的套餐 ID"})
                continue
            try:
                page.goto(product_edit_url(product), wait_until="domcontentloaded", timeout=60000)
                page.wait_for_timeout(2500)
                body_text = page.locator("body").inner_text(timeout=15000)
                if "登录" in body_text and "产品" not in body_text:
                    raise RuntimeError("携程登录态失效，请重新登录账号")
                data = fetch_price_stock_data(page, product_id, package_ids, product)
                product_rows = extract_holiday_preview_rows(product, data, set(target_days), requested_ids, payload)
                rows.extend(product_rows)
                if not product_rows:
                    errors.append({"productId": product_id, "message": "当前产品在所选资源/日期内没有可调价库价记录"})
            except Exception as error:
                errors.append({"productId": product_id, "message": str(error)})
        return {
            "ok": True,
            "accountId": account_id,
            "days": target_days,
            "productCount": len(products),
            "rowCount": len(rows),
            "rows": rows,
            "errors": errors,
            "previewedAt": now_text(),
        }
    finally:
        if context:
            context.close()
        if browser:
            browser.close()


def preview_oneday_holiday_prices(payload):
    with sync_playwright() as active_playwright:
        return preview_oneday_holiday_prices_in_browser(active_playwright, payload)


PRICE_OPERATIONS = ("setPrice", "adjustPrice", "percentPrice")


def summarize_product_for_list(product):
    item = dict(product)
    snapshot = item.get("priceStock")
    if isinstance(snapshot, dict):
        slim_snapshot = {
            key: value for key, value in snapshot.items()
            if key not in ("resources", "raw", "packagePriceAndStockInfoList", "packagePriceAndStockList")
        }
        resource_count = len(snapshot.get("resources") or [])
        if resource_count:
            slim_snapshot["resourceDetailCount"] = resource_count
            slim_snapshot["detailOmitted"] = True
        item["priceStock"] = slim_snapshot
    return item


def read_products_for_list(account_id, summary=False):
    data = read_products(account_id)
    if not summary:
        return data
    slim_data = dict(data)
    slim_data["products"] = [summarize_product_for_list(product) for product in data.get("products") or []]
    return slim_data


def read_product_detail(account_id, product_id):
    lookup = product_lookup(account_id)
    product = lookup.get(str(product_id))
    if not product:
        raise RuntimeError("未找到产品明细")
    product = dict(product)
    product["accountId"] = account_id
    return {"ok": True, "accountId": account_id, "product": product}


def price_resource_ids_for_product(task, product):
    if task.get("skuScope") != "custom":
        return unique_preserve_order([
            str(sku.get("resourceId") or sku.get("id") or "")
            for sku in product.get("skus") or []
            if sku.get("resourceId") or sku.get("id")
        ])
    requested = set(split_ids(task.get("skuText", "")))
    if not requested:
        return []
    matched = []
    for sku in product.get("skus") or []:
        values = {
            str(sku.get("resourceId") or ""),
            str(sku.get("id") or ""),
            str(sku.get("packageId") or ""),
            str(sku.get("subPackageId") or ""),
        }
        if values & requested:
            value = str(sku.get("resourceId") or sku.get("id") or "")
            if value:
                matched.append(value)
    return unique_preserve_order(matched)


def resource_node_id(resource):
    resource_id = str(resource.get("resourceId") or "")
    if resource_id:
        return resource_id
    for info in resource.get("basicInfoList") or []:
        resource_id = str(info.get("resourceId") or "")
        if resource_id:
            return resource_id
    return ""


def package_price_resources(package):
    price = package.get("price") or {}
    return (price.get("resourcePriceList") or []) + (price.get("resourcePriceDraftList") or [])


def package_stock_resources(package):
    stock = package.get("stock") or {}
    return (stock.get("resourceStockList") or []) + (stock.get("resourceStockDraftList") or [])


def rows_by_day(rows):
    result = {}
    for row in rows or []:
        day = str(row.get("day") or row.get("date") or "")
        if day:
            result[day] = row
    return result


def find_package_resource_rows(package, resource_id):
    price_rows = {}
    stock_rows = {}
    price_resource = {}
    stock_resource = {}
    for resource in package_price_resources(package):
        if resource_node_id(resource) == str(resource_id):
            price_resource = resource
            price_rows.update(rows_by_day(resource.get("priceList") or []))
    for resource in package_stock_resources(package):
        if resource_node_id(resource) == str(resource_id):
            stock_resource = resource
            stock_rows.update(rows_by_day(resource.get("stockList") or []))
    return price_rows, stock_rows, price_resource, stock_resource


def product_version_from_mix(page, product_id):
    try:
        data = call_vbooking_api(page, "getProductMix", {
            "productId": int(product_id),
            "getProductRequest": {"type": [7]},
            "queryTabConfigRequest": {"returnPackageInfo": "1"},
            "getCurrentUserRequest": {"productEdit": True, "sourceType": 3},
            "queryTypes": [
                "SimpleProductInfo",
                "ProductLocale",
                "QueryNewTourTabConfig",
                "GetCategory",
                "Enumeration",
                "CurrentUser",
                "TabFieldLocaleInfo",
                "FieldMetaInfo",
                "AggregatedAuditStatus",
            ],
            "requestBaseData": request_base("6.0"),
        })
        version = (data.get("simpleProductInfo") or {}).get("productVersion")
        if version:
            return version
    except Exception:
        pass
    try:
        data = call_vbooking_api(page, "getProductDraft", {
            "productId": int(product_id),
            "draftTypes": [PRICE_STOCK_TAB_DRAFT_TYPE, "NegativeGrossProfit", "LowBrokerageRate"],
            "requestBaseData": request_base("5.3"),
        })
        return data.get("productVersion")
    except Exception:
        return None


def build_price_change_packages(product, price_stock_data, task, resource_ids, target_days):
    by_resource, by_package = build_sku_lookup(product)
    target_resource_set = {str(item) for item in resource_ids if item}
    details = []
    packages = []
    for package in price_stock_data.get("packagePriceAndStockInfoList") or price_stock_data.get("packagePriceAndStockList") or []:
        api_package_id = str(package.get("packageId") or "")
        package_resource_ids = unique_preserve_order([
            resource_node_id(resource)
            for resource in package_price_resources(package)
            if resource_node_id(resource) in target_resource_set
        ])
        for day in target_days:
            price_changes = []
            stock_changes = []
            day_details = []
            for resource_id in package_resource_ids:
                price_rows, stock_rows, price_resource, stock_resource = find_package_resource_rows(package, resource_id)
                price_row = price_rows.get(day)
                if not price_row:
                    continue
                stock_row = stock_rows.get(day) or {}
                resource_volume = price_resource.get("volume")
                if resource_volume in ("", None):
                    resource_volume = stock_resource.get("volume")
                planned_price = planned_price_value(
                    task.get("operationType"),
                    price_row.get("salePrice"),
                    task.get("priceValue"),
                )
                if planned_price == "":
                    continue
                sku = by_resource.get(resource_id) or by_package.get(api_package_id) or {}
                price_changes.append({
                    "resourceId": int(resource_id),
                    "volume": resource_volume if resource_volume not in ("", None) else 0,
                    "salePrice": planned_price,
                    "costPrice": price_row.get("costPrice"),
                })
                if stock_row.get("total") not in ("", None):
                    stock_changes.append({
                        "resourceId": int(resource_id),
                        "volume": resource_volume if resource_volume not in ("", None) else 0,
                        "total": stock_row.get("total"),
                    })
                day_details.append({
                    "accountId": product.get("accountId", ""),
                    "accountName": product.get("accountName", ""),
                    "productId": str(product.get("productId") or product.get("id") or ""),
                    "productTitle": product.get("title", ""),
                    "category": product.get("category", ""),
                    "packageId": str(sku.get("packageId") or api_package_id),
                    "apiPackageId": api_package_id,
                    "packageName": sku.get("packageName") or sku.get("packageInventoryName") or "",
                    "skuId": resource_id,
                    "resourceId": resource_id,
                    "resourceName": sku.get("resourceName") or sku.get("name") or "",
                    "volume": resource_volume if resource_volume not in ("", None) else 0,
                    "day": day,
                    "oldPrice": price_row.get("salePrice"),
                    "newPrice": planned_price,
                    "costPrice": price_row.get("costPrice"),
                    "stockTotal": stock_row.get("total"),
                })
            if not price_changes:
                continue
            date_rule = {
                "dateType": "2",
                "date": [day],
                "dateDesc": day,
            }
            package_payload = copy.deepcopy(package)
            package_payload["price"] = {
                **(package_payload.get("price") or {}),
                "packagePriceChangeRule": {
                    **date_rule,
                    "changePriceType": "2",
                    "resourcePriceChangeList": price_changes,
                },
            }
            package_payload["stock"] = {
                **(package_payload.get("stock") or {}),
                "packageStockChangeRules": [{
                    **date_rule,
                    "changeStockType": "2",
                    "resourceStockChangeList": stock_changes,
                }],
            }
            packages.append(package_payload)
            details.extend(day_details)
    return packages, details


PRICE_STOCK_TAB_DRAFT_TYPE = "PriceAndStock"
ONLY_SUBMIT_STATUS_TYPE = 0
SAVE_DRAFT_TYPE = 2
SAVE_AND_SUBMIT_TYPE = 3
ALL_DRAFT_TYPES_REQUIRED = [
    "ProductInfo",
    "ProductItinerary",
    "PackageInfo",
    "BookingRule",
    "AdvancedSettings",
]


def as_float(value):
    if value in ("", None):
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def price_values_match(actual, expected):
    actual_value = as_float(actual)
    expected_value = as_float(expected)
    if actual_value is None or expected_value is None:
        return False
    return abs(actual_value - expected_value) < 0.01


def read_price_rows_for_details(page, product, product_id, package_ids, details):
    target_days = {str(item.get("day") or "") for item in details if item.get("day")}
    resource_ids = [str(item.get("resourceId") or item.get("skuId") or "") for item in details]
    data = fetch_price_stock_data(page, product_id, package_ids, product)
    rows = extract_holiday_preview_rows(product, data, target_days, resource_ids, {
        "operationType": "setPrice",
        "priceValue": "",
    })
    return {
        (str(row.get("resourceId") or ""), str(row.get("day") or "")): row
        for row in rows
    }


def fetch_price_stock_data(page, product_id, package_ids, product=None):
    if product and not is_ttd_product(product):
        return call_vbooking_api(page, "getProductDraft", {
            "productId": int(product_id),
            "draftTypes": [PRICE_STOCK_TAB_DRAFT_TYPE, "NegativeGrossProfit", "LowBrokerageRate"],
            "requestBaseData": request_base("5.3"),
        })
    return call_vbooking_api(page, "getPackagePriceStockInRange", {
        "productId": int(product_id),
        "packageIdList": package_ids,
        "requestBaseData": request_base("6.0"),
    })


def submit_price_stock_draft(page, product_id, product_version, payload):
    page_version = "5.3" if "activity-vbk" in page.url else "6.0"
    draft_types = [PRICE_STOCK_TAB_DRAFT_TYPE, "NegativeGrossProfit", "LowBrokerageRate"] if page_version == "5.3" else [PRICE_STOCK_TAB_DRAFT_TYPE]
    return call_vbooking_api(page, "submitProductDraft", {
        "productId": int(product_id),
        "draftTypes": draft_types,
        "draftTypesRequired": [],
        "type": SAVE_DRAFT_TYPE,
        "checkKeyword": True,
        "productVersion": product_version,
        "addDSAInfoLater": False,
        **payload,
        "requestBaseData": request_base(page_version),
    })


def submit_all_product_drafts(page, product_id, product_version):
    if "activity-vbk" in page.url:
        return call_vbooking_api(page, "saveOrEffectProductDraft", {
            "productId": int(product_id),
            "type": ONLY_SUBMIT_STATUS_TYPE,
            "draftTypes": [],
            "checkWordMap": {},
            "effectMarks": [1, 3, 4, 5, 6, 8, 9],
            "productVersion": product_version,
            "requestBaseData": request_base("5.3"),
        })
    return call_vbooking_api(page, "submitProductDraft", {
        "productId": int(product_id),
        "draftTypes": [],
        "draftTypesRequired": ALL_DRAFT_TYPES_REQUIRED,
        "type": ONLY_SUBMIT_STATUS_TYPE,
        "checkKeyword": True,
        "productVersion": product_version,
        "addDSAInfoLater": False,
        "requestBaseData": request_base("6.0"),
    })


def finalize_price_task_verification(page, task, product, product_id, package_ids, items):
    verifiable = [
        item for item in items
        if item.get("status") != "待人工"
        and item.get("resourceId") and item.get("day") and item.get("newPrice") not in ("", None)
    ]
    if not verifiable:
        return
    page.goto(product_edit_url(product), wait_until="domcontentloaded", timeout=60000)
    page.wait_for_timeout(2500)
    final_rows = read_price_rows_for_details(page, product, product_id, package_ids, verifiable)
    for item in verifiable:
        if item.get("status") == "失败":
            item["finalVerifySkipped"] = "已有执行失败结果，保留原始失败原因"
            continue
        key = (str(item.get("resourceId") or item.get("skuId") or ""), str(item.get("day") or ""))
        final_price = (final_rows.get(key) or {}).get("salePrice")
        item["finalVerifiedPrice"] = final_price
        item["finalVerifyApi"] = "getPackagePriceStockInRange"
        if price_values_match(final_price, item.get("newPrice")):
            item["status"] = "成功"
            item["message"] = f"{item.get('day')} 最终回读确认：{item.get('oldPrice')} -> {item.get('newPrice')}"
        else:
            item["status"] = "失败"
            item["message"] = f"{item.get('day')} 最终回读售价为 {final_price}，未达到 {item.get('newPrice')}"


def execute_price_task_api(page, task, product, task_id=""):
    if task.get("operationType") not in PRICE_OPERATIONS:
        raise RuntimeError("当前接口执行器只支持价格类操作")
    product_id = str(product.get("productId") or product.get("id") or "")
    if not product_id:
        raise RuntimeError("缺少产品 ID")
    target_days = date_tokens(task.get("dateStart", ""), task.get("dateEnd", "") or task.get("dateStart", ""))
    if not target_days:
        raise RuntimeError("缺少有效调价日期")
    resource_ids = price_resource_ids_for_product(task, product)
    if not resource_ids:
        raise RuntimeError("没有匹配到需要调价的资源 ID")
    package_ids = []
    by_resource, _ = build_sku_lookup(product)
    for resource_id in resource_ids:
        sku = by_resource.get(str(resource_id)) or {}
        value = sku.get("subPackageId") or sku.get("packageId")
        if value:
            package_ids.append(str(value))
    package_ids = [int(item) for item in unique_preserve_order(package_ids) if str(item).isdigit()]
    if not package_ids:
        raise RuntimeError("未找到可用于查询库价的套餐 ID")

    page.goto(product_edit_url(product), wait_until="domcontentloaded", timeout=60000)
    page.wait_for_timeout(1500)
    body_text = page.locator("body").inner_text(timeout=15000)
    if "登录" in body_text and "产品" not in body_text:
        raise RuntimeError("携程登录态失效，请重新登录账号")
    product_version = product_version_from_mix(page, product_id)
    price_stock_data = fetch_price_stock_data(page, product_id, package_ids, product)
    items = []
    saved_items = []
    ui_saved_items = []
    pending_ui_details = []
    pending_ui_error = ""
    previous_success = successful_price_item_keys(task, product_id)
    check_response_base = {}
    submit_response_base = {}
    if direct_activity_price_ui_product(product):
        for day in target_days:
            _, details = build_price_change_packages(
                product,
                price_stock_data,
                task,
                resource_ids,
                [day],
            )
            runnable = []
            for detail in details:
                detail_key = (str(detail.get("resourceId") or detail.get("skuId") or ""), str(detail.get("day") or ""))
                if detail_key in previous_success:
                    items.append({
                        **detail,
                        "status": "成功",
                        "message": f"{detail.get('day')} 已在上次执行成功，本次跳过",
                        "api": "skip-previous-success",
                        "operationType": task.get("operationType", ""),
                        "priceValue": task.get("priceValue", ""),
                        "finishedAt": now_text(),
                    })
                else:
                    runnable.append(detail)
            if not details:
                items.append({
                    "productId": product_id,
                    "productTitle": product.get("title", ""),
                    "category": product.get("category", ""),
                    "day": day,
                    "status": "失败",
                    "message": f"{day} 没有可调价的库价记录",
                    "api": "activity-ui-precheck",
                    "operationType": task.get("operationType", ""),
                    "priceValue": task.get("priceValue", ""),
                    "finishedAt": now_text(),
                })
            pending_ui_details.extend(runnable)
        if pending_ui_details:
            try:
                ui_items = execute_activity_price_group_ui(page, task, product, pending_ui_details, task_id=task_id)
                items.extend(ui_items)
                ui_saved_items.extend([item for item in ui_items if item.get("status") == "待回读"])
            except Exception as group_error:
                for detail in pending_ui_details:
                    items.append(manual_price_assist_item(task, product, detail, f"活动页批量自动化失败，已快速返回待人工：{group_error}"))
        if not items:
            raise RuntimeError("目标日期没有可调价的库价记录")
        if ui_saved_items:
            try:
                submit_info = submit_activity_page_review(page)
                if not submit_info.get("submitted"):
                    raise RuntimeError(f"活动页价格已保存，但未找到提交审核按钮：{submit_info.get('reason')}")
                for item in ui_saved_items:
                    item["message"] = f"{item.get('day')} 已通过活动页保存并提交审核，等待最终回读确认"
                    item["submitUi"] = submit_info
            except Exception as error:
                for item in ui_saved_items:
                    item["status"] = "失败"
                    item["message"] = f"活动页价格已保存，但提交审核失败：{error}"
        try:
            finalize_price_task_verification(page, task, product, product_id, package_ids, items)
        except Exception as error:
            for item in items:
                if item.get("status") not in ("失败", "待人工"):
                    item["status"] = "失败"
                    item["message"] = f"最终回读校验失败：{error}"
        failed_count = len([item for item in items if item.get("status") not in ("成功", "待人工")])
        manual_count = len([item for item in items if item.get("status") == "待人工"])
        success_count = len(items) - failed_count - manual_count
        status = "成功" if failed_count == 0 and manual_count == 0 else ("待人工" if failed_count == 0 and manual_count else ("部分失败" if success_count or manual_count else "失败"))
        message_parts = []
        if success_count:
            message_parts.append(f"成功 {success_count} 条")
        if manual_count:
            message_parts.append(f"待人工 {manual_count} 条")
        if failed_count:
            message_parts.append(f"失败 {failed_count} 条")
        return {
            "productId": product_id,
            "productTitle": product.get("title", ""),
            "category": product.get("category", ""),
            "status": status,
            "message": "，".join(message_parts) or "无可执行明细",
            "api": "activity-ui-fast-path",
            "items": items,
            "checkResponseBase": check_response_base,
            "submitResponseBase": submit_response_base,
            "finishedAt": now_text(),
        }
    for day in target_days:
        package_payloads, details = build_price_change_packages(
            product,
            price_stock_data,
            task,
            resource_ids,
            [day],
        )
        if not package_payloads:
            items.append({
                "productId": product_id,
                "productTitle": product.get("title", ""),
                "category": product.get("category", ""),
                "day": day,
                "status": "失败",
                "message": f"{day} 没有可调价的库价记录",
                "api": "submitProductDraft",
                "operationType": task.get("operationType", ""),
                "priceValue": task.get("priceValue", ""),
                "finishedAt": now_text(),
            })
            continue
        payload = {"packagePriceAndStockList": package_payloads}
        try:
            check_result = call_vbooking_api(page, "checkResourcePrices", {
                **payload,
                "requestBaseData": request_base("6.0"),
            })
            check_response_base = check_result.get("responseBaseData") or {}
            if check_result.get("canSaveOrNot") is False:
                raise RuntimeError(f"携程价格校验未通过：{json.dumps(check_result, ensure_ascii=False)[:800]}")
            product_version = product_version_from_mix(page, product_id)
            save_result = submit_price_stock_draft(page, product_id, product_version, payload)
            save_response_base = save_result.get("responseBaseData") or {}
            if save_response_base.get("success") is False:
                raise RuntimeError(f"携程保存价格库存草稿失败：{json.dumps(save_result, ensure_ascii=False)[:800]}")
            price_stock_data = fetch_price_stock_data(page, product_id, package_ids, product)
            for detail in details:
                item = {
                    **detail,
                    "status": "待回读",
                    "message": f"{detail.get('day')} 已保存草稿，等待本产品统一提交审核",
                    "api": "submitProductDraft",
                    "saveApi": "submitProductDraft",
                    "checkApi": "checkResourcePrices",
                    "verifyApi": "getPackagePriceStockInRange",
                    "saveResponseBase": save_response_base,
                    "operationType": task.get("operationType", ""),
                    "priceValue": task.get("priceValue", ""),
                    "finishedAt": now_text(),
                }
                items.append(item)
                saved_items.append(item)
        except Exception as error:
            error_message = str(error)
            can_use_activity_ui = (
                is_activity_edit_product(product)
                and (
                    "wrong.link.error" in error_message
                    or "页面链接上下文校验失败" in error_message
                    or "url链接已失效" in error_message
                )
                and details
            )
            if can_use_activity_ui:
                pending_ui_error = pending_ui_error or error_message
                pending_ui_details.extend(details)
            else:
                for detail in details or [{"productId": product_id, "productTitle": product.get("title", ""), "category": product.get("category", ""), "day": day}]:
                    items.append({
                        **detail,
                        "status": "失败",
                        "message": error_message,
                        "api": "submitProductDraft",
                        "checkApi": "checkResourcePrices",
                        "operationType": task.get("operationType", ""),
                        "priceValue": task.get("priceValue", ""),
                        "finishedAt": now_text(),
                    })
    if pending_ui_details:
        try:
            ui_items = execute_activity_price_group_ui(page, task, product, pending_ui_details)
            items.extend(ui_items)
            ui_saved_items.extend([item for item in ui_items if item.get("status") == "待回读"])
        except Exception as group_error:
            for detail in pending_ui_details:
                try:
                    ui_item = execute_activity_price_detail_ui(page, task, product, detail)
                    items.append(ui_item)
                    if ui_item.get("status") == "待回读":
                        ui_saved_items.append(ui_item)
                except Exception as ui_error:
                    if requires_manual_price_assist(product):
                        items.append(manual_price_assist_item(task, product, detail, f"{pending_ui_error}；活动页批量自动化失败：{group_error}；逐日兜底也失败：{ui_error}"))
                    else:
                        items.append({
                            **detail,
                            "status": "失败",
                            "message": f"{pending_ui_error}；活动页批量自动化失败：{group_error}；逐日 UI fallback 也失败：{ui_error}",
                            "api": "submitProductDraft/activity-ui-price-modal",
                            "checkApi": "checkResourcePrices",
                            "operationType": task.get("operationType", ""),
                            "priceValue": task.get("priceValue", ""),
                            "finishedAt": now_text(),
                        })
    if not items:
        raise RuntimeError("目标日期没有可调价的库价记录")
    if saved_items:
        try:
            product_version = product_version_from_mix(page, product_id) or product_version
            submit_result = submit_all_product_drafts(page, product_id, product_version)
            submit_response_base = submit_result.get("responseBaseData") or {}
            if submit_response_base.get("success") is False:
                raise RuntimeError(f"携程提交调价失败：{json.dumps(submit_result, ensure_ascii=False)[:800]}")
            page.wait_for_timeout(4000)
            for item in saved_items:
                item["message"] = f"{item.get('day')} 已统一提交审核，等待最终回读确认"
                item["submitApi"] = "submitProductDraft"
                item["submitResponseBase"] = submit_response_base
        except Exception as error:
            for item in saved_items:
                item["status"] = "失败"
                item["message"] = str(error)
    if ui_saved_items:
        try:
            submit_info = submit_activity_page_review(page)
            if not submit_info.get("submitted"):
                raise RuntimeError(f"活动页价格已保存，但未找到提交审核按钮：{submit_info.get('reason')}")
            for item in ui_saved_items:
                item["message"] = f"{item.get('day')} 已通过活动页保存并提交审核，等待最终回读确认"
                item["submitUi"] = submit_info
        except Exception as error:
            for item in ui_saved_items:
                item["status"] = "失败"
                item["message"] = f"活动页价格已保存，但提交审核失败：{error}"
    try:
        finalize_price_task_verification(page, task, product, product_id, package_ids, items)
    except Exception as error:
        for item in items:
            if item.get("status") != "失败":
                item["status"] = "失败"
                item["message"] = f"最终回读校验失败：{error}"
    failed_count = len([item for item in items if item.get("status") != "成功"])
    success_count = len(items) - failed_count
    status = "成功" if failed_count == 0 else ("部分失败" if success_count else "失败")
    message = f"已通过接口提交并回读确认 {success_count} 条资源日期调价"
    if failed_count:
        message += f"，失败 {failed_count} 条"
    return {
        "productId": product_id,
        "productTitle": product.get("title", ""),
        "category": product.get("category", ""),
        "status": status,
        "message": message,
        "api": "submitProductDraft",
        "items": items,
        "checkResponseBase": check_response_base,
        "submitResponseBase": submit_response_base,
        "finishedAt": now_text(),
    }


def inventory_status_matches(status, operation):
    if operation == "openInventory":
        return status.get("allOpen")
    if operation == "closeInventory":
        return status.get("allClosed")
    return False


def execute_inventory_task_verified(page, task, product):
    product_id = str(product.get("productId") or product.get("id"))
    url = product_edit_url(product)
    page.goto(url, wait_until="domcontentloaded", timeout=60000)
    page.wait_for_timeout(3000)
    body_text = page.locator("body").inner_text(timeout=15000)
    if "登录" in body_text and "产品" not in body_text:
        raise RuntimeError("携程登录态失效，请重新登录账号")

    operation = task.get("operationType", "")
    target_days = date_tokens(task.get("dateStart", ""), task.get("dateEnd", ""))
    before_status = read_price_stock_status(page, product_id, target_days) if target_days else {}
    api_name = ""
    api_ack = ""
    if inventory_status_matches(before_status, operation):
        message = "目标日期已是打开销售" if operation == "openInventory" else "目标日期已是关闭销售"
    else:
        if operation == "closeInventory":
            payload = {
                "productId": int(product_id),
                "requestBaseData": {
                    "extParameterList": [
                        {"key": "page_version", "value": "5.3"},
                        {"key": "needValidatePermission", "value": "true"},
                    ]
                },
            }
            data = call_vbooking_api(page, "resourcesNotForSaleOnPrices", payload)
            api_name = "resourcesNotForSaleOnPrices"
            api_ack = (data.get("ResponseStatus") or {}).get("Ack", "")
            page.wait_for_timeout(1500)
        else:
            execute_product_task(page, task, product)
            page.goto(url, wait_until="domcontentloaded", timeout=60000)
            page.wait_for_timeout(2000)
        after_status = read_price_stock_status(page, product_id, target_days) if target_days else {}
        if not inventory_status_matches(after_status, operation):
            raise RuntimeError(f"已尝试执行，但携程草稿校验未达到目标状态：{after_status}")
        before_status = after_status
        message = "已校验目标日期为打开销售" if operation == "openInventory" else "已校验目标日期为关闭销售"
    screenshot = account_dir(task.get("accountId") or "default") / f"task_{task['id']}_{product_id}.png"
    page.screenshot(path=str(screenshot), full_page=True)
    return {
        "productId": product_id,
        "productTitle": product.get("title", ""),
        "category": product.get("category", ""),
        "status": "成功",
        "message": message,
        "api": api_name,
        "apiAck": api_ack,
        "priceStockStatus": before_status,
        "screenshot": str(screenshot),
        "finishedAt": now_text(),
    }


def sync_task_accounts(task):
    accounts = task.get("targetAccounts") or []
    if accounts:
        return accounts
    account_id = task.get("accountId", "")
    if account_id and account_id != "all":
        return [{"id": account_id, "name": task.get("accountName") or ACCOUNT_NAME_HINTS.get(account_id, account_id)}]
    return [
        {"id": account["id"], "name": account.get("name") or account["id"]}
        for account in list_backend_accounts()
        if account.get("login") == "已授权" or (account.get("sessionSummary") or {}).get("recorded") or account.get("sessionRef")
    ]


def execute_sync_task(task_id, task):
    sync_type = task.get("syncType") or ""
    params = task.get("params") or {}
    accounts = sync_task_accounts(task)
    if not accounts:
        raise RuntimeError("没有可同步的账号")
    total = len(accounts)
    success = 0
    failed = 0
    update_task(task_id, status="执行中", progress=5, currentStep="准备执行同步任务", result="", error="")
    for index, account in enumerate(accounts, start=1):
        account_id = account.get("id") or account.get("accountId")
        account_name = account.get("name") or account.get("accountName") or ACCOUNT_NAME_HINTS.get(account_id, account_id)
        update_task(
            task_id,
            status="执行中",
            progress=min(95, 8 + int((index - 1) / total * 87)),
            currentStep=f"正在同步 {index}/{total}：{account_name}",
        )
        try:
            if sync_type == "products":
                result = sync_products(account_id, max_pages=int(params.get("maxPages", 80)))
                message = f"同步产品 {len(result.get('products') or [])} 个"
            elif sync_type == "skus":
                result = sync_product_skus(
                    account_id,
                    max_products=int(params.get("maxProducts", 0)),
                    product_id_filter=params.get("productId", ""),
                    category_filter=params.get("categoryFilter", ""),
                    fallback_only=params.get("fallbackOnly", False),
                )
                progress = result.get("skuSyncProgress") or {}
                message = f"SKU 明细同步完成：成功 {progress.get('synced', 0)} 个，失败 {progress.get('failed', 0)} 个，处理 {progress.get('processed', 0)}/{progress.get('total', 0)}"
            elif sync_type == "priceStock":
                result = sync_product_price_stock(
                    account_id,
                    max_products=int(params.get("maxProducts", 0)),
                    product_id_filter=params.get("productId", ""),
                    category_filter=params.get("categoryFilter", ""),
                )
                progress = result.get("priceStockSyncProgress") or {}
                message = f"库价同步完成：成功 {progress.get('synced', 0)} 个，失败 {progress.get('failed', 0)} 个，跳过 {progress.get('skipped', 0)} 个，处理 {progress.get('processed', 0)}/{progress.get('total', 0)}"
            elif sync_type == "traffic":
                result = sync_traffic_dashboard(account_id, days=int(params.get("days", 30)))
                lines = result.get("traffic", {}).get("businessLines") or []
                message = f"同步渠道流量 {len(lines)} 条业务线"
            else:
                raise RuntimeError(f"未知同步类型：{sync_type}")
            success += 1
            append_task_item(task_id, {
                "accountId": account_id,
                "accountName": account_name,
                "productId": "-",
                "productTitle": task.get("operationLabel") or "同步任务",
                "category": sync_type,
                "status": "成功",
                "message": message,
                "api": f"sync:{sync_type}",
                "finishedAt": now_text(),
            })
        except Exception as error:
            failed += 1
            append_task_item(task_id, {
                "accountId": account_id,
                "accountName": account_name,
                "productId": "-",
                "productTitle": task.get("operationLabel") or "同步任务",
                "category": sync_type,
                "status": "失败",
                "message": str(error),
                "api": f"sync:{sync_type}",
                "finishedAt": now_text(),
            })
    update_task(
        task_id,
        status="成功" if failed == 0 else ("部分失败" if success else "失败"),
        progress=100,
        currentStep="同步任务执行完成",
        finishedAt=now_text(),
        result=f"成功 {success} 个账号，失败 {failed} 个账号",
        error="" if failed == 0 else "部分账号同步失败，请查看明细",
    )


def sort_product_refs_oneday_first(product_refs, task):
    decorated = []
    for index, ref in enumerate(product_refs or []):
        account_id = ref.get("accountId") or task.get("accountId")
        product_id = str(ref.get("productId") or "")
        product = dict(ref)
        if account_id and product_id:
            try:
                product = {**(product_lookup(account_id).get(product_id) or {}), **product}
            except Exception:
                pass
        decorated.append((0 if is_ttd_product(product) else 1, index, ref))
    return [ref for _, _, ref in sorted(decorated, key=lambda item: (item[0], item[1]))]


def execute_batch_task(task_id, task):
    if task.get("operationType") == "sync":
        execute_sync_task(task_id, task)
        return
    product_refs = task.get("productRefs") or []
    product_ids = [str(item) for item in task.get("productIds", [])]
    if not product_refs:
        product_refs = [{"productId": product_id, "accountId": task.get("accountId", "")} for product_id in product_ids]
    resource_inventory = (
        task.get("operationType") in ("openInventory", "closeInventory")
        and task.get("skuScope") == "custom"
        and task.get("skuText")
    )
    if task.get("operationType") in PRICE_OPERATIONS and len(product_refs) > 1:
        product_refs = sort_product_refs_oneday_first(product_refs, task)
        update_task(task_id, productRefs=product_refs)
    total = max(1, len(product_refs))
    update_task(task_id, status="执行中", progress=5, currentStep="准备打开携程执行器", result="", error="")

    task_playwright = None
    browser = None
    context = None
    try:
        task_playwright = sync_playwright().start()
        if resource_inventory:
            execute_resource_inventory_groups(task_playwright, task_id, task, product_refs)
            return
        first_account = (product_refs[0].get("accountId") if product_refs else "") or task.get("accountId")
        if not first_account or first_account == "multiple":
            raise RuntimeError("资源维度批量开关班需要指定一个账号")
        storage_path = account_dir(first_account) / "storage_state.json"
        browser = task_playwright.chromium.launch(
            channel="chrome",
            headless=task.get("operationType") in PRICE_OPERATIONS,
        )
        context = browser.new_context(
            storage_state=str(storage_path) if storage_path.exists() else None,
            viewport={"width": 1440, "height": 1000},
            locale="zh-CN",
            timezone_id="Asia/Shanghai",
        )
        page = context.new_page()
        success = 0
        failed = 0
        manual = 0
        if task.get("operationType") in ("openInventory", "closeInventory"):
            try:
                update_task(
                    task_id,
                    status="执行中",
                    progress=12,
                    currentStep="正在尝试产品列表批量开关班",
                )
                batch_result = execute_inventory_batch_switch_task(page, task, product_refs)
                for item in batch_result.get("items", []):
                    append_task_item(task_id, item)
                success = len(batch_result.get("items", []))
                update_task(
                    task_id,
                    status="执行完成",
                    progress=100,
                    currentStep="产品列表批量开关班已提交",
                    finishedAt=now_text(),
                    result=f"批量开关班成功提交 {success} 个{ '资源' if batch_result.get('mode') == 'resource' else '产品' }",
                    error="",
                )
                return
            except Exception as batch_error:
                update_task(
                    task_id,
                    status="执行中",
                    progress=18,
                    currentStep=f"批量开关班失败，转为逐产品执行：{batch_error}",
                    error=str(batch_error),
                )
        for index, ref in enumerate(product_refs, start=1):
            account_id = ref.get("accountId") or task.get("accountId")
            lookup = product_lookup(account_id)
            product_id = str(ref.get("productId") or "")
            product = lookup.get(product_id) or {
                "productId": product_id,
                "title": ref.get("title", ""),
                "category": ref.get("category", ""),
            }
            product = {
                **product,
                "accountId": account_id,
                "accountName": ref.get("accountName") or task.get("accountName") or ACCOUNT_NAME_HINTS.get(account_id, account_id),
            }
            update_task(
                task_id,
                status="执行中",
                progress=min(95, 8 + int((index - 1) / total * 87)),
                currentStep=f"正在处理 {index}/{total}：{product_id}",
            )
            try:
                if task.get("operationType") in PRICE_OPERATIONS:
                    item = execute_price_task_api(page, task, product, task_id=task_id)
                    item_success = len([detail for detail in item.get("items", []) if detail.get("status") == "成功"])
                    item_manual = len([detail for detail in item.get("items", []) if detail.get("status") == "待人工"])
                    item_failed = len([detail for detail in item.get("items", []) if detail.get("status") not in ("成功", "待人工")])
                    success += item_success
                    manual += item_manual
                    failed += item_failed
                    for detail in item.get("items", []):
                        append_task_item(task_id, detail)
                    if not item.get("items"):
                        append_task_item(task_id, item)
                        if item.get("status") == "成功":
                            success += 1
                        elif item.get("status") == "待人工":
                            manual += 1
                        else:
                            failed += 1
                    continue
                if task.get("operationType") in ("openInventory", "closeInventory") and "一日游" not in product.get("category", "") and "人工讲解" not in product.get("category", ""):
                    item = execute_inventory_task_verified(page, task, product)
                else:
                    item = execute_product_task(page, task, product)
                success += 1
            except Exception as error:
                failed += 1
                screenshot = account_dir(account_id) / f"task_{task_id}_{product_id}_failed.png"
                try:
                    page.screenshot(path=str(screenshot), full_page=True)
                except Exception:
                    screenshot = ""
                item = {
                    "productId": product_id,
                    "productTitle": product.get("title", ""),
                    "category": product.get("category", ""),
                    "status": "失败",
                    "message": str(error),
                    "screenshot": str(screenshot) if screenshot else "",
                    "finishedAt": now_text(),
                }
            append_task_item(task_id, item)
        status = "成功" if failed == 0 and manual == 0 else ("待人工" if failed == 0 and manual else ("部分失败" if success or manual else "失败"))
        result_parts = []
        if success:
            result_parts.append(f"成功 {success} 个")
        if manual:
            result_parts.append(f"待人工 {manual} 个")
        if failed:
            result_parts.append(f"失败 {failed} 个")
        update_task(
            task_id,
            status=status,
            progress=100,
            currentStep="执行完成",
            finishedAt=now_text(),
            result="，".join(result_parts) or "无可执行明细",
            error="" if failed == 0 else "部分产品执行失败，请查看明细",
        )
    finally:
        if context:
            context.close()
        if browser:
            browser.close()
        if task_playwright:
            task_playwright.stop()


class Handler(BaseHTTPRequestHandler):
    def send_json(self, payload, status=200):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)
        account_id = params.get("accountId", ["default"])[0]
        try:
            if parsed.path == "/api/login/start":
                self.send_json(start_login(
                    account_id,
                    channel=params.get("channel", ["ctrip"])[0],
                    account_name=params.get("name", [""])[0],
                    shop_name=params.get("shopName", [""])[0],
                    phone=params.get("phone", [""])[0],
                    remark=params.get("remark", [""])[0],
                ))
                return
            if parsed.path == "/api/session/capture":
                self.send_json(capture_session(
                    account_id,
                    channel=params.get("channel", [""])[0],
                    account_name=params.get("name", [""])[0],
                    shop_name=params.get("shopName", [""])[0],
                    phone=params.get("phone", [""])[0],
                    remark=params.get("remark", [""])[0],
                ))
                return
            if parsed.path == "/api/session/status":
                self.send_json(read_summary(account_id))
                return
            if parsed.path == "/api/accounts/list":
                self.send_json({"accounts": list_backend_accounts()})
                return
            if parsed.path == "/api/products/list":
                summary = params.get("summary", ["0"])[0] in ("1", "true", "yes")
                self.send_json(read_products_for_list(account_id, summary=summary))
                return
            if parsed.path == "/api/products/detail":
                product_id = params.get("productId", [""])[0]
                self.send_json(read_product_detail(account_id, product_id))
                return
            if parsed.path == "/api/products/sync":
                max_pages = int(params.get("maxPages", ["30"])[0])
                self.send_json(sync_products(account_id, max_pages=max_pages))
                return
            if parsed.path == "/api/products/sync-skus":
                max_products = int(params.get("maxProducts", ["0"])[0])
                product_id = params.get("productId", [""])[0]
                category_filter = params.get("categoryFilter", [""])[0]
                fallback_only = params.get("fallbackOnly", ["0"])[0] in ("1", "true", "yes")
                self.send_json(sync_product_skus(
                    account_id,
                    max_products=max_products,
                    product_id_filter=product_id,
                    category_filter=category_filter,
                    fallback_only=fallback_only,
                ))
                return
            if parsed.path == "/api/products/sync-price-stock":
                max_products = int(params.get("maxProducts", ["0"])[0])
                product_id = params.get("productId", [""])[0]
                category_filter = params.get("categoryFilter", [""])[0]
                self.send_json(sync_product_price_stock(
                    account_id,
                    max_products=max_products,
                    product_id_filter=product_id,
                    category_filter=category_filter,
                ))
                return
            if parsed.path == "/api/traffic/list":
                if account_id == "all":
                    dashboards = [read_traffic_dashboard(account["id"]) for account in list_backend_accounts()]
                    dashboards.extend(read_imported_traffic_dashboards())
                    self.send_json({"traffic": dashboards})
                else:
                    imported = [item for item in read_imported_traffic_dashboards() if item.get("accountId") == account_id]
                    self.send_json({"traffic": imported or [read_traffic_dashboard(account_id)]})
                return
            if parsed.path == "/api/traffic/sync":
                business = params.get("business", [""])[0]
                business_keys = split_ids(business) if business else None
                days = int(params.get("days", ["30"])[0])
                self.send_json(sync_traffic_dashboard(account_id, business_keys=business_keys, days=days))
                return
            if parsed.path == "/api/tasks/list":
                self.send_json({"tasks": read_tasks()})
                return
            target = ROOT / ("ctrip-price-workbench.html" if parsed.path in ("/", "/index.html") else parsed.path.lstrip("/"))
            if not target.resolve().is_relative_to(ROOT) or not target.exists():
                self.send_error(404)
                return
            body = target.read_bytes()
            self.send_response(200)
            self.send_header("Content-Type", mimetypes.guess_type(target.name)[0] or "application/octet-stream")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        except Exception as error:
            self.send_json({"ok": False, "error": str(error)}, status=500)

    def do_POST(self):
        parsed = urlparse(self.path)
        try:
            length = int(self.headers.get("Content-Length", "0") or "0")
            body = self.rfile.read(length).decode("utf-8") if length else "{}"
            payload = json.loads(body or "{}")
            if parsed.path == "/api/tasks/create":
                self.send_json({"ok": True, "task": create_batch_task(payload)})
                return
            if parsed.path == "/api/tasks/run":
                self.send_json({"ok": True, "task": run_existing_task(payload.get("taskId", ""))})
                return
            if parsed.path == "/api/price/holiday-preview":
                self.send_json(preview_oneday_holiday_prices(payload))
                return
            if parsed.path == "/api/traffic/import":
                self.send_json(save_imported_traffic(payload.get("rows") or []))
                return
            self.send_error(404)
        except Exception as error:
            self.send_json({"ok": False, "error": str(error)}, status=500)

    def log_message(self, format, *args):
        print("%s - %s" % (self.address_string(), format % args))


if __name__ == "__main__":
    mark_interrupted_tasks_on_startup()
    print(f"Serving on http://{HOST}:{PORT}")
    ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()
