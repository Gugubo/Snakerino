var canvas = document.getElementById("mycan");
var gc = canvas.getContext("2d");
var lastDate = new Date();
var timeSinceLastTick = 0;
var TIMEBETWEENTICKS = 0.1;
var x = 0;
var y = 0;
var CELLSIZE = 20;
var GRIDWIDTH = 30;
var GRIDHEIGHT = 20;
var RAND = false;
var ANFANGSLAENGE = 7;
var laenge = ANFANGSLAENGE;
var SPACE = 32;
var LEFT = 37;
var UP = 38;
var RIGHT = 39;
var DOWN = 40;
var M = 77;
var P = 80;
var dir = RIGHT;
var foodX = 0;
var foodY = 0;
var foodColor = 0;
var segments = [];
var gameOver = false;

var eat = [new Audio("eat0.wav"),new Audio("eat1.wav"),new Audio("eat2.wav")];
var die = new Audio("gameover.wav");

var muted = false;
var paused = false;

function randomNumber(range) {
    return Math.floor(Math.random() * range);
}

kongregateAPI.loadAPI(function(){
  window.kongregate = kongregateAPI.getAPI();
  // You can now access the Kongregate API with: kongregate.services.getUsername(), etc
  // Proceed with loading your game...
});

function pickColor() {
   var r = randomNumber(100);
    if (r<5){
        return 2;
    } else if (r<20){
        return 1;
    } else {
        return 0;
    }
}

function placeFood() {
    while (true) {
        foodX = randomNumber(GRIDWIDTH);
        foodY = randomNumber(GRIDHEIGHT);
        
        foodColor = pickColor();
        var isOnSnake = false;
        for (var i = 0; i < segments.length; i++) {
            if (foodX === segments[i].x && foodY === segments[i].y) {
                isOnSnake = true;
            }
        }
        if (!isOnSnake) {
            break;
        }
    }
}
placeFood();

function Segment(x, y) {
    this.x = x;
    this.y = y;
    segments.push(this);
}
for (var i = 0; i < ANFANGSLAENGE; i++) {
    new Segment(-100, -100);
}
var controlQueue = [];
document.addEventListener("keydown", function (event) {
    var kc = event.keyCode;
    event.preventDefault();
    if (kc===P){
        if (paused){
           paused =false;
        } else {
            paused = true;
        }
    } else if (controlQueue.length < 5 && (kc === LEFT || kc === RIGHT || kc === UP || kc === DOWN)) {
        controlQueue.push(kc);
    } else if (kc === SPACE) {
        TIMEBETWEENTICKS = 0.1;
        x = 0;
        y = 0;
        laenge = ANFANGSLAENGE;
        dir = RIGHT;
        foodX = 0;
        foodY = 0;
        foodColor = 0;
        segments = [];
        gameOver = false;
        placeFood();
        for (var i = 0; i < ANFANGSLAENGE; i++) {
            new Segment(-100, -100);
        }
        controlQueue = [];
    } else if (kc===M){
        if (muted){
            muted =false;
        } else {
            muted = true;
        }
    }
});

function updateLoop() {
    var thisDate = new Date();
    var deltaTime = (thisDate.getTime() - lastDate.getTime()) / 1000;
    lastDate = thisDate;
    timeSinceLastTick += deltaTime;
    if (!gameOver &&!paused && timeSinceLastTick > TIMEBETWEENTICKS) {
        //timeSinceLastTick -= TIMEBETWEENTICKS;
        timeSinceLastTick = 0;
        gc.fillStyle = "#000042";
        gc.fillRect(0, 0, canvas.width, canvas.height);
        if (controlQueue.length > 0) {
            switch (controlQueue[0]) {
            case (LEFT):
                if (dir === UP || dir === DOWN) {
                    dir = LEFT;
                }
                break;
            case (RIGHT):
                if (dir === UP || dir === DOWN) {
                    dir = RIGHT;
                }
                break;
            case (DOWN):
                if (dir === LEFT || dir === RIGHT) {
                    dir = DOWN;
                }
                break;
            case (UP):
                if (dir === LEFT || dir === RIGHT) {
                    dir = UP;
                }
                break;
            }
            controlQueue.splice(0, 1);
        }
        switch (dir) {
        case (LEFT):
            x--;
            break;
        case (RIGHT):
            x++;
            break;
        case (UP):
            y--;
            break;
        case (DOWN):
            y++;
            break;
        }
        if (!RAND) {
            if (x < 0) {
                x = GRIDWIDTH - 1;
            }
            if (x >= GRIDWIDTH) {
                x = 0;
            }
            if (y < 0) {
                y = GRIDHEIGHT - 1;
            }
            if (y >= GRIDHEIGHT) {
                y = 0;
            }
        }
        else {
            if (x < 0 || x >= GRIDWIDTH || y < 0 || y >= GRIDHEIGHT) {
                gameOver = true;
            }
        }
        for (var i = 0; i < segments.length; i++) {
            if (segments[i].x === x && segments[i].y === y) {
                gameOver = true;
            }
        }
        for (var i = segments.length - 1; i > 0; i--) {
            segments[i].x = segments[i - 1].x;
            segments[i].y = segments[i - 1].y;
        }
        segments[0].x = x;
        segments[0].y = y;
        if (x === foodX && y === foodY) {
            if (!muted){
            eat[foodColor].play();
            }
            new Segment(-100, -100);
            if (foodColor>0){
                //PURPLE OR GOLDEN
                new Segment(-100, -100);
                new Segment(-100, -100);
                laenge+=2;
            }
            if (foodColor>1){
                //ONLY GOLDEN
                new Segment(-100, -100);
                new Segment(-100, -100);
                laenge+=2;
            }
            laenge++;
            placeFood();
        }
        for (var i = 0; i < segments.length; i++) {
            if (i % 4 == 0) {
                gc.fillStyle = "#5FE237";
            }
            else if (i % 3 == 0) {
                gc.fillStyle = "#08F917";
            }
            else if (i % 2 == 0) {
                gc.fillStyle = "#5FE237";
            }
            else {
                gc.fillStyle = "#8DFC09";
            }
            gc.fillRect(segments[i].x * CELLSIZE, segments[i].y * CELLSIZE, CELLSIZE, CELLSIZE);
        }
        if (foodColor === 0) {
            //RED
            gc.fillStyle = "#ff0000";
        }
        else if (foodColor === 1) {
            //PURPLE
            gc.fillStyle = "#8542FC";
        }
        else {
            //YELLOW
            gc.fillStyle = "#FCE912";
        }
        gc.fillRect(foodX * CELLSIZE, foodY * CELLSIZE, CELLSIZE, CELLSIZE);
        gc.font = "30px serif";
        gc.fillStyle = "#ffffff";
        gc.fillText(laenge, 5, 25);
        if (gameOver) {
            if (!muted){
            die.play();
            }
            gc.fillText("Game over!", 215, 170);
            gc.font = "24px serif";
            gc.fillText("(SPACE to restart)", 200, 220);
            kongregate.stats.submit('Score', laenge);
        }
    }
}
window.setInterval(updateLoop, 1);