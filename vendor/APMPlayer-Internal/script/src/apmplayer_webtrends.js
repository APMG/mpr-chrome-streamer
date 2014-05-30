// Webtrends apmplayer plug-in
//
// V1.2
// CLARK 2012
//
// beacon rate in seconds
(function () {
    // adjust the beacon rate here
    var beaconRate1 = 10;   // the initial beacon rate
    var beacon1end  = 120;  // the point the beacon rate changes
    var beaconRate2 = 120;  // the second beacon rate

    var _currentPlayItem =  null;
        var beaconRate = beaconRate1  ;
    //
    // wtPlayerReady
    // this is called when the player has loaded and is ready
    //
    wtPlayerReady = function (data) {
            // create/init our tracking data structure
            _currentPlayItem = {
                _state: null,
                _preRoll: null,
                _index: 0,
                _quartile: 0,
                _15MinTicker: {
                    interval15Min: 0,
                    listen5Mins: 0
                },
                _beaconTime: {
                    lastBeacon: 0,
                    currentBeacon: 0
                },
                _listenTime: {
                    sampleNumber: 0,
                    sumOf: 0,
                    currentVal: 0,
                    normalizedVal: 0,
                    startTime: 0,
                    lastTick: 0,
                    lastValue: 0
                },
                _content: {
                    program: null,
                    content: null,
                    duration: null,
                    type: null,
                    path: null,
                    id: null,
                    file: null,
                    underwriting: false ,
                    mode:null
                }
            }
        }
        // test to see if the audio is streaming audio
        isStream = function() {
          if ( _currentPlayItem._content.mode === 'live_audio') return true;
          return false;
                }
                // test to see if the audio is static (fix length) audio
                isStatic = function() {
                  if( _currentPlayItem._content.mode === 'audio') return true;
                    return false;
                }


        // END wtPlayerReady
        //
        // wtMediaMETA
        // this is called when new META data is avaliable
        //
        wtMediaMETA = function (meta) {
                    // get the program information from the meta call

                    if (meta == null) return;

            _currentPlayItem._content.mode = meta.type;
            _currentPlayItem._content.path = meta.flash_file_path;
            _currentPlayItem._content.id = meta.identifier;
            _currentPlayItem._content.duration = meta.duration;
            type = meta.flash_file_path.split('.');
            file = meta.flash_file_path.split('/');
            _currentPlayItem._content.type = type[type.length - 1];
            _currentPlayItem._content.file = file[file.length - 1];
          _currentPlayItem._content.program = meta.program;
          _currentPlayItem._content.content = meta.description;
                    if (typeof meta.is_underwriting != 'undefined' ) {
                        if (meta.is_underwriting) _currentPlayItem._content.underwriting = true;
                        else  currentPlayItem._content.underwriting = false;
                };
          };
    // END wtMediaMETA

    //
    // wtMediaReady
    // this is called when the media has loaded
    //
    wtMediaReady = function (meta) {
        // call into the playing method to get the meta data since its not avaliable with the call yet
        //   list = loadPlaylistItemInfo(_listPlaying._currentPlayItem._index);
        wtMediaMETA(meta); // get the meta
    };
    // END wtMediaReady
    //
    // wtPosUpdate
    // this is called every 100ms with position updata data
    //
    wtPosUpdate = function (meta) {

        beacon = _currentPlayItem._beaconTime;
        playTime = _currentPlayItem._listenTime;

         // this is for the listening for at least 5 minutes every 15 minuted metric
        // AQH requirement - peopel listening over 5 minutes at 15 minute intervals
        var d = new Date();
        if (playTime.lastTick == 0) playTime.lastTick = d.getTime();
        lTime = d.getTime() - playTime.lastTick;
        playTime.lastTick = d.getTime();

        // update the playing time for the item
        playTime.currentVal += lTime;
        if (_currentPlayItem._15MinTicker.interval15Min == 0) {
            _currentPlayItem._15MinTicker.interval15Min = d;
            _currentPlayItem._15MinTicker.listen5Mins = d;
        }

        // AQH requirement - peopel listening over 5 minutes at 15 minute intervals
        if (_currentPlayItem._15MinTicker.listen5Mins != null) {
            if (((d - _currentPlayItem._15MinTicker.listen5Mins) / 1000) / (60 * 5) > 1) {
                _currentPlayItem._15MinTicker.listen5Mins = null;
                tags = wtClipInfo('AQH');
                wtSendData(tags)
            }
        }
        if (((d - _currentPlayItem._15MinTicker.interval15Min) / 1000) / (60 * 15) > 1) {
            _currentPlayItem._15MinTicker.interval15Min = d
            _currentPlayItem._15MinTicker.listen5Mins = d
        }
        if (beacon.lastBeacon == 0) beacon.lastBeacon = playTime.currentVal;
        if (playTime.currentVal > beacon1end*1000) beaconRate = beaconRate2;
        if (playTime.currentVal > beacon.lastBeacon + beaconRate * 1000 && isStream()) {
            tags = wtClipInfo('BEACON');
            wtSendData(tags)
            beacon.lastBeacon = playTime.currentVal;
        }
        quartile = Math.floor((meta.percent_played + .02) * 4);
        if (quartile > _currentPlayItem._quartile && _currentPlayItem._content.underwriting == false && meta.percent_played > 0 && meta.percent_played != 1 && isStatic()) {

            _currentPlayItem._quartile = quartile;
            tags = wtClipInfo('QUARTILE');
            wtSendData(tags);
        }

    };
    // END wtPosUpdate
    //
    // wtMediaChange
    // this is called if the content changes
    // for the streaming implemention this is probably never called
    // so its a stub for when we move to fixed length content
    //
    wtMediaChange = function (meta) {
        // stub
    };
    // END wtMediaChange
    //
    // wtMediaUnload
    // this is called when media unloads (completes)
    //
    wtMediaUnload = function (meta) {
            // the current item finished playing
            _currentPlayItem._state = "COMPLETE";
            tags = wtClipInfo('COMPLETE');
            wtSendData(tags)

        _currentPlayItem._content.underwriting = false;
                // clear everything out
                wtPlayerReady();
    };
    // END wtMediaUnload
    //
    // wtMediaFinished
    // this is called when has finished
    //
    wtMediaFinished = function (meta) {

            // stub
    };
    // END wtMediaFinished
    //
    // wtMediaStart
    // this is called when the media starts to play
    //
    wtMediaStart = function (data) {
        // content play begin
        if (_currentPlayItem._state === 'PAUSE' && isStatic()) {
            // send resume message here
            wtSendData(wtClipInfo("RESUME"));
        }
        _currentPlayItem._state = 'PLAY';
    }

    wtMediaPlay = function (data) {
        // content play begin

                // set the meta data in case the meta call did not fire yet
                wtMediaMETA(data);

                // static fixed lenght audio
                if (isStatic()) {
                    switch(data.state) {
                      case 'PAUSED':
                            wtSendData(wtClipInfo("PAUSED"));
                            _currentPlayItem._state = 'PAUSED'
                            break;
                        case 'PLAYING':
                          if (_currentPlayItem._state === 'PAUSED') {
                  // send resume message here
                    wtSendData(wtClipInfo("RESUME"));
                                _currentPlayItem._state = 'PLAY';
                    } else {
                    if (_currentPlayItem._state !== 'PLAY') {
                        wtSendData(wtClipInfo('PLAY'));
                                _currentPlayItem._state = 'PLAY';
                        }
                            }
                            break;
                        default:
                            _currentPlayItem._state = 'PLAY';
                        }
                } else {
                    // streaming audio only have two events -- play and complete
                    switch(data.state) {
                        case 'PLAYING':
                    if (_currentPlayItem._state !== 'PLAY') {
                        wtSendData(wtClipInfo('PLAY'));
                                _currentPlayItem._state = 'PLAY';
                        }
                            break;
                        default:
                            _currentPlayItem._state = 'PLAY';
                        }
                }
        }


    if (typeof (APMPlayer) != 'undefined') {
        // bind into the event handlers
        APMPlayer.events.addListener(APMPlayer.events.type.PLAYER_READY, wtPlayerReady);
        APMPlayer.events.addListener(APMPlayer.events.type.METADATA, wtMediaMETA);
        APMPlayer.events.addListener(APMPlayer.events.type.MEDIA_READY, wtMediaReady);
        APMPlayer.events.addListener(APMPlayer.events.type.POSITION_UPDATE, wtPosUpdate);
        APMPlayer.events.addListener(APMPlayer.events.type.UNLOADED, wtMediaUnload);
        APMPlayer.events.addListener(APMPlayer.events.type.FINISHED, wtMediaFinished);
        APMPlayer.events.addListener(APMPlayer.events.type.PLAYING, wtMediaPlay);
        APMPlayer.events.addListener(APMPlayer.events.type.PAUSED, wtMediaPlay);
    }
    //
    // send out the webtrends payload
    // this is set up for a easy conversion to sync V10 when they are ready
    //
    wtSendData = function (vars) {
        if (vars == null) return;
        var myArgs = new Array();
        for (var c = 0; c < vars.length; c++) {
            myArgs.push(vars[c].tag);
            if (typeof (vars[c].value) === 'number') myArgs.push(vars[c].value.toString());
            else if (typeof (vars[c].value) === 'string') myArgs.push(vars[c].value.replace(/<\/?[a-z][a-z0-9]*[^<>]*>/ig, ""));
            else myArgs.push('unknown');
        }
        _tag.dcsMultiTrack.apply(_tag, myArgs);
    };
    wtClipInfo = function (event) {
        myData = _currentPlayItem;

        var myTags = Array();

        var tags = {tag: null,value: null};
        tags.tag = "WT.clip_ev";
        if (event != null) tags.value = event;
        else tags.value = myData._state;
        myTags.push(tags);

        // type of clip (mp3, video, ...)
        var tags = {tag: null,value: null};
        tags.tag = "WT.clip_t";
        tags.value = myData._content.type;
        myTags.push(tags);

        // type of stream
        var tags = {tag: null,value: null};
        if (myData._content.mode) {
            tags.tag = "WT.clip_m";
            if (isStatic()) tags.value = 'Static';
                        if (isStream()) tags.value = 'Stream'
                        if (tags.value == null) tags.value = 'unknown';
            myTags.push(tags);
        }

        // title of show
        var tags = {tag: null,value: null};
        tags.tag = "WT.clip_n";
        if (myData._content.program) tags.value = myData._content.program;
        else tags.value = document.title;
        if (_currentPlayItem._content.underwriting) tags.value = 'underwriting:' + tags.value;
        myTags.push(tags);

        // content of show
        var tags = {tag: null,value: null};
        if (myData._content.content) {
            tags.tag = "WT.clip_c";
            tags.value = myData._content.content;
            myTags.push(tags);
        }


        // phase of play (preroll, content)
        var tags = {tag: null,value: null};
        if (_currentPlayItem._content.underwriting) { // underwriting
            tags.tag = "WT.clip_p";
            tags.value = 'preroll';
        } else {
            tags.tag = "WT.clip_p";
            tags.value = 'content';
        }
        myTags.push(tags);

        // file name of show
        var tags = {tag: null,value: null};
        tags.tag = "WT.clip_f";
        tags.value = myData._content.file;
        myTags.push(tags);

        // current position
        var tags = {tag: null,value: null};
        tags.tag = "WT.clip_v";
        tags.value = Math.floor(((myData._listenTime.currentVal / 1000) / 60) * 100) / 100;
        myTags.push(tags);

        // set page determination level
        var tags = {tag: null,value: null};
        tags.tag = "WT.dl";
        tags.value = 31;
        myTags.push(tags);

        // normalized position
        // this is used to calculate average time listned in a hit based world
        //
        var tags = {tag: null,value: null};
        tags.tag = "WT.clip_ta";
        myData._listenTime.sampleNumber++;
        n = myData._listenTime.sampleNumber * (myData._listenTime.currentVal / 1000) - myData._listenTime.sumOf;
        tags.value = Math.floor((n / 60) * 100) / 100;
        myTags.push(tags);
        myData._listenTime.sumOf += n;
        var tags = {tag: null,value: null};

        // hit wise total time listened to content
        var d = new Date();
        currentTime = d.getTime();
        if (myData._listenTime.lastValue == 0) {
            myData._listenTime.lastValue = currentTime;
        }
        tags.tag = "WT.clip_tv";
        tags.value = Math.floor(((currentTime / 1000 - myData._listenTime.lastValue / 1000) / 60) * 100) / 100;
        myData._listenTime.lastValue = currentTime;
        myTags.push(tags);
        if (event == 'AQH') {
            //round it to the nearest 15min interval
            hr = d.getHours();
            min = d.getMinutes();
            min = Math.floor(min / 15) * 15;
            t = AddLeadZero(hr) + ":" + AddLeadZero(min);
            var tags = {tag: null,value: null}
            tags.tag = 'WT.tick15';
            tags.value = t;
            myTags.push(tags);
        }
        if (event == 'QUARTILE') {
            var tags = {tag: null,value: null};
            tags.value = _currentPlayItem._quartile;
            tags.tag = "WT.clip_q";

            myTags.push(tags);
            var tags = {tag: null,value: null};
            if (_currentPlayItem._quartile == 1) tags.value = 1;
            if (_currentPlayItem._quartile == 2) tags.value = 3;
            if (_currentPlayItem._quartile == 3) tags.value = 5;
            if (_currentPlayItem._quartile == 4) tags.value = 9;
            tags.tag = "WT.clip_nq";
            myTags.push(tags);
        }

        return myTags;
    }
    AddLeadZero = function (n) {
        if (n < 10) return ("0" + n);
        return (n);
    }
})();