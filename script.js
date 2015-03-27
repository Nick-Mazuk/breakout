var animate = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function(callback) { window.setTimeout(callback, 1000/60) };
var canvas = document.createElement('canvas');
var height = 600;
var width = 1200;
canvas.height = height;
canvas.width = width;
var context = canvas.getContext("2d");
var playerSpeed_0 = 14;
var playerSpeed = 15;
var ballSpeed_0 = 9;
var ballSpeed = 10;
var blockArray = [];
var lives = 3;
var level = 1;
var alive = true;
var firstBall = true;

window.onload = function() {
    document.getElementById("board").appendChild(canvas);
    start();
    animate(step);
}

var step = function() {
    update();
    render();
    if(alive)
        animate(step);
}

function update() {
    player.update();
    ball.update(blockArray);
}

function render() {
	context.fillStyle = "#000000";
    context.fillRect(0, 0, width, height);
    player.render();
    ball.render();
    renderBlocks(blockArray);
    if(!alive) {
        context.font="75px 'Press Start 2P'";
        context.fillStyle = "#FF0000";
        context.fillText("Game Over",267,375);
        context.font="20px 'Press Start 2P'";
        context.fillText("Refresh to play again",400,400);
    }
}

function Block(x,y,width,height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.x_speed = 0;
    this.y_speed = 0;
}

function renderBlocks(array) {
    for(i = 0; i < array.length; i++) {
        array[i].render();
    }
}

Block.prototype.render = function() {
    context.fillStyle = "#FFFFFF";
    context.fillRect(this.x, this.y, this.width, this.height);
    context.strokeStyle = "#000000";
    context.strokeRect(this.x, this.y, this.width, this.height);
}

function Player() {
    this.Block = new Block((width - 200)/2, 580, 200, 10);
}

Player.prototype.move = function (x,y) {
    this.Block.x += x;
    this.Block.y += y;
    this.Block.x_speed = x;
    this.Block.y_speed = y;

    if (this.Block.x < 0) { //all the way to the left
        this.Block.x = 0
        this.Block.x_speed = 0;
    } else if (this.Block.x + this.Block.width > width) { //all the way to the right
        this.Block.x = width - this.Block.width;
        this.Block.x_speed = 0;
    }
}

Player.prototype.render = function() {
    this.Block.render();
}

Player.prototype.update = function() {
    for(var key in keysDown) {
        var value = Number(key);
        if(value == 37) { //left arrow
            this.move(-playerSpeed, 0);
        } else if (value == 39) { //right arrow
            this.move(playerSpeed, 0);
        } else {
            this.move(0,0);
        }
    }
}

var player = new Player();

function Ball(x,y) {
    this.x = x;
    this.y = y;
    this.x_speed = 0;
    this.y_speed = ballSpeed;
    this.radius = 5;
}

Ball.prototype.render = function() {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 2*Math.PI, false);
    context.fillStyle = "#FFFFFF";
    if(alive)
        context.fill();
}

Ball.prototype.update = function(array) {
    this.x += this.x_speed;
    this.y += this.y_speed;
    var top_x = this.x - this.radius;
    var top_y = this.y - this.radius;
    var bottom_x = this.x + this.radius;
    var bottom_y = this.y + this.radius;

    if (top_y < (player.Block.y + player.Block.height) && bottom_y > player.Block.y && top_x < (player.Block.x + player.Block.width) && bottom_x > player.Block.x) {
        //ball hit player's paddle
        sectionWidth = player.Block.width / (2 * ballSpeed - 3);
        var x = (this.x - (player.Block.x + player.Block.width/2)); //changes ball horizontal speed based on where it hits the padddle
        this.x_speed = x / sectionWidth;
        this.y_speed = -Math.sqrt(Math.pow(ballSpeed,2) - Math.pow(this.x_speed,2));
        this.y += this.y_speed;
        firstBall = false;
    } else if (top_x <=0) {
        this.x_speed = -this.x_speed;
    } else if (bottom_x >= width) {
        this.x_speed = -this.x_speed;
    } else if (top_y <= 0) {
        this.y_speed = -this.y_speed;
    } else if (top_y >= height) {
        ballLost();
    } else {
        for(i = 0; i < array.length; i++) {
            var block_i = array[i];
            if(bottom_x > block_i.x && top_x < block_i.x + block_i.width) {
                if(bottom_y > block_i.y && top_y < block_i.y + block_i.height) {
                    ratio = block_i.height / block_i.width;
                    var x = this.x - (2 * block_i.x + block_i.width) / 2;
                    var y = this.y - (2 * block_i.y + block_i.height) / 2;
                    if(Math.abs(y/x) < ratio) {
                        this.x_speed = -this.x_speed;
                        array.splice(i,1);
                    } else {
                        this.y_speed = -this.y_speed;
                        array.splice(i,1);
                    }
                }
            }
        }
        if(array.length == 0) {
            newLevel();
        }
    }
}

var ball = new Ball(width/2,height/2);

var keysDown = {};

window.addEventListener("keydown", function(event) {
    keysDown[event.keyCode] = true;
})

window.addEventListener("keyup", function(event) {
    delete keysDown[event.keyCode];
})

function ballLost() {
    if(!firstBall && lives != "Never Lose")
        lives--;
    document.getElementById("lives").innerHTML = "Lives: " + lives;
    ball.x = width / 2;
    ball.y = height/2;
    ball.x_speed = 0;
    ball.y_speed = ballSpeed;
    firstBall = true;
    if(lives == 0) {
        gameOver();
    }
}

function start() {
    var layers = 10;
    if(level < 10)
        layers = level;
    for(i = 0; i < layers; i++) {
        for(j = 0; j < 10; j++) {
            var block = new Block(j*width/10,100 + 20 * i,width/10,20);
            blockArray[i * 10 + j] = block;
        }
    }
    document.getElementById("lives").innerHTML = "Lives: " + lives;
    document.getElementById("level").innerHTML = "Level: " + level;
    ball.x = width / 2;
    ball.y = height/2;
    ball.x_speed = 0;
    ballSpeed = ballSpeed_0 + level;
    playerSpeed = playerSpeed_0 + level;
    ball.y_speed = ballSpeed;
    firstBall = true;
}

function newLevel() {
    level++;
    lives++;
    start();
}

function gameOver() {
    alive = false;
}

function setLevel(input) {
    level = input;
    start();
}

function neverLose() {
    lives = "Never Lose";
    document.getElementById("lives").innerHTML = "Lives: " + lives;
}
