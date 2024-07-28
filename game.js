const canvas = document.getElementById('2dcanvas');
const scoreDiv = document.getElementById('score');
const highScoreDiv = document.getElementById('highscore');
const gameOverDiv = document.getElementById('gameover');
const instructionsDiv = document.getElementById('instructions');
const startButton = document.getElementById('startButton');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const context = canvas.getContext("2d");

let numStars = 50;
const maxStars = 2000;
const stars = [];
const comets = [];
let baseSpeed = 5;
let speed = baseSpeed;
const maxSpeed = baseSpeed * 10;
let score = 0;
let isGameOver = false;
let highScore = localStorage.getItem('highScore') || 0;
let isWPressed = false;
let isSPressed = false;

const ship = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 50,
    height: 50
};

const shipImg = new Image();
shipImg.src = 'ship.png';

const cometImg = new Image();
cometImg.src = 'comet.png';

function createStar(index) {
    let x, y;
    do {
        x = Math.random() * canvas.width;
        y = Math.random() * canvas.height;
    } while (Math.hypot(x - ship.x, y - ship.y) < 50); // Ensure star is at least 50px away from the ship

    return {
        x,
        y,
        z: Math.random() * canvas.width,
        o: Math.random(),
        size: 0, // Start with size 0
        speedVariation: Math.random() * 0.5 + 0.75, // Speed variation between 0.75 and 1.25
        isSpecial: index % 20 === 0 // Every 20th star is special
    };
}

function createComet() {
    const direction = Math.floor(Math.random() * 4);
    let x, y, vx, vy;

    switch (direction) {
        case 0: // from top
            x = Math.random() * canvas.width;
            y = 0;
            vx = (Math.random() - 0.5) * 10;
            vy = Math.random() * 5 + 2;
            break;
        case 1: // from bottom
            x = Math.random() * canvas.width;
            y = canvas.height;
            vx = (Math.random() - 0.5) * 10;
            vy = -(Math.random() * 5 + 2);
            break;
        case 2: // from left
            x = 0;
            y = Math.random() * canvas.height;
            vx = Math.random() * 5 + 2;
            vy = (Math.random() - 0.5) * 10;
            break;
        case 3: // from right
            x = canvas.width;
            y = Math.random() * canvas.height;
            vx = -(Math.random() * 5 + 2);
            vy = (Math.random() - 0.5) * 10;
            break;
    }

    return {
        x,
        y,
        vx,
        vy,
        size: Math.random() * 8 + 5
    };
}

function populateStars() {
    const newStarsCount = Math.min(maxStars, numStars) - stars.length;
    for (let i = 0; i < newStarsCount; i++) {
        stars.push(createStar(stars.length + i));
    }
}

document.addEventListener('keydown', (event) => {
    if (event.code === 'ArrowUp') {
        clearInterval(speedDecreaseInterval);
        speedIncreaseInterval = setInterval(() => {
            speed = Math.min(maxSpeed, speed + 2);
        }, 100);
    } else if (event.code === 'ArrowDown') {
        clearInterval(speedIncreaseInterval);
        speedDecreaseInterval = setInterval(() => {
            speed = Math.max(baseSpeed, speed - 2);
        }, 100);
    } else if (event.code === 'KeyW') {
        isWPressed = true;
        isSPressed = false;
    } else if (event.code === 'KeyS') {
        isSPressed = true;
        isWPressed = false;
    } else if (event.code === 'NumpadAdd') {
        numStars = Math.min(maxStars, numStars + 50);
        populateStars();
    } else if (event.code === 'NumpadSubtract') {
        numStars = Math.max(50, numStars - 50);
        populateStars();
    }
});

document.addEventListener('keyup', (event) => {
    if (event.code === 'KeyW') {
        isWPressed = false;
    } else if (event.code === 'KeyS') {
        isSPressed = false;
    } else if (event.code === 'ArrowUp') {
        clearInterval(speedIncreaseInterval);
    } else if (event.code === 'ArrowDown') {
        clearInterval(speedDecreaseInterval);
    }
});

canvas.addEventListener('mousemove', (event) => {
    if (!isGameOver) {
        ship.x = event.clientX;
        ship.y = event.clientY;
    }
});

canvas.addEventListener('click', (event) => {
    if (isGameOver) {
        ship.x = event.clientX;
        ship.y = event.clientY;
        resetGame();
    }
});

canvas.addEventListener('touchmove', (event) => {
    if (!isGameOver) {
        const touch = event.touches[0];
        ship.x = touch.clientX;
        ship.y = touch.clientY - 300;
    }
});

canvas.addEventListener('touchstart', (event) => {
    if (isGameOver) {
        const touch = event.touches[0];
        ship.x = touch.clientX;
        ship.y = touch.clientY - 300;
        resetGame();
    }
});

function resetGame() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }
    score = 0;
    speed = baseSpeed;
    numStars = 50;
    isGameOver = false;
    gameOverDiv.style.display = 'none';
    populateStars();
    comets.length = 0;
    updateStars();
}

function gameOver() {
    isGameOver = true;
    gameOverDiv.style.display = 'block';
    highScoreDiv.textContent = `High Score: ${highScore}`;
}

function updateStars() {
    if (isGameOver) return;

    // Adjust speed based on score
    const speedMultiplier = 1 + Math.floor(score / 1000)/15; // Adjust the divisor to control the rate of speed increase
    speed = Math.min(maxSpeed, baseSpeed * speedMultiplier);

    if (isWPressed) {
        speed = Math.min(maxSpeed, speed * 5); // Increase speed to 5x current speed while held
    } else if (isSPressed) {
        speed /= 2; // Set speed to current speed / 2 while pressed
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    context.drawImage(shipImg, ship.x - ship.width / 2, ship.y - ship.height / 2, ship.width, ship.height);

    for (let i = 0; i < stars.length; i++) {
        let star = stars[i];
        star.z -= star.isSpecial ? (speed / 3) * star.speedVariation : speed * star.speedVariation;

        if (star.z <= 0) {
            if (!star.isSpecial) {
                score += 1;
            }
            Object.assign(star, createStar(i));
            star.z = canvas.width;
        }

        const sx = (star.x - ship.x) * (canvas.width / star.z) + ship.x;
        const sy = (star.y - ship.y) * (canvas.width / star.z) + ship.y;
        star.size = Math.max((1 - star.z / canvas.width) * 10, 2); // Gradually increase the size

        context.fillStyle = star.isSpecial ? "red" : "white";
        context.beginPath();
        context.arc(sx, sy, star.size / 2, 0, Math.PI * 2);
        context.fill();

        if (speed >= baseSpeed * 5) { // Only draw trails if speed is at least 5x base speed
            const trailLength = Math.min(speed * 1, 100); // Max trail length
            const alpha = 0.2; // Trail transparency
            const ex = sx + (sx - ship.x) * 0.01 * trailLength;
            const ey = sy + (sy - ship.y) * 0.01 * trailLength;

            const gradient = context.createLinearGradient(sx, sy, ex, ey);
            gradient.addColorStop(0, star.isSpecial ? "rgba(255, 0, 0, 1)" : "rgba(255, 255, 255, 1)");
            gradient.addColorStop(1, star.isSpecial ? `rgba(255, 0, 0, 0)` : `rgba(255, 255, 255, 0)`);

            context.strokeStyle = gradient;
            context.lineWidth = star.size / 2;
            context.beginPath();
            context.moveTo(sx, sy);
            context.lineTo(ex, ey);
            context.stroke();
        }

        // Check collision only for special stars
        if (star.isSpecial && sx > ship.x - ship.width / 2 && sx < ship.x + ship.width / 2 && sy > ship.y - ship.height / 2 && sy < ship.y + ship.height / 2) {
            score += 1000;
            Object.assign(star, createStar(i));
            star.z = canvas.width;
        }
    }

    if (score % 100 === 0 && numStars < maxStars) {
        numStars += 10;
        populateStars();
    }

    if (score % 50 === 0) {
        comets.push(createComet());
    }

    for (let i = 0; i < comets.length; i++) {
        let comet = comets[i];
        comet.x += comet.vx;
        comet.y += comet.vy;

        context.drawImage(cometImg, comet.x - comet.size / 2, comet.y - comet.size / 2, comet.size, comet.size);

        if (comet.x < 0 || comet.x > canvas.width || comet.y < 0 || comet.y > canvas.height) {
            comets.splice(i, 1);
            i--;
        }

        if (comet.x > ship.x - ship.width / 2 && comet.x < ship.x + ship.width / 2 && comet.y > ship.y - ship.height / 2 && comet.y < ship.y + ship.height / 2) {
            gameOver();
            return;
        }
    }

    scoreDiv.textContent = `Score: ${score}`;
    highScoreDiv.textContent = `High Score: ${highScore}`;

    requestAnimationFrame(updateStars);
}

function initGame() {
    startButton.addEventListener('click', () => {
        instructionsDiv.style.display = 'none';
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('touchstart', handleTouchStart);
        resetGame();
    });

    shipImg.onload = () => {
        populateStars();
        updateStars();
    };
}

function handleMouseMove(event) {
    if (!isGameOver) {
        ship.x = event.clientX;
        ship.y = event.clientY;
    }
}

function handleTouchStart(event) {
    if (!isGameOver) {
        const touch = event.touches[0];
        ship.x = touch.clientX;
        ship.y = touch.clientY;
    }
}

initGame();