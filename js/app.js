/////////////// PROPERTIES ///////////////

var prop = {
    difficulty: {countOfBugs: 1, lives: 3 }, // bugs = 2 - medium; 1 - easy; 3 - hard;
    image: {width: 101, height: 80},
    canvas: {width: 505, height: 606},
    player: {speed: 83, firstX: 200, firstY: 350},
    enemy: {speed: getRandomValue(120, 30), firstX: -101, firstY: getRandomValue(220, 50), sprite: "images/enemy-bug.png"},
    level: { scenes: [
        {l:9}, 
        {image: 'images/enemy-bug.png',      boss: false, vertical: false},
        {image: 'images/enemy-bug-dark.png', boss: false, vertical: false}, 
        {image: 'images/enemy-bug-red.png',  boss: false, vertical: false},
        {image: 'images/enemy-bug-evil.png', boss: false, vertical: false},
        {image: 'images/new-bug.png',        boss: true,  vertical: false},
        {image: 'images/scary-spider.png',   boss: true,  vertical: false},
        {image: 'images/enemy-bug-evil-vertical.png', boss: false, vertical: true},
        {image: 'images/enemy-bug-new-vertical.png',  boss: false, vertical: true},
        {image: 'images/scary-spider.png',            boss: true,  vertical: true},
    ],
    startFromLevel: 1 }
}

//Superclass - moving entity
var Instance = function(PropsObj){
    this.x = PropsObj.firstX;
    this.y = PropsObj.firstY;
    this.speed = PropsObj.speed;
    this.sprite = PropsObj.sprite || "";
  };

/////////////// ENEMY ///////////////
var Enemy = function(PropsObj) {
    Instance.call(this, PropsObj);
    // this.sprite = 'images/enemy-bug.png';
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started
    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.

    if(prop.level.scenes[level.levels].vertical) { //prop.level.scenes[level.levels].vertical == true
        this.y += this.speed * dt;
        if(this.y >= prop.canvas.height) { this.y = -101; } 
    }
    if(!prop.level.scenes[level.levels].vertical) {
        this.x += this.speed * dt;
        if(this.x >= prop.canvas.width) { this.x = -prop.image.width; } 
    }
    // Check for collision with enemies or barrier-walls
    checkCollision(this, dt);
};

checkCollision = function(enemy, dt) {
    // Check the intersection of two rectangles (player and this enemy)
    if (
        player.sprite != player.spriteDead &&
        player.sprite != player.spriteInvisible &&
            player.x < (enemy.x + prop.image.width)  &&
            (player.x + prop.image.width)  > enemy.x &&
             player.y < (enemy.y + prop.image.height) && 
            (player.y + prop.image.height) > enemy.y 
        ) { 
            level.die();
            if(level.lives == 0){ 
                player.sprite = player.spriteRip;
            } 
                setTimeout(function(){
                    player.resetPlayerLocation();
                }, 300);            
            //console.log('You die');
    }
  };

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};
// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.

/////////////// PLAYER /////////////////
var Player = function(PropsObj){
    Instance.call(this, PropsObj);
    this.sprite          = 'images/char-boy.png';

    this.spriteDefault   = 'images/char-boy.png';
    this.spriteDead      = 'images/char-boy-dead.png';
    this.spriteInvisible = 'images/char-boy-invisible.png';
    this.spriteRip       = 'images/char-boy-rip.png';
    this.blocked = false;
}

Player.prototype.resetPlayerLocation = function() {
    if(level.lives > 0) {
        this.sprite = this.spriteInvisible;
        var self = this;
   setTimeout(function(){
        self.x = prop.player.firstX;
        self.y = prop.player.firstY;
        self.sprite = self.spriteDefault;
        self.blocked = false; 
    }, 1000);  
    
    }
}

Player.prototype.update = function(dt){
    //if player reach top
    if (this.y <= 0 ) { 
        this.blocked = true;
        level.win();
        this.resetPlayerLocation(); 
        //console.log('You win');
    }
    this.x > 400 && level.lives != 0 && (this.x = 400);
    this.y > 440 && (this.y = 440);
    this.x < -0  && (this.x = 0);
    this.y < 71  && (this.y = 71);
    
}

Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Player.prototype.gameEnd = function(){
    this.sprite = this.spriteDead; 
    this.blocked = true;
}

Player.prototype.emulateButtonsPushing = function(keyboardInput){
    var el = document.getElementById(keyboardInput);
    el.focus();
    setTimeout(function(){  el.blur()  }, 100);
}

Player.prototype.handleInput = function(keyboardInput){
    if(!this.blocked) {
        this.emulateButtonsPushing(keyboardInput);
        switch (keyboardInput) {
            
        case 'left':
            this.x -= this.speed; break;
        case 'right':
            this.x += this.speed; break;
        case 'down':
            this.y += this.speed; break;
        case 'up':
            this.y -= this.speed; break;
        }
    }
}

/////////////  LEVEL ///////////////
var Level = function(player, lives, levels) {
    this.player = player;
    this.lives = lives;
    this.gameover = false;
    this.levels = levels;    
};

Level.prototype.render = function() {
    ctx.font = 'bold 48px arial';
    ctx.drawImage(Resources.get('images/Heart.png'), 0, 10);
    ctx.fillText(this.lives, 40, 110);
    ctx.drawImage(Resources.get('images/Star.png'), 405, -10);
    ctx.fillText(this.levels, 440, 110);
};

Level.prototype.win = function() {
    if (!player.blocked || player.sprite != player.spriteDead || player.sprite != player.spriteInvisible){
        ++this.levels;
        createEnemies(this);
    }

};

Level.prototype.die = function() {
    if(this.lives == 0) {
        player.blocked = true;
        this.gameover = true;
        player.gameEnd(); 
    }
    else { 
        --this.lives; 
        player.gameEnd();
        player.blocked = true;
    }
    
};

var level = new Level(player, prop.difficulty.lives, prop.level.startFromLevel);


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
var allEnemies = [];

function createOneEnemy(level){
    var firstX, firstY;
    if(prop.level.scenes[level.levels].vertical) {
        firstX = getRandomValue(250, 50, level.levels);
        firstY = getRandomValue(-101, 0, level.levels);
    } else {
        firstX = prop.enemy.firstX;
        firstY = getRandomValue(220, 50, level.levels);
    }
    var speed  = getRandomValue(130, 30, level.levels);
    var sprite = prop.level.scenes[level.levels].image;
    var enemyObj  = {
        speed:  speed, 
        firstX: firstX, 
        firstY: firstY, 
        sprite: sprite 
    };
    return enemyObj;
}

function createEnemies(level){
    allEnemies.length = 0; //del enemies from array
    var bugNumber = prop.difficulty.countOfBugs * level.levels;
    if (prop.level.scenes[level.levels].boss) {
        level.levels == 5 && (bugNumber = 3)
        level.levels == 6 && (bugNumber = 1)
    }
    for (var i = 0; i < bugNumber; i++){
        allEnemies.push(new Enemy(createOneEnemy(level)));
    }
}

createEnemies(level);

// Place the player object in a variable called player
var player = new Player(prop.player);


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keydown', function(e) {
    if(!player.blocked) {
        var allowedKeys = {
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down'
        };
        player.handleInput(allowedKeys[e.keyCode]);
    }
});
var controls = ["left", "up", "right", "down"];
for(var i = 0; i < controls.length; i++){
    listenButtons(controls[i]);
}
function listenButtons(direction) {
    var el = document.getElementById(direction);
    el.addEventListener("click", function(e){ 
        if(!player.blocked) {
            player.handleInput(e.target.id);
        }
    }, false );
}

document.getElementById("reset").addEventListener("click", function(e){ 
    window.location.reload();}, false );

function getRandomValue(max, min, levels){
    return Math.random() * max + min;
}



