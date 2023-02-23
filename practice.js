const checkBtn = document.getElementById("checkBtn");
const startBtn = document.getElementById("startBtn");
const container = document.querySelector(".options");
const gameBoard = document.getElementById("gameboard");
const info = document.getElementById("info");
const turn = document.getElementById("turn");

let rotationValue = 0;
const width = 10;

const checkShip = () => {
  const options = Array.from(container.children);

  rotationValue = rotationValue === 0 ? 90 : 0;

  options.forEach(
    (option) => (option.style.transform = `rotate(${rotationValue}deg)`)
  );
};

checkBtn.addEventListener("click", checkShip);

const createBoard = (color, user) => {
  const gameBoardContainer = document.createElement("div");
  gameBoardContainer.classList.add("game-board");
  gameBoardContainer.style.backgroundColor = color;
  gameBoardContainer.id = user;

  for (let i = 0; i < width * width; i++) {
    const blockElement = document.createElement("div");
    blockElement.classList.add("block");
    blockElement.id = i;
    gameBoardContainer.append(blockElement);
  }

  gameBoard.append(gameBoardContainer);
};

createBoard("rgb(95, 151, 95)", "player");
createBoard("rgb(226, 104, 104)", "computer");

class Ship {
  constructor(name, length) {
    this.name = name;
    this.length = length;
  }
}

const destroyer = new Ship("destroyer", 2);
const submarine = new Ship("submarine", 3);
const cruiser = new Ship("cruiser", 3);
const battleship = new Ship("battleship", 4);
const carrier = new Ship("carrier", 5);

const ships = [destroyer, submarine, cruiser, battleship, carrier];

let notDropped;

const addShip = (user, shipCategory, blockId) => {
  const allBlocks = document.querySelectorAll(`${user} div`);
  let booleanRandom = Math.random() < 0.5;
  let isHorizontal = user === "player" ? rotationValue === 0 : booleanRandom;
  let randomIndex = Math.floor(Math.random() * width * width);

  let startInd = blockId ? blockId : randomIndex;

  const { shipBlocks, validPlace, notTakenBlock } = handleValidation(
    allBlocks,
    isHorizontal,
    startInd,
    shipCategory
  );

  if (validPlace && notTakenBlock) {
    shipBlocks.forEach((shipBlock) => {
      shipBlock.classList.add(shipCategory.name);
      shipBlock.classList.add("taken");
    });
  } else {
    if (user === "computer") addShip(user, shipCategory, blockId);
    if (user === "player") notDropped = true;
    // addShip(shipCategory);
  }
};

function handleValidation(allBlocks, isHorizontal, startInd, shipCategory) {
  let validPlace;
  let randomIndex = Math.floor(Math.random() * width * width);

  let shipBlocks = [];
  const valid = isHorizontal
    ? startInd <= width * width - shipCategory.length
      ? startInd
      : width * width - shipCategory.length
    : startInd <= width * width - width * shipCategory.length
    ? startInd
    : startInd - shipCategory.length * width + width;

  for (let i = 0; i < shipCategory.length; i++) {
    if (isHorizontal) {
      shipBlocks.push(allBlocks[Number(randomIndex) + i]);
    } else {
      shipBlocks.push(allBlocks[Number(randomIndex)] + i * width);
    }
  }

  if (isHorizontal) {
    shipBlocks.every(
      (_, index) =>
        (validPlace =
          shipBlocks[0].id % width !== width - (shipBlocks.length - index + 1))
    );
  } else {
    validPlace = shipBlocks.every(
      (_, index) => shipBlocks[0].id < 90 + (width * index + 1)
    );
  }

  const notTakenBlock = shipBlocks.every(
    (shipBlock) => !shipBlock.classList.contains("taken")
  );

  return { shipBlocks, validPlace, notTakenBlock };
}

ships.forEach((ship) => addShip("computer", ship));

let draggedShip;
const playerBlocks = document.querySelectorAll("#player div");

playerBlocks.forEach((playerBlock) => {
  playerBlock.addEventListener("dragover", dragOver);
  playerBlock.addEventListener("drop", dropShip);
});

const optionShips = Array.from(container.children);
optionShips.forEach((optionShip) =>
  optionShip.addEventListener("dragstart", dragStart)
);

function dragOver(e) {
  e.preventDefault();
  const ship = ships[draggedShip.id];
  highLight(e.target.id, ship);
}

function dropShip(e) {
  const blockId = e.target.id;
  const ship = ships[draggedShip.id];
  addShip("player", ship, blockId);

  if (!notDropped) {
    draggedShip.remove();
  }
}

function dragStart(e) {
  notDropped = false;
  draggedShip = e.target;
}

function highLight(startIndex, ship) {
  const allBoardBlocks = document.querySelectorAll("#player div");
  let isHorizontal = rotationValue === 0;

  const { shipBlocks, validPlace, notTakenBlock } = handleValidation(
    allBoardBlocks,
    isHorizontal,
    startIndex,
    ship
  );

  if (validPlace && notTakenBlock) {
    shipBlocks.forEach((shipBlock) => {
      shipBlock.classList.add("hover");
      setTimeout(() => {
        shipBlock.classList.remove("hover");
      }, 3500);
    });
  }
}

let gameOver = false;
let playerTurn;
let playerHits = [];
let pcHits = [];
let playerDestrShips = [];
let pcDestrShips = [];

const handleClick = (e) => {
  if (!gameOver) {
    if (e.target.classList.contains("taken")) {
      e.target.classList.add("boom");
      info.textContent = "You hit.";
      let classes = Array.from(e.target.classList);
      classes = classes.filter((className) => className !== "block");
      classes = classes.filter((className) => className !== "boom");
      classes = classes.filter((className) => className !== "taken");

      playerHits.push(...classes);
      checkScores("player", playerHits, playerDestrShips);
    }
    if (!e.target.classList.contains("taken")) {
      info.textContent = "No hit.";
      e.target.classList.add("empty");
    }
    playerTurn = false;
    const allBoardBlocks = document.querySelectorAll("#computer div");
    allBoardBlocks.forEach((block) => block.replaceWith(block.cloneNode(true)));
    setTimeout(goPC, 2500);
  }
};

function goPC() {
  if (!gameOver) {
    turn.textContent = "PC Turn";
    info.textContent = "PC is thinking";

    setTimeout(() => {
      let randomTime = Math.floor(Math.random() * width * width);
      const allBoardBlocks = document.querySelectorAll("#player div");

      if (
        allBoardBlocks[randomTime].classList.contains("taken") &&
        allBoardBlocks[randomTime].classList.contains("boom")
      ) {
        goPC();
        return;
      } else if (
        allBoardBlocks[randomTime].classList.contains("taken") &&
        !allBoardBlocks[randomTime].classList.contains("boom")
      ) {
        allBoardBlocks[randomTime].classList.add("boom");
        info.textContent = "PC hit something.";
        let classes = Array.from(allBoardBlocks[randomTime].classList);
        classes = classes.filter((className) => className !== "block");
        classes = classes.filter((className) => className !== "boom");
        classes = classes.filter((className) => className !== "taken");
        pcHits.push(...classes);
        checkScores("computer", pcHits, pcDestrShips);
      } else {
        info.textContent = "Nothing was hit.";
        allBoardBlocks[randomTime].classList.add("empty");
      }
    }, 3500);
    setTimeout(() => {
      playerTurn = true;
      turn = "Your turn.";
      info.textContent = "Please take your shot.";

      const allBoardBlocks = document.querySelectorAll("#computer div");
      allBoardBlocks.forEach((block) =>
        block.addEventListener("click", handleClick)
      );
    }, 7000);
  }
}

const startGame = () => {
  if (playerTurn === undefined) {
    if (container.children.length != 0) {
      info.textContent = "Please place all ships first";
    } else {
      const allBoardBlocks = document.querySelectorAll("#computer div");
      allBoardBlocks.forEach((block) =>
        block.addEventListener("click", handleClick)
      );
      playerTurn = true;
      turn.textContent = "GO";
      info.textContent = "The game have started";
    }
  }
};

startBtn.addEventListener("click", startGame);

function checkScores(user, userHits, userDestShips) {
  function checkShip(shipName, shipLength) {
    if (
      userHits.filter((storedShipName) => storedShipName === shipName)
        .length === shipLength
    ) {
      if (user === "player") {
        info.textContent = "Your destroyed a ship! Result: " + user + shipName;
        playerHits = userHits.filter(
          (storedShipName) => storedShipName !== shipName
        );
      }
      if (user === "computer") {
        info.textContent =
          "Computer destroyed a ship! Result: " + user + shipName;
        pcHits = userHits.filter(
          (storedShipName) => storedShipName !== shipName
        );
      }
      userDestShips.push(shipName);
    }
  }

  checkShip("destroyer", 2);
  checkShip("submarine", 3);
  checkShip("cruiser", 3);
  checkShip("battleship", 4);
  checkShip("carrier", 5);

  if (playerDestrShips.length === 5) {
    info.textContent = "You've won.";
    gameOver = true;
  }
  if (pcDestrShips.length === 5) {
    info.textContent = "PC've won, you lost.";
    gameOver = true;
  }
}
