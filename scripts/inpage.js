


console.log('initing player!');


$('#apm_media_wrapper').apmplayer_ui({
  settings : {
      volume : 0.9,
      autoplay : true
  },
  playables : [
      {
          identifier: 'apm-live-audio:/mpr_news',
          description: 'live stream',
          program: '91.1 MPR News'
      },
      {
          identifier: 'apm-live-audio:/mpr_current',
          description: 'live stream',
          program: '89.3 the Current'
      }

  ],
  /** player-specific functions below **/
  onPlaylistUpdate : function (playable) {
      if($('#apm_playlist li[ id = \'' + playable.identifier + '\']').length == 0) {   //create playlist item li, if none exists.
          $('#apm_playlist ul').append('<li id="' + playable.identifier + '" class="apm_playlist_item"></li>');
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

      $('#apm_playlist li[ id = \'' + playable.identifier + '\']').html(snippet);

      $('#apm_playlist li[ id = \'' + playable.identifier + '\']').click(function () {
          $('#apm_player_container').apmplayer_ui('gotoPlaylistItem', this.id);
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
