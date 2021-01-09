
var xMousePoint, yMousePoint = 0;
var gridWidth = 800;
var gridHeight = 800;
var data = [];
var colorData = ["#c0c0c0", "#800000", "#ff00ff", "#00ff00", "#808000", "#ffff00", 
                 "#0000ff", "#00ffff", "#ffa500", "#8a2be2", "#5f9ea0", "#6495ed", 
                 "#dc143c", "#ff8c00", "#228b22", "#ff69b4", "#7cfc00", "#20b2aa", 
                 "#6b8e23", "#d2b48c"];
var numOfPoints = 0;
var numbOfPointsToRandom;
var m, b = 0;
var showInfo = false;
var showGrid = true;

var inputX;
var inputY;
var scalePixels = 10;

function setup() {
  // Canvas settings
  canvas = createCanvas(1700, 850);
  canvas.position(50, 50)
  frameRate(10);

  //Buttons
  var showInfoButton = createButton("Show/hide additional info");
  showInfoButton.mousePressed(showInfoButtonPressed);
  showInfoButton.position(50,20)

  var showGridButton = createButton("Show/hide grid");
  showGridButton.mousePressed(showGridButtonPressed);
  showGridButton.position(220,20)

  var resetButton = createButton("Reset points");
  resetButton.mousePressed(resetPoints);
  resetButton.position(330,20)
  resetButton.style('background-color', "red");
  resetButton.style('font-weight', "bold");
  resetButton.style('color', 'white');
  resetButton.style('border', 'none');
  resetButton.style('height', '21px');

  var randomButton = createButton("Random points: ");
  randomButton.mousePressed(randomButtonPressed);
  randomButton.position(700,20)
  //Select
  numbOfPointsToRandom = createSelect();
  for (var i = 2; i < 41; i++) {
    numbOfPointsToRandom.option(i);
  }
  numbOfPointsToRandom.position(810, 21)

  //Input add point
  inputX = createInput();
  inputX.position(500, 20);
  inputX.size(30, 15);
  xb = createButton('x: ');
  xb.style('background', 'none');
  xb.style('border', 'none');
  xb.style('outline', 'none');
  xb.position(inputX.x-18, 20);

  inputY = createInput();
  inputY.position(555, 20);
  inputY.size(30, 15);
  yb = createButton('y: ');
  yb.style('background', 'none');
  yb.style('border', 'none');
  yb.style('outline', 'none');
  yb.position(inputY.x-18, 20);
  
  addPointButton = createButton('Add point');
  addPointButton.position(inputY.x + inputY.width-1, 20);
  addPointButton.mousePressed(addPointButtonPressed);


}

function draw() {
  //Canvas background and grid color fill
  background(255);
  fill(255);
  let gridBackground = rect(0, 0, gridWidth, gridHeight);
  //let showInfos = showInfo;

  //Background for residual plot
  fill(255);
  noStroke();
  let residualPlotBackground = rect(980, 0, 400, 400);

  //Map points on the grid to the mouse scalePixels 10px --> 1 point
  xMousePoint = Math.round(map(mouseX, 0, gridWidth, ((gridWidth/2)*-1)/scalePixels, (gridWidth/2)/scalePixels, gridWidth) * 10) / 10;
  yMousePoint = Math.round(map(mouseY, 0, gridHeight, (gridHeight/2)/scalePixels, ((gridHeight/2)*-1)/scalePixels, gridHeight) * 10) / 10;

  //Translate and scale grid for cartesian plane
  translate(gridWidth/2, gridHeight/2); 
  scale(1, -1);

  //Draw grids
  if (showGrid) {
    drawGrid();
  } 
  drawGridResidual();


  //Start calculating and plot if enough data provided
  if(data.length > -1) {
    calculateRegression();
    drawFunction(m, b);
    if (showInfo) {
      showAdditionalLines();
    }
  }

  //Display points on main plane
  displayPointsAndLabels();

  //Show current point and cross pointer on grid mouse hover
  if (isMouseOverGrid()) {
    push();
    scale(1, -1);
    fill("black");
    textStyle(BOLD);
    textSize(16);
    noStroke();
    text("(" + (xMousePoint) + ", " + (yMousePoint) + ")", (xMousePoint*scalePixels)+10, -(yMousePoint*scalePixels)-10);
    pop(); 
    showCrossPointer();
    noCursor();
  }
}


function drawGrid() {

  strokeWeight(1);
  //Draw light lines
	for (var i=-gridWidth/2; i <= gridWidth/2; i+=10) {
    if(i%100 !== 0) {
      stroke('#c7c7c7');
      line(i, -gridHeight/2, i, gridHeight/2);
      line(-gridWidth/2, i, gridWidth/2, i);
    } else {
      //Draw dark lines
      stroke(100);
      line(i, -gridHeight/2, i, gridHeight/2);
      line(-gridWidth/2, i, gridWidth/2, i);
    }
  }
  
  //Add labels for dark lines
	for (var i=-gridWidth/2; i <= gridWidth/2; i+=20) {
    if(i%100 === 0) {
      noStroke();
      //Labels
      let numberWidthX = textWidth(i/scalePixels);
      let numberWidthY = textWidth(i/scalePixels*(-1));
      //Y-axis labels
      if(i !== 0) { // Exlude "0" label from Y-axis
        push();
        scale(1, -1);
        fill(0,0,0,200);
        rect(-(numberWidthY+10), i-7.5, numberWidthY+10, 15);
        fill("white");
        text((i/scalePixels)*(-1), -(numberWidthY+5), i+4);
        pop(); 
      }
      //X-axis labels
      push();
      scale(1, -1);
      fill(0,0,0,200);
      rect(i-((numberWidthX+10)/2), 0, numberWidthX+10, 15);
      fill(255);
      text(i/scalePixels, i-(numberWidthX/2), 12);
      pop(); 
    } 
  }
}


function showCrossPointer() {
  stroke("black");
  strokeWeight(2);
  let xLine = line(xMousePoint*scalePixels, -(gridHeight/2), xMousePoint*scalePixels, (gridHeight/2));
  let yLine = line(-(gridWidth/2), yMousePoint*scalePixels, (gridWidth/2), yMousePoint*scalePixels);
  noStroke();
}

function isMouseOverGrid() {
  if (mouseX <= gridWidth && mouseY <= gridHeight && mouseX >= 0 && mouseY >= 0) {
    return true;
  }
  cursor();
  return false;
}

function addPoint(x, y)  {
  let point;
  if (!x && !y) {
    point = createVector(xMousePoint, yMousePoint);
  } else {
    point = createVector(x, y);
  }
  data.push(point);
}

function displayPointsAndLabels() {
  for (var i = 0; i < data.length; i++) {

    let color = "#000000";
    if (i < colorData.length) {
      color = colorData[i];
    }
    fill(color);
    ellipse(data[i].x*scalePixels, data[i].y*scalePixels, 18, 18);

    //Labels with colors
    let margin = i * 20;
    let label = "(" + i + ")" +  " (" + (data[i].x) + ", " + (data[i].y) + ")";
    push();
    scale(1, -1);
    fill(color);
    rect((gridWidth/2)+20, -(gridHeight/2)+10+margin, 25, 15);
    fill("black");
    textSize(16);
    text(label, (gridWidth/2)+50, -(gridHeight/2)+22+margin);
    fill("white");
    stroke("black");
    strokeWeight(3);
    textSize(9);
    text(i, data[i].x*scalePixels-(textWidth(i)/2), data[i].y*scalePixels*(-1)+3);
    pop();  
   }
}


function mousePressed() {
  if (isMouseOverGrid()) {
    addPoint();
  }
}

function calculateRegression() {
  var xSum = 0;
  var ySum = 0;
  var xySum = 0;
  var xSquareSum = 0;
  numOfPoints = data.length;

  for (var i = 0; i < data.length; i++) {
    xSum += data[i].x*scalePixels;
    ySum += data[i].y*scalePixels;
    xySum += ((data[i].x*scalePixels) * (data[i].y*scalePixels));
    xSquareSum += Math.pow((data[i].x*scalePixels), 2);
  }

  m = ( (numOfPoints*xySum) - (xSum*ySum) ) / ((numOfPoints*xSquareSum) - (Math.pow(xSum, 2)))
  b = (ySum - (m*xSum)) / numOfPoints;

  //Round
  b = Math.round(b * 100) / 100;
  m = Math.round(m * 100) / 100;

  //Show function
  let linearFunction = "f(x) = " +m+ "x " + nfp(Math.round((b/10) * 100) / 100); //podzielic b na 10
  let meanX = Math.round(((xSum/scalePixels)/data.length) * 100) / 100;
  let meanY = Math.round(((ySum/scalePixels)/data.length) * 100) / 100;

  push();
  scale(1, -1);
  fill("black");
  textStyle(BOLD);
  textSize(16);
  noStroke();
  text(linearFunction, (gridWidth/2)+200, -(gridHeight/2)+420);
  text("Średnia wartość x: "+meanX, (gridWidth/2)+200, -(gridHeight/2)+440);
  text("Średnia wartość y: "+meanY, (gridWidth/2)+200, -(gridHeight/2)+460);


  pop();  

}

function drawFunction(m, b) {
  let x1 = -400; //-400
  let y1 = m * x1 + (b);
  let x2 = 400; //400
  let y2 = m * x2 + (b);

  stroke("red");
  strokeWeight(3);
  let finalLine = line(x1, y1, x2, y2);
  noStroke();
}

function showAdditionalLines() {
  for (var i = 0; i < data.length; i++) {
    //Function value in point
    let funcValueInPoint = m * data[i].x*scalePixels + (b);
    stroke("black");
    strokeWeight(2);
    drawingContext.setLineDash([1, 5]);
    line(data[i].x*scalePixels, data[i].y*scalePixels, data[i].x*scalePixels, funcValueInPoint);
    drawingContext.setLineDash([]);
    noStroke();
  }
}


function drawGridResidual() {

  let counter = 0;
  for (var i = 600; i <= 1000; i+=50) {
    stroke("gray");
      
    if (counter === 4) {
      stroke("black");
      strokeWeight(2);
      line(i, 0, i, 400);
      line(600, i-600, 1000, i-600);

    }
    line(i, 190, i, 210);
    line(790, i-600, 810, i-600);
    strokeWeight(1);
    counter += 1;
  }

  //Set/map x-y 0 point for residual grid
  let x = 800;
  let y = 200; 
  for (var i = 0; i < data.length; i++) {
    let xPointMap = x + (data[i].x*scalePixels)/2;
    let yPointMap = y + (data[i].y*scalePixels)/2;
    //Draw lines to points
    let funcValueInPoint = m * data[i].x*scalePixels + (b);
    let color = "#000000";
    if (i < colorData.length) {
      color = colorData[i];
    }
    stroke(color);
    strokeWeight(6);
    //Calculate difference between function value and point
    let funcValueDiff = (yPointMap - (y+(funcValueInPoint/2))) + y;
    line(xPointMap, funcValueDiff, xPointMap, y);
    noStroke(); 

  }

}

function randomPoints(numberOfPoints) {
  resetPoints();
  for (var i = 0; i < numberOfPoints; i++)
  {
    var xValue = Math.round(random(-40.0, 40.0) * 10) / 10;
    var yValue = 0;
  
    switch (true) {
      case (xValue >= -40 && xValue <= -30):
        yValue = random(-10.0, -40.0);
        break;
  
      case (xValue >= -29.9 && xValue <= -20):
        yValue = random(0.0, -40.0);
        break;
  
      case (xValue >= -19.9 && xValue <= 0):
        yValue = random(5, -10.0);
        break;
  
      case (xValue >= 0.1 && xValue <= 19.99):
        yValue = random(-5, 10.0);
        break;
    
      case (xValue >= 20.0 && xValue <= 29.99):
        yValue = random(0, 20.0);
        break;
  
      case (xValue >= 30.0 && xValue <= 40.0):
        yValue = random(10, 40.0);
        break;
      default:
        console.log("error random points");
    }
    yValue = Math.round(yValue * 10) / 10;

    addPoint(xValue, yValue);

  }

}

function showInfoButtonPressed() {
  showInfo = switchFlag(showInfo);
}
function showGridButtonPressed() {
  showGrid = switchFlag(showGrid);
}
function randomButtonPressed() {
  randomPoints(numbOfPointsToRandom.value());
}
function addPointButtonPressed() {
  let xValue = inputX.value();
  let yValue = inputY.value();
  if(xValue && yValue && xValue >= -40 && xValue <= 40 && yValue >= -40 && yValue <= 40) {
    addPoint(xValue, yValue);
  }
}

function switchFlag(flag) {
  if (flag == true) {
    return false;
  } else {
    return true;
  }
}

function resetPoints() {
  data.length = 0;
}