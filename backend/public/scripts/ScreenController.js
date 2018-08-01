/**
 * Start game, display battle and hide start screen.
 */
$('#start-screen .start').on('click', function() {
  game.newGameFromCards(testDecks[0]);
  setTimeout(function() {
    $('#start-screen').addClass('hidden');

    $('.battle').removeClass('hidden');
  }, 1000); // Time with start button press!
});

$('#start-screen .leaderboard').on('click', function() {
  // Fetch highscores
  $.ajax({
    type: 'GET',
    url: '/scores/leaderboard',
    success: function (data){
      const FIRST_PLACE = 0;
      const SECOND_PLACE = 1;
      const THIRD_PLACE = 2

      // Populate top three highscores
      data.forEach(function(record, idx) {
        switch(idx) { // data is sorted in descending order, so rank is determined by order
          case FIRST_PLACE:
            $('#first-place td.highscore').text(record.value);
            $('#first-place td.username').text(record.name);
            break;
          case SECOND_PLACE:
            $('#second-place td.highscore').text(record.value);
            $('#second-place td.username').text(record.name);
            break;
          case THIRD_PLACE:
            $('#third-place td.highscore').text(record.value);
            $('#third-place td.username').text(record.name);
            break;
        }
      })

      setTimeout(function() {
        $('#start-screen').addClass('hidden');

        const leaderboard = $('#leaderboard');
        leaderboard.removeClass('hidden');
        leaderboard.data('previousPage', 'start-screen');
      }, 1000); // Time with start button press!
    },
    error: function(XMLHttpRequest, textStatus, errorThrown){console.log(textStatus)},
   });
});

$('#continuebtn').on('click', function() {
  game.continueSave();
  setTimeout(function() {
    $('#start-screen').addClass('hidden');

    $('.battle').removeClass('hidden');
  }, 1000); // Time with start button press!
});

/**
 * Restart game if "start" hit on game over screen and hides game over screen.
 */
$('#game-over-screen .start').on('click', function() {
  setTimeout(function() {
    // TODO: Restart game
    game.restartGameWithSameStartingDeck();

    setTimeout(function() {
      $('.battle').removeClass('hidden');

      $('#game-over-screen').addClass('hidden');
      $( "#game-over-screen img" ).show( "fade" );
    }, 700)
  }, 250); // Time with start button press!
});

$('#game-over-screen .leaderboard').on('click', function() {
  // TODO:
  // Fetch highscores
  $.ajax({
    type: 'GET',
    url: '/scores/leaderboard',
    success: function (data){
      const FIRST_PLACE = 0;
      const SECOND_PLACE = 1;
      const THIRD_PLACE = 2

      // Populate top three highscores
      data.forEach(function(record, idx) {
        switch(idx) { // data is sorted in descending order, so rank is determined by order
          case FIRST_PLACE:
            $('#first-place td.highscore').text(record.value);
            $('#first-place td.username').text(record.name);
            break;
          case SECOND_PLACE:
            $('#second-place td.highscore').text(record.value);
            $('#second-place td.username').text(record.name);
            break;
          case THIRD_PLACE:
            $('#third-place td.highscore').text(record.value);
            $('#third-place td.username').text(record.name);
            break;
        }
      })

      setTimeout(function() {
        $('#game-over-screen').addClass('hidden');
        const leaderboard = $('#leaderboard');
        leaderboard.removeClass('hidden');
        leaderboard.data('previousPage', 'game-over-screen');
      }, 250); // Time with start button press!
    },
    error: function(XMLHttpRequest, textStatus, errorThrown){console.log(textStatus)}
  })
});

$('#leaderboard button').on('click', function() {
  const leaderboard = $('#leaderboard');

  // Go back to start screen
  if (leaderboard.data('previousPage').indexOf('start-screen') !== -1) {
    setTimeout(function() {
      leaderboard.addClass('hidden');
      $('#start-screen').removeClass('hidden');
    }, 250);
  } else if (leaderboard.data('previousPage').indexOf('game-over-screen') !== -1) { // Go back to game over screen
    setTimeout(function() {
      leaderboard.addClass('hidden');
      $('#game-over-screen').removeClass('hidden');
    }, 250);
  }
})

/**
 * Returns player to Start Screen if they click 'Main Menu' on Game Over Screen
 */
$('#game-over-screen .mainmenu').on('click', function() {
  setTimeout(function() {
    // TODO: Restart game

    setTimeout(function() {
      checkIfLoggedIn(); // checks is player is logged in user

      $('#start-screen').removeClass('hidden');

      $('#game-over-screen').addClass('hidden');
      $( "#game-over-screen img" ).show( "fade" );
    }, 700)
  }, 250); // Time with start button press!
});

/**
 * If player loses, hide battle screen and display game over screen.
 */
function displayGameOver() {
  $('.battle').addClass('hidden');
  $('#game-over-screen').removeClass('hidden');
}

function LoadingController(){
  this.show = function(callback){
    if (!callback){
      $( "#loading-screen" ).show( 'blind', {}, 700 );

    } else{
      $( "#loading-screen" ).show( 'blind', {}, 700, callback );
    }
  };
  this.hide = function(callback){
      if (!callback){
      $( "#loading-screen" ).hide( 'blind', {}, 700 );

    } else{
      $( "#loading-screen" ).hide( 'blind', {}, 700, callback );
    }
  };
}
