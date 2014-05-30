
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
          program: 'MPR News',
      },
      {
          identifier: 'apm-live-audio:/mpr_current',
          program: 'The Current'
      },
      {
          identifier: 'apm-live-audio:/mpr_classical',
          program: 'Classical MPR'
      },
      {
          identifier: 'apm-live-audio:/mpr_local_current',
          program: 'Local Current'
      },
      {
          identifier: 'apm-live-audio:/mpr_wonderground',
          program: 'Wonderground'
      },
      {
          identifier: 'apm-live-audio:/mpr_radio_heartland',
          program: 'Radio Heartland'
      },
      {
          identifier: 'apm-live-audio:/mpr_classical_choral',
          program: 'Classical Chroal'
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
      } 

      $('#apm_playlist li[ data-identifier = \'' + playable.identifier + '\']').html(snippet);

      $('#apm_playlist li[ data-identifier = \'' + playable.identifier + '\']').click(function () {      
          
            playGivenStream(this);
          //$('#apm_player_container').apmplayer_ui('gotoPlaylistItem', $(this).data('identifier'));
      });

      $('#apm_playlist li').first().addClass('selected');
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
  //console.log(e.keyCode);
  var selected = $(".selected");
  switch (e.keyCode){
    case 32: //spacebar
        if ($('#apm_player_play').is(':visible')){
            playGivenStream(selected);
        } else if ($('#apm_player_pause').is(':visible')){
          stopStream();
        }
        break;
    case 38: //up
        $("#apm_playlist li").removeClass("selected");
        if (selected.prev().length === 0) {
            selected.siblings().last().addClass("selected");
        } else {
            selected.prev().addClass("selected");
        }
        break;

    case 40:  //down
        $("#apm_playlist li").removeClass("selected");
        if (selected.next().length === 0) {
            selected.siblings().first().addClass("selected");
        } else {
            selected.next().addClass("selected");
        }
        break;

  }
});


function playGivenStream(listItem){
    $('#apm_playlist .playing').removeClass('playing');
    $(listItem).addClass('playing'); //remove any playing status    
    var streamIdentifier = $(listItem).data('identifier');
    $('#apm_player_container').apmplayer_ui('gotoPlaylistItem', streamIdentifier);
}

function stopStream(){
    $('#apm_player_pause').click();
    $('#apm_playlist .playing').removeClass('playing');
}

function pause(){

}