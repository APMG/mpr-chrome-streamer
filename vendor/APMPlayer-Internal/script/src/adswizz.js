/**
 * APMPlayer support script for AdsWizz.
 *
 * Requires the following scripts:
 * <script type='text/javascript' src='http://cdn.adswizz.com/adswizz/js/SynchroClient2.js'></script>
 * <script type='text/javascript' src='http://synchrobox.adswizz.com/register2.php'></script>
 *
 * @author William Johnston <wjohnston@mpr.org>
 */

(function ($) {

    $.adswizz = {

        /**
         * Decorate the stream for AdsWizz if an adblocker isn't loaded.
         * Keeps the stream from breaking if you do.
         *
         * @param  {string} mp3_stream The MP3 stream to be decorated.
         * @return {string}            A decorated MP3 stream.
         */
        safe_decorate: function (mp3_stream) {
            //be sure adswizz script loads... adblock prevents the load
            //and function will break player if undefined.
            if (typeof com_adswizz_synchro_decorateUrl !== 'undefined') {
                mp3_stream = com_adswizz_synchro_decorateUrl(mp3_stream);
            }
            return mp3_stream;
        },

        /**
         * Handle AdsWizz Metadata - A plugin to handle the companion images for AdsWizz server side stitching.
         *
         * @class adswizz_handle_metadata
         * @memberOf jQuery
         * @param {object} options          Options for plugin execution.
         * @param {object} options.playable The APMPlayer Playable in the onMetadata trigger.
         * @param {object} options.triggers An object containing keys with the trigger and options with zone IDs.
         * @param {object} options.zones    An object containing keys for zones and arguments for dom location, width, height, and a callback called done.
         **/
        handle_metadata: function (options) {

            var default_zones = {
                banner : {
                    dom: '#adswizzBanner',
                    width: 300,
                    height: 100
                },
                overlay : {
                    dom: '#adswizzOverlay',
                    width: 300,
                    height: 250,
                    done: function() {
                        $('#apm_media_wrapper').addClass('preroll-active');
                        $('#apm_media_wrapper').removeClass('preroll-inactive');
                    }
                },
                fallback : {
                    // Special zone which fires if none of the others apply.
                    done: function() {
                        $('#apm_media_wrapper').removeClass('preroll-active');
                        $('#apm_media_wrapper').addClass('preroll-inactive');
                    }
                }
            };

            // Add defaults.
            options = $.extend({
                zones: default_zones
            }, options);

            // Validate options.
            if (typeof options.playable === 'undefined') {
                throw 'adswizz_handle_metadata: Requires playable.';
            }
            if (!options.hasOwnProperty('triggers')) {
                throw 'adswizz_handle_metadata: Requires triggers.';
            }


            // Execute options.
            if (options.triggers.hasOwnProperty(options.playable.title)) {

                trigger = options.triggers[options.playable.title];

                for (var zoneName in options.zones) {

                    if (typeof trigger[zoneName] !== 'undefined') {

                        var zoneId = trigger[zoneName];
                        var zone = options.zones[zoneName];

                        // Validate that the dom element is a jquery object or string and handle the latter case.
                        var element;
                        if (typeof zone.dom === 'string') {
                            element = $(zone.dom);
                        } else {
                            element = zone.dom;
                        }


                        zone = $.extend({
                            width: 300,
                            height: 100
                        }, zone);


                        element.width(zone.width);
                        element.height(zone.height);


                        var sourceLink = 'http://deliveryengine.streamguys.adswizz.com/afr' + '?zoneid=' + zoneId + '&context=' + options.playable.adw_context + '&cb=' + Math.random();

                        var content = $('<iframe />', {
                            width: zone.width,
                            height: zone.height,
                            src: sourceLink,
                            framespacing: 0,
                            frameborder: 'no',
                            scrolling: 'no',
                            allowTransparency: 'true'
                        });

                        element.html(content);

                        if (zone.hasOwnProperty('done')) {
                            zone.done();
                        }

                    }
                }
            } else {
                options.zones.fallback.done();
            }
        }
    };

})(jQuery);