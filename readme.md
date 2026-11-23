npx esbuild ./tools/basic.css --bundle --minify --outfile=./basic_b.css  --external:*.png  --external:*.webp  --external:*.avif --external:*.woff2

npx esbuild ./tools/main.css --bundle --minify --outfile=./css/main_b.css  --external:*.png  --external:*.webp  --external:*.avif  --external:*.svg

npx esbuild ./main.js --minify --bundle --outfile=./js/main_b.js