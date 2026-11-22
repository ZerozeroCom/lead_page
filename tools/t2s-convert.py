#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
繁體 → 簡體 轉換（OpenCC）。只改中文字，HTML 結構/CSS/網址/class 等 ASCII 不動。
就地覆寫指定檔案（以 git 追蹤變更，不另存備份）。

用法：
  python tools/t2s-convert.py <file> [config]
  config 預設 t2s（忠實簡化字形、保留用詞）；要「台灣用詞→大陸用詞」改用 tw2sp。
例：
  python tools/t2s-convert.py taccoo8866_cn/index.html
"""
import sys
from opencc import OpenCC

def main():
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(1)
    path = sys.argv[1]
    config = sys.argv[2] if len(sys.argv) > 2 else "t2s"
    cc = OpenCC(config)
    with open(path, "rb") as f:
        raw = f.read()
    text = raw.decode("utf-8")
    out = cc.convert(text)
    with open(path, "wb") as f:
        f.write(out.encode("utf-8"))
    changed = sum(1 for a, b in zip(text, out) if a != b)
    print(f"[{config}] {path}: 完成，變更約 {changed} 個字元")

if __name__ == "__main__":
    main()
