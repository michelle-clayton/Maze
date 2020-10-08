// buttons
var newMazeButton = document.getElementById('new-maze');
var solveButton = document.getElementById('solve');
var restartButton = document.getElementById('restart');

// other document elements
var errorMessage = document.getElementById('error-message');
var canvas = document.getElementById("board");
var ctx = canvas.getContext("2d");
var showMaze;

// user inputs
var width; //how many columns of boxes
var height; // how many rows of boxes

// settings
var dotRadius = 5;
var boxSize = 40;
var padding = 1.75;
var lineWeight = 10;

// for maze building
var coords = [];
var pathCreator;
let cellMap = new Map();

// for user lines/moves
var user;
var userLine;
var up;
var down;
var left;
var right;
var lineColor = 'maroon';
var path;
var countMoves = 0;

// for solution
var showSoln = false;
var solnSet = [];
var discovered;
var visitedSet;

// calls main method
main();

// draws the solution
function drawSoln() {
  resetUser();
  for (var i = 0; i < solnSet.length - 1; i++) {
    drawPathLine(lineColor, solnSet[i], solnSet[i+1]);
    addUserBox(solnSet[i]);
  }

  addUserBox(cellMap.get(coords[coords.length - 1]));
}

// finds the solution to the maze
function findSoln() {

  if (showMaze && !showSoln) {
    showSoln = true;
    solnSet = [];
    discovered = [];
    visitedSet = new Stack();
    visitedSet.push(cellMap.get(coords[0]));
    discovered.push(cellMap.get(coords[0]));

    //dfs
    findSolnHelper(visitedSet.peek());
    drawSoln();
  }
}

// helper to the recursive findSoln. Finds the solution
function findSolnHelper(cell) {

  if (cell.equals(cellMap.get(coords[coords.length - 1]))) {
    solnSet.push(cell);
    return true;
  }

  var foundEnd = false;
  while (!visitedSet.isEmpty()) {
    discovered.push(cell);
    visitedSet.push(cell);
    for (var i = 0; i < cell.connections.length; i++ ) {

      if (!contains(discovered, cell.connections[i])) {
        if (findSolnHelper(cell.connections[i])) {
          solnSet.push(visitedSet.pop());
          return true;
        } else {
          visitedSet.pop();

        }
      }
    }
    return foundEnd;
  }
  return false;
}

// draws box at beginning of maze
function addUserBox(cell) {
  ctx.beginPath();
  ctx.fillStyle = lineColor;
  ctx.fillRect(cell.getCoord().getX() - dotRadius*2, cell.getCoord().getY() - dotRadius * 2, boxSize/2, boxSize/2);
  ctx.closePath();

  cell.drawThis();
}

// moves user back to beginning of maze and erases progress
function resetUser() {

  errorMessage.style.visibility = "hidden";
  countMoves = 0;
  while(user.path.length > 1) {
    drawPathLine("white", user.curPosition(), user.prevPosition());
    user.path.pop();
  }
  user = new User();
  user.path.push(cellMap.get(coords[0]));
  addUserBox(cellMap.get(coords[0]));
}

// response to user keyboard move
function userMove() {

  if (up) {
    up = false;
    let temp = user.curPosition().aboveConnect();
    if (temp != undefined) {
      if (user.prevPosition() != undefined && temp.equals(user.prevPosition())) {
        drawPathLine("white", user.curPosition(), temp);
        user.path.pop();
      } else {
        drawPathLine(lineColor, user.curPosition(), temp);
        user.path.push(temp);
        addUserBox(temp);
      }
      countMoves++;
    }
  }

  if (down) {
    down = false;
    let temp = user.curPosition().belowConnect();
    if (temp != undefined) {
      if (user.prevPosition() != undefined && temp.equals(user.prevPosition())) {
        drawPathLine("white", user.curPosition(), temp);
        user.path.pop();
      } else {
        drawPathLine(lineColor, user.curPosition(), temp);
        user.path.push(temp);
        addUserBox(temp);
      }
      countMoves++;
    }
  }

  if (right) {
    right = false;
    let temp = user.curPosition().rightConnect();
    if (temp != undefined) {
      if (user.prevPosition() != undefined && temp.equals(user.prevPosition())) {
        drawPathLine("white", user.curPosition(), temp);
        user.path.pop();
      } else {
        drawPathLine(lineColor, user.curPosition(), temp);
        user.path.push(temp);
        addUserBox(temp);
      }
      countMoves++;
    }
  }

  if (left) {
    left = false;
    let temp = user.curPosition().leftConnect();
    if (temp != undefined) {
      if (user.prevPosition() != undefined && temp.equals(user.prevPosition())) {
        drawPathLine("white", user.curPosition(), temp);
        user.path.pop();
      } else {
        drawPathLine(lineColor, user.curPosition(), temp);
        user.path.push(temp);
        addUserBox(temp);
      }
      countMoves++;
    }
  }

  if (user.curPosition().getCoord().equals(coords[coords.length - 1])) {
    errorMessage.innerHTML = "Congrats! You solved it in " + countMoves + " moves!";
    errorMessage.style.visibility = 'visible';
    showSoln = true;
  }
}

// traces user path
function drawPathLine(color, from, to) {
  ctx.beginPath();

  if (color == 'white') {
    ctx.lineWidth = boxSize/2 + 4;
    ctx.moveTo(from.getCoord().getX(), from.getCoord().getY());
    ctx.lineTo(to.getCoord().getX(), to.getCoord().getY());

  } else {
    ctx.lineWidth = boxSize/2;
    ctx.moveTo(from.getCoord().getX(), from.getCoord().getY());
    ctx.lineTo(to.getCoord().getX(), to.getCoord().getY());
  }

  ctx.closePath();
  ctx.strokeStyle = color;
  ctx.stroke();

  if (color == 'white') {
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.fillRect(from.getCoord().getX() - dotRadius*2, from.getCoord().getY() - dotRadius * 2, boxSize/2, boxSize/2 );
    ctx.closePath();
  }

  from.drawThis();
  to.drawThis();
}

// connects the cells using recursive backtracking
function drawMaze(width, height){

  let visited = new Stack();
  let curCell = cellMap.get(coords[0]); // start at top left

  visited.push(curCell);

  // visit every block
  while(!visited.isEmpty()) {

    visited.peek().color = "red";
    visited.peek().drawThis();

    // randomly choose neighbor to visit
    while(!curCell.visitedNeighbors()) {
      // place current dot
      curCell.setVisited(true);

      let nextCellCoord = (curCell.getNeighbors()[Math.floor(Math.random() * (curCell.getNeighbors().length))]).getCoord();

      let nextCell = cellMap.get(find(nextCellCoord));

      while(nextCell.getVisited()) {
        nextCellCoord = (curCell.getNeighbors()[Math.floor(Math.random() * (curCell.getNeighbors().length))]).getCoord();

        nextCell = cellMap.get(find(nextCellCoord));
      }

      drawMazeLine(curCell.getCoord(), nextCell.getCoord());
      curCell.color = "black";
      nextCell.color = "red";
      curCell.drawThis();
      nextCell.drawThis();

      curCell.addConnection(nextCell);
      nextCell.addConnection(curCell);

      curCell = nextCell;
      curCell.setVisited(true);
      visited.push(curCell);
    }

    let temp = visited.peek();
    temp.color = "black";
    temp.drawThis();
    curCell = visited.pop();
  }
}

// draws the maze by erasing walls
function drawMazeLine(from, to) {
  ctx.beginPath();
  ctx.lineWidth = boxSize - (1*lineWeight);

  ctx.moveTo(from.getX(), from.getY());
  ctx.lineTo(to.getX(), to.getY());

  ctx.closePath();
  ctx.strokeStyle = "white";
  ctx.stroke();
}

// makes initial grid and black dots
function fillBoard(width, height) {

    ctx.beginPath();
    ctx.lineWidth = lineWeight;
    for (var x = 0; x <= width; x += boxSize) { // vertical lines
        ctx.moveTo(x + padding, padding);
        ctx.lineTo(x + padding, height + padding);
    }

    for (var y = 0; y <= height; y += boxSize) { // horizontal lines
        ctx.moveTo(padding, y + padding);
        ctx.lineTo(width + padding, y + padding);
    }
    ctx.closePath();
    ctx.strokeStyle = "black";
    ctx.stroke();

    addCells(width, height);
}

// adds cells to the maze and keeps track of neighbors
function addCells(width, height) {
  for (var x = 0; x < width; x += boxSize) {
    for (var y = 0; y < height; y += boxSize) {

      let tempCoord = new Coord(x + boxSize/2 + padding, y + boxSize/2 + padding);
      let rightCoord = new Coord(x + 3*boxSize/2 + padding, y + boxSize/2 + padding);
      let belowCoord = new Coord(x + boxSize/2 + padding, y + 3*boxSize/2 + padding);

      let temp;
      let right;
      let below;

      if(!contains(coords, tempCoord)) {
        temp = new Cell(new Coord(x + boxSize/2 + padding, y + boxSize/2 + padding));
        coords.push(temp.getCoord());
        cellMap.set(temp.getCoord(), temp);
      } else {
        tempCoord = find(tempCoord);
        temp = cellMap.get(tempCoord);
      }

      if(!contains(coords, rightCoord)) {
        right = new Cell(new Coord(x + 3*boxSize/2 + padding, y + boxSize/2 + padding));


        if(inBounds(rightCoord)) {
          coords.push(right.getCoord());
          cellMap.set(right.getCoord(), right);
          temp.addNeighbor(right);
          right.addNeighbor(temp);
        }

      } else {
        rightCoord = find(rightCoord);
        right = cellMap.get(rightCoord);

        if(inBounds(rightCoord)) {
          temp.addNeighbor(right);
          right.addNeighbor(temp);
        }
      }

      if(!contains(coords, belowCoord)) {

        below = new Cell(new Coord(x + boxSize/2 + padding, y + 3*boxSize/2 + padding));

        if(inBounds(belowCoord)) {
          coords.push(below.getCoord());
          cellMap.set(below.getCoord(), below);
          temp.addNeighbor(below);
          below.addNeighbor(temp);
        }

      } else {
        belowCoord = find(belowCoord);
        below = cellMap.get(belowCoord);

        if(inBounds(belowCoord)) {
          temp.addNeighbor(below);
          below.addNeighbor(temp);
        }
      }
    }
  }
  user.path.push(cellMap.get(coords[0]));
}

// checks if set contains value
function contains(set, value) {
  for(var i = 0; i < set.length; i++) {
    if(value.equals(set[i])) {
      return true;
    }
  }
  return false;
}

// checks if coordinates are in bounds
function inBounds(coord) {
  return coord.getX() < canvas.width && coord.getY() < canvas.height;
}

// returns exact pair of coordinates
function find(coord) {
  for(var i = 0; i < coords.length; i++) {
    if(coord.equals(coords[i])) {
      return coords[i];
    }
  }
  return undefined;
}

// response to user keyboard action
function keydown(e) {
  var key_code = e.which || e.key_code;
  switch(key_code) {
    case 13: // enter key
      newMaze();
      break;
    case 37: // left arrow
      if (showMaze && !showSoln) {
        left = true;
        userMove();
      }
      break;
    case 38: // up arrow
      if (showMaze && !showSoln) {
        up = true;
        userMove();
      }
      break;
    case 39: // right arrow
      if (showMaze && !showSoln) {
        right = true;
        userMove();
      }
      break;
    case 40: // down arrow
      if (showMaze && !showSoln) {
        down = true;
        userMove();
      }
  }
}

// resets board and hides everything
function resetEverything() {
  coords = [];
  cellMap = new Map();
  showMaze = false;
  showSoln = false;
  solnSet = [];
  countMoves = 0;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  user = new User();
}

// response to new maze button
function newMaze() {

  width = document.getElementById('width').value;
  height = document.getElementById('height').value;


  if (width >= 2 && height >= 2) {

    canvas.width = width*boxSize + lineWeight/2;
    canvas.height = height*boxSize + lineWeight/2;

    errorMessage.style.visibility = "hidden";
    resetEverything();
    errorMessage.innerHTML = 'Please input acceptable dimensions.';

    fillBoard(width * boxSize, height * boxSize);
    drawMaze(width, height);
    showMaze = true;

    //create entry and exit points
    ctx.beginPath();
    ctx.lineWidth = boxSize - lineWeight;

    ctx.moveTo(0, boxSize/2 + padding);
    ctx.lineTo(coords[0].getX() - lineWeight, coords[0].getY());

    ctx.moveTo(coords[coords.length - 1].getX() + lineWeight, coords[coords.length - 1].getY());
    ctx.lineTo(canvas.width, coords[coords.length - 1].getY());

    ctx.closePath();
    ctx.strokeStyle = "white";
    ctx.stroke();

    addUserBox(cellMap.get(coords[0]));

  } else {

    errorMessage.style.visibility = "visible";
    errorMessage.classList.add('red-glow');
    setTimeout(function() {errorMessage.classList.add('remove-glow')}, 800);
    setTimeout(function() {errorMessage.classList.remove('red-glow')}, 800);
    setTimeout(function() {errorMessage.classList.remove('remove-glow')}, 1600);
  }
}

// MAIN METHOD
function main() {
  document.addEventListener('keydown', () => {
    keydown(event);
  });

  newMazeButton.addEventListener('click', () => {
    newMaze();
  });

  solveButton.addEventListener('click', () => {
    console.log('solve');
    findSoln();
  });

  restartButton.addEventListener('click', () => {
    resetUser();
  });
}

//CLASSES

// tracks users moves
class User {
  constructor() {
    this.path = [];
  }

  curPosition() {
    if (this.path.length == 0) {
      return undefined;
    }
    return this.path[this.path.length - 1];
  }

  prevPosition() {
    if (this.path.length <= 1) {
      return undefined;
    }
    return this.path[this.path.length - 2];
  }

}

// tracks all necessary information in each cell
class Cell {
  constructor(coord) {
    this.coord = coord;
    this.color = "black";
    this.visited = false;
    this.neighbors = [];
    this.connections = [];
  }

  drawThis() {
    ctx.beginPath();
    ctx.arc(this.coord.x, this.coord.y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }

  getCoord() {
    return this.coord;
  }

  getNeighbors() {
    return this.neighbors;
  }

  addNeighbor(cell) {
    this.neighbors.push(cell);
  }

  equals(other) {
    if (other != undefined) {
      return (other.getCoord()).equals(this.coord);
    }
  }

  addConnection(cell) {
    for (var i = 0; i < this.connections.length; i++) {
      if (cell.getCoord().getX() == this.connections[i].coord.getX() && cell.getCoord().getY() == this.connections[i].coord.getY()) {
        return;
      }
    }
    this.connections.push(cell);
  }

  // returns false if a neighbor has not been visited
  visitedNeighbors() {
    for (var i = 0; i < this.neighbors.length; i++) {
      if(!this.neighbors[i].visited) {
        return false;
      }
    }
    return true;
  }

  setVisited(value) {
    //console.log(this.coord);
    this.visited = value;
  }

  getVisited() {
    return this.visited;
  }

  leftConnect() {
    for (var i = 0; i < this.connections.length; i++) {
      if(this.connections[i].getCoord().getX() < this.coord.getX()) {
        return this.connections[i];
      }
    }
    return undefined;
  }

  rightConnect() {
    for (var i = 0; i < this.connections.length; i++) {
      if(this.connections[i].getCoord().getX() > this.coord.getX()) {
        return this.connections[i];
      }
    }
    return undefined;
  }

  aboveConnect() {
    for (var i = 0; i < this.connections.length; i++) {
      if(this.connections[i].getCoord().getY() < this.coord.getY()) {
        return this.connections[i];
      }
    }
    return undefined;
  }

  belowConnect() {
    for (var i = 0; i < this.connections.length; i++) {
      if(this.connections[i].getCoord().getY() > this.coord.getY()) {
        return this.connections[i];
      }
    }
    return undefined;
  }
}

// represents a pair of coordinates
class Coord {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }

  equals(other) {
    return other.getX() == this.x && other.getY() == this.y;
  }

}

// replicates the stack data structure
class Stack {
  constructor() {
    this.items = [];
  }

  push(element) {
    this.items.push(element);
  }

  pop() {
    if (this.items.length == 0) {
      return "Underflow";
    }
    return this.items.pop();
  }

  peek() {
    return this.items[this.items.length - 1];
  }

  isEmpty() {
    return this.items.length == 0;
  }
}
