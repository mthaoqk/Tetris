const cvs = document.getElementById("tetris");
const ctx = cvs.getContext("2d");
const scoring = document.getElementById("score");
const ROW = 20;
const COL = COLUMN = 10;
const SQ = squareSize = 20;
const VACANT = "white"; //Color of vacant squares

//Drawing a square
function drawSquare(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * SQ, y * SQ, SQ, SQ);

    ctx.strokeStyle = "Black";
    ctx.strokeRect(x * SQ, y * SQ, SQ, SQ);
}


//Creating board

let board = [];
for (r = 0; r < ROW; r++) {
    board[r] = [];
    for (c = 0; c < COL; c++) {
        board[r][c] = VACANT;
    }
}

//Draw the board

function drawBoard() {
    for (r = 0; r < ROW; r++) {
        for (c = 0; c < COL; c++) {
            drawSquare(c, r, board[r][c]);
        }
    }
}

drawBoard()

const PIECES = [
    [Z, "#0bd3d3"],
    [L, "#f890e7"],
    [S, "#d0d0d0"],
    [O, "#343633"],
    [I, "#e30050"],
    [J, "#35a4c0"],
    [T, "#37bbec"],
];

//Generate a random piece

function randomPiece() {
    let r = randomN = Math.floor(Math.random() * PIECES.length)
    return new Piece(PIECES[r][0], PIECES[r][1]);
}

let p = randomPiece();

//Object piece

function Piece(tetromino, color) {
    this.tetromino = tetromino;
    this.color = color;

    this.tetrominoN = 0; // Start from the first pattern
    this.activeTetromino = this.tetromino[this.tetrominoN];

    //Control the pieces

    this.x = 4;
    this.y = -1;
}

//Fill function 

Piece.prototype.fill = function (color) {
    for (r = 0; r < this.activeTetromino.length; r++) {
        for (c = 0; c < this.activeTetromino.length; c++) {
            if (this.activeTetromino[r][c]) {
                //Draw only occupied squares
                drawSquare(this.x + c, this.y + r, color);
            }
        }
    }
}
//Drawing the pieces

Piece.prototype.draw = function () {
    this.fill(this.color);
}

//Undraw piece so when it goes down its is not continuously adding

Piece.prototype.unDraw = function () {
    this.fill(VACANT);
}

//Move piece down

Piece.prototype.moveDown = function () {
    if (!this.collision(0, 1, this.activeTetromino)) {
        this.unDraw();
        this.y++;
        this.draw();
    }
    else {
        //Lock the piece and generate a new one
        this.lock();
        p = randomPiece();
    }
}

//Move piece Right

Piece.prototype.moveRight = function () {
    if (!this.collision(1, 0, this.activeTetromino)) {
        this.unDraw();
        this.x++;
        this.draw();
    }
}

//Move piece Left

Piece.prototype.moveLeft = function () {
    if (!this.collision(-1, 0, this.activeTetromino)) {
        this.unDraw();
        this.x--;
        this.draw();
    }
}
//Rotate the piece

Piece.prototype.rotate = function () {
    let nextPattern = this.tetromino[(this.tetrominoN + 1) % this.tetromino.length];
    let kick = 0;

    if (this.collision(0, 0, nextPattern)) {
        if (this.x > COL / 2) {
            //Hits right wall
            kick = -1;
        }
        else {
            //Hits left wall
            kick = 1;
        }
    }

    if (!this.collision(kick, 0, nextPattern)) {
        this.unDraw();
        this.x += kick;
        this.tetrominoN = (this.tetrominoN + 1) % this.tetromino.length;
        this.activeTetromino = this.tetromino[this.tetrominoN];
        this.draw();
    }
}

//Lock the pieces when reach the bottom

let score = 0;
Piece.prototype.lock = function () {
    for (r = 0; r < this.activeTetromino.length; r++) {
        for (c = 0; c < this.activeTetromino.length; c++) {
            //skip the VACANT squares

            if (!this.activeTetromino[r][c]) {
                continue;
            }
            //Pieces gather all way to top game over

            if (this.y + r < 0) {
                alert("Game Over");
                //Stop the request animation frame

                gameOver = true;
                break;
            }
            //Lock the pieces

            board[this.y + r][this.x + c] = this.color;
        }
    }
    //Remove when there is a full row

    for (r = 0; r < ROW; r++) {
        let isRowFull = true;
        for (c = 0; c < COL; c++) {
            isRowFull = isRowFull && (board[r][c] != VACANT);
        }
        if (isRowFull) {
            //If the row is full we move down all the rows above it
            for (y = r; y > 1; y--) {
                for (c = 0; c < COL; c++) {
                    board[y][c] = board[y - 1][c];
                }
            }
            //The top row of the board has no row above it
            for (c = 0; c < COL; c++) {
                board[0][c] = VACANT;
            }
            //Increment score
            score += 10;
        }
    }
    //Update the board after removing the full row

    drawBoard();

    //Updating the score

    scoring.innerHTML = score;
}

//Collision function

Piece.prototype.collision = function (x, y, piece) {
    for (r = 0; r < piece.length; r++) {
        for (c = 0; c < piece.length; c++) {

            //If square empty, we skip
            if (!piece[r][c]) {
                continue;
            }
            //Coordinatese of the piece after movement

            let newX = this.x + c + x;
            let newY = this.y + r + y;

            //Conditions
            if (newX < 0 || newX >= COL || newY >= ROW) {
                return true;
            }
            //Skip newY < 0, So board will not crash since no board[-1]

            if (newY < 0) {
                continue;
            }
            //Check if piece already in lock

            if (board[newY][newX] != VACANT) {
                return true;
            }
        }
    }
    return false;
}

//Control the Piece

document.addEventListener("keydown", CONTROL);

function CONTROL(event) {
    if (event.keyCode === 37) {
        event.preventDefault()
        p.moveLeft();
        dropStart = Date.now();
    }
    else if (event.keyCode === 38) {
        event.preventDefault()
        p.rotate();
    }
    else if (event.keyCode === 39) {
        event.preventDefault()
        p.moveRight();
        dropStart = Date.now();
    }
    else if (event.keyCode === 40) {
        event.preventDefault()
        p.moveDown(0);
    }
}


//Pieces moving down every 1 sec

let dropStart = Date.now();
let gameOver = false;
function drop() {
    let now = Date.now();
    let delta = now - dropStart;
    if (delta > 1000) {
        p.moveDown();
        dropStart = Date.now();
    }
    if (!gameOver) {
        requestAnimationFrame(drop);
    }
}

drop();