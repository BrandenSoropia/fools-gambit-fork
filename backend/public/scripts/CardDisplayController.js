/*displayDrawnHand(game.getHand())
game.playCardsByIndex("0,1,2")*/

function CardDisplayController(){
    /*public functions for use in Main.js*/
    this.displayDrawnHand = displayDrawnHand;
    this.updateLog = updateLog;

    let logData = "";

    /*updates text in Battle Log dialog*/
    function updateLog(newData, renew) {
        /*if new round starting, clear log*/
        if (renew) {
            logData = "";
        }
        else {
            logData = logData+"\n"+newData;
        }

        /*update text*/
        $("#battle-log-text").text(logData);
        $("#battle-log-text").animate({ scrollTop: $('#battle-log-text').prop("scrollHeight")}, 1000);
    }

    /*controls player's hand when they select and play cards*/
    $( function() {
        $( "#drawn-cards" ).selectable({
            selected: function(event, ui) {
                /*if the card already has selected class, play the card*/
                if ($(ui.selected).hasClass("selectedCard") && game.isPlayerTurn()) {
                    /*play card*/
                    let code = $(ui.selected).attr("code");
                    game.playCardByCode(code);

                    /*hide played card visually*/
                    $(ui.selected).hide('puff');

                    /*update card-display amount trackers*/
                    let cardsLeft = game.cardsLeftToPlay();
                    $(".cards-remaining").text("Cards Remaining: "+cardsLeft)
                    $(".discard-deck-amount").text(parseInt($(".discard-deck-amount").text())+1);
                }

                /*ensure only one card can be selected at a time*/
                $(ui.selected).addClass("selectedCard").addClass("ui-selected").siblings().removeClass("ui-selected");
                $(ui.selected).siblings().removeClass("selectedCard");
            }
        });
    });

    /*updates player's hand when it's their turn*/
    function displayDrawnHand(currentHand, showAll, currentDraw, currentDiscard) {
        /*for each card in player's hand*/
        $.each(currentHand, function(index, value){
            let idName = "#card-"+(index);

            /*update card visually and with its card code*/
            $(idName).attr("src",value.image);
            $(idName).attr("index", index);
            $(idName).attr("code", value.code);
            $(idName).addClass('drawn-card');
            $(idName).removeClass('ui-selected');
            $(idName).removeClass('selectedCard');
            if(showAll){$(idName).show('slide',{direction:'down'});}
        });
        /*update trackers*/
        $(".cards-remaining").text("Cards Remaining: 3");
        $(".draw-deck-amount").text(currentDraw);
        $(".discard-deck-amount").text(currentDiscard);
    }

    /*end player's turn early when they ask*/
    $(".end-turn").on("click", function() {
        game.endPlayerTurn();
    });

    $( "#log-header" ).click(function(){
        $('#battle-log-text').slideToggle('fast');
        $('#log-icon').toggleClass( "ui-icon-triangle-1-e ui-icon-triangle-1-s" );
    });

}
