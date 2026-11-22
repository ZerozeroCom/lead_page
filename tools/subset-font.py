#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
把變量字型（wght 軸）依各字重 instance 後，用 font-text/<lang>-w<weight>.txt 做子集化，
輸出 woff2 到 fonts/。每個字重只含該字重實際用到的字。

用法：
  python tools/subset-font.py <source_variable.ttf> <lang> <out_prefix>
例：
  python tools/subset-font.py /path/NotoSansTC.ttf tw noto-tc
  -> fonts/noto-tc-400.woff2 等
"""
import sys, os, glob, re
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools import subset

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def build(src, lang, prefix):
    files = sorted(glob.glob(os.path.join(ROOT, "font-text", f"{lang}-w*.txt")))
    if not files:
        print(f"找不到 font-text/{lang}-w*.txt"); return
    os.makedirs(os.path.join(ROOT, "fonts"), exist_ok=True)
    total = 0
    for fp in files:
        m = re.search(rf"{lang}-w(\d+)\.txt$", fp)
        if not m:
            continue
        weight = int(m.group(1))
        text = open(fp, encoding="utf-8").read()
        chars = set(text) - set("\r\n")
        # 1) instance 到該字重（得到靜態字型）
        font = TTFont(src)
        instantiateVariableFont(font, {"wght": weight}, inplace=True)
        # 2) 子集化
        opts = subset.Options()
        opts.flavor = "woff2"
        opts.hinting = False            # 網頁 CJK 通常不需 hinting，省體積
        opts.desubroutinize = True
        opts.name_IDs = ["*"]
        opts.notdef_outline = True
        opts.layout_features = ["*"]
        ss = subset.Subsetter(options=opts)
        ss.populate(unicodes=[ord(c) for c in chars])
        ss.subset(font)
        out = os.path.join(ROOT, "fonts", f"{prefix}-{weight}.woff2")
        font.save(out)
        kb = os.path.getsize(out) / 1024
        total += kb
        print(f"  {prefix}-{weight}.woff2  {len(chars):>4} 字  {kb:6.1f} KB")
    print(f"合計：{total:.1f} KB")

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print(__doc__); sys.exit(1)
    build(sys.argv[1], sys.argv[2], sys.argv[3])
