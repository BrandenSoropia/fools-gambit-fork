function RewardDisplayController(){
	this.showRewardScreen = function(){
		$('#reward-screen').show('slide',{direction:'up'});
	};
	this.hideRewardScreen = function(){
		$('#reward-screen').hide('slide',{direction:'down'});
		$("#rewardCards").empty();
	};

	let numSelected = 0;
	let maxSelected = 2;
	this.displayCurrentDeck = function(){
		let cards = game.getDeckPile();
		let cardList = document.getElementById('rewardCards');
		for (let c in cards){
			let card = document.createElement('img');
			card.setAttribute('id','rewardCard'+ c);
			card.setAttribute('code', cards[c].code);
			card.setAttribute('src',cards[c].image);
			card.className += 'rewardCard';
			cardList.appendChild(card);
		}

	    $(".rewardCard").click(function(){
	        if ($(this).hasClass('selectedCard')){
	        	$(this).removeClass('selectedCard');
	        	numSelected-=1;
	        }
	        else if (numSelected < maxSelected){
	       		$(this).addClass('selectedCard');
	       		numSelected+=1;
	        }
	        if(numSelected == maxSelected){
	        	$("#rewardDoneButton").prop('disabled', false);
	        } else {
	        	$("#rewardDoneButton").prop('disabled', true);
	        }
    	});
	};

    $("#rewardDoneButton").click(function(){
    	$("#rewardDoneButton").prop('disabled', true);
    	let codes = '';
    	$('#rewardCards .selectedCard').each(function(){
    		codes += $(this).attr('code') + ',';    		
    	});
    	codes = codes.slice(0, -1);
    	game.upgradeCards(codes);
    	//$("#rewardCards").empty();
    	numSelected = 0;
    });

}