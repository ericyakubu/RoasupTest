import * as PIXI from "pixi.js";
import gsap from "gsap";
import { PixiPlugin, MotionPathPlugin } from "gsap/all";
import {
  blueCarImg,
  redCarImg,
  greenCarImg,
  yellowCarImg,
  lineImg,
  pRedImg,
  pYellowImg,
  buttonImg,
  failImg,
  gameLogoImg,
  handImg,
} from "./constants";

type PathType = { x: number; y: number }[];
type MinMaxCoordinatesType = {
  minMaxX: {
    min: number;
    max: number;
  };
  minMaxY: {
    min: number;
    max: number;
  };
};
type FinishDrawingType = {
  red: boolean;
  yellow: boolean;
};
type BoxType = {
  x: {
    from: number;
    to: number;
  };
  y: {
    from: number;
    to: number;
  };
};

gsap.registerPlugin(MotionPathPlugin, PixiPlugin);

const app = new PIXI.Application<HTMLCanvasElement>({
  background: "#545454",
  resizeTo: window,
});
const screenWidth: number = app.screen.width;
const screenHeight: number = app.screen.height;

if (!document.body.querySelector("canvas")) document.body.appendChild(app.view);

//=================================================================== Variables
const greenCar = PIXI.Sprite.from(greenCarImg);
const redCar = PIXI.Sprite.from(redCarImg);
const yellowCar = PIXI.Sprite.from(yellowCarImg);
const blueCar = PIXI.Sprite.from(blueCarImg);
const pYellow = PIXI.Sprite.from(pYellowImg);
const pRed = PIXI.Sprite.from(pRedImg);
const failSign = PIXI.Sprite.from(failImg);
const line1 = PIXI.Sprite.from(lineImg);
const line2 = PIXI.Sprite.from(lineImg);
const line3 = PIXI.Sprite.from(lineImg);
const line4 = PIXI.Sprite.from(lineImg);
const line5 = PIXI.Sprite.from(lineImg);
const button = PIXI.Sprite.from(buttonImg);
const gameLogo = PIXI.Sprite.from(gameLogoImg);
const hand = PIXI.Sprite.from(handImg);
const customBack = new PIXI.Graphics();

const tl: gsap.core.Timeline = gsap.timeline();

const redLine = new PIXI.Graphics();
const yellowLine = new PIXI.Graphics();
const canvasParts = [
  greenCar,
  blueCar,
  redCar,
  yellowCar,
  line1,
  line2,
  line3,
  line4,
  line5,
  pYellow,
  pRed,
  hand,
  redLine,
  yellowLine,
  customBack,
  button,
  gameLogo,
  failSign,
];

const canvasItems: PIXI.Sprite[] = [
  greenCar,
  blueCar,
  redCar,
  yellowCar,
  pRed,
  pYellow,
  hand,
  button,
  gameLogo,
  failSign,
];
const canvasItemsPositions: number[] = [
  0.1625, 0.8375, 0.275, 0.725, 0.6125, 0.3875, 0.325, 0.5, 0.5, 0.5,
];
const lines: PIXI.Sprite[] = [line1, line2, line3, line4, line5];
const linePositions: number[] = [0.05, 0.275, 0.5, 0.725, 0.95];

const lineYPos: number = 0;
const topCarsYPos: number = screenHeight * 0.2;
const pYPos: number = screenHeight * 0.2;
const botCarsYPos: number = screenHeight * 0.8;

const inactivityTimeout = 20000; //20 seconds
let inactivityTimer: NodeJS.Timeout | null;

resetInactivityTimer();

// Function to be called when user is inactive for 20 seconds

let drawingRed: boolean = false;
let drawingYellow: boolean = false;
let pathRed: PathType = [];
let pathYellow: PathType = [];
let finishDrawing: FinishDrawingType = {
  red: false,
  yellow: false,
};

//=================================================================== PIXI block
customBack.beginFill(0x000000, 0.5);
customBack.drawRect(0, 0, screenWidth, screenHeight);
customBack.endFill();
// customBack.visible = false;
customBack.alpha = 0;

const playImgs = [
  greenCar,
  blueCar,
  redCar,
  yellowCar,
  line1,
  line2,
  line3,
  line4,
  line5,
  pYellow,
  pRed,
  button,
  hand,
  gameLogo,
  failSign,
];

playImgs.forEach((obj) => obj.anchor.set(0.5));
customBack.position.set(0, 0);

button.alpha = 0;
gameLogo.alpha = 0;
failSign.alpha = 0;
failSign.scale.set(0.5);
button.scale.set(0.5);
gameLogo.scale.set(0.5);

canvasItems.forEach((tes, index) => {
  tes.x = screenWidth * canvasItemsPositions[index];
  tes.y = lineYPos;
});

pYellow.y = pYPos;
pRed.y = pYPos;

button.y = screenHeight * 0.85;
gameLogo.y = screenHeight * 0.35;

failSign.y = screenHeight * 0.5;
greenCar.y = topCarsYPos;
blueCar.y = topCarsYPos;
redCar.y = botCarsYPos;
yellowCar.y = botCarsYPos;
hand.y = screenHeight * 0.825;

lines.forEach((line, index) => {
  line.anchor.set(0);
  line.height = screenHeight * 0.275;
  line.x = screenWidth * linePositions[index];
  line.y = lineYPos;
});

const yellowBox = setBoxes(line2, line3);
const redBox = setBoxes(line3, line4);

canvasParts.forEach((obj) => app.stage.addChild(obj));

//=================================================================== GSAP block
gsap.to(hand, {
  x: screenWidth * 0.675,
  y: screenHeight * 0.235,
  duration: 2,
});

// Record user drawing
app.view.addEventListener("pointerdown", handlePointerDown);
app.view.addEventListener("mousedown", handlePointerDown);
app.view.addEventListener("pointermove", handlePointerMove);
app.view.addEventListener("mousemove", handlePointerMove);
app.view.addEventListener("pointerup", handlePointerUp);
app.view.addEventListener("mouseup", handlePointerUp);

app.view.addEventListener("timeupdate", () => {});

// Generates a BoxType object based on the position and dimensions of the provided left and right lines.
function setBoxes(leftLine: PIXI.Sprite, rightLine: PIXI.Sprite): BoxType {
  const { x, y, height } = leftLine;
  return {
    x: {
      from: x,
      to: rightLine.x,
    },
    y: {
      from: y,
      to: height,
    },
  };
}

// Returns the minimum and maximum coordinates based on the input PIXI sprite.
function createMinMax(car: PIXI.Sprite): MinMaxCoordinatesType {
  const offsetX = 175;
  const offsetY = 250;
  const { x, y } = car;
  return {
    minMaxX: { min: x - offsetX, max: x + offsetX },
    minMaxY: { min: y - offsetY, max: y + offsetY },
  };
}

// Check if the pointer event coordinates are within the specified minmax bounds to select a car
function checkAim(e: PointerEvent, minmax: MinMaxCoordinatesType): boolean {
  const { clientX, clientY } = e;
  const { minMaxX, minMaxY } = minmax;
  return (
    clientX >= minMaxX.min &&
    clientX <= minMaxX.max &&
    clientY >= minMaxY.min &&
    clientY <= minMaxY.max
  );
}

// Check if the given path ends within the specified box
function checkHitBox(box: BoxType, path: PathType): boolean {
  const {
    x: { from: xFrom, to: xTo },
    y: { from: yFrom, to: yTo },
  } = box;
  const { x, y } = path[path.length - 1];
  return x >= xFrom && x <= xTo && y >= yFrom && y <= yTo;
}

// Check and animate cars if both red and yellow finish drawing flags are true
function checkAndAnimateCars(): void {
  if (finishDrawing.red && finishDrawing.yellow) {
    animateCars(redCar, pathRed);
    animateCars(yellowCar, pathYellow);
  }
}

// Hide or fade away everything except the background and show the fail button
function failState(): void {
  gsap.to(playImgs, { alpha: 0, duration: 1 });
  gsap.to(failSign, { alpha: 1, duration: 1 });
}

// Animate a car along a given path using GSAP animations.
function animateCars(car: PIXI.Sprite, path: PathType): void {
  // If the path is too short, jump to the fail state
  if (path.length < 2) {
    failState();
    return;
  }

  tl.set(car, { x: path[0].x, y: path[0].y });

  tl.to(
    car,
    {
      duration: 2,
      motionPath: {
        path: path.map((point) => ({ x: point.x, y: point.y })),
        curviness: 5,
      },
    },
    0
  );

  tl.call(() => {
    gsap.to([playImgs, redLine, yellowLine], { alpha: 0, duration: 0.5 });
  });

  fadingAndStuff();
}

function resetInactivityTimer() {
  clearTimeout(inactivityTimer); // Clear existing timeout, if any
  inactivityTimer = setTimeout(fadingAndStuff, inactivityTimeout);
}

function fadingAndStuff(): void {
  tl.call(
    () => {
      customBack.visible = true;
      gsap.to(customBack, { alpha: 1 });

      // Show the fail button
      gsap.to(failSign, {
        alpha: 1,
        // scale: 1,
        duration: 0.5,
      });
      gsap.to(failSign.scale, { duration: 0.5, x: 1, y: 1 });

      // Hide the fail button after a delay
      gsap.to(failSign, {
        alpha: 0,
        duration: 0.5,
        // scale: 0.5,
        delay: 1,
      });
      gsap.to(failSign.scale, { duration: 0.5, x: 0.5, y: 0.5, delay: 1 });
    },
    null,
    "-=1"
  );

  tl.to({}, { duration: 2.5, onComplete: revertToInitialState }, "-=2");
}

// Show or fade in everything back to its initial state
function revertToInitialState(): void {
  // Show or fade in everything back to its initial state
  gsap.to(playImgs, { alpha: 1, duration: 2 });

  gsap.to(button.scale, { duration: 2, x: 1.25, y: 1.25 });
  gsap.to(gameLogo.scale, { duration: 2, x: 1.25, y: 1.25 });

  customBack.visible = true;

  // Reset the drawing and animation states
  drawingRed = false;
  drawingYellow = false;
  finishDrawing.red = false;
  finishDrawing.yellow = false;
  pathRed = [];
  pathYellow = [];

  hand.visible = false;
  failSign.visible = false;
  gameLogo.alpha = 1;
  button.alpha = 1;
  redCar.y = botCarsYPos;
  yellowCar.y = botCarsYPos;
  redCar.x = screenWidth * 0.275;
  yellowCar.x = screenWidth * 0.725;

  removeEvents();
}

//=================================================================== EVENT HANDLERS

// Handles the pointer down event, setting the hand alpha to 0, checking aim with red and yellow cars, and updating drawing flags accordingly
function handlePointerDown(e: PointerEvent): void {
  hand.alpha = 0;

  const redMinMax: MinMaxCoordinatesType = createMinMax(redCar);
  const yellowMinMax: MinMaxCoordinatesType = createMinMax(yellowCar);

  drawingRed = checkAim(e, redMinMax);
  drawingYellow = checkAim(e, yellowMinMax);

  if (drawingRed) {
    pathRed = [];
  }
  if (drawingYellow) {
    pathYellow = [];
  }
}

// Handles the pointer move event by updating the drawing paths for the red and yellow lines
function handlePointerMove(e: PointerEvent): void {
  if (drawingRed) {
    pathRed.push({ x: e.clientX, y: e.clientY });
    drawLine(redLine, pathRed, 0xd1191f);
  }
  if (drawingYellow) {
    pathYellow.push({ x: e.clientX, y: e.clientY });
    drawLine(yellowLine, pathYellow, 0xffc841);
  }
}

function drawLine(
  line: PIXI.Graphics,
  path: { x: number; y: number }[],
  color: number
): void {
  line.clear();
  line.lineStyle(15, color);
  for (let i = 1; i < path.length; i++) {
    line.moveTo(path[i - 1].x, path[i - 1].y);
    line.lineTo(path[i].x, path[i].y);
  }
}
// Handles the pointer up event and performs actions based on the current drawing state and hit box check results
function handlePointerUp(): void {
  if (drawingRed && checkHitBox(redBox, pathRed)) {
    drawingRed = false;
    finishDrawing.red = true;
    checkAndAnimateCars();
  } else if (drawingRed) {
    pathRed = [];
    redLine.clear();
  }

  if (drawingYellow && checkHitBox(yellowBox, pathYellow)) {
    drawingYellow = false;
    finishDrawing.yellow = true;
    checkAndAnimateCars();
  } else if (drawingYellow) {
    pathYellow = [];
    yellowLine.clear();
  }
}

// Removes all event listeners and sets the button event mode to "dynamic".
function removeEvents(): void {
  app.view.removeEventListener("pointerdown", handlePointerDown);
  app.view.removeEventListener("mousedown", handlePointerDown);
  app.view.removeEventListener("pointermove", handlePointerMove);
  app.view.removeEventListener("mousemove", handlePointerMove);
  app.view.removeEventListener("pointerup", handlePointerUp);
  app.view.removeEventListener("mouseup", handlePointerUp);
  button.eventMode = "dynamic";
  button.onpointerup = () => (window.location.href = "https://roasup.com");
}

// Handle window resize
window.addEventListener("resize", () =>
  app.renderer.resize(window.innerWidth, window.innerHeight)
);
