#!/bin/bash
cat ../src/apmplayer.js ../src/custom_schemes.js ../src/apmplayer_init.js ../src/apmplayer_ui.jquery.js > apmplayer-all.js

# ~/node_modules/uglify-js/bin/uglifyjs apmplayer-all.js > ../apmplayer-all.min.js
closure-compiler --language_in ECMASCRIPT3 apmplayer-all.js > ../apmplayer-all.min.js

rm apmplayer-all.js


closure-compiler ../src/adswizz.js > ../adswizz.min.js
closure-compiler ../src/apmplayer_webtrends.js > ../apmplayer_webtrends.min.js
