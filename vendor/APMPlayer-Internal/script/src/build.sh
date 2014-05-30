#!/bin/bash
cat apmplayer.js custom_schemes.js apmplayer_init.js apmplayer_ui.jquery.js > apmplayer-all.js

# ~/node_modules/uglify-js/bin/uglifyjs apmplayer-all.js > ../apmplayer-all.min.js
closure-compiler apmplayer-all.js > ../apmplayer-all.min.js

rm apmplayer-all.js
