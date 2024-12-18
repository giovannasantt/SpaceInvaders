const musica = new Audio('/src/sons/musica.mp3')
musica.volume = 1;
const tiro = new Audio('/src/sons/tiro.mp3')
tiro.volume = 0.7
const morteInvader = new Audio('/src/sons/morteInvader.mp3')
morteInvader.volume = 0.3
//this is fucking bullshit

 //board
let tileSize = 32;
let rows = 25;
let columns = 32;

let board;
let boardWidth = tileSize * columns; // 32 * 32 = 1024
let boardHeight = tileSize * rows; // 32 * 25 = 800
let context;

//ship
let shipWidth = tileSize*2;
let shipHeight = tileSize;
let shipX = tileSize * columns/2 - tileSize;
let shipY = tileSize * rows - tileSize*2;

let ship = {
    x : shipX,
    y : shipY,
    width : shipWidth,
    height : shipHeight
}

let shipImg;
let shipVelocityX = tileSize; //ship moving speed

//aliens
let alienArray = [];
let alienWidth = tileSize*2;
let alienHeight = tileSize;
let alienX = tileSize;
let alienY = tileSize;
let alienImg;

let invaderInt;
let invaderString;

let alienRows = 2;
let alienColumns = 3;
let alienCount = 0; //number of aliens to defeat
let alienVelocityX = 1; //alien moving speed

//bullets
let bulletArray = [];
let bulletVelocityY = -10; //bullet moving speed

let score = 0;
let gameOver = false;

//Fazer etec foi um ero
window.onload = function() {
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d"); //used for drawing on the board

    //draw initial ship
    // context.fillStyle="green";
    // context.fillRect(ship.x, ship.y, ship.width, ship.height);

    //load images
    shipImg = new Image();
    shipImg.src = "/src/img/dispara_ervilha.png";
    shipImg.onload = function() {
        context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }
    
    invaderInt = getRandomInt(3)
    switch (invaderInt) {
        case 0:
            invaderString = "invader1"
            break;
        case 1:
            invaderString = "invader2"
            break;
        case 2:
            invaderString = "invader3"
            break;
    }
    alienImg = new Image();
    alienImg.src = "/src/img/" + invaderString + ".png";
    createAliens();

    requestAnimationFrame(update);
    document.addEventListener("keydown", moveShip);
    document.addEventListener("keyup", shoot);
    document.addEventListener("keydown", (e) => {
        musica.play()
        if (gameOver == true) {
            musica.stop()
        }
    })
    document.addEventListener("keydown", (e) => {
        if (e.code == "KeyR") {
            gameOver = true
        }
    })
}

function abrirGameOver(url) {
    const win = window.open(url, '_blank')
    win.focus
}

function update() {
    requestAnimationFrame(update);

    if (gameOver) {
        abrirGameOver("./gameover.html")    
        return;
    }

    context.clearRect(0, 0, board.width, board.height);

    //ship
    context.drawImage(shipImg, ship.x, ship.y, 70, 60);

    //alien
    for (let i = 0; i < alienArray.length; i++) {
        let alien = alienArray[i];
        if (alien.alive) {
            alien.x += alienVelocityX;

            //if alien touches the borders
            if (alien.x + alien.width >= board.width || alien.x <= 0) {
                alienVelocityX *= -1;
                alien.x += alienVelocityX*2;

                //move all aliens up by one row
                for (let j = 0; j < alienArray.length; j++) {
                    alienArray[j].y += alienHeight;
                }
            }
            context.drawImage(alienImg, alien.x, alien.y, alien.width, alien.height);

            if (alien.y >= ship.y) {
                gameOver = true;
            }
        }
    }

    //bullets
    for (let i = 0; i < bulletArray.length; i++) {
        let bullet = bulletArray[i];
        bullet.y += bulletVelocityY;
        //context.fillStyle="white";
        bulletImg = new Image();
        bulletImg.src = "/src/img/ervilha.png";
        context.drawImage(bulletImg, bullet.x - 25, bullet.y, 50, 50)
        context.fillRect(bulletImg, bullet.x, bullet.y, bullet.width, bullet.height);

        //bullet collision with aliens
        for (let j = 0; j < alienArray.length; j++) {
            let alien = alienArray[j];
            if (!bullet.used && alien.alive && detectCollision(bullet, alien)) {
                bullet.used = true;
                alien.alive = false;
                alienCount--;
                score += 100;
                morteInvader.play()
            }
        }
    }

    //clear bullets
    while (bulletArray.length > 0 && (bulletArray[0].used || bulletArray[0].y < 0)) {
        bulletArray.shift(); //removes the first element of the array
    }

    //next level
    if (alienCount == 0) {
        //increase the number of aliens in columns and rows by 1
        score += alienColumns * alienRows * 100; //bonus points :)
        alienColumns = Math.min(alienColumns + 1, columns/2 -2); //cap at 16/2 -2 = 6
        alienRows = Math.min(alienRows + 1, rows-4);  //cap at 16-4 = 12
        if (alienVelocityX > 0) {
            alienVelocityX += 0.2; //increase the alien movement speed towards the right
        }
        else {
            alienVelocityX -= 0.2; //increase the alien movement speed towards the left
        }
        alienArray = [];
        bulletArray = [];
        createAliens();
    }

    //score
    context.fillStyle="white";
    context.font="30px Comic Sans MS";
    context.fillText(score, 5, 30);
}
//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA

function moveShip(e) {
    if (gameOver) {
        return;
    }

    if (e.code == "ArrowLeft" && ship.x - shipVelocityX >= 0) {
        ship.x -= shipVelocityX; //move left one tile
    }
    else if (e.code == "ArrowRight" && ship.x + shipVelocityX + ship.width <= board.width) {
        ship.x += shipVelocityX; //move right one tile
    }
}

function createAliens() {
    for (let c = 0; c < alienColumns; c++) {
        for (let r = 0; r < alienRows; r++) {
            let alien = {
                img : alienImg,
                x : alienX + c*alienWidth,
                y : alienY + r*alienHeight,
                width : alienWidth,
                height : alienHeight,
                alive : true
            }
            alienArray.push(alien);
        }
    }
    alienCount = alienArray.length;
}

function shoot(e) {
    if (gameOver) {
        return;
    }

    if (e.code == "Space") {
        tiro.play()
        //shoot
        let bullet = {
            x : ship.x + shipWidth*15/32,
            y : ship.y,
            width : tileSize/8,
            height : tileSize/2,
            used : false
        }
        bulletArray.push(bullet);
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}