//initialization w/ custom configuration short-cuts (not required)
var scheme_map = {
    "apm-audio" : {
        flash_server_url  : 'rtmp://ondemand-rtmp.stream.publicradio.org/music',
        flash_file_prefix : 'mp3:ondemand',
        http_file_prefix  : 'http://ondemand-http.stream.publicradio.org',
        buffer_time : 3,
        type : 'audio'
    },
    "apm-live-audio" : {
        mpr_news : {
            flash_server_url : 'rtmp://wowza.stream.publicradio.org/news',
            flash_file_path : 'news.stream',
            http_file_path : 'http://nis.stream.publicradio.org/nis.mp3',
            buffer_time : 6,
            type : 'live_audio'
        },
        mpr_current : {
            flash_server_url : 'rtmp://wowza.stream.publicradio.org/kcmp',
            flash_file_path : 'kcmp.stream',
            http_file_path : 'http://current.stream.publicradio.org/kcmp.mp3',
            buffer_time : 6,
            type : 'live_audio'
        },
        csf : {
            flash_server_url : 'rtmp://wowza.stream.publicradio.org/csf',
            flash_file_path : 'csf.stream',
            http_file_path : 'http://csf.stream.publicradio.org/csf.mp3',
            buffer_time : 6,
            type : 'live_audio'
        },
        wpbi : {
            flash_server_url : 'rtmp://wowza.stream.publicradio.org/wpbistream',
            flash_file_path : 'wpbi.stream',
            http_file_path : 'http://wpbi.stream.publicradio.org/wpbi.mp3',
            buffer_time : 6,
            type : 'live_audio'
        },
        mpr_local_current : {
            flash_server_url : 'rtmp://wowza.stream.publicradio.org/localstream',
            flash_file_path : 'local.stream',
            http_file_path : 'http://localcurrent.stream.publicradio.org/localcurrent.mp3',
            buffer_time : 6,
            type : 'live_audio'
        },
        mpr_wonderground : {
            flash_server_url : 'rtmp://wowza.stream.publicradio.org/wonderground',
            flash_file_path : 'wonderground.stream',
            http_file_path : 'http://wonderground.stream.publicradio.org/wonderground.mp3',
            buffer_time : 6,
            type : 'live_audio'
        },
        mpr_radio_heartland : {
            flash_server_url : 'rtmp://wowza.stream.publicradio.org/radioheartland',
            flash_file_path : 'radioheartland.stream',
            http_file_path : 'http://radioheartland.stream.publicradio.org/radioheartland.mp3',
            buffer_time : 6,
            type : 'live_audio'
        },
        mpr_classical : {
            flash_server_url : 'rtmp://wowza.stream.publicradio.org/ksjn',
            flash_file_path : 'ksjn.stream',
            http_file_path : 'http://cms.stream.publicradio.org/cms.mp3',
            buffer_time : 6,
            type : 'live_audio'
        },
        mpr_classical_choral : {
            flash_server_url : 'rtmp://wowza.stream.publicradio.org/choral',
            flash_file_path : 'choral.stream',
            http_file_path : 'http://choral.stream.publicradio.org/choral.mp3',
            buffer_time : 6,
            type : 'live_audio'
        },
        utility : {
            flash_server_url : 'rtmp://wowza.stream.publicradio.org/utility',
            flash_file_path : 'utility.stream',
            http_file_path : 'http://utility.stream.publicradio.org/utility01.mp3',
            buffer_time : 6,
            type : 'live_audio'
        },
        utility2 : {
            flash_server_url : 'rtmp://wowza.stream.publicradio.org/utility2',
            flash_file_path : 'utility2.stream',
            http_file_path : 'http://utility.stream.publicradio.org/utility02.mp3',
            buffer_time : 6,
            type : 'live_audio'
        },
        utility3 : {
            flash_server_url : 'rtmp://wowza.stream.publicradio.org/utility3',
            flash_file_path : 'utility3.stream',
            http_file_path : 'http://utility.stream.publicradio.org/utility03.mp3',
            buffer_time : 6,
            type : 'live_audio'
        },
        utility4 : {
            flash_server_url : 'rtmp://wowza.stream.publicradio.org/utility4',
            flash_file_path : 'utility4.stream',
            http_file_path : 'http://utility.stream.publicradio.org/utility04.mp3',
            buffer_time : 6,
            type : 'live_audio'
        },
        c24 : {
            flash_server_url : 'rtmp://wowza.stream.publicradio.org/c24',
            flash_file_path : 'c24.stream',
            http_file_path : 'http://c24.stream.publicradio.org/c24.mp3',
            buffer_time : 6,
            type : 'live_audio'
        }
    }
};

// Compatibility with prior versions.
// Change made due to underscores not being valid
// http://tools.ietf.org/html/rfc3986#page-17
scheme_map.apm_audio = scheme_map["apm-audio"];
scheme_map.apm_live_audio = scheme_map["apm-live-audio"];

var custom_schemes = APMPlayerFactory.getCustomSchemes();
custom_schemes.init(scheme_map);