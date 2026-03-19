import asyncio
from playwright.async_api import async_playwright
import random
import logging

logger = logging.getLogger(__name__)

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2.1 Safari/605.1.15",
]

def get_random_ua():
    os_list = [
        "Windows NT 10.0; Win64; x64",
        "Macintosh; Intel Mac OS X 10_15_7",
        "X11; Linux x86_64",
        "Windows NT 11.0; Win64; x64"
    ]
    browser_list = [
        ("Chrome", "121.0.0.0", "537.36"),
        ("Chrome", "122.0.0.0", "537.36"),
        ("Firefox", "123.0", "20100101"),
        ("Safari", "17.3", "605.1.15"),
        ("Edge", "121.0.2277.128", "537.36")
    ]
    # Dynamically generate 100+ combinations
    combinations = []
    for o in os_list:
        for b, v, webkit in browser_list:
            if b == "Firefox":
                combinations.append(f"Mozilla/5.0 ({o}; rv:{v}) Gecko/{webkit} Firefox/{v}")
            elif b == "Safari":
                combinations.append(f"Mozilla/5.0 ({o}) AppleWebKit/{webkit} (KHTML, like Gecko) Version/{v} Safari/{webkit}")
            else:
                combinations.append(f"Mozilla/5.0 ({o}) AppleWebKit/{webkit} (KHTML, like Gecko) {b}/{v} Safari/{webkit}")
    return random.choice(combinations)

async def stealth_scrape(query: str, max_results: int = 5) -> list:
    """
    Zero-Cost Stealth Scraping using Playwright.
    Bypasses API Search dependencies by directly scraping fallback engines.
    """
    results = []
    logger.info(f"[Playwright] Stealth scraping for: {query}")
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(
                headless=True,
                args=["--disable-blink-features=AutomationControlled"]
            )
            context = await browser.new_context(
                user_agent=get_random_ua(),
                viewport={'width': 1920, 'height': 1080}
            )
            await context.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            page = await context.new_page()
            
            try:
                # Evasion Tactics: We use DuckDuckGo HTML/Lite to avoid complex captchas initially
                await page.goto(f"https://lite.duckduckgo.com/lite/")
                await page.fill('input[name="q"]', query)
                await page.click('input[type="submit"]')
                await page.wait_for_selector('td.result-snippet', timeout=8000)
                
                raw_results = await page.evaluate('''() => {
                    let items = [];
                    document.querySelectorAll('tr').forEach(row => {
                        let titleEl = row.querySelector('.result-title');
                        let snippetEl = row.querySelector('.result-snippet');
                        let linkEl = row.querySelector('.result-url');
                        
                        if (titleEl && snippetEl) {
                            items.push({ 
                                title: titleEl.innerText, 
                                href: linkEl ? linkEl.href : 'N/A',
                                body: snippetEl.innerText
                            });
                        }
                    });
                    return items;
                }''')
                results = raw_results[:max_results]
                
            except Exception as e:
                logger.warning(f"[Playwright] DuckDuckGo block detected, falling back to Yandex: {e}")
                # Fallback to Yandex
                await page.goto(f"https://yandex.com/search/?text={query}")
                await page.wait_for_selector('.serp-item', timeout=8000)
                
                raw_results = await page.evaluate('''() => {
                    let items = [];
                    document.querySelectorAll('.serp-item').forEach(row => {
                        let titleEl = row.querySelector('.organic__title-wrapper');
                        let snippetEl = row.querySelector('.organic__content-wrapper');
                        let linkEl = row.querySelector('a');
                        
                        if (titleEl && snippetEl) {
                            items.push({ 
                                title: titleEl.innerText, 
                                href: linkEl ? linkEl.href : 'N/A',
                                body: snippetEl.innerText
                            });
                        }
                    });
                    return items;
                }''')
                results = raw_results[:max_results]
                
            finally:
                await browser.close()
    except Exception as base_e:
        logger.error(f"[Playwright] Failed to initialize chromium: {base_e}")
    
    return results
