/* Helpers for this file only */
/**
 * Format HP to: current/max. ex: 9/10
 * @param currentHP, int
 * @param maxHP, int
 */
function formatHP(currentHP, maxHP) {
  const formattedHP = round(currentHP).toString() + '/' + maxHP.toString();
  return formattedHP;
}

/**
 * Return a percentage string of form "{int}%". ex: "66%"
 * @param currentHP, int
 * @param maxHp, int
 */
function formatPercentHPString(currentHP, maxHp) {
  return ((currentHP / maxHp) * 100).toString() + '%';
}

/**
 * Contains all animations on battle display to apply to participants
 * @param containerClass, string either 'player' or 'monster'
 * NOTE: type must match class name containing battle participants elements
 */
function BattleParticipantDisplay(containerSelector) {
  this.containerSelector = containerSelector; // Defines who's display to change
}

/**
 * Display current hp ouy of max hp and apply delta.
 * NOTE: Doesn't do animation on the very first time a partitipant's hp is shown
 * @param currentHP, int
 * @param maxHP, int
 * @param delta, can never be 0
 *  +/- int applied to currentHP.
 *  positive val increases red bar.
 *  negative val decreases red bar, reveals pink bar of prev health,
 *    then decreases pink bar to match red.
 */
BattleParticipantDisplay.prototype.updateHP = function updateHP(newHP, maxHP) {
  let curBarWidth = $(this.containerSelector + ' .hp .bar').width();
  let curTotalBarWidth = $(this.containerSelector + ' .hp .bar').parent().width();
  let curWidth;
  if(curBarWidth === 0 || curTotalBarWidth === 0){
    curWidth = 0;
  }
  else{
    curWidth = $(this.containerSelector + ' .hp .bar').width() / $(this.containerSelector + ' .hp .bar').parent().width() * 100;
  }

  // Calculate width percentage
  const formattedHPPercentage = formatPercentHPString(newHP, maxHP);

  const delta = (newHP/maxHP)*100 - curWidth;

  // Update text
  replaceAllElementTextGiven(this.containerSelector + ' .hp .text', formatHP(newHP, maxHP));

  // Update red bar to % of hp
  setElementWidth(this.containerSelector + ' .hp .bar', formattedHPPercentage);

  if (delta > 0) { // Just move pink bar right away
    setElementWidth(this.containerSelector + ' .hp .prev', formattedHPPercentage);
  } else { // Delay pink bar movement to animate cool damage taken effect
    const _this = this; // Save reference to "this" for async call

    setTimeout(
      function() {
        setElementWidth(_this.containerSelector + ' .hp .prev', formattedHPPercentage);
      },
      1000
    );
  }
};

BattleParticipantDisplay.prototype.updateShield = function updateHP(newShield) {
  let shieldContainer = this.containerSelector + ' .shield span';
  $(shieldContainer).text(round(newShield));
};

// Display increase in shield
BattleParticipantDisplay.prototype.displayShieldIncrease = function() {
    const _this = this;

    $(this.containerSelector + ' .shield').effect('puff', null, null,
        function() { // Remove effect, this redeisplaying shield
            $(_this.containerSelector + ' .shield').removeAttr( "style" ).hide().fadeIn();
        });
};

// Display physical attack animation.
BattleParticipantDisplay.prototype.physicalAttack = function() {
  const _this = this; //
  const animationDuration = 750; // ms of animation

  if (this.containerSelector.indexOf('player') !== -1) { // Player attack animation
    $(this.containerSelector + ' .sprite').toggleClass('player-physical-attack');

    setTimeout(function () { // Remove animation so animation can be rerun
        $(_this.containerSelector + ' .sprite').toggleClass('player-physical-attack');
    }, animationDuration);
  } else if (this.containerSelector.indexOf('monster') !== -1) { // Monster attack animation
    $(this.containerSelector + ' .sprite').toggleClass('mob-physical-attack');

    setTimeout(function () { // Remove animation so animation can be rerun
        $(_this.containerSelector + ' .sprite').toggleClass('mob-physical-attack');
    }, animationDuration);
  }
};

// Make sprite shake when taking damage
BattleParticipantDisplay.prototype.takeDamage = function() {
  $(this.containerSelector + ' .sprite').effect('shake', { distance: 5 });
};
// Spawn animation
BattleParticipantDisplay.prototype.spawn = function() {
  $(this.containerSelector + ' .sprite').show('fade');
};
// Fade out sprite when dead
BattleParticipantDisplay.prototype.death = function() {
  $(this.containerSelector + ' .sprite').effect('explode', { pieces: 4 });
};

const playerDisplay = new BattleParticipantDisplay('.player');
const monsterDisplay = new BattleParticipantDisplay('.monster');

/** FOR TESTING **/

const testPlayer = {
  currentHP: 10,
  maxHP: 10
} ;

$('#apply-heal-up-to-max').on('click', function() {

  playerDisplay.updateHP(testPlayer.currentHP, testPlayer.maxHP, 1);
  testPlayer.currentHP += 1;
});

$('#apply-heal-above-max').on('click', function() {

  playerDisplay.updateHP(testPlayer.currentHP, testPlayer.maxHP, 11);
  testPlayer.currentHP += 11;
});

$('#apply-damage-1').on('click', function() {

  playerDisplay.updateHP(testPlayer.currentHP, testPlayer.maxHP, -1);
  testPlayer.currentHP -= 1;
});

$('#apply-damage-5').on('click', function() {

  playerDisplay.updateHP(testPlayer.currentHP, testPlayer.maxHP, -5);
  testPlayer.currentHP -= 5;
});

$('#playerPhys').on('click', function() {
    playerDisplay.physicalAttack();
});

$('#playerShield').on('click', function() {
    playerDisplay.displayShieldIncrease();
});

$('#monPhys').on('click', function() {
    monsterDisplay.physicalAttack();
});

$('#monDeath').on('click', function() {
    monsterDisplay.death();
});

$('#playerShakeShield\n').on('click', function() {
    playerDisplay.displayShieldDecrease();
});
