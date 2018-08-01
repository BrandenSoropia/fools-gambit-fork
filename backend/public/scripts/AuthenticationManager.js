function checkIfLoggedIn(){
	$.ajax({type: 'GET', url: '/loggedin'}).done(function( username ) {
    if (username.length < 1){
    	$('#authentication').show();
    	$('#post-authentication').hide();
    	$('#loggedintext').text("Games and Scores are not saved if you are not logged in.");
    } else {
    	$('#authentication').hide();
    	$('#post-authentication').show();
    	$('#loggedintext').text('Logged in as ' + username);
        $.ajax({type: 'GET', url: '/saveFiles/getSave'}).done(function(data){
            if (data=='player has no save'){
                $('#continuebtn').prop("disabled",true);
            }
            else
                $('#continuebtn').prop("disabled",false);

        })
    }
  });
}

checkIfLoggedIn();
