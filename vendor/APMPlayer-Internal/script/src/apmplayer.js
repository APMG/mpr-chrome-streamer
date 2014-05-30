/**
 * @name apmplayer.js
 * @fileOverview
 * @description the file contains APMPlayerFactory, APMPlayer, Playlist, Playable etc.
 * All methods are revealed via API through the use of 'revealing' or 'module' js pattern.
 */
if (typeof APMPlayerFactory === 'undefined') {

    /**
     * @name APMPlayerFactory
     * @description factory pattern used to prohibit multiple copies of APMPlayer (singleton) + provides access to Playlist, Playable, and UnderwritingPlayable
     * @class
     */
    var APMPlayerFactory = (function () {

        'use strict';

        /**
         * @name MediaTypes
         * @description contains the names of all valid Media Types that APMPlayer handles -- also, see {@link Playable}.
         * @class
         * @ignore
         */
        var MediaTypes = {
            type : {
                AUDIO : 'audio',
                LIVE_AUDIO : 'live_audio'
                //VIDEO : 'video',
            },
            isValid : function (type) {
                var key;
                for (key in MediaTypes.type) {
                    if (MediaTypes.type[key] === type) {
                        return true;
                    }
                }
                return false;
            }
        };

        /**
         * @name Debug
         * @description static debugging utility.  To enable debug messages from browser session, simply add '?debug=1' or 'debug=true' to URL when loading any APMPlayer instance (enables console logging).  To disable Console + onScreen debug trace, use 'debug=all'.
         * @class
         */
        var Debug = function () {};
        /**
         * @name enabled
         * @description used to mark if debugging logs should output or not.  to enable, add ?debug=1 to URL when loading player.  by default, it logs to the console only; to enable a debug div, do debug=all
         * @default false
         * @fieldOf Debug
         */
        Debug.enabled = false;
        /**
         * @name consoleOnly
         * @description used to mark if debugging logs should output to console only; true by default.  use debug=all to log to both the console AND a helper div on screen.
         * @default true
         * @fieldOf Debug
         */
        Debug.consoleOnly = true;
        /**
         * @name log
         * @description writes to the log
         * @param {string} message the information to log
         * @param {string} type level of severity to log (see type)
         * @param {string} object_name optional object name to pass (if logging outside of APMPlayer -- APMPlayer_UI for instance)
         *
         * @methodOf Debug
         */
        Debug.log = function (message, type, object_name) {
            if (Debug.enabled === false) {
                return;
            }

            if (typeof object_name === 'undefined') {
                object_name = 'APMPlayer';
            }

            var success = false;
            if (typeof soundManager !== 'undefined') {
                success = soundManager._writeDebug(object_name + '::' + message, type.id, false);
            }
            // Early in the load cycle, soundManager exists, but won't print debug messages.
            if (typeof soundManager === 'undefined' || !success) {
                console.log(object_name + '::' + message + '[' + type.name + ']');
            }
        };
        /**
         * @name type
         * @description object that holds the three different logging levels
         * @example
         * Debug.type.info
         * Debug.type.warn
         * Debug.type.error
         * @fieldOf Debug
         */
        Debug.type = {
            'info' : {'id' : 1, 'name' : 'info'},
            'warn' : {'id' : 2, 'name' : 'warning'},
            'error': {'id' : 3, 'name' : 'error'}
        };

        /**
         * @name Events
         * @description creates a new Events object.  Currently used within {@link APMPlayer}, internal and external version + {@link Playlist}
         * @constructor
         */
        var Events = function () {
            /**
             * @name type
             * @description holds all valid event types -- See Event Summary for details
             * @type Object
             * @fieldOf Events
             */
            this.type = {
                /**
                 * @name AUDIO_LIB_READY
                 * @event
                 * @description fires after Audio library has initialized (only used internally)
                 * @example Events.type.AUDIO_LIB_READY
                 *
                 * @memberOf Events
                 */
                AUDIO_LIB_READY : 'AUDIO_LIB_READY',
                /**
                 * @name MEDIA_READY
                 * @event
                 * @description fires when media has successfully loaded and is ready to be played
                 * @example Events.type.MEDIA_READY
                 *
                 * @memberOf Events
                 */
                MEDIA_READY : 'MEDIA_READY',
                /**
                 * @name PLAYER_READY
                 * @event
                 * @description  fires when player has completely initialized
                 * @example Events.type.PLAYER_READY
                 * @fieldOf Events
                 */
                PLAYER_READY : 'PLAYER_READY',
                /**
                 * @name PLAYER_FAILURE
                 * @event
                 * @description fires when no suitable playback mechanism can be determined (final failure)
                 * @example Events.type.PLAYER_FAILURE
                 * @fieldOf Events
                 */
                PLAYER_FAILURE : 'PLAYER_FAILURE',
                /**
                 * @name CONNECTION_LOST
                 * @event
                 * @description fires if the network connection is lost
                 * @example Events.type.CONNECTION_LOST
                 * @fieldOf Events
                 */
                CONNECTION_LOST : 'CONNECTION_LOST',
                /**
                 * @name PLAYLIST_CURRENT_CHANGE
                 * @event
                 * @description fires when current item in playlist has updated
                 * @example Events.type.PLAYLIST_CURRENT_CHANGE
                 * @fieldOf Events
                 */
                 MISSING_FILE : 'MISSING_FILE',
                /**
                 * @name MISSING_FILE
                 * @event
                 * @description fires if a file that was attempted to be played is missing
                 * @example Events.type.MISSING_FILE
                 * @fieldOf Events
                 */
                PLAYLIST_CURRENT_CHANGE : 'PLAYLIST_CURRENT_CHANGE',
                /**
                 * @name POSITION_UPDATE
                 * @event
                 * @description fires each time player head updates while playing-- a number in miliseconds usually accompanies the event to report current position in miliseconds.
                 * @example Events.type.POSITION_UPDATE
                 * @fieldOf Events
                 */
                POSITION_UPDATE : 'POSITION_UPDATE',
                /**
                 * @name PLAYING
                 * @event
                 * @description fires when playable begins playback
                 * @example Events.type.PLAYING
                 * @fieldOf Events
                 */
                PLAYING : 'PLAYING',
                /**
                 * @name PAUSED
                 * @event
                 * @description fires when playable is paused
                 * @example Events.type.PAUSED
                 * @fieldOf Events
                 */
                PAUSED : 'PAUSED',
                /**
                 * @name FINISHED
                 * @event
                 * @description fires when playable finishes playing
                 * @example Events.type.FINISHED
                 * @fieldOf Events
                 */
                FINISHED : 'FINISHED',
                /**
                 * @name UNLOADED
                 * @event
                 * @description fires when a playable is stopped or unloaded from player
                 * @example Events.type.UNLOADED
                 * @fieldOf Events
                 */
                UNLOADED : 'UNLOADED',
                /**
                 * @name BUFFER_START
                 * @event
                 * @description fires when player starts buffering
                 * @example Events.type.BUFFER_START
                 * @fieldOf Events
                 */
                BUFFER_START : 'BUFFER_START',
                /**
                 * @name BUFFER_END
                 * @event
                 * @description fires when player buffering ends
                 * @example Events.type.BUFFER_END
                 * @fieldOf Events
                 */
                BUFFER_END : 'BUFFER_END',
                /**
                 * @name METADATA
                 * @event
                 * @description important for statistic tracking (web trends) fires each time a new playable is encountered, or when a new item begins playing in a live stream
                 * A {@link Playable} is always the data for each METADATA event
                 * @example Events.type.METADATA
                 * @fieldOf Events
                 */
                METADATA : 'METADATA',
                /**
                 * @name VOLUME_UPDATED
                 * @event
                 * @description fires when volume is updated
                 * @example Events.type.VOLUME_UPDATED
                 * @fieldOf Events
                 */
                VOLUME_UPDATED : 'VOLUME_UPDATED',
                /**
                 * @name SEGMENT_CHANGED
                 * @event
                 * @description fires when segment changes
                 * @example Events.type.SEGMENT_CHANGED
                 * @fieldOf Events
                 */
                SEGMENT_CHANGED : 'SEGMENT_CHANGED'
            };
            /**
             * @name handlers
             * @description array of event handler objects in form of { 'handler_name', function() {} }.
             * @type Array.<Object>
             * @fieldOf Events
             */
            this.handlers = [];
        };
        Events.prototype = {
            /**
             * @name trigger
             * @description fires all events handlers that match 'name' and passes eventArgs to each handler.
             * @param {string} name name of event to fire
             * @param {Object} eventArgs object literal to pass to all function handlers. Additional arguments will also be passed.
             *
             * @example APMPlayer.events.trigger(player.events.type.MEDIA_READY, { 'identifier' : this.ID });
             *
             * @methodOf Events
             */
            trigger : function (name, eventArgs) {
                var i;
                for (i = 0; i < this.handlers.length; i += 1) {
                    if (this.handlers[i].eventName === name) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        this.handlers[i].eventHandler.apply(this, args);
                    }
                }
            },
            /**
             * @name addListener
             * @description adds an event listener
             * @param {string} name the name of the event to listen for
             * @param {Object} handler function to fire when event is called.
             *
             * @example APMPlayer.events.addListener(APMPlayer.events.type.PLAYER_READY, function() {});
             * @methodOf Events
             */
            addListener : function (name, handler) {
                if (typeof (name) !== 'string' || typeof (handler) !== 'function') {
                    Debug.log("Invalid parameters when creating listener with the following arguments: 'Name': " + name + ", 'Handler': " + handler, Debug.type.error);
                }
                this.handlers.push({ "eventName" : name, "eventHandler" : handler });
            },
            /**
             * @name removeListeners
             * @description clears out all listeners in this events objec
             *
             * @example APMPlayer.events.removeListeners();
             * @methodOf Events
             */
            removeListeners : function () {
                this.handlers = [];
            }
        };



        /**
         * @name PlaybackState
         * @constructor
         *
         * @description holds all PlaybackStates (PLAYING, STOPPED, PAUSED);
         *
         * @property {Object} type all possible PlaybackState types (PLAYING, STOPPED, PAUSED);
         */
        var PlaybackState = function () {
            this.type = {
                PLAYING : 'PLAYING',
                STOPPED : 'STOPPED',
                PAUSED : 'PAUSED'
            };
            this._current = this.type.STOPPED;  //default
        };
        PlaybackState.prototype = {
            /**
             * @name current
             * @description gets current state (PLAYING, STOPPED, or PAUSED)
             *
             * @returns {string} state (PLAYING, STOPPED, or PAUSED)
             * @public
             * @methodOf PlaybackState
             */
            current : function () {
                return this._current;
            },
            /**
             * @name set
             *
             * @description sets current state + sets state in playable, if playable is passed.
             * @param state the state to set
             * @param playable optional {@link Playable} to update copy of state.
             *
             * @public
             * @methodOf PlaybackState
             */
            set : function (state, playable) {
                this._current = state;

                if (typeof (playable) === 'object' && playable.hasOwnProperty('state')) {
                    playable.state = this._current;
                }
            }
        };

        /**
         * @name PlaybackMechanism
         * @constructor
         *
         * @description holds an ordered-array of all possible playback mechanisms supported
         *
         * @property {Object} type all possible playback mechanism types (currently FLASH and HTML5)
         * @property {Array.<Object>} solutions array of playback mechanisms, ordered by priority to use as a solution.  Currently FLASH is the primary playback mechanism.  If the primary solution is deemed unacceptable for given platform, that first solution is removed and the next solution becomes first and primary.
         */
        var PlaybackMechanism = function () {
            this.type = {
                FLASH : 'FLASH',
                HTML5 : 'HTML5'
            };
            this.solutions = [ this.type.FLASH, this.type.HTML5 ];  //defaults
        };
        PlaybackMechanism.prototype = {
            /**
             * @name getCurrentSolution
             * @description returns current primary playback mechanism
             *
             * @public
             * @returns {string|null} returns null of no playback mechanisms exist
             * @methodOf PlaybackMechanism
             */
            getCurrentSolution : function () {
                if (this.solutions.length > 0) {
                    return this.solutions[0];
                }
                return null;
            },
            /**
             * @name removeCurrentSolution
             * @description removes current primary playback solution
             *
             * @public
             * @returns {boolean} success returns true for successful removal, false if nothing left to remove (no more solutions exist)
             * @methodOf PlaybackMechanism
             */
            removeCurrentSolution : function () {
                if (this.solutions.length > 0) {
                    this.solutions.shift();
                    return true;
                }
                Debug.log('PlaybackMechanism.removeCurrentSolution() no playback solutions remain to remove!', Debug.type.error);
                return false;
            },
            /**
             * @name setSolutions
             * @description sets an array of playback solutions
             *
             * @public
             * @returns {boolean} success
             * @methodOf PlaybackMechanism
             */
            setSolutions : function (args) {
                if (args instanceof Array) {
                    var valid_mechanisms = [];
                    var mechanism;
                    while (args.length > 0) {
                        mechanism = args.shift();
                        if (this.isValid(mechanism)) {
                            valid_mechanisms.push(mechanism);
                        } else {
                            Debug.log('PlaybackMechanism.setSolutions() passed mechanism \'' + mechanism + '\' is invalid.', Debug.type.error);
                        }
                    }
                    this.solutions = valid_mechanisms;
                    return true;
                }

                Debug.log('PlaybackMechanism.setSolutions() argument passed is not an array!', Debug.type.error);
                return false;
            },
            /**
             * @name isValid
             * @description returns whether passed mechanism is a valid PlaybackMechanism
             * @param {string} mechanism the playback mechanism to validate
             *
             * @public
             * @returns {boolean}
             * @methodOf PlaybackMechanism
             */
            isValid : function (mechanism) {
                var key;
                for (key in this.type) {
                    if (this.type[key] === mechanism) {
                        return true;
                    }
                }
                return false;
            }
        };


        /**
         * @name CustomSchemes
         * @constructor
         *
         * @description allows the developer to create shortcuts or custom schemes for common patterns or common {@link Playable} objects in-use;
         * NOTE: The main thing to understand about CustomSchemes is that any value set in the scheme_map definition will override anything passed
         * in on {@link Playable} creation, if the identifier of the Playable happens to qualify as a registered CustomScheme.
         */
        var CustomSchemes = function () {
            this.schemes = [];
            this.scheme_map = {};
            this.playable_attrs = [];
        };
        CustomSchemes.prototype = {
            /**
             * @name init
             * @description initializes the map of custom schemes -- when a new {@link Playable} object is created, a look-up of the identifier on the CustomSchemes object will happen to determine if the Playable matches one of the CustomSchemes.  If so, all attributes defined in the scheme_map will override the {@link Playable}
             * @param {Object} scheme_map object literal holding configuration, map of schemes-- each scheme can hold any number attributes that exist in {@link Playable} .. PLUS, the two below:
             * @param {Object} scheme_map.flash_file_prefix prefix to be pre-pended to flash filepath when the {@link Playable} is instantiated.
             * @param {Object} scheme_map.http_file_prefix prefix to be pre-pended to http filepath when the {@link Playable} is instantiated.
             *
             * @example
             * var scheme_map = {
             *    apm-audio : {
             *      flash_server_url  : 'rtmp://flash.server.org/music',
             *      flash_file_prefix : 'mp3:flashprefix',
             *      http_file_prefix  : 'http://download.org',
             *      buffer_time : 3,
             *      type : 'audio'
             *    },
             *    live_audio : {
             *          mpr_news : {
             *              flash_server_url : 'rtmp://flash.server.org/news',
             *              flash_file_path : 'news.stream',
             *              http_file_path : 'http://newsstream1.publicradio.org:80/',
             *              buffer_time : 6,
             *              type : 'live_audio'
             *          },
             *          mpr_current : {
             *              flash_server_url : 'rtmp://flash.server.org/kcmp',
             *              flash_file_path : 'kcmp.stream',
             *              http_file_path : 'http://currentstream1.publicradio.org:80/',
             *              buffer_time : 6,
             *              type : 'live_audio'
             *          }
             *     }
             * };
             * custom_schemes.init(scheme_map);
             *
             * ** in this example above,
             * ** a Playable w/ identifer 'apm-audio:/marketplace/2012/04/18/morning_report.mp3'
             * ** would translate to:
             *
             * var playable = {
             *      identifier : 'apm-audio:/marketplace/2012/04/18/morning_report.mp3',
             *      flash_server_url  : 'rtmp://flash.server.org/music',
             *      flash_file_path : 'mp3:flashprefix/marketplace/2012/04/18/morning_report.mp3',
             *      http_file_path  : 'http://download.org/marketplace/2012/04/18/morning_report.mp3',
             *      buffer_time : 3,
             *      type : 'audio',
             *      // + all other attributes in a Playable, with defaults
             * };
             *
             * while a Playable w/ identifer 'live_audio:/mpr_current' would translate to:
             * var playable = {
             *      identifier : 'live_audio:/mpr_current',
             *      flash_server_url : 'rtmp://flash.server.org/kcmp',
             *      flash_file_path : 'kcmp.stream',
             *      http_file_path : 'http://currentstream1.publicradio.org:80/',
             *      buffer_time : 6,
             *      type : 'live_audio',
             *      // + all other attributes in a Playable, with defaults
             * };
             * @public
             * @methodOf CustomSchemes
             */
            init : function (scheme_map) {
                this.scheme_map = scheme_map;
                this.initSchemeTypes();
                this.initPlayableAttrs();
            },
            initSchemeTypes : function () {
                this.schemes = [];
                for (var type in this.scheme_map) {
                    this.schemes.push(type);
                }
            },
            initPlayableAttrs : function () {
                this.playable_attrs = [];
                var playable = new Playable({});
                for(var propertyName in playable) {
                    if(typeof playable[propertyName] !== 'function') {
                        this.playable_attrs.push(propertyName);
                    }
                }
            },
            hasSchemes : function () {
                if (this.schemes.length > 0) {
                    return true;
                }
                return false;
            },
            isValid : function (scheme) {
                if (this.schemes.indexOf(scheme) !== -1) {
                    return true;
                }
                return false;
            },
            isScheme : function (identifier, scheme) {
                var result = this.parse(identifier);
                if (result !== null && result.scheme === scheme) {
                    return true;
                }
                return false;
            },
            parse : function (identifier) {
                var pattern = '^(' + this.schemes.join('|') + '){1}(:/){1}([/\\w.-]+$)';
                var regex =  new RegExp(pattern);
                var result = identifier.match(regex);

                if (result !== null && result.length === 4) {
                    return {
                        scheme : result[1],
                        path  : result[3]
                    };
                }
                return null;
            },
            getValues : function (identifier) {
                var values = {};

                var result = this.parse(identifier);
                if (result !== null && this.isValid(result.scheme)) {
                    var type_map = this.scheme_map[result.scheme];

                    //check for aliases (next level down)
                    if (type_map.hasOwnProperty(result.path)) {
                        type_map = type_map[result.path];
                    }

                    for (var prop in type_map) {
                        if (this.playable_attrs.indexOf(prop) !== -1) {
                            values[prop] = type_map[prop];
                        } else if (prop === 'flash_file_prefix') {
                            values.flash_file_path = type_map[prop] + '/' + result.path;
                        } else if (prop === 'http_file_prefix') {
                            values.http_file_path = type_map[prop] + '/' + result.path;
                        }
                    }
                }
                return values;
            }
        };
        var custom_schemes = new CustomSchemes();


        /**
         * @name Playable
         * @class
         *
         * @description holds all specific information about each media item to be played in APMPlayer -- To play audio/video in APMPlayer, the creation of a valid Playable is first required.
         * to create a playable, see {@link APMPlayerFactory.getPlayable}.  Also holds complete metadata for a single playable.
         * @param {Object} params object literal used to create a Playable object -- each of the passed object's attributes needs to match a particular item in Field Detail to be included w/ the Playable.
         * note that the indentifier is the only required field for APM-specific audio.. However for basic playables (non-APM), type is also required.
         * @property {string} identifier [REQUIRED] the ID for the playable (must be unique when creating a playlist).  Note that this is really the only required field when creating an APM-specific Playable.
         * @property {string} type [REQUIRED] either 'audio' or 'live_audio' -- Note that this is typically set automatically when using a {@link CustomScheme}
         * @property {string} flash_server_url server url to connect to to stream flash (eg  rtmp://archivemedia.publicradio.org/)
         * @property {string} flash_file_path file to play over flash_server_url (eg  'mp3:filename_64.mp3')
         * @property {string} http_file_path used for HTML5 audio playback (eg  http://ondemand.publicradio.org/filename.mp3) -OR- progressive download pseudo HTML5 playback via flash.
         * @property {string} title optional metadata field.
         * @property {string} description optional metadata field.
         * @property {string} detail optional metadata field.
         * @property {string} program optional metadata field.
         * @property {string} host optional metadata field.
         * @property {string} date optional metadata field.
         * @property {string} image_sm image associated w/ playable (eg used to display in info window when playable plays) -- a small and large were necessary to deal w/ re-sizing issues in IE 7,8
         * @property {string} image_lg image associated w/ playable (eg used to display in info window when playable plays)
         * @property {boolean} downloadable (default true) flag to permit the file to be downloaded.  Shows download option and/or presents the file for download if no suitable {@link PlaybackMechanism} is present.
         * @property {number} buffer_time amount of time (in seconds) the player should buffer -- default = 3.
         * @property {number} duration the length, in miliseconds of this Playable
         * @property {number} position the current position, in miliseconds for the Playable
         * @property {number} percent_played percentage of the playable that's been played (position/duration)
         * @property {number} percent_loaded percentage of the playable that's been loaded (percent of total duration)
         * @property {number} start_time the timestamp in milliseconds at which playback will start. This doesn't work on mobile.
         * @property {number} end_time the timestamp in milliseconds at which playback will end.
         *
         */
        var Playable = function (params) {
            var playable_self = this;

            this.identifier = null;
            this.type = null;

            //playback config
            this.flash_file_path = '';
            this.flash_server_url = '';
            this.http_file_path = '';
            this.buffer_time = 3;
            this.downloadable = true;

            //metadata
            this.title = '';
            this.description = '';
            this.detail = '';
            this.date = '';
            this.program = '';
            this.host = '';
            this.url = '';

            //images
            this.image_sm = '';
            this.image_lg = '';

            //playback statii
            this.duration = 0;
            this.position = 0;
            this.percent_played = 0;
            this.percent_loaded = 0;

            // playback duration
            this.start_time = null;
            this.end_time = null;

            // Segments within the playable audio.
            this.segments = [];

            //state
            this.state = 'STOPPED';   //provided as courtesy to webTrends tracking.

            //identifier is required.
            //return empty object if not passed
            if (typeof params.identifier === 'undefined' || params.identifier === null || params.identifier === '') {
                return playable_self;
            }

            (function () {  //set members

                //first, set any values passed in via the playable.
                playable_self.setMembers(params);

                //second, set everything that exists in custom scheme.
                //note that customScheme trumps all default data and strictly uses each scheme.
                if (custom_schemes.hasSchemes()) {
                    var configParams = custom_schemes.getValues(playable_self.identifier);
                    playable_self.setMembers(configParams);
                }

                // Set position to start time on initial load. Subsequently, playable.reset() will set this.
                if (playable_self.start_time) {
                    playable_self.position = playable_self.start_time;
                } else {
                    playable_self.position = 0;
                }

            }());

            return this;
        };
        Playable.prototype = {
            /**
             * @name isValid
             *
             * @description a Playable isValid if it has an identifier and its type matches one of the valid MediaTypes (either 'audio' or 'live_audio')
             * @example playable.isValid()
             * @returns {boolean} true or false
             * @methodOf Playable
             */
            isValid : function () {
                if (this.identifier !== null && this.type !== null && MediaTypes.isValid(this.type)) {
                    return true;
                }
                return false;
            },
            /**
             * @name isCustomScheme
             *
             * @description a Playable isCustomScheme if it has an identifier that matches one of the custom schemes defined
             * @example playable.isCustomScheme('scheme_name')
             * @returns {boolean} true or false
             * @methodOf Playable
             */
            isCustomScheme : function (scheme) {
                if (custom_schemes.isScheme(this.identifier, scheme) === true) {
                    return true;
                }
                return false;
            },
            /**
             * @name isEOF
             *
             * @description a Playable is at the end of the file, return true.
             * @example playable.isEOF()
             * @returns {boolean} true or false
             * @methodOf Playable
             */
            isEOF : function () {
                if (this.percent_played > 0.99995) {
                    return true;
                }
                return false;
            },
            /**
             * @name reset
             *
             * @description resets playable's position, percent_played, and percent_loaded back to 0
             * @example playable.reset()
             * @methodOf Playable
             */
            reset : function () {
                if (this.start_time) {
                    this.position = this.start_time;
                } else {
                    this.position = 0;
                }
                this.percent_played = 0;
                this.percent_loaded = 0;
            },
            /**
             * @name setEmptyMembers
             *
             * @description finds and sets any provided members that are either '', 0, or null -- nothing will be set if passed params are empty or null
             * @example playable.setEmptyMembers({object})
             * @methodOf Playable
             */
            setEmptyMembers : function (params) {
                var prop;
                for (prop in params) {
                    if (params.hasOwnProperty(prop) && this.hasOwnProperty(prop) && params[prop] !== null && params[prop] !== '' && (this[prop] === null || this[prop] === '' || this[prop] === 0)) {
                        this[prop] = params[prop];
                    }
                }
            },
            /**
             * @name setMembers
             *
             * @description finds and sets any valid key, value pair-- will override anything that currently exists in that field.
             * @example playable.setMembers({object})
             * @methodOf Playable
             */
            setMembers : function (params) {
                for (var prop in params) {
                    if (prop === 'segments') {
                        // Handle segments as a special case.
                        for (var segment in params[prop]) {
                            this[prop].push(new PlayableSegment(params[prop][segment]));
                        }
                    } else if (params.hasOwnProperty(prop) && this.hasOwnProperty(prop)) {
                        this[prop] = params[prop];
                    }
                }
            },
            /**
             * @name clearFlashProperties
             *
             * @description removes the flash_server_url + flash_file_path
             * so that only the progressive http mechanism is possible.
             * @example playable.clearFlashProperties()
             * @methodOf Playable
             */
            clearFlashProperties : function () {
                this.flash_server_url = '';
                this.flash_file_path = '';
            },
            /**
             * @name isFlashStreamable
             *
             * @description returns whether or not flash_server_url + flash_file_path is avail.  used to allow/disallow seeking before item loads.
             * @returns {boolean} true or false
             * @example playable.isFlashStreamable()
             * @methodOf Playable
             */
            isFlashStreamable : function () {
                if (this.flash_server_url !== '' && this.flash_file_path !== '') {
                    return true;
                }
                return false;
            }
        };

        /**
         * @name UnderwritingPlayable
         * @description contains all basic attributes for an underwriting campaign.  Extends {@link Playable}
         *
         * @augments Playable
         * @param {Object} params an object containing attributes matching those in the Field Summary.
         * @property {string} click_url OAS-type thing.  may not be necessary
         * @property {boolean} has_played basic indicator used to show if played or not.
         * @property {boolean} is_underwriting indicates playable type UnderwritingPlayable (needed because minification removes types)
         *
         * @class
         */
        var UnderwritingPlayable = function (params) {
            this.click_url = null;
            this.has_played = false;
            this.is_underwriting = true;

            Playable.apply(this, arguments);
        };
        UnderwritingPlayable.prototype = Playable.prototype;


        /**
         * @name PlayableSegment
         * @description segments within a {@link Playable}. Used to click around in audio.
         *
         * @param {Object} params an object containing attributes matching those in the Field Summary.
         * @property {integer} start_time The beginning of this segment in milliseconds.
         * @property {string} title The title of this segment.
         * @property {string} html_class A html_class to differentiate segments in the front-end.
         * @property {boolean} active Whether this segment is presently playing. (dynamically set)
         *
         * @class
         */
        var PlayableSegment = function (params) {
            var segment_self = this;

            // Metadata
            this.start_time = 0;
            this.title = '';
            this.html_class = '';

            // Dynamic Properties
            this.active = false;

            (function () {  //set members

                //first, set any values passed in via the playable.
                segment_self.setMembers(params);

            }());

            return this;
        };
        PlayableSegment.prototype = {
            /**
             * @name setMembers
             *
             * @description finds and sets any valid key, value pair-- will override anything that currently exists in that field.
             * @example playable.setMembers({object})
             * @methodOf Playable
             */
            setMembers : function (params) {
                for (var prop in params) {
                    if (params.hasOwnProperty(prop) && this.hasOwnProperty(prop)) {
                        this[prop] = params[prop];
                    }
                }
            }
        };


        /**
         * @name APMPlayer
         * @description main container for Audio/Video playback.
         * @class
         */
        var APMPlayer = function () {
            var player = this;

            // This should be next.version-dev. Remove -dev when releasing.
            this.apmplayer_version = '1.4.0';

            var Audio = function () {
                this.lib = soundManager;
                this.init_status = false;
            };
            Audio.prototype = {
                init : function (settings) {
                    if (player.audio.init_status === false) {

                        // Set player defaults.
                        settings = jQuery.extend({
                            preferFlash : true, // Whether to prefer flash over html5.
                            swf : false // The path to the flash objects. Will try to guess when false.
                        }, settings);

                        // Detect Safari 7 and use HTML5 to work around the Safari Power Saver feature.
                        var isSafariPS = (/[7.\d|6.1](.\d+)? Safari/).test(navigator.userAgent) && (/Apple Computer/).test(navigator.vendor);
                        /*
                         * Check if we are passing in a relative or absolute url for the swf and if so is it on another domain
                         */
                        var isCrossDomain = function () {
                            var bool = false;
                            var swfDomain;
                            var re = /https?:\/\/[^\s\/]+/;
                            // if no settings.swf is passed in check if apmplayer.js is on the same domain as the browser
                            // Assumption:  apmplayer js will be on the same domain as the swf file
                            if(settings.swf === false) {
                                var playerFileNames = ['apmplayer.js', 'apmplayer-all.min.js'];
                                var swfHttp;
                                for(var i in playerFileNames) {
                                    swfHttp = player.util.getLoadedScriptPathByFileName(playerFileNames[i]);
                                    if(swfHttp) {
                                        swfDomain = swfHttp.match(re);
                                    }
                                }
                            }
                            else {  // check if swf path is an absolute or relative url, and if it's absolute see if it's crossdomain.
                                swfDomain =  settings.swf.match(re);
                            }
                            if(swfDomain !== null) {
                                // if browser location domain is not the same as swfDomain, isCrossDomain should be true.
                                bool = (swfDomain[0] === window.location.origin) ? false : true;
                             }
                            return bool;
                        };
                        //soundManager2 settings
                        this.lib.flashVersion = 9;
                        if (isSafariPS && settings.preferFlash && isCrossDomain()) {
                            this.lib.preferFlash = false;
                            Debug.log('Audio.init() -- setting to HTML5-only due to Safari 6.1 or 7.x Power Manager settings.', Debug.type.info);
                        } else {
                            this.lib.preferFlash = settings.preferFlash;
                            if (settings.preferFlash) {
                                Debug.log('Audio.init() -- Preferring Flash.', Debug.type.info);
                            } else {
                                Debug.log('Audio.init() -- Preferring HTML5.', Debug.type.info);
                            }
                        }

                        this.lib.useHTML5Audio = true;
                        this.lib.consoleOnly = Debug.consoleOnly;
                        this.lib.debugMode = Debug.enabled;
                        this.lib.flashPollingInterval = 150;  //helps improve seeker ui experience

                        if (settings.swf !== false) {
                            this.lib.url = settings.swf;
                            Debug.log('Audio.init() -- Soundmanager script path manually set: ' + settings.swf, Debug.type.info);
                        } else {
                            this.lib.url = player.util.getLoadedScriptPathByFileName('soundmanager2') + 'swf/';  // used to dynamically determine lib location for flash lib dependency
                            if (this.lib.url === undefined) {
                                Debug.log('Audio.init() -- Soundmanager script path isn\'t found. You are probably concatenating SM2 without defining the swf location.', Debug.type.error);
                            }
                        }

                        this.lib.onready(function () {
                            if (player.audio.lib.html5Only === true) {  //SM2 will know onready() if HTML5 is the only option avail.
                                player.mechanism.setSolutions([ player.mechanism.type.HTML5 ]);
                                Debug.log('Audio.init() -- setting to HTML5-only', Debug.type.info);
                            }

                            Debug.log('Audio.init() success', Debug.type.info);
                            player.audio.init_status = true;
                            player.internal_events.trigger(player.events.type.AUDIO_LIB_READY, {});
                        });
                        this.lib.ontimeout(function (status) {           //(note: ontimeout typically only happens w/ flash-block, or flash not installed)
                            if(!player.audio.lib.canPlayMIME('audio/mp3') && !player.audio.lib.canPlayMIME('audio/mpeg')) {
                                player.mechanism.setSolutions([]);       //no possible playback solutions if no support for mp3 in HTML5 (eg Firefox).
                            } else {
                                player.mechanism.setSolutions([ player.mechanism.type.HTML5 ]);
                            }
                            player.audio.reset();
                        });
                    } else {
                        player.audio.reset();
                        Debug.log('Audio.init() -- audio lib has already been initialized once, attempting reset', Debug.type.info);
                    }
                },
                reset : function () {
                    player.audio.init_status = false;

                    var current_solution = player.mechanism.getCurrentSolution();
                    switch (current_solution) {
                    case player.mechanism.type.FLASH:
                        player.audio.lib.preferFlash = true;
                        player.audio.lib.html5Only = false;
                        break;
                    case player.mechanism.type.HTML5:
                        player.audio.lib.preferFlash = false;
                        player.audio.lib.html5Only = true;
                        break;
                    default:
                        Debug.log('Audio.reset() no playback solution exists.', Debug.type.error);
                        player.events.trigger(player.events.type.PLAYER_FAILURE, null);
                        return false;
                    }

                    player.audio.lib.reboot();

                    return true;
                },
                load : function (playable) {
                    if (this.init_status === true) {
                        try {
                            var sound;
                            switch (player.mechanism.getCurrentSolution()) {
                            case player.mechanism.type.FLASH:

                                //1. create basic http-based sound first (http path, no serverURL)
                                sound = {
                                    id: playable.identifier,
                                    url: playable.http_file_path,
                                    bufferTime: playable.buffer_time,
                                    onconnect: function () {
                                        Debug.log('Audio.load.lib.createSound.onConnect() - successfully connected over RTMP (' + playable.flash_server_url + ')', Debug.type.info);
                                        player.internal_events.trigger(player.events.type.MEDIA_READY, playable);
                                    },
                                    onfailure : function (sound) {
                                        var playable = player.current_playable;
                                        if (playable.position > 0) {
                                            Debug.log('Audio.load.createSound.onfailure() -- network connection has been lost', Debug.type.info);
                                            player.state.set(player.state.type.STOPPED, playable);
                                            player.events.trigger(player.events.type.CONNECTION_LOST, playable);
                                        } else if (sound.connected === true) {
                                            Debug.log('Audio.load.createSound.onfailure() - requested file \'' + playable.flash_file_path + '\' w/ identifier \'' + playable.identifier + '\' could not be found in flash/RTMP mode.', Debug.type.error);
                                            player.state.set(player.state.type.STOPPED, playable);
                                            player.events.trigger(player.events.type.MISSING_FILE, playable);
                                            player.events.trigger(player.events.type.FINISHED, playable);
                                        } else {
                                            //in this case, there was an issue connecting to our flash wowza server. as a back-up, falls-back to using HTML5-mode
                                            Debug.log('Audio.load.createSound.onfailure() - could not connect to \'' + playable.flash_server_url + '\' ... falling back to HTML5-mode.', Debug.type.error);
                                            player.state.set(player.state.type.STOPPED, playable);
                                            player.mechanism.removeCurrentSolution();
                                            player.audio.reset();
                                        }
                                    },
                                    onload : function(success) {
                                        if (success === false) {   //progressive download file failed to be loaded..
                                            var playable = player.current_playable;
                                            player.events.trigger(player.events.type.MISSING_FILE, playable);
                                            Debug.log('Audio.load.createSound.onload() - could not load \'' + playable.http_file_path + '\' over progressive download', Debug.type.error);
                                        }
                                    }
                                };

                                //2. if flash server + file is present, stream it from flash server by
                                //overriding these settings before sound invocation
                                if (playable.flash_file_path !== null && playable.flash_file_path !== '' && playable.flash_server_url !== null && playable.flash_server_url !== '') {
                                    sound.serverURL = playable.flash_server_url;
                                    sound.url = playable.flash_file_path;
                                }

                                this.lib.createSound(sound);
                                break;

                            case player.mechanism.type.HTML5:

                                //1. html5: much simpler
                                sound = this.lib.createSound({
                                    id: playable.identifier,
                                    url: playable.http_file_path,
                                    onload : function (success) {
                                        var playable = player.current_playable;

                                        if (!success) {
                                            player.state.set(player.state.type.STOPPED, playable);
                                            player.events.trigger(player.events.type.MISSING_FILE, playable);
                                            player.events.trigger(player.events.type.FINISHED, playable);
                                            Debug.log('Audio.load.createSound.onload():  requested file \'' + playable.http_file_path + '\' w/ identifier \'' + playable.identifier + '\' could not be found in HTML5 mode.', Debug.type.error);
                                        } else {
                                            if (this.duration) {
                                                playable.duration = this.duration;
                                                Debug.log('Audio.load.createSound.onload(): duration found after start', Debug.type.info);
                                            } else {
                                                Debug.log('Audio.load.createSound.onload(): duration unknown', Debug.type.info);
                                            }
                                        }
                                    }
                                });

                                player.internal_events.trigger(player.events.type.MEDIA_READY, playable);
                                break;

                            default:
                                Debug.log('Audio.load() no playback solution exists.', Debug.type.error);
                                player.events.trigger(player.events.type.PLAYER_FAILURE, playable);
                                break;
                            }

                        } catch (e) {
                            Debug.log('Exception thrown in APMPlayer.Audio.load : ' + e.toString(), Debug.type.error);
                        }
                    } else {
                        if(player.mechanism.getCurrentSolution() === null) {
                            player.events.trigger(player.events.type.PLAYER_FAILURE, playable);
                        } else {
                            Debug.log('Audio.lib.load - audio lib not initialized.  load() will be called again when player is finally initialized.', Debug.type.info);
                        }
                    }
                },
                unload : function (playable) {
                    if (player.current_playable !== null) {
                        Debug.log('Audio.unload() about to stop, drop and roll current sound.', Debug.type.info);
                        this.lib.destroySound(playable.identifier);
                        playable.reset();
                        player.state.set(player.state.type.STOPPED, playable);
                        player.events.trigger(player.events.type.UNLOADED, playable);
                    }
                },
                play : function (playable) {
                    if (!this.lib.getSoundById(playable.identifier)) {
                        this.load(playable);
                    } else {
                        Debug.log('Audio.play() attempting to play from lib.', Debug.type.info);

                        this.lib.play(playable.identifier, {
                            volume : (player.settings.volume * 100),
                            position : playable.position,
                            onplay : function () {
                                player.state.set(player.state.type.PLAYING, playable);
                                player.events.trigger(player.events.type.PLAYING, playable);
                                player.events.trigger(player.events.type.METADATA, playable);
                                if (player.settings.muted) {
                                    this.mute();
                                }
                                Debug.log('Audio.play.onplay() PLAYING fired', Debug.type.info);

                                // Set up watcher for end time.
                                if (playable.end_time && playable.end_time < playable.duration) {
                                    this.onPosition(playable.end_time, function (eventPosition) {
                                        player.audio.pause(playable);
                                        player.current_playable.reset();
                                        player.state.set(player.state.type.STOPPED, playable);
                                        player.events.trigger(player.events.type.FINISHED, playable);
                                        Debug.log('Audio reached end point, stopped.', Debug.type.info);
                                    });

                                    Debug.log('Audio.play.onplay() Set up watcher for end time of ' + playable.end_time, Debug.type.info);
                                }
                            },
                            onpause: function () {
                                player.state.set(player.state.type.PAUSED, playable);
                                player.events.trigger(player.events.type.PAUSED, playable);
                                Debug.log('Audio.play.onpause() PAUSED fired', Debug.type.info);
                            },
                            onresume : function () {
                                player.state.set(player.state.type.PLAYING, playable);
                                player.events.trigger(player.events.type.PLAYING, playable);
                                Debug.log('Audio.play.onresume() PLAYING fired', Debug.type.info);
                            },
                            onfinish : function () {
                                player.current_playable.reset();
                                player.state.set(player.state.type.STOPPED, playable);
                                player.events.trigger(player.events.type.FINISHED, playable);
                                Debug.log('Audio.play.onfinish() FINISHED fired; playable reset.', Debug.type.info);
                            },
                            onbufferchange : function () {
                                if (this.isBuffering === true) {
                                    player.events.trigger(player.events.type.BUFFER_START, playable);
                                    Debug.log('Audio.play.onbufferchange() BUFFER_START fired ', Debug.type.info);
                                } else {
                                    player.events.trigger(player.events.type.BUFFER_END, playable);
                                    Debug.log('Audio.play.onbufferchange() BUFFER_END fired ', Debug.type.info);
                                }
                            },
                            whileplaying : function () {

                                var playable = player.current_playable;

                                // Work around HTML5 issue where soundmanager doesn't set position passed as property.
                                // Checking range to avoid issues where it is rounded to within a second.
                                // if (Math.ceil(this.position)+1 < Math.ceil(playable.position)) {
                                //     Debug.log('Audio.play.whileplaying() Overriding position with playable position. Position: ' + Math.ceil(this.position) + ', playable.position: ' + Math.ceil(playable.position), Debug.type.info);
                                //     this.setPosition(playable.position);
                                // }

                                if (playable.type === MediaTypes.type.LIVE_AUDIO) {
                                    playable.percent_played = 1;
                                    playable.duration = 0;
                                    playable.position = this.position;

                                    player.events.trigger(player.events.type.POSITION_UPDATE, playable);

                                } else {  //STATIC AUDIO
                                    if (this.position !== 0) {      //SM2 returns position 0 once after restarting a piece in middle, skip this if/when it happens.
                                        playable.position = this.position;
                                    }

                                    if (this.duration !== 0 && this.duration > playable.duration) {  //helps w/ HTTP progressive download and duration display.
                                        playable.duration = this.duration;
                                    }

                                    if (this.duration !== 0 && this.duration == this.durationEstimate) { // Fix edge case on Android Mobile Chrome where the initial duration is 100000.
                                        playable.duration = this.duration;
                                    }

                                    if (this.durationEstimate > this.duration) {
                                        //loading over HTTP progressive download, add percent loaded.
                                        playable.percent_loaded = this.duration / this.durationEstimate;
                                    } else if (playable.percent_loaded > 0 && playable.percent_loaded < 1) {
                                        playable.percent_loaded = 1;
                                    }

                                    if (playable.duration > 0) {
                                        playable.percent_played = playable.position / playable.duration;
                                    }

                                    //SM2 'work-around'-- the onfinish() event does not always fire if scrubbing to end.
                                    //this catches that scenario
                                    if (playable.isEOF()) {
                                        playable.percent_played = 1;
                                        playable.position = playable.duration;
                                        //player.events.trigger(player.events.type.FINISHED, playable);  5/21/12 -- aml removed this due to double-advances in iOS.
                                                                                                       //onfinish() now appears to fire normally in all cases.
                                        //Debug.log('Audio.play.whileplaying() FINISHED fired. ' + playable.title, Debug.type.info);
                                    } else {
                                        //Debug.log('Audio.play.whileplaying() POSITION_UPDATE fired. ' + playable.percent_loaded + '% ' + playable.percent_played, Debug.type.info);
                                        player.events.trigger(player.events.type.POSITION_UPDATE, playable);
                                    }

                                    // Set active segment.
                                    for (var i = playable.segments.length - 1; i >= 0; i--) {
                                        // Assuming that this is ordered by timestamp in ascending order.
                                        if (playable.segments[i].start_time <= this.position) {

                                            // If this isn't already active, set to active and change all other segments to false.
                                            if (playable.segments[i].active !== true) {
                                                for (var n in playable.segments) {
                                                    playable.segments[n].active = false;
                                                }

                                                playable.segments[i].active = true;

                                                player.events.trigger(player.events.type.SEGMENT_CHANGED, playable, playable.segments[i]);
                                                Debug.log('whileplaying() active segment changed.', Debug.type.info);
                                            }

                                            break;
                                        }
                                    }
                                }
                            },
                            onmetadata : function () {
                                if (this.hasOwnProperty('metadata')) {
                                    if (this.metadata.hasOwnProperty('adw_ad') && this.metadata.adw_ad === 'true' && this.metadata.hasOwnProperty('metadata') && this.metadata.metadata.indexOf("adswizzContext") !== -1) {
                                        // AdsWizz ad

                                        Debug.log('onmetadata() received adw_ad of insertionType: \'' + this.metadata.insertionType + '\'', Debug.type.info);

                                        playable.title = 'adw_ad_' + this.metadata.insertionType;
                                        playable.adw_context = this.metadata.metadata.substr(15);  //hack via AdsWizz. need to request a better solution
                                        player.events.trigger(player.events.type.METADATA, playable);
                                    }
                                    else if (this.metadata.hasOwnProperty('StreamTitle') && typeof this.metadata.StreamTitle !== 'undefined') { // APM-specific
                                        Debug.log('onmetadata() received metadata w/ title: \'' + this.metadata.StreamTitle + '\'', Debug.type.info);
                                        playable.title = this.metadata.StreamTitle;
                                        player.events.trigger(player.events.type.METADATA, playable);
                                    }
                                }
                            }
                        });
                    }
                },

                pause : function (playable) {
                    var sound = this.lib.getSoundById(playable.identifier);
                    if (sound) {
                        sound.pause();
                        return true;
                    }
                    Debug.log('Audio.pause() Error.  Could not pause.  \'' + playable.identifier + '\' is unknown.', Debug.type.warn);
                    return false;
                },

                unpause : function (playable) {
                    var sound = this.lib.getSoundById(playable.identifier);
                    if (sound && sound.paused === true) {
                        sound.resume();
                        return true;
                    }
                    Debug.log('Audio.unpause() Error.  Could not unpause.  \'' + playable.identifier + '\' is unknown.', Debug.type.warn);
                    return false;
                },

                setPosition : function (playable, milliseconds) {
                    var sound = this.lib.getSoundById(playable.identifier);
                    if (sound) {
                        Debug.log('Audio.setPosition() setting to \'' + milliseconds + '\' milliseconds in sound \'' + playable.identifier + '\'', Debug.type.info);
                        sound.setPosition(milliseconds);

                        // If position is greater than the end_time, remove the onPosition callback.
                        if (playable.end_time <= milliseconds) {
                            sound.clearOnPosition(playable.end_time);
                            Debug.log('Audio.setPosition() end_time callback has been unset due to seeking past it.', Debug.type.info);
                        }

                        return true;
                    }

                    Debug.log('Audio.setPosition() sound \'' + playable.identifier + '\' is unknown.', Debug.type.warn);
                    return false;
                },

                seek : function (playable, percent_decimal) {
                    if (playable.duration) {
                        Debug.log('Audio.seek() seeking to \'' + percent_decimal + '\' of sound \'' + playable.identifier + '\'', Debug.type.info);
                        var msec = percent_decimal * playable.duration;
                        player.audio.setPosition(playable, msec);
                        return true;
                    } else {
                        Debug.log('Audio.seek() Error.  Could not seek. duration of \'' + playable.identifier + '\' is unknown.', Debug.type.warn);
                        return false;
                    }
                },

                mute : function (playable) {
                    var sound = this.lib.getSoundById(playable.identifier);
                    if (sound) {
                        sound.mute();
                    }
                },

                unmute : function (playable) {
                    var sound = this.lib.getSoundById(playable.identifier);
                    if (sound) {
                        sound.unmute();
                    }
                },

                setVolume :  function (playable, percent_decimal) {
                    var percent = percent_decimal * 100;
                    var sound = this.lib.getSoundById(playable.identifier);
                    if (sound) {
                        Debug.log('Audio.setVolume() setting volume to ' + percent + '% (out of 100)', Debug.type.info);
                        sound.setVolume(percent);
                    } else {
                        Debug.log('Audio.setVolume() sound is not loaded.  volume will be set to ' + percent + '% once audio begins playing', Debug.type.info);
                    }
                }

            }; //end Audio()

            //var Video = function () {};

            //default settings
            this.settings = {
                volume : 0.9,
                muted : false,
                debug : false
            };

            this.current_playable = null;       //only one single playable can be in use at a given time

            this.events = new Events();
            this.internal_events = new Events();
            this.mechanism = new PlaybackMechanism();
            this.state = new PlaybackState();
            this.audio = new Audio();
            this.internal_event_handlers = {
                checkReady : function () {
                    if (player.audio.init_status === true) {
                        Debug.log('checkReady() player ready.  all dependencies loaded.', Debug.type.info);
                        player.events.trigger(player.events.type.PLAYER_READY, {});
                    } else {
                        //will be useful when multiple dependencies are required on init
                        Debug.log('checkReady() not quite ready -- waiting for other dependencies to load...', Debug.type.info);
                    }
                },
                onMediaReady : function (playable) {
                    player.audio.play(playable);

                }
            };
            this.internal_events.addListener(player.events.type.AUDIO_LIB_READY, player.internal_event_handlers.checkReady);
            this.internal_events.addListener(player.events.type.MEDIA_READY, player.internal_event_handlers.onMediaReady);

            this.util = {
                getParameterByName : function (name) {
                    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
                    var regexS = "[\\?&]" + name + "=([^&#]*)";
                    var regex = new RegExp(regexS);
                    var results = regex.exec(window.location.href);

                    if (results === null) {
                        return "";
                    }

                    return decodeURIComponent(results[1].replace(/\+/g, " "));
                },
                getLoadedScriptPathByFileName : function (name) {
                    var scripts = document.getElementsByTagName("script");
                    var numScripts = scripts.length;
                    var index;
                    for (index = 0; index < numScripts; index += 1) {
                        var match = scripts[index].src.indexOf(name, 0);
                        if (match !== -1) {
                            return scripts[index].src.slice(0, match);
                        }
                    }
                    return false;
                },
                getProjectBasePath : function () {
                    var path = player.util.getLoadedScriptPathByFileName('script/apmplayer-all.min.js');
                    if (typeof path === 'undefined') {
                        path = player.util.getLoadedScriptPathByFileName('script/src/apmplayer.js');
                    }
                    return path;
                },
                mergeSettings : function (settings) {
                    var prop;
                    for (prop in settings) {
                        if (settings.hasOwnProperty(prop) && player.settings.hasOwnProperty(prop)) {
                            player.settings[prop] = settings[prop];
                        }
                    }
                },
                checkDebug : function () {
                    if (player.util.getParameterByName('debug')) {
                        Debug.enabled = true;
                    }

                    if (player.util.getParameterByName('debug') === 'all') {
                        Debug.consoleOnly = false;
                    }
                },
                getPreferredMode : function () {
                    if (player.util.getParameterByName('mode') === 'html5') {
                        Debug.log('player.util.getPreferredMode() Preferring HTML5.', Debug.type.info);
                        return 'html5';
                    } else if (player.util.getParameterByName('mode') === 'flash') {
                        Debug.log('player.util.getPreferredMode() Preferring Flash.', Debug.type.info);
                        return 'flash';
                    }
                    return false;
                },
                addIEFixes : function () {
                    if (!Array.prototype.indexOf) {
                        Array.prototype.indexOf = function(elt /*, from*/) {
                            var len = this.length >>> 0;

                            var from = Number(arguments[1]) || 0;
                            from = (from < 0) ? Math.ceil(from) : Math.floor(from);
                            if (from < 0)
                              from += len;

                            for (; from < len; from++) {
                              if (from in this &&
                                  this[from] === elt)
                                return from;
                            }
                            return -1;
                            };
                     }
                }
            };

            return {  //APMPlayer public methods
                /**
                 * @name init
                 * @description initializes APMPlayer library;  NOTE: init() must be called immediately after instantiation to ensure SoundManager2 init doesn't timeout
                 * @methodOf APMPlayer
                 */
                init : function (settings) {
                    if (!settings) {
                        settings = {};
                    }

                    player.util.addIEFixes();
                    player.util.checkDebug();
                    var mode = player.util.getPreferredMode();
                    if (mode) {
                        settings.preferFlash = (mode === 'flash') ? true : false;
                    }
                    player.audio.init(settings);
                },
                /**
                 * @name reset
                 * @description resets APMPlayer -- sets {@link PlaybackMechanism} solutions + resets Audio playback library
                 *
                 * @param {string[]} playback_solutions array of accepted playback mechanisms to use (ie FLASH, HTML5)
                 *
                 * @methodOf APMPlayer
                 */
                reset : function (playback_solutions) {
                    if (playback_solutions instanceof Array) {
                        player.mechanism.setSolutions(playback_solutions);
                    }
                    player.audio.reset();
                },
                /**
                 * @name play
                 * @description loads item (if not loaded), then plays it--  automatically unloads any previous {@link Playable} that was loaded/playing
                 * @fires Events.type.PLAYING will fire when audio successfully starts playing. (see {@link Events}).
                 * @methodOf APMPlayer
                 */
                play : function (playable, settings) {
                    if (playable instanceof Playable) {
                        if (playable === player.current_playable && player.state.current() !== player.state.type.PLAYING) {
                            switch (playable.type) {
                            case MediaTypes.type.AUDIO:
                            case MediaTypes.type.LIVE_AUDIO:
                                player.audio.play(playable);
                                break;
                            case MediaTypes.type.VIDEO:
                                break;
                            default:
                                Debug.log('play() unsupported type: \'' + playable.type + '\'', Debug.type.error);
                                break;
                            }
                        } else if (playable !== player.current_playable) {

                            //1. check if playback solutions exist.
                            if(player.mechanism.getCurrentSolution() === null) {
                                Debug.log('play()  insufficient playback mechanism for platform.  Triggered PLAYER_FAILURE', Debug.type.error);
                                player.events.trigger(player.events.type.PLAYER_FAILURE, playable);
                                return false;
                            }

                            //2. unload item if a current one exists.
                            if (player.current_playable !== null) {
                                player.audio.unload(player.current_playable);
                            }

                            player.util.mergeSettings(settings);
                            player.current_playable = playable;

                            switch (playable.type) {
                            case MediaTypes.type.AUDIO:
                            case MediaTypes.type.LIVE_AUDIO:
                                player.audio.load(playable);
                                break;
                            case MediaTypes.type.VIDEO:
                                break;
                            default:
                                Debug.log('load() unsupported type: \'' + playable.type + '\'', Debug.type.error);
                                break;
                            }
                        }

                        return true;
                    } else {
                        Debug.log('play() invalid playable passed. Must be of type Playable.', Debug.type.error);
                        return false;
                    }
                },
                /**
                 * @name pause
                 * @description if static audio, pauses currently loaded {@link Playable}; However, if type LIVE_AUDIO, the playable is automatically unloaded.
                 * @fires Events.type.PAUSED, or Events.type.UNLOADED will fire depending on type, on success. (see {@link Events}).
                 * @methodOf APMPlayer
                 */
                pause : function () {
                    var playable = player.current_playable;
                    if (playable !== null) {
                        switch (playable.type) {
                        case MediaTypes.type.AUDIO:
                            player.audio.pause(playable);
                            break;
                        case MediaTypes.type.LIVE_AUDIO:
                            player.audio.unload(playable);
                            break;
                        case MediaTypes.type.VIDEO:
                            break;
                        default:
                            Debug.log('pause() unsupported type: \'' + playable.type + '\'', Debug.type.error);
                            break;
                        }
                    } else {
                        Debug.log('pause() no current playable loaded.  nothing to pause.', Debug.type.warn);
                    }
                },
                /**
                 * @name unload
                 * @description stops, unloads, and destroys the current {@link Playable}
                 * @fires Events.type.UNLOADED will be fired if audio successfully unloads (see {@link Events}).
                 * @methodOf APMPlayer
                 */
                unload : function () {
                    var playable = player.current_playable;
                    if (playable !== null) {
                        switch (playable.type) {
                        case MediaTypes.type.AUDIO:
                        case MediaTypes.type.LIVE_AUDIO:
                            player.audio.unload(playable);
                            break;
                        case MediaTypes.type.VIDEO:
                            break;
                        default:
                            Debug.log('unload() unsupported type: \'' + playable.type + '\'', Debug.type.error);
                            break;
                        }
                    } else {
                        Debug.log('unload() no current playable loaded.  nothing to stop/unload.', Debug.type.info);
                    }
                },
                /**
                 * @name seek
                 * @description moves play head to current percentage of media {@link Playable}.
                 * @fires Events.type.POSITION_UPDATE will continue to fire after position is updated by seek() (see {@link Events}).
                 * @param {number} percent_decimal the point in the media file to seek to.  (eg, 0 is beginning / .50 is half-way / 1 is end)
                 * @methodOf APMPlayer
                 */
                seek : function (percent_decimal) {
                    var playable = player.current_playable;
                    if (playable !== null) {
                        switch (playable.type) {
                        case MediaTypes.type.AUDIO:
                            player.audio.seek(playable, percent_decimal);
                            break;
                        case MediaTypes.type.LIVE_AUDIO:
                            Debug.log('seek() sorry, this item is not seekable \'' + playable.identifier + '\', type: \'' + playable.type + '\'', Debug.type.info);
                            break;
                        case MediaTypes.type.VIDEO:
                            break;
                        default:
                            Debug.log('seek() unsupported type: \'' + playable.type + '\'', Debug.type.error);
                            break;
                        }
                    } else {
                        Debug.log('seek() no current playable loaded.  nothing to seek.', Debug.type.info);
                    }
                },
                /**
                 * @name setPosition
                 * @description moves play head to location in media {@link Playable}.
                 * @fires Events.type.POSITION_UPDATE will continue to fire after position is updated by setPosition() (see {@link Events}).
                 * @param {number} milliseconds the point in the media file to setPosition to (in milliseconds).
                 * @methodOf APMPlayer
                 */
                setPosition : function (milliseconds) {
                    var playable = player.current_playable;
                    if (playable !== null) {
                        switch (playable.type) {
                        case MediaTypes.type.AUDIO:
                            player.audio.setPosition(playable, milliseconds);
                            break;
                        case MediaTypes.type.LIVE_AUDIO:
                            Debug.log('setPosition() sorry, this item is not setPositionable \'' + playable.identifier + '\', type: \'' + playable.type + '\'', Debug.type.info);
                            break;
                        case MediaTypes.type.VIDEO:
                            break;
                        default:
                            Debug.log('setPosition() unsupported type: \'' + playable.type + '\'', Debug.type.error);
                            break;
                        }
                    } else {
                        Debug.log('setPosition() no current playable loaded.  nothing to setPosition.', Debug.type.info);
                    }
                },
                /**
                 * @name mute
                 * @description mutes sound; returns nothing, triggers nothing.
                 * @methodOf APMPlayer
                 */
                mute : function () {
                    player.settings.muted = true;

                    var playable = player.current_playable;
                    if (playable !== null) {
                        switch (playable.type) {
                        case MediaTypes.type.AUDIO:
                        case MediaTypes.type.LIVE_AUDIO:
                            player.audio.mute(playable);
                            break;
                        case MediaTypes.type.VIDEO:
                            break;
                        default:
                            Debug.log('mute() unsupported type: \'' + playable.type + '\'', Debug.type.error);
                            break;
                        }
                    }
                    Debug.log('mute() -- player is now muted.', Debug.type.info);
                },
               /**
                 * @name unmute
                 * @description unmutes sound;  returns nothing, triggers nothing.
                 * @methodOf APMPlayer
                 */
                unmute : function () {
                    player.settings.muted = false;

                    var playable = player.current_playable;
                    if (playable !== null) {
                        switch (playable.type) {
                        case MediaTypes.type.AUDIO:
                        case MediaTypes.type.LIVE_AUDIO:
                            player.audio.unmute(playable);
                            break;
                        case MediaTypes.type.VIDEO:
                            break;
                        default:
                            Debug.log('unmute() unsupported type: \'' + playable.type + '\'', Debug.type.error);
                            break;
                        }
                    }
                    Debug.log('unmute() -- player is now unmuted.', Debug.type.info);
                },
                /**
                 * @name setVolume
                 * @description sets volume.
                 * @fires Events.type.VOLUME_UPDATED fires event after sucessfully setting volume (see {@link Events}).
                 * @param {number} percent_decimal the percentage to set the volume to 0 to 1
                 * @methodOf APMPlayer
                 */
                setVolume : function (percent_decimal) {
                    if (percent_decimal < 0) {
                        percent_decimal = 0;
                        Debug.log('setVolume() invalid percent_decimal passed: \'' + percent_decimal + '\' is less than 0.  percent_decimal set to 0.  percentages must be represented as a decimal from 0 to 1 (eg .45)', Debug.type.warn);
                    } else if (percent_decimal > 1) {
                        percent_decimal = 1;
                        Debug.log('setVolume() invalid percent_decimal passed: \'' + percent_decimal + '\' is greater than 1.  percent_decimal set to 1.00 by default.  percentages must be represented as a decimal from 0.00 to 1.00 (eg .45)', Debug.type.warn);
                    }

                    var playable = player.current_playable;
                    if (playable !== null) {
                        switch (playable.type) {
                        case MediaTypes.type.AUDIO:
                        case MediaTypes.type.LIVE_AUDIO:
                            player.audio.setVolume(playable, percent_decimal);
                            break;
                        case MediaTypes.type.VIDEO:
                            break;
                        default:
                            Debug.log('setVolume() unsupported type: \'' + playable.type + '\'', Debug.type.error);
                            break;
                        }
                    } else {
                        Debug.log('setVolume() no playable loaded.  VOLUME_UPDATED event still fired. new vox : \'' + percent_decimal + '\'', Debug.type.info);
                    }
                    player.settings.volume = percent_decimal;
                    player.events.trigger(player.events.type.VOLUME_UPDATED, { 'percent_decimal' : percent_decimal });
                },
                /**
                 * @name debug
                 * @description reference to APMPlayer {@link Debug} logger
                 *
                 * @example APMPlayer.debug.log('debug message', APMPlayer.debug.type.info, 'ObjectName');
                 *
                 * Debug types:
                 * APMPlayer.debug.type.info
                 * APMPlayer.debug.type.warn
                 * APMPlayer.debug.type.error
                 *
                 * @static
                 * @fieldOf APMPlayer
                 */
                debug : Debug,
                /**
                 * @name events
                 * @description reference to the main {@link Events} object for APMPlayer
                 * @example APMPlayer.events.addListener(APMPlayer.events.type.PLAYER_READY, function() {} );
                 * @fieldOf APMPlayer
                 */
                events : player.events,
                /**
                 * @name mechanism
                 * @description reference to internal {@link PlaybackMechanism} object.
                 * @example APMPlayer.mechanism.getCurrentSolution();
                 * @fieldOf APMPlayer
                 */
                mechanism : player.mechanism,
                /**
                 * @name mediaTypes
                 * @description reference to supported MediaTypes (currently AUDIO, LIVE_AUDIO)
                 * @example player_ui.playlist.current().type == APMPlayer.mediaTypes.LIVE_AUDIO
                 * @fieldOf APMPlayer
                 */
                mediaTypes : MediaTypes.type,
                /**
                 * @name state
                 * @description reference to current {@link PlaybackState} object
                 * @example APMPlayer.state.getCurrent() === APMPlayer.state.type.PLAYING;
                 * @fieldOf APMPlayer
                 */
                state : player.state,
                /**
                 * @name base_path
                 * @description returns the base_path of the project, relative to this file.
                 * checks for both apmplayer-all.min.js and apmplayer.js
                 * @example http://localhost/apmplayer/1.2/
                 * @fieldOf APMPlayer
                 */
                base_path : player.util.getProjectBasePath(),
                /**
                 * @name version
                 * @description returns the version of APMPlayer.
                 * @fieldOf APMPlayer
                 */
                version : player.apmplayer_version
            };
        };  //end APMPlayer()

        /**
         * @name Playlist
         * @description structured, organized playlist made-up of {@link Playable} objects.
         * @constructor
         * */
        var Playlist = function () {
            /**
             * @name events
             * @description object reference to specific {@link Events} object for Playlist
             * @example Playlist.events.addListener(APMPlayer.events.type.PLAYLIST_CURRENT_CHANGE, function() {} );
             * @fieldOf Playlist
             */
            this.events = new Events();
            this._items = [];
            this._current_index = null;
        };
        Playlist.prototype = {
            /**
             * @name add
             * @description adds a valid {@link Playable} to the playlist.
             * @param {Playable} playable the playable to add.
             * @example Playlist.add(playable);
             * @returns {boolean} success or failure.
             * @methodOf Playlist
             */
            add : function (playable) {
                if (playable instanceof Playable && playable.isValid()) {

                    if (this.item(playable.identifier) !== null) {
                        Debug.log('add() could not add \'' + playable.identifier + '\' to playlist because it already exists!', Debug.type.warn, 'Playlist');
                        return false;
                    }

                    this._items.push(playable);
                    if (this._current_index === null) {
                        this._current_index = 0;
                        this.events.trigger(this.events.type.PLAYLIST_CURRENT_CHANGE, null);
                    }
                    Debug.log('add() new playable successfully added to playlist: \'' + playable.identifier + '\'',  Debug.type.info, 'Playlist');
                    return true;
                }

                Debug.log('add() -- error: nothing added to playlist.  either object passed was not of type Playable or identifier \'' + playable.identifier + '\' is invalid.', Debug.type.warn, 'Playlist');
                return false;
            },
            /**
             * @name _count
             * @description returns number of items in playlist
             * @private
             * @ignore
             */
            _count : function () {
                return this._items.length;
            },
            /**
             * @name current
             * @description returns the current {@link Playable} in the playlist.
             * @returns {Playable} returns a valid playable, or null if nothing in playlist.
             * @example Playlist.current();
             * @methodOf Playlist
             */
            current : function () {
                if (this._current_index !== null) {
                    return this._items[this._current_index];
                }
                return null;
            },
            /**
             * @name item
             * @description returns specific {@link Playable} by identifier, if it exists in playlist
             * @param {string} identifier of a specific {@link Playable}.
             * @returns {Playable} if found, returns a valid playable, or null if non-existant.
             * @example Playlist.item('kick_ass_rock_song');
             * @methodOf Playlist
             */
            item : function (identifier) {
                var j, total_items = this._count();
                for (j = 0; j < total_items; j += 1) {
                    if (this._items[j].identifier === identifier) {
                        return this._items[j];
                    }
                }
                return null;
            },
            /**
             * @name goto
             * @description finds appropriate {@link Playable} in playlist and switches current pointer to that playable, if it exists in the playlist.
             * @param {string} identifier of a specific {@link Playable}.
             * @returns {boolean} success or failure.
             * @example Playlist.goto('boring_bluegrass_song');
             * @fires Events.type.PLAYLIST_CURRENT_CHANGE fires upon successful update of current playlist item (see {@link Events}).
             * @methodOf Playlist
             */
            goto : function (identifier, start_position) {
                var j, total_items = this._count();
                for (j = 0; j < total_items; j += 1) {
                    if (this._items[j].identifier === identifier) {
                        var previous_playable = this.current();
                        this._current_index = j;

                        // Set the start position. This allows overriding on playlist switch.
                        if (start_position) {
                            this._items[j].position = start_position;
                        }

                        this.events.trigger(this.events.type.PLAYLIST_CURRENT_CHANGE, previous_playable);
                        return true;
                    }
                }
                Debug.log('goto() - invalid identifier passed \'' + identifier + '\'.  This was not found in the current playlist!', Debug.type.warn, 'Playlist');
                return false;
            },
            /**
             * @name hasNext
             * @description returns whether or not there is at least one more item before end of playlist
             * @returns {boolean} true if playlist has another item, false if at end of playlist
             * @example Playlist.hasNext();
             * @methodOf Playlist
             */
            hasNext : function () {
                if (this._current_index + 1 < this._count()) {
                    return true;
                }
                return false;
            },
            /**
             * @name remove
             * @description finds and removes a specifc {@link Playable} in playlist by identifier.  The current playlist item may not be removed.
             * @param {string} identifier of a specific {@link Playable}.
             * @returns {boolean} success or failure.
             * @example Playlist.remove('brittany_spears_theft_of_the_dial');
             * @methodOf Playlist
             */
            remove : function (identifier) {
                var j, num_items_before_remove = this._count();
                for (j = 0; j < num_items_before_remove; j += 1) {

                    if (this._items[j].identifier === identifier) {

                        if (this.current().identifier === identifier) {
                            Debug.log('remove() -- sorry, you may not remove the current item in the playlist. returning false.)', Debug.type.warn, 'Playlist');
                            return false;
                        }

                        this._items.splice(j, 1);              //remove from array, while resetting array indexes

                        if (this._current_index > 0 && j <= this._current_index) {
                            this._current_index -= 1;          //move current index back by 1, if we purged something before current item
                        }

                        return true;
                    }
                }
                return false;
            },
            /**
             * @name next
             * @description advances current() point to next {@link Playable} in playlist.  Also moves current to beginning if at end of playlist.
             * @returns {boolean} false if no items exist in playlist.
             * @example Playlist.next();
             * @fires Events.type.PLAYLIST_CURRENT_CHANGE fires upon successful change of current playlist item (see {@link Events}).  Also passes previous_playable back with the Event.
             * @methodOf Playlist
             */
            next : function () {
                if (this._current_index !== null) {
                    Debug.log('next() advancing to next position in playlist (or to beginning if at last)', Debug.type.info, 'Playlist');
                    var previous_playable = this.current();
                    this._current_index = (this._current_index + 1 < this._count()) ? this._current_index + 1 : 0;
                    this.events.trigger(this.events.type.PLAYLIST_CURRENT_CHANGE, previous_playable);
                } else {
                    return false;
                }
            },
            /**
             * @name previous
             * @description sets current() point to back one {@link Playable} in playlist.  Also moves current to end if at beginning of playlist.
             * @returns {boolean} false if no items exist in playlist.
             * @example Playlist.previous();
             * @fires Events.type.PLAYLIST_CURRENT_CHANGE fires upon successful change of current playlist item (see {@link Events}).  Also passes previous_playable back with the Event.
             * @methodOf Playlist
             */
            previous : function () {
                if (this._current_index !== null) {
                    Debug.log('previous() moving to previous position in playlist (or to last if at beginning)', Debug.type.info, 'Playlist');
                    var previous_playable = this.current();
                    this._current_index = (this._current_index - 1 >= 0) ? this._current_index - 1 : this._count() - 1;
                    this.events.trigger(this.events.type.PLAYLIST_CURRENT_CHANGE, previous_playable);
                } else {
                    return false;
                }
            }
        };  //end Playlist


        var apmplayer_instance;  //singleton
        return {
            /**
             * @name getPlayer
             * @description returns singleton instance of {@link APMPlayer}.
             * @returns {APMPlayer}
             * @methodOf APMPlayerFactory
             */
            getPlayer: function () {
                if (typeof apmplayer_instance === 'undefined') {
                    apmplayer_instance = new APMPlayer();
                    apmplayer_instance.constructor = null;  //prohibit new's
                }
                return apmplayer_instance;
            },
            /**
             * @name getPlayable
             * @description validates params argument and constructs a new {@link Playable} object upon each call, if valid.  Returns an empty {@link Playable} if passed arguments are invalid.  see also {@link Playable.isValid}
             * @param {Object} params object literal used to build Playable.
             * @returns {Playable}
             *
             * @example regular example:
             * APMPlayerFactory.getPlayable(
             * {
             *   type: 'audio',
             *   identifier: 'my_audio',
             *   flash_server_url: 'rtmp://server/',
             *   flash_file_path: 'mp3:path/file.mp3',
             *   http_file_path: 'http://server/file.mp3',
             *   buffer_time: 5
             * });
             *
             * @example CustomScheme example:
             * APMPlayerFactory.getPlayable(
             * {
             *   identifier: 'apm-audio:/being/programs/2011/12/15/20111222_prophetic_imagination_128.mp3'
             * });
             *
             * (note that in this example, the CustomScheme provides attributes that are pre-defined
             * (eg, flash_server_url, flash_file_path, http_file_path, type, buffer_time)
             *
             *
             * @methodOf APMPlayerFactory
             */
            getPlayable : function (params) {
                return new Playable(params);
            },
            /**
             * @name getPlaylist
             * @description constructs and returns a new {@link Playlist}.
             * @returns {Playlist}
             * @methodOf APMPlayerFactory
             */
            getPlaylist : function () {
                return new Playlist();
            },
            /**
             * @name getUnderwritingPlayable
             * @description constructs and returns a new {@link UnderwritingPlayable} object
             * @returns {UnderwritingPlayable}
             * @methodOf APMPlayerFactory
             */
            getUnderwritingPlayable : function (params) {
                return new UnderwritingPlayable(params);
            },
            /**
             * @name getCustomSchemes
             * @description returns a CustomSchemes object to initialize the map of {@link CustomSchemes}, used as a short-cut for constructing {@link Playable} objects -- see {@link CustomSchemes} for more detail.
             * @param {Object} params object literal used to initialize {@link CustomSchemes} -- the object can contain any number of attributes already defined for {@link Playable} objects.
             * @returns {CustomSchemes}
             *
             * @methodOf APMPlayerFactory
             */
            getCustomSchemes : function () {
                return custom_schemes;
            }
        };
    }()); //end APMPlayerFactory
}
