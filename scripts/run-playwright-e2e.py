#!/usr/bin/env python3
"""Playwright user-journey test for the founder dashboard.

This harness intentionally validates the real founder journey through the rendered UI:
surface, edits, saved temporary scenarios, reset behavior, refresh-loss behavior,
mechanism outcomes, and mobile usability. It does not count label presence alone as proof.

It inlines the app source into the browser document so the test can run in restricted
containers where localhost/file navigation is blocked by browser policy. Local operators
may still run the public app with `npm run serve`; this test uses the same src files.
"""
import base64
import os
import re
import tempfile
from pathlib import Path

from playwright.sync_api import expect, sync_playwright

ROOT = Path(__file__).resolve().parents[1]


def money_to_int(text: str) -> int:
    clean = re.sub(r"[^0-9.-]", "", text)
    return int(round(float(clean or 0)))


def pct_to_float(text: str) -> float:
    clean = re.sub(r"[^0-9.-]", "", text)
    return float(clean or 0)


def source(name: str) -> str:
    return (ROOT / "src" / name).read_text()


def app_document() -> str:
    scenarios = source("scenarios.js").replace("export ", "")
    math = source("math.js").replace("export ", "")
    app = re.sub(r"^import .*?;\n", "", source("app.js"), flags=re.MULTILINE)
    logo = base64.b64encode((ROOT / "public" / "brand" / "wp-logo.png").read_bytes()).decode("ascii")
    app = app.replace("./brand/wp-logo.png", f"data:image/png;base64,{logo}")
    css = source("styles.css")
    return f"""<!doctype html>
<html lang='en'>
<head>
<meta charset='utf-8' />
<meta name='viewport' content='width=device-width, initial-scale=1' />
<title>Founder Dilution Dashboard by West Peek</title>
<style>{css}</style>
</head>
<body>
<div id='app'></div>
<script>
{scenarios}
{math}
{app}
</script>
</body>
</html>"""


def set_number(page, selector, value):
    locator = page.locator(selector)
    locator.fill(str(value))
    locator.dispatch_event("input")


def click_example(page, name):
    page.get_by_role("button", name=re.compile(re.escape(name))).click()


def assert_money_changes(before, after, label):
    if money_to_int(before) == money_to_int(after):
        raise AssertionError(f"{label} did not change. before={before}, after={after}")


def new_context(playwright, width=1440, height=1100):
    launch_options = {
        "viewport": {"width": width, "height": height},
        "args": ["--no-sandbox", "--disable-web-security"],
    }

    chrome_path = os.environ.get("CHROMIUM_PATH")
    if chrome_path:
        launch_options["executable_path"] = chrome_path

    return playwright.chromium.launch_persistent_context(
        tempfile.mkdtemp(prefix="fdd-playwright-"),
        **launch_options,
    )


def load_app(page):
    page.goto("about:blank")
    page.set_content(app_document(), wait_until="load")


def run():
    with sync_playwright() as p:
        context = new_context(p)
        page = context.pages[0]
        load_app(page)

        # Surface: prove the founder can see the guided flow and not just isolated labels.
        expect(page.get_by_role("heading", name="Founder Dilution Dashboard by West Peek")).to_be_visible()
        expect(page.locator('[data-testid="wp-logo"]')).to_have_attribute("alt", "West Peek logo")
        for heading in [
            "Choose a starting example",
            "Who owns the company before the next deal?",
            "How much money did the company raise, and on what terms?",
            "What gets paid before shareholders?",
            "What if the company sells for different amounts?",
            "Payment order",
            "What the founder may actually receive",
            "Compare different deal paths",
        ]:
            expect(page.get_by_role("heading", name=heading)).to_be_visible()
        expect(page.get_by_text("Educational scenario simulator only.")).to_be_visible()
        expect(page.get_by_text("Your saved scenarios are temporary.")).to_be_visible()

        # Outcome: a founder can own shares and still receive $0.
        click_example(page, "Founder Walks Away With $0")
        expect(page.locator('[data-testid="founder-payout-result"]')).to_have_text("$0")
        expect(page.locator('[data-testid="founder-outcome-message"]')).to_contain_text("receive $0")
        assert pct_to_float(page.locator('[data-testid="founder-ownership-result"]').inner_text()) > 0
        first_dollar = money_to_int(page.locator('[data-testid="first-dollar-result"]').inner_text())
        if first_dollar <= 0:
            raise AssertionError("First-dollar threshold must be above zero in founder-zero scenario")

        # Transaction: changing the sale price changes the real outcome.
        payout_before = page.locator('[data-testid="founder-payout-result"]').inner_text()
        set_number(page, '[data-testid="sale-price-input"]', 100000000)
        payout_after = page.locator('[data-testid="founder-payout-result"]').inner_text()
        assert_money_changes(payout_before, payout_after, "Founder payout after sale price edit")
        if money_to_int(payout_after) <= 0:
            raise AssertionError("Founder should receive proceeds after high enough sale price in this scenario")

        # Transaction: debts and fees are not cosmetic; they change money left after costs.
        net_before = page.locator('[data-testid="net-money-result"]').inner_text()
        set_number(page, '[data-testid="debt-input"]', 10000000)
        net_after = page.locator('[data-testid="net-money-result"]').inner_text()
        if money_to_int(net_after) >= money_to_int(net_before):
            raise AssertionError("Increasing debt must reduce money left after costs")

        # Transaction: target payout input changes the sale price required.
        target_before = page.locator('[data-testid="target-price-result"]').inner_text()
        set_number(page, '[data-testid="target-input"]', 5000000)
        target_after = page.locator('[data-testid="target-price-result"]').inner_text()
        assert_money_changes(target_before, target_after, "Target sale price after founder goal edit")

        # Mechanism: investor gets paid twice changes investor proceeds, not just text.
        click_example(page, "Investor Gets Paid Twice")
        set_number(page, '[data-testid="sale-price-input"]', 100000000)
        paid_twice_value = money_to_int(page.locator('[data-testid="investor-payback-result"]').inner_text())
        checkbox = page.locator('[data-action="round-0-getsPaidTwice"]')
        if not checkbox.is_checked():
            raise AssertionError("Investor Gets Paid Twice example should start checked")
        page.evaluate("""() => { const box = document.querySelector('[data-action=\"round-0-getsPaidTwice\"]'); box.checked = false; box.dispatchEvent(new Event('input', { bubbles: true })); }""")
        single_pay_value = money_to_int(page.locator('[data-testid="investor-payback-result"]').inner_text())
        if paid_twice_value <= single_pay_value:
            raise AssertionError(f"Turning off paid-twice rights should reduce investor payout at high sale price. before={paid_twice_value}, after={single_pay_value}, checked={checkbox.is_checked()}")

        # Mechanism: add/remove round changes the number of editable financing blocks.
        round_count_before = page.locator('.round-card').count()
        page.locator('[data-testid="add-round"]').click()
        if page.locator('.round-card').count() != round_count_before + 1:
            raise AssertionError("Add another funding round did not create a usable round card")
        page.get_by_role("button", name="Remove").last.click()
        if page.locator('.round-card').count() != round_count_before:
            raise AssertionError("Remove round did not return to the original round count")

        # Temporary save: user can save an edited version, leave it, come back, and see the edited numbers.
        click_example(page, "Heavy VC Stack")
        set_number(page, '[data-testid="founder-ownership-input"]', 44)
        page.once("dialog", lambda dialog: dialog.accept("My Brutal Scenario"))
        page.locator('[data-testid="save-version"]').click()
        expect(page.get_by_role("button", name=re.compile("My Brutal Scenario"))).to_be_visible()
        expect(page.locator('[data-testid="status-message"]')).to_contain_text("disappear if you refresh")
        click_example(page, "Clean Seed Round")
        click_example(page, "My Brutal Scenario")
        if page.locator('[data-testid="founder-ownership-input"]').input_value() != "44":
            raise AssertionError("Saved scenario did not preserve the founder's edited number during the active page")

        # Reset: custom scenario can be reset back to its original built-in example.
        page.locator('[data-testid="reset-current"]').click()
        if page.locator('[data-testid="founder-ownership-input"]').input_value() != "70":
            raise AssertionError("Reset to original example did not restore Heavy VC Stack founder ownership")

        # Clear: temporary saved scenarios can be removed.
        page.locator('[data-testid="clear-saved"]').click()
        expect(page.get_by_role("button", name=re.compile("My Brutal Scenario"))).to_have_count(0)

        # Persistence: temporary save must disappear after refresh/reload. This is key product behavior.
        click_example(page, "Founder Walks Away With $0")
        page.once("dialog", lambda dialog: dialog.accept("Refresh Loss Proof"))
        page.locator('[data-testid="save-version"]').click()
        expect(page.get_by_role("button", name=re.compile("Refresh Loss Proof"))).to_be_visible()
        load_app(page)
        expect(page.get_by_role("button", name=re.compile("Refresh Loss Proof"))).to_have_count(0)
        expect(page.get_by_role("button", name=re.compile(r"Founder Walks Away With \$0"))).to_be_visible()

        # Mobile usability smoke: the full journey surface is still reachable on phone width.
        mobile_context = new_context(p, width=390, height=1000)
        mobile = mobile_context.pages[0]
        load_app(mobile)
        expect(mobile.get_by_role("heading", name="Founder Dilution Dashboard by West Peek")).to_be_visible()
        expect(mobile.get_by_role("button", name=re.compile(r"Founder Walks Away With \$0"))).to_be_visible()
        mobile.get_by_role("button", name=re.compile(r"Founder Walks Away With \$0")).click()
        expect(mobile.locator('[data-testid="founder-payout-result"]')).to_have_text("$0")
        screenshot_dir = ROOT / "test-results"
        screenshot_dir.mkdir(exist_ok=True)
        page.screenshot(path=str(screenshot_dir / "west-peek-dashboard-desktop.png"), full_page=True)
        mobile.screenshot(path=str(screenshot_dir / "west-peek-dashboard-mobile.png"), full_page=True)
        mobile_context.close()
        context.close()
        print("Playwright E2E passed: branded surface, transactions, outcomes, temporary persistence, reset, screenshots, and mobile journey.")


if __name__ == "__main__":
    run()
