


console.log('initing player!');

var APMPlayer = APMPlayerFactory.getPlayer();
APMPlayer.init({
        preferFlash: false

});

$('#apm_media_wrapper').apmplayer_ui({
  settings : {
      volume : 0.9,
      autoplay : true
  },
  playables : [
      {
          identifier: 'apm-live-audio:/mpr_news',
          description: 'live stream',
          program: 'MPR News',

      },
      {
          identifier: 'apm-live-audio:/mpr_current',
          description: 'live stream',
          program: 'The Current'
      },
      {
          identifier: 'apm-live-audio:/mpr_classical',
          description: 'live stream',
          program: 'Classical MPR'
      },
      {
          identifier: 'apm-live-audio:/mpr_local_current',
          description: 'live stream',
          program: 'Local Current'
      }

  ],
  /** player-specific functions below **/
  onPlaylistUpdate : function (playable) {
      var cleanID = playable.identifier.split(":/")[1];
      //console.log(cleanID);
      if($('#apm_playlist li[ id = \'' + playable.identifier + '\']').length == 0) {   //create playlist item li, if none exists.
          $('#apm_playlist ul').append('<li id="playable-' + cleanID + '" class="apm_playlist_item" data-identifier="'+playable.identifier+'"></li>');
      }
      var snippet = '';
      if (playable.program !== '') {
          snippet += '<div class="apm_playlist_item_title">' + playable.program + '</div>';
      }
      if (playable.title !== '') {
           snippet += '<div class="apm_playlist_item_info">' + playable.title + '</div>';
      } else if (playable.description !== '') {
           snippet += '<div class="apm_playlist_item_info">' + playable.description + '</div>';
      }

      $('#apm_playlist li[ data-identifier = \'' + playable.identifier + '\']').html(snippet);

      $('#apm_playlist li[ data-identifier = \'' + playable.identifier + '\']').click(function () {          
          $('#apm_player_container').apmplayer_ui('gotoPlaylistItem', $(this).data('identifier'));
      });
  },
  onMetadata : function (playable) {
      if (playable.title !== ''
              && playable.title.indexOf("null - American Public Media") === -1) {
          var snippet = "<h4>APMPlayer 1.2 playlist demo</h4>";
          if (playable.program !== '') {
              snippet += "<h2>"+playable.program+"</h2>";
          }
          if (playable.title !== '') {
              snippet += "<p class='apm-track-info'>"+playable.title+"</p>";
          }
          $('#apm_player_info').html(snippet);
      }
  }
});

$(document).keydown(function(e){
  console.log(e.keyCode);
  if (e.keyCode == 32){
    if ($('#apm_player_play').is(':visible')){
      console.log('playing!');
      $('#apm_player_play').click();
    } else if ($('#apm_player_pause').is(':visible')){
      console.log('pausing!');
      $('#apm_player_pause').click();
    }
  }
});
