npx esbuild ./tools/basic.css --bundle --minify --outfile=./basic_b.css  --external:*.png  --external:*.webp  --external:*.avif --external:*.woff2

npx esbuild ./tools/main.css --bundle --minify --outfile=./css/main_b.css  --external:*.png  --external:*.webp  --external:*.avif  --external:*.svg

npx esbuild ./main.js --minify --bundle --outfile=./js/main_b.js


pyftsubset fonts/GenSenRounded2TW-H.otf --output-file=fonts/GenSenRounded2TW-H-subset.woff2 --flavor=woff2 --text-file=tw_font.txt --layout-features='*' --glyph-names --symbol-cmap --legacy-cmap --notdef-glyph --notdef-outline --recommended-glyphs


# 韓文 kr（與 TW 同邏輯：主標與 body 分兩群字）
# 主標 .main_font 走 GenSen 圓體（韓文附在思源日文內）→ 取字清單 kr_font.txt
pyftsubset fonts/GenSenRounded2JP-H.otf --output-file=fonts/GenSenRounded2JP-H-subset.woff2 --flavor=woff2 --text-file=kr_font.txt --layout-features='*' --glyph-names --symbol-cmap --legacy-cmap --notdef-glyph --notdef-outline --recommended-glyphs

# body（font-weight:900 但非 .main_font，如 .btn-label/各標題）走 Noto Sans KR
# → 字清單 font-text/kr-w900.txt（另含 w400/w500）；下載變量字型 ofl/notosanskr/NotoSansKR[wght].ttf
python tools/subset-font.py <NotoSansKR[wght].ttf> kr noto-kr
# 改字後：主標改字動 kr_font.txt、body 改字動 font-text/kr-w900.txt，兩邊各自重跑上面對應指令。