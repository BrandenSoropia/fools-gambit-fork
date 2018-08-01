const apiUrl = 'https://deckofcardsapi.com/api/deck/';
if (typeof(username) === 'undefined'){
    username = 'Guest';
}

/////////////////////////////
//--- RUNNING THE THING ---//
/////////////////////////////
//here is some possibly temporary global stuff
const testDecks = ['AS,AS,AS,2S,2H,AH,AH,AC,AC,AC,AD,AD,AD'];

let game = new GameApp();

//game.newGameFromCards(testDecks[0]);

//display controllers
let GUI = {};

GUI.hand = new CardDisplayController();
GUI.enemy = new BattleParticipantDisplay('.monster');
GUI.player = new BattleParticipantDisplay('.player');
GUI.rewards = new RewardDisplayController();
GUI.loading = new LoadingController();

//////////////////////////
//--- MAIN GAME CODE ---//
//////////////////////////
/**
 * Class for a GameApp
 * GameApp is the main controller for the game.
 * @class
 */
function GameApp(){
    // Private properties
    let self = this;
    let deckUrl = apiUrl;
    let starterDeckCode = '';
    let mobFactory = new MonsterFactory(self);
    let deck = { // Contains the different piles used in a game and the deck's id
        deckId: null,
        drawPile: {},
        discardPile: {},
        handPile: {},
        deckPile:{}
    };

    let player = new Player();
    let roundNum = 1; // The number of the current round of the game, also enemy lvl
    let enemy = null; // Contains the currently fought enemy
    let playerTurn = false; // Whether or not the player is allowed to select and play cards

    let cardsPlayed = 0;
    let spadesCardsPlayed = 0;
    let clubsCardsPlayed = 0;
    let heartsCardsPlayed = 0;
    let diamondsCardsPlayed = 0;



    const maxCardsPerTurn = 3;
    const handSize = 5;

    let resetGameVariables = function(rnd = 1){
        player = new Player();
        roundNum = rnd; // The number of the current round of the game, also enemy lvl
        enemy = null; // Contains the currently fought enemy
        playerTurn = false; // Whether or not the player is allowed to select and play cards

        cardsPlayed = 0;
        spadesCardsPlayed = 0;
        clubsCardsPlayed = 0;
        heartsCardsPlayed = 0;
        diamondsCardsPlayed = 0;
    };

    // Public properties

    // Public Methods
    //this.init = init;
    this.loadGame = loadGame;
    this.newGameFromCards = newGameFromCards;
    this.restartGameWithSameStartingDeck = restartGameWithSameStartingDeck;

    this.logStatus = logStatus;
    this.playCards = playCards;
    this.upgradeCards = upgradeCards;
    this.getHand = getHand;
    this.getDrawPile = getDrawPile;
    this.getDeck = function(){return deck.handPile.cards.concat(deck.drawPile.cards).concat(deck.discardPile.cards);};
    this.getDeckPile = function(){return deck.deckPile.cards};
    this.playCardsByIndex = playCardsByIndex;
    this.playCardByCode = playCardByCode;
    this.cardsLeftToPlay = cardsLeftToPlay;
    this.endPlayerTurn = endPlayerTurn;
    this.getRoundNumber = function(){return roundNum;};
    this.isPlayerTurn = function(){return playerTurn;};
    this.continueSave = continueSave;
    //this.getGameState = getGameState; //debug only
    //this.loadGame = loadGame; //debug only

    // Private methods
    //--- debug ---
    function logStatus(){
        let log = console.log;
        log('player hp:' + player.hp + ', shield: ' + player.shield);
        log('enemy hp:' + enemy.hp + ', shield: ' + enemy.shield);
        log(getGameState());
    }
    function getHand(){
        return deck.handPile.cards;
    }
    function getDrawPile(){
        return deck.drawPile.cards;
    }

    function playCardsByIndex(indeces){
        let indices = indeces.split(',');
        let cards = [];
        for (let i in indices){
            cards.push(deck.handPile.cards[indices[i]]);
        }
        playCards(cards);
    }
    function playCardByCode(code){
        for (let i in deck.handPile.cards){
            if (deck.handPile.cards[i].code === code){
                playCards([deck.handPile.cards[i]]);
                return;
            }
        }
    }

    //--- battle phase ---
    /**
     * At the start of every battle, initiate mob and give player starting shield.
     * Set HP and shield displays
     */
    function battlePhaseStart(oldgame = false){
        if (!oldgame){
            //spawn the enemy mob, the mob's display is set within the constructor
            enemy = mobFactory.newMob(roundNum);
            // At the beginning of every battle, player is given startingshield
            player.shield = player.startingShield;
        } else {
            GUI.enemy.updateHP(enemy.hp, enemy.maxHP);
            GUI.enemy.updateShield(enemy.shield);
        }

        GUI.player.updateHP(player.hp, player.maxHP);
        GUI.player.updateShield(player.startingShield);
        $('.monster .sprite img').show('fade');

        //then start players turn
        playerTurnStart();
    }

    function playerTurnStart(){
        //at the beginning of player's turn,
        //we need to make sure the player has max cards
        //we "startTurn" after they've finished drawing
        let remaining = deck.drawPile.cards.length;
        let cardsNeeded = handSize - deck.handPile.cards.length;
        //if the drawpile doesnt have enough cards
        if (cardsNeeded > remaining){
            cardsNeeded = cardsNeeded - remaining;
            //first draw remaining cards
            deck.drawPile.draw(remaining, (cards) => {
                deck.handPile.addCards(cards, function(){
                    //then shuffle discard into drawPile
                    deck.drawPile.addCards(deck.discardPile.cards, function(){
                        //then continue drawing
                        deck.drawPile.draw(cardsNeeded, (cards) => {
                            deck.handPile.addCards(cards, startTurn);
                                $('.draw-deck').effect('shake',{distance:10,direction:'up'});
                                $('.discard-deck').effect('shake',{distance:10,direction:'up'});
                        });
                    });
                    deck.discardPile.emptyPile();
                });
            });

        }
        else if (cardsNeeded > 0){
            deck.drawPile.draw(cardsNeeded, (cards) => {
                deck.handPile.addCards(cards, startTurn);
            });
            $('.draw-deck').effect('shake',{distance:10,direction:'up'});
        }
        else {
          deck.handPile.addCards([], startTurn);
        }

        function startTurn(){
            saveGame(getGameState());
            GUI.hand.displayDrawnHand(getHand(), true, deck.drawPile.remaining, deck.discardPile.remaining);
            playerTurn = true;
            cardsPlayed = 0;
            spadesCardsPlayed = 0;
        }
    }

    function cardsLeftToPlay(){
        return maxCardsPerTurn - cardsPlayed;
    }

    /**
     * [playCards description]
     * @param  {[object]} cards, list of card objs to play
     * @return {boolean} did you play valid cards
     */
    function playCards(cards){
        if (!playerTurn) {return;}

        if (cards.length + cardsPlayed > maxCardsPerTurn){
            alert('You cant play that many cards!');
            return false;
        }
        cardsPlayed += cards.length;
        let cardcodes = '';
        for (let c in cards){
            if(cardcodes.length){cardcodes += ',';}
            cardcodes += cards[c].code;
        }

        //resolve card effects
        for (let c in cards){
            let card = cards[c];
            let newLogData = ""
            switch (card.suit){
                case 'HEARTS':
                    player.heal(card.value);
                    break;
                case 'DIAMONDS':
                    player.shieldUp(card.value);
                    break;
                case 'SPADES':
                    let dmg = player.physAttack(card.value, spadesCardsPlayed);
                    spadesCardsPlayed ++;
                    if (enemy.takeDamage(dmg) < 0.05){
                        // TODO: Death animation
                        GUI.hand.updateLog(newLogData, true);
                        roundOver();
                        return;
                    }
                    break;
                case 'CLUBS':
                    let mdmg = player.magicAttack(card.value);
                    if (enemy.takeDamage(mdmg.value, true) < 0.05){
                        GUI.hand.updateLog(newLogData, true);
                        roundOver();
                        return;
                    }
                    break;
                default:
                    alert('Invalid suit played!');
            }
        }

        //remove card from hand
        if(!deck.handPile.removeCardsByCode(cardcodes)){
            alert('Invalid Card Played, Grats you broke the game!');
            return false;
        }
        //add card to discard
        deck.discardPile.addCardsByCode(cardcodes);

        if (cardsPlayed === maxCardsPerTurn){
            endPlayerTurn();
        }
        return true;
    }

    function endPlayerTurn(){
        playerTurn = false;
        //timeout to let the animations run
        setTimeout( function(){
            let dmg = enemy.takeTurn();
            // first check if the enemy died during its turn
            if (enemy.hp === 0){
                roundOver();
                return;
            }
            // then deal with any damage done by the enemy to the player
            if (dmg > 0){
                if(player.takeDamage(dmg) < 0.05){
                    gameOver();
                    return;
                }
            }
            setTimeout(function(){playerTurnStart();}, 200);
        }, 200);

    }

    function roundOver(){
        playerTurn = false;
        deck.drawPile.emptyPile(function(){
            deck.drawPile.addCards(deck.deckPile.cards);
            deck.handPile.emptyPile();
            deck.discardPile.emptyPile();
            rewardPhase();
        });
        // deck.drawPile.addCards(deck.discardPile.cards, ()=>{
        //     deck.drawPile.addCards(deck.handPile.cards,()=>{

        //         rewardPhase();
        //     });
        // });
        alert('You beat round ' + roundNum + '! congrats!');
        roundNum += 1;
    }

    function gameOver(){
        /*GUI.player.death();
        displayGameOver();*/
        alert('you died!');
        GUI.hand.updateLog("",true); // clears battle log
        $('#game-over-screen').removeClass('hidden');
        $('.battle').addClass('hidden');
        $( ".buttons-container").hide();
        $( ".message").hide();
        $( ".rounds").hide();
        $( "#game-over-screen img" ).effect( "bounce", "slow" );
        $( "#game-over-screen img" ).toggle( "explode" );

        setTimeout(function(){
          $( ".message" ).show( "fade" );
        },1200);

        setTimeout(function(){
          $( ".buttons-container" ).show( "fade" );
        },2000);

        setTimeout(function(){
          let roundMessage = "Round Reached: "+game.getRoundNumber();
          $( ".rounds" ).text(roundMessage);
          $( ".rounds" ).show( "fade" );
        },2800);

        deleteRecentSave();
        $.ajax({type: 'POST', url: '/scores/add', data: {value:game.getRoundNumber()}});
    }

    //--- reward phase ---
    function rewardPhase(){
        GUI.rewards.showRewardScreen();
        GUI.rewards.displayCurrentDeck();
        //battlePhaseStart();
    }

    function upgradeCards(cardcodes){
        deck.drawPile.removeCardsByCode(cardcodes);
        deck.deckPile.removeCardsByCode(cardcodes);

        let codes = cardcodes.split(',');
        let newCodes = '';
        for (let c in codes){
            const suit = codes[c].substr(-1);
            if (suit === 'H') {player.heal(2);}
            let value = codes[c].slice(0, -1);
            let newVal = value === 'A' ? 2 : parseInt(value) + 1;

            switch (newVal){
                case 10:
                    newVal = 0;
                    break;
                case 11:
                    newVal = 'J';
                    break;
                case 12:
                    newVal = 'Q';
                    break;
                case 13:
                    newVal = 'K';
                    break;
                default:
                    newVal = newVal;
                    break;
            }


            newCodes += newVal.toString() + suit + ',';
        }
        newCodes = newCodes.slice(0, -1);

        function nextRound(){
            GUI.rewards.hideRewardScreen();
            player.setPassiveStatsFromCards(self.getDeck());
            battlePhaseStart();
        }

        deck.drawPile.addCardsByCode(newCodes, nextRound);
        deck.deckPile.addCardsByCode(newCodes);
    }

    //--- setup ---
    function startGame(){
        playerTurn = false;
        GUI.loading.hide();
        battlePhaseStart();
    }
    function continueGame(){
        playerTurn = false;
        GUI.loading.hide();
        battlePhaseStart(true);
    }

    // Initialization goes here, for now we will call this for every new or restarted game
    // by making a new deck, we don't have to bother with emptying the piles
    function init(afterInit = function(){}){
        let setupDeck = function(deckInfo){
            deckUrl += deckInfo.deck_id + '/';
            deck.deckId = deckInfo.deck_id;
            deck.drawPile = new CardPile('drawPile', deckInfo.deck_id);
            deck.discardPile = new CardPile('discardPile', deckInfo.deck_id);
            deck.handPile = new CardPile('handPile', deckInfo.deck_id);
            deck.deckPile = new CardPile('deckPile', deckInfo.deck_id);
            afterInit();
        };
        getNewDeck(setupDeck);
    }

    /*
     * Request a new emptied deck from deckofcards
     * Passes the deckid and cards to the callback
     * @param callback, the callback function that is passed the deck data
     */
    function getNewDeck(callback){
        let url = apiUrl + 'new/draw/?count=52';
        ajaxRequest('GET', url, callback);
    }

    /**
     * setup a game with a player deck defined by a list of cardcodes
     * @param  {string} cardcodes, string separated list of cardcodes
     */
    function newGameFromCards(cardcodes){
        GUI.loading.show();
        starterDeckCode = cardcodes;
        resetGameVariables();
        function setupPlayer(){
            deck.deckPile.addCardsByCode(cardcodes);
            //add the cards into the draw pile
            deck.drawPile.addCardsByCode(cardcodes, function(){
                //setup player stats according to the cards
                player.setPassiveStatsFromCards(deck.drawPile.cards);
                player.hp = player.maxHP;
                startGame();
            });
        };

        init(setupPlayer);
    }
    function restartGameWithSameStartingDeck(){
        newGameFromCards(starterDeckCode);
    }

    /**
     * Loads a game's data into this GameApp
     * @param gamestate, the state of the game in the form of a JSON string
     */
    function loadGame(gamestatestring){
        //let gamestate = JSON.parse(gamestatestring).gameState;
        let gamestate = gamestatestring.gameState;
        GUI.loading.show();

        starterDeckCode = gamestate.starterdeckcode;
        resetGameVariables(gamestate.roundnum);

        function setupPlayer(){
            deck.deckPile.addCardsByCode(gamestate.deckpile, function(){
                deck.discardPile.addCardsByCode(gamestate.discardpile, function(){
                    deck.handPile.addCardsByCode(gamestate.handpile, function(){
                        deck.drawPile.addCardsByCode(gamestate.drawpile, function(){
                            //setup player stats according to the cards
                            player.setPassiveStatsFromCards(deck.deckPile.cards);
                            player.hp = gamestate.hp;
                            player.shield = gamestate.shield;

                            enemy = mobFactory.newMob(roundNum);
                            enemy.hp = gamestate.mobhp;
                            enemy.shield = gamestate.mobshield

                            continueGame();
                        });
                    });

                });
            });



        };

        init(setupPlayer);
    }

    /**
     * returns a stringified game state in the form of a JSON string
     * @return {[type]} [description]
     */
    function getGameState(){
        //for now, we just save card pile info, in the future we can
        //temporarily save
        //and a retrieve a guest's game via the deckId

        //TODO: we should eventually add a hash check or something
        let gamestate = {
            starterdeckcode: starterDeckCode,
            roundnum: roundNum,
            deckpile: deck.deckPile.getCardCodes(),
            drawpile: deck.drawPile.getCardCodes(),
            discardpile: deck.discardPile.getCardCodes(),
            handpile: deck.handPile.getCardCodes(),
            deckId: deck.deckId, // this won't get imported into a continued game but is a unique identifier for a game sesh
            hp: player.hp,
            shield: player.shield,
            mobhp: enemy.hp,
            mobshield: enemy.shield
        }
        return JSON.stringify({gameState:gamestate});
    }
    /**
     * Deletes the gamesave
     */
    function deleteRecentSave(){
        //TODO: stringify and parse game save data to be able to load games
        $.ajax({
          type: "DELETE",
          url: '/saveFiles/Save',
          success: function (data){console.log(data)},
          error: function(XMLHttpRequest, textStatus, errorThrown){console.log(textStatus)},
          contentType: "application/json; charset=utf-8",
        });
    }
    /**
     * saves the game to the server
     */
    function saveGame(gameState){
        //TODO: stringify and parse game save data to be able to load games
        $.ajax({
          type: "POST",
          url: '/saveFiles/addSave',
          data: gameState,
          success: function (){console.log("Autosaved!")},
          error: function(XMLHttpRequest, textStatus, errorThrown){console.log(textStatus)},
          contentType: "application/json; charset=utf-8",
        });
    }

    /**
     * pulls save data and initiates it
     */
    function continueSave(){
        //TODO: stringify and parse game save data to be able to load games
        $.ajax({
          type: "GET",
          url: '/saveFiles/getSave',
          success: function (data){loadGame(data)},
          error: function(XMLHttpRequest, textStatus, errorThrown){console.log(textStatus)},
        });
    }
}

/**
 * player class
 * @class
 */
function Player(){
    let self = this;
    //active stats; updated throughout a battle
    this.hp = 0;
    this.shield = 0;

    //passive stats; updated through upgrades
    this.maxHP = 10;
    this.startingShield = 0;
    this.atkMult = 1;
    this.magicPow = 1;

    //public methods
    this.heal = heal;
    this.shieldUp = shieldUp;
    this.physAttack = attack;
    this.magicAttack = magic;
    this.takeDamage = takeDamage;
    this.calcPassiveStatsFromCards = calcPassiveStatsFromCards;
    this.setPassiveStatsFromCards = setPassiveStatsFromCards;

    //private methods
    /**
     * translates a list of cards into player stats
     * @param  {[card]} cards, a list of card objs
     * @return {object} an obj of a set of passive stats
     */
    function calcPassiveStatsFromCards(cards){
        let suitTotals = [];

        //get the value total per suit
        for (let c in cards){
            let card = cards[c];
            if(!suitTotals[card.suit]){suitTotals[card.suit] = 0;}
            suitTotals[card.suit] += card.value;
        }

        //translate the value total per suit into stats
        //the main formulas for stats go here
        let stats = {};
        stats.maxHP = 10 + suitTotals['HEARTS']*2;
        stats.startingShield = round(suitTotals['DIAMONDS']*1.5,0);
        stats.atkMult = 1 + (suitTotals['SPADES'] * 0.18 / 2);
        stats.magicPow = suitTotals['CLUBS']*0.9;
        return stats;
    }

    /**
     * updates the player's passive stats according to a list of cards
     * @param {[card]} cards, a list of card objs
     */
    function setPassiveStatsFromCards(cards){
        let stats = calcPassiveStatsFromCards(cards);
        setPassiveStats(stats);
    }

    /**
     * updates the player's passive stats with a new set of stats
     * @param {object} newStats, an obj of a set of passive stats
     */
    function setPassiveStats(newStats){
        for (let stat in newStats){
            self[stat] = newStats[stat];
        }
    }

    /**
     * Increase hp of player up to maxHP
     * @param {number} healAmount, the amount to heal
     * @return {number} player hp after the heal
     */
    function heal(healAmount){
        const newHp = Math.min(self.maxHP, self.hp + healAmount);
        self.hp = newHp;

        let newLogData = 'Player healed '+round(healAmount)+' point(s).';
        GUI.hand.updateLog(newLogData, false);

        // Display heal
        GUI.player.updateHP(self.hp, self.maxHP);

        return self.hp;
    }

    /**
     * Increase shield of player
     * @param {number} shieldAmount, the amount to increase by
     * @return {number} player's shield after the boost
     */
    function shieldUp(shieldAmount){
        self.shield += shieldAmount;
        GUI.player.updateShield(round(self.shield));

        if (shieldAmount > 0) {
            GUI.player.displayShieldIncrease();
        }

        newLogData = 'Player strengthened shield by '+round(shieldAmount)+' point(s).';
        GUI.hand.updateLog(newLogData, false);
        return self.shield;
    }

    /**
     * returns the player's attack damage from a card value
     * @param  {number} value, the value of a spade card
     * @param  {number} chain,
     * @return {number} calculated attack damage value
     */
    function attack(value, chain = 0){
        let attackValue = value * Math.pow(self.atkMult, chain);
        newLogData = 'Monster physically damaged by '+round(attackValue)+' point(s).';
        GUI.hand.updateLog(newLogData, false);
        GUI.player.physicalAttack();
        return attackValue
    }

    /**
     * returns a player's magic attack from a card value
     * eventually there's going to be status effects and stuff
     * @param  {number} val, the value of a clubs card
     * @return {object} this'll probably be some sort of
     */
    function magic(value){
        //TODO: advance magic stuff
        let magic = {
            value: (self.magicPow / 3) + value,
            duration: Math.round(self.magicPow / 4),
            type: null
        };
        newLogData = 'Monster magically damaged by '+round(magic.value)+' point(s).';
        GUI.hand.updateLog(newLogData, false);
        return magic;
    }


    /**
     * reduce player hp and shield by damage
     * @param {number} damage, amount of damage
     * @param {boolean} piercing, whether or not the damage bypasses shield
     * @return {number}, hp remaining
     */
    function takeDamage(damage, piercing){
        damage = round(damage);
        if(piercing){
            self.hp = Math.max(0 , self.hp - damage);
        } else {
            self.shield -= damage;
            //if damage exceeds shield, then take away from hp
            if(self.shield < 0){
                self.hp = Math.max(0, (self.hp + self.shield));
                self.shield = 0;
            }
        }

        newLogData = 'Player damaged by '+round(damage)+' point(s).';
        GUI.hand.updateLog(newLogData, false);
        GUI.player.updateHP(round(self.hp), self.maxHP);
        GUI.player.updateShield(round(self.shield));
        GUI.player.takeDamage();
        return self.hp;
    }
}

/**
 * Class for a CardPile
 * contains the properties of a pile and methods to manipulate that pile
 * create an object with pile class by: let pile = new CardPile()
 * @class
 * @param pileName, name of the pile
 * @param deckId, the id of the deck of the pile
 * @param cards, optionally you can create a pile with an array of cards
 */
function CardPile(pileName, deckId, cards = []){
    // Private properties
    let pileUrl = apiUrl + deckId + '/pile/' + pileName + '/';
    let self = this;
    // Public properties
    this.pileName = pileName;
    this.deckId = deckId;
    if(cards.length > 0){
        addCards(cards);
    }
    else{
        this.cards = cards;
        this.remaining = cards.length;
    }

    // Public methods
    this.shuffle = shuffle;
    this.addCards = addCards;
    this.addCardsByCode = addCardsByCode;
    this.draw = draw;
    this.removeCardsByCode = removeCardsByCode;
    this.emptyPile = function(callback){removeCardsByCode(getCardCodes(),callback);};
    this.savePileInfo = savePileInfo;
    this.getCardCodes = getCardCodes;

    // Private methods
    /**
     * Gets the list of cards in the pile via the api
     * @param {Function} callback, the callback function
     * @param {boolean} sorted, whether the cards should be sorted or not, true by default
     */
    function getPileInfo(callback, sorted = true){
        let url = pileUrl + 'list/';
        function sendPileDataToCallback(data){
            let pileData = data.piles[self.pileName];
            if (typeof(pileData)==='undefined'){
                callback({remaining:0, cards : []});
            }
            else{
                if (sorted){
                    pileData.cards = sort(convertValuesToIntGiven(pileData.cards));
                }
                callback(pileData);
            }

        }
        ajaxRequest('GET', url, sendPileDataToCallback);
    }

    /**
     * Saves the cards remaining and cards objects from api to the CFardPile's local properties
     * @param {boolean} sorted, whether the local cards should be sorted or not, true by default
     */
    function savePileInfo(callback = function(){}, sorted = true){
        function pileCallback(data){
            self.remaining = data.remaining;
            self.cards = data.cards;
            callback(data);
        }
        getPileInfo(pileCallback, sorted);
    }

    /**
     * returns a comma-separated list of the cardcodes of the cards
     * @return {string} comma-separted list of cardcodes
     */
    function getCardCodes(){
        let cardcodes = '';
        for (let card in self.cards){
            if (cardcodes.length) {cardcodes += ',';}
            cardcodes += self.cards[card].code;
        }
        return cardcodes;
    }

    /**
     * Compares the local properties of the pile to those in the api
     * if the remaining card value or if the content of cards (unordered) don't match
     * return false, otherwise returns true.
     * @return {Boolean}
     */
    function isValid(){
        //TODO: this may be useful in the future for checking if the player has tried hacking the piles
        return true;
    }

    /**
     * Shuffles the cards in this pile in the api
     * the cards in this local cardPile obj are not shuffled
     * @param {Function} callback, optional callback
     */
    function shuffle(callback){
        let url = pileUrl + 'shuffle/';
        ajaxRequest('GET', url, callback);
    }

    /**
     * Adds an array of card objs to the pile
     * @param {[card]} cards, an array of card objs
     */
    function addCards(cards, callback = function(){}){
        let cardcodes = '';
        for (let c in cards){
            if (c!==0) {cardcodes += ',';}
            cardcodes += cards[c].code;
        }
        addCardsByCode(cardcodes, callback);
    }

    /**
     * Adds cards to the pile via card codes
     * @param {string} cardcodes, a comma separated list of card codes eg. 4H,QD,AS
     */
    function addCardsByCode(cardcodes, callback = function(){}){
        if (cardcodes ==="") {
            savePileInfo(callback);
            return;
        }
        let url = pileUrl + 'add/?cards=' + cardcodes;
        ajaxRequest('GET', url, function(){savePileInfo(callback);});
    }

    /**
     * Shuffles the pile, then draws a number of cards from the pile
     * @param {number} numberOfCards, the number of cards to draw
     * @param {function} callback, the callback function gets given the set of cards drawn
     */
    function draw(numberOfCards, callback){
        //shuffle the pile before you draw
        //or else players can list the cards ahead of time
        //and know what to expect
        let url = pileUrl + 'draw/?count=' + numberOfCards;
        function drawSaveAndReturnCards(){
            ajaxRequest('GET', url, function(data){
                savePileInfo();
                callback(data.cards);
                }
            );

        }
        shuffle(drawSaveAndReturnCards);
    }

    /**
     * Removes cards from the pile that are specified by the cardcodes
     * @param {string} cardcodes, a comma separated list of card codes eg. 4H,QD,AS
     * @return {boolean} whether or not the specified cards were found in the pile
     */
    function removeCardsByCode(cardcodes, callback=function(){}){
        if(cardcodes.length === 0){return;}
        let codes = cardcodes.split(',');
        for (let c in codes){
            let flag = false;
            for (let card in self.cards){
                if (self.cards[card].code === codes[c]){
                    flag = true;
                    self.cards.splice(card,1);
                    break;
                }
            }
            if (flag === false){
                alert('attempted to remove an invalid card from ' + self.pileName);
                return false;
            }
        }

        let url = pileUrl + 'draw/?cards=' + cardcodes;
        ajaxRequest('GET', url, function(){savePileInfo(callback);});
        return true;
    }
}

/**
 * This class is a reference as to what a "card" obj looks like
 * Or at least you can see what the relavent properties of a card are
 * @class
 */
class Card{
    constructor(code){
        this.code = code;   // eg. "KH" for king of hearts; "8C" for 8 of clubs
        this.value = '';    // eg. "KING"; "8"
        this.suit = '';     // eg. "HEARTS"; "CLUBS"
        this.image = '';    // a url for a card image
    }
}

////////////////////////
//--- MONSTER CODE ---//
////////////////////////

function MonsterFactory(gameApp){
    let game = gameApp;

    // TODO: if a type is not specified, a type is chosen randomly that is appropriate for the lvl
    function newMob(lvl, type = ""){
        let monster = new BaseMob(game, lvl);
        setTimeout(function(){GUI.enemy.spawn();},500);

        GUI.enemy.updateHP(monster.hp, monster.maxHP);
        GUI.enemy.updateShield(monster.shield);
        return monster;
    }
    this.newMob = newMob;
}

/**
 * @class the base enemy class
 */
class BaseMob {
    constructor(gameApp, lvl){
        this.name = 'Card Beast';
        this.lvl = lvl;
        this.atk = 2 + lvl*0.75;
        this.maxHP = 10 + lvl*2;
        this.gameApp = gameApp;

        this.hp = this.maxHP;
        this.shield = 0;
        this.statuses = [];
    }

    /**
     * The mob will take its turn.
     * this method will resolve whatever needs to happen on its turn,
     * which includes healing, status effects, etc.
     * @return {number} the amount of damage to do to the player
     */
    takeTurn(){
        GUI.enemy.physicalAttack();
        return this.atk;
    }

    /**
     * the mob takes damage, first from shield then hp, unless piercing is specified
     * this method pretty much matches the player version
     * @param  {number} damage, amount of damage
     * @param  {boolean} piercing, whether or not the damage ignores shield
     * @return {number}, the mob's remaining hp
     */
    takeDamage(damage, piercing = false){
        damage = round(damage);
        const beforeDamageMobHP = this.hp;
        let trueDmg; // dmg to deal to hp
        let shieldDmg; // dmg to deal to shield
        if(piercing){
            this.hp = Math.max(0 , this.hp - damage);
            trueDmg = damage;
            shieldDmg = 0;
        } else {
            if (this.shield > 0){ // if there is shield
                //if damage exceeds shield
                if (this.shield < damage){
                    shieldDmg = this.shield;
                    trueDmg = damage - this.shield;
                    this.shield = 0;
                }
                else{
                    shieldDmg = damage;
                    this.shield -= damage;
                }
            }
            else { //if there is no shield
                trueDmg = damage;
                shieldDmg = 0;
            }

            this.hp = Math.max(0, (this.hp - trueDmg));
        }

        // Display enemy taking damage
        GUI.enemy.updateHP(round(this.hp), this.maxHP);
        GUI.enemy.updateShield(this.shield);

        if (this.hp < 0.05) this.die();

        GUI.enemy.takeDamage();
        return this.hp;
    }

    die(){
        //do death animation here
        GUI.enemy.death();
    }
}


/////////////////////////////
//--- UTILITY FUNCTIONS ---//
/////////////////////////////
/**
 * Sends an ajax request and calls the callback with the data
 * upon successful response
 * @param {string} type, 'GET' 'POST' etc.
 * @param {string} url, url to send the request to
 * @param {Function} callback, callback function for the response data
 */
function ajaxRequest(type, url, callback){
    $.ajax({
        type: type,
        url: url,
        success:function(data){
            if (callback !== undefined){
                callback(data);
            }
        },
        error: function(xhr, error) {
            console.log('Something went wrong: ', error);
        }
    });
}


/**
 * Return the list of cards with values converted to int
 * @param cards, list of card objects
 */
function convertValuesToIntGiven(cards) {
    return cards.map(function(card) {
        // Special conversions for non-numeral cards
        if (card.value === 'ACE') {
            card.value = 1;
        } else if (card.value === 'JACK') {
            card.value = 11;
        } else if (card.value === 'QUEEN') {
            card.value = 12;
        } else if (card.value === 'KING') {
            card.value = 13;
        } else { // Convert string to int
            card.value = parseInt(card.value);
        }

        return card; // Return modified card
    });
}

/**
 * Return list containing all cards sorted by suit and value.
 * @param cards, list of cards
 */
function sort(cards) {
    // Separate cards by suit in their own array
    const spades = cards.filter(function(card) {
        return card.suit === 'SPADES';
    });
    const clubs = cards.filter(function(card) {
        return card.suit === 'CLUBS';
    });
    const hearts = cards.filter(function(card) {
        return card.suit === 'HEARTS';
    });
    const diamonds = cards.filter(function(card) {
        return card.suit === 'DIAMONDS';
    });

    // Sort cards in piles by value
    const sortedSpades = spades.sort(function(card, other) {
        return card.value - other.value;
    });

    const sortedClubs = clubs.sort(function(card, other) {
        return card.value - other.value;
    });

    const sortedHearts = hearts.sort(function(card, other) {
        return card.value - other.value;
    });

    const sortedDiamonds = diamonds.sort(function(card, other) {
        return card.value - other.value;
    });

    // Merge sorted cards
    return sortedSpades.concat(sortedClubs, sortedHearts, sortedDiamonds);
}
