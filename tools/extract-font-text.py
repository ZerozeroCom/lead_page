#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
抓各語系頁 index.html 的「可見文字」，分語言輸出成 font-text/<lang>.txt，
供 pyftsubset --text-file 做字型子集化（body 字型 Noto Sans TC/SC/KR 用）。

- 會略過 <script> / <style> / <noscript> 的內容（那些不是用內文字型渲染的）。
- 預設不含 alt/aria 等屬性文字；若要把 alt 也納入（圖片載入失敗時會以內文字型顯示），
  執行時加 --with-alt。
用法：
  python tools/extract-font-text.py            # 全語系
  python tools/extract-font-text.py tw          # 只做 tw
  python tools/extract-font-text.py tw --with-alt
"""
import sys, os, re
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOCALES = {
    "tw": "taccoo8866_tw",   # 繁中 → Noto Sans TC
    "cn": "taccoo8866_cn",   # 簡中 → Noto Sans SC
    "en": "taccoo8866_en",   # 英文 → 拉丁字型（Inter）
    "kr": "taccoo8866_kr",   # 韓文 → Noto Sans KR
}
SKIP_TAGS = {"script", "style", "noscript"}

class VisibleText(HTMLParser):
    def __init__(self, with_alt=False):
        super().__init__(convert_charrefs=True)
        self.with_alt = with_alt
        self.skip_depth = 0
        self.chunks = []
    def handle_starttag(self, tag, attrs):
        if tag in SKIP_TAGS:
            self.skip_depth += 1
        if self.with_alt:
            for k, v in attrs:
                if k in ("alt", "aria-label") and v and self.skip_depth == 0:
                    self.chunks.append(v)
    def handle_endtag(self, tag):
        if tag in SKIP_TAGS and self.skip_depth > 0:
            self.skip_depth -= 1
    def handle_data(self, data):
        if self.skip_depth == 0:
            t = data.strip()
            if t:
                self.chunks.append(t)

def extract(path, with_alt):
    with open(path, encoding="utf-8") as f:
        html = f.read()
    p = VisibleText(with_alt=with_alt)
    p.feed(html)
    # 去重但保留順序
    seen, lines = set(), []
    for c in p.chunks:
        c = re.sub(r"\s+", " ", c).strip()
        if c and c not in seen:
            seen.add(c)
            lines.append(c)
    return lines

def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    with_alt = "--with-alt" in sys.argv
    langs = args if args else list(LOCALES)
    out_dir = os.path.join(ROOT, "font-text")
    os.makedirs(out_dir, exist_ok=True)
    for lang in langs:
        d = LOCALES.get(lang)
        idx = os.path.join(ROOT, d, "index.html") if d else None
        if not idx or not os.path.exists(idx):
            print(f"[skip] {lang}: 找不到 {d}/index.html")
            continue
        lines = extract(idx, with_alt)
        text = "\n".join(lines)
        chars = sorted(set(text) - set("\n"))
        out = os.path.join(out_dir, f"{lang}.txt")
        with open(out, "w", encoding="utf-8") as f:
            f.write(text + "\n")
        print(f"[ok]   {lang}: {len(lines)} 段、{len(chars)} 個不重複字元 -> font-text/{lang}.txt")

if __name__ == "__main__":
    main()
