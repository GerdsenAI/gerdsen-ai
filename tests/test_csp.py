"""Dependency-free CSP source regressions; run locally with unittest discover."""

import base64
import hashlib
from html.parser import HTMLParser
from pathlib import Path
import re
import unittest


ROOT = Path(__file__).resolve().parents[1]


def parse_policy(policy):
    return {
        part.split()[0]: part.split()[1:]
        for part in policy.split(";")
        if part.strip()
    }


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags = []
        self.scripts = []
        self.current_script = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.tags.append((tag, attrs))
        if tag == "script":
            self.current_script = [attrs, ""]

    def handle_data(self, data):
        if self.current_script is not None:
            self.current_script[1] += data

    def handle_endtag(self, tag):
        if tag == "script" and self.current_script is not None:
            self.scripts.append(self.current_script)
            self.current_script = None


class CSPTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html = (ROOT / "index.html").read_text(encoding="utf-8")
        cls.css = (ROOT / "assets/css/main.css").read_text(encoding="utf-8")
        cls.docs = (ROOT / "SECURITY.md").read_text(encoding="utf-8")
        cls.page = PageParser()
        cls.page.feed(cls.html)
        policies = [
            attrs["content"]
            for tag, attrs in cls.page.tags
            if tag == "meta" and attrs.get("http-equiv") == "Content-Security-Policy"
        ]
        if len(policies) != 1:
            raise AssertionError("Expected exactly one CSP meta element")
        cls.policy = parse_policy(policies[0])

    def test_exact_early_bootstrap_hash(self):
        inline = [
            body for attrs, body in self.page.scripts
            if "src" not in attrs and attrs.get("type") != "application/ld+json"
        ]
        self.assertEqual(inline, ['document.documentElement.classList.add("js");'])
        digest = base64.b64encode(hashlib.sha256(inline[0].encode()).digest()).decode()
        self.assertEqual(self.policy["script-src"], ["'self'", f"'sha256-{digest}'"])
        self.assertLess(self.html.index('http-equiv="Content-Security-Policy"'), self.html.index(inline[0]))
        self.assertLess(self.html.index(inline[0]), self.html.index("</head>"))
        self.assertNotIn("'unsafe-inline'", self.policy["script-src"])
        self.assertNotIn("'unsafe-eval'", self.policy["script-src"])

    def test_reveal_delay_is_stylesheet_based(self):
        self.assertFalse([attrs for _, attrs in self.page.tags if "style" in attrs])
        self.assertNotIn("'unsafe-inline'", self.policy["style-src"])
        self.assertRegex(self.css, r"(?m)^\.contact-panel\s*\{\s*--reveal-delay:\s*120ms;")
        self.assertIn("transition-delay: var(--reveal-delay, 0ms);", self.css)
        self.assertRegex(self.css, r"(?m)^\.reveal\s*\{\s*opacity:\s*1;")
        self.assertIn(".js .reveal.is-visible", self.css)

    def test_existing_resources_and_contact_destination_remain_allowed(self):
        self.assertEqual(self.policy["default-src"], ["'self'"])
        self.assertEqual(self.policy["style-src"], ["'self'", "https://fonts.googleapis.com"])
        self.assertEqual(self.policy["font-src"], ["'self'", "https://fonts.gstatic.com"])
        self.assertEqual(self.policy["connect-src"], ["'self'", "https://formspree.io"])
        self.assertEqual(self.policy["form-action"], ["'self'", "https://formspree.io"])
        self.assertIn(({"src": "assets/js/main.js", "defer": None}, ""), [
            (attrs, body) for attrs, body in self.page.scripts
        ])
        forms = [attrs for tag, attrs in self.page.tags if tag == "form"]
        self.assertEqual(len(forms), 1)
        self.assertEqual(forms[0]["action"], "https://formspree.io/f/xeozyrwa")

    def test_documented_header_matches_meta_plus_header_only_framing(self):
        header = parse_policy(re.search(r"```\n(default-src.*?)```", self.docs, re.S).group(1))
        self.assertEqual(header.pop("frame-ancestors"), ["'none'"])
        self.assertEqual(header, self.policy)
        self.assertNotIn("frame-ancestors", self.policy)
        self.assertIn("response-header-only", self.docs)
        self.assertIn("browsers ignore it in a meta policy", self.docs)


if __name__ == "__main__":
    unittest.main()
