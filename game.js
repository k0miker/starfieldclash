// Get references to the HTML elements
const canvas = document.getElementById('2dcanvas');
const scoreDiv = document.getElementById('score');
const highScoreDiv = document.getElementById('highscore');
const gameOverDiv = document.getElementById('gameover');
const instructionsDiv = document.getElementById('instructions');
const startButton = document.getElementById('startButton');

// Set the canvas dimensions to match the window dimensions
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Get the 2D drawing context for the canvas
const context = canvas.getContext("2d");

// Initialize variables for the game
let numStars = 50; // Initial number of stars
const maxStars = 2000; // Maximum number of stars
const stars = []; // Array to store star objects
const comets = []; // Array to store comet objects
let baseSpeed = 5; // Base speed for stars
let speed = baseSpeed; // Current speed of the stars
const maxSpeed = baseSpeed * 10; // Maximum speed of the stars
let score = 0; // Current score
let isGameOver = false; // Game over state
let highScore = localStorage.getItem('highScore') || 0; // Retrieve high score from local storage
let isWPressed = false; // State for "W" key press
let isSPressed = false; // State for "S" key press

// Define the ship object
const ship = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 50,
    height: 50
};

// Load ship and comet images
const shipImg = new Image();
shipImg.src = 'ship.png';
const cometImg = new Image();
cometImg.src = 'comet.png';

// Function to create a new star
function createStar(index) {
    let x, y;
    do {
        x = Math.random() * canvas.width;
        y = Math.random() * canvas.height;
    } while (Math.hypot(x - ship.x, y - ship.y) < 50); // Ensure star is at least 50px away from the ship

    return {
        x,
        y,
        z: Math.random() * canvas.width, // Depth of the star
        o: Math.random(), // Opacity
        size: 0, // Start with size 0
        speedVariation: Math.random() * 0.5 + 0.75, // Speed variation between 0.75 and 1.25
        isSpecial: index % 20 === 0 // Every 20th star is special
    };
}

// Function to create a new comet
function createComet() {
    const direction = Math.floor(Math.random() * 4); // Random direction for the comet (0: top, 1: bottom, 2: left, 3: right)
    let x, y, vx, vy;

    // Set position and velocity based on direction
    switch (direction) {
        case 0: // from top
            x = Math.random() * canvas.width; // Random x position
            y = 0; // Start from the top
            vx = (Math.random() - 0.5) * 5; // Horizontal speed 
            vy = Math.random() * 3 + 2; // Vertical speed between 2 and 7
            break;
        case 1: // from bottom
            x = Math.random() * canvas.width; // Random x position
            y = canvas.height; // Start from the bottom
            vx = (Math.random() - 0.5) * 5; // Horizontal speed
            vy = -(Math.random() * 3 + 2); // Vertical speed
            break;
        case 2: // from left
            x = 0; // Start from the left
            y = Math.random() * canvas.height; // Random y position
            vx = Math.random() * 3 + 2; // Horizontal speed
            vy = (Math.random() - 0.5) * 5; // Vertical speed
            break;
        case 3: // from right
            x = canvas.width; // Start from the right
            y = Math.random() * canvas.height; // Random y position
            vx = -(Math.random() * 3 + 2); // Horizontal speed
            vy = (Math.random() - 0.5) * 5; // Vertical speed
            break;
    }

    return {
        x,
        y,
        vx, // Horizontal speed component
        vy, // Vertical speed component
        size: Math.random() * 5 + 8 // Random size between 8 and 13
    };
}

// Function to populate the stars array
function populateStars() {
    const newStarsCount = Math.min(maxStars, numStars) - stars.length;
    for (let i = 0; i < newStarsCount; i++) {
        stars.push(createStar(stars.length + i));
    }
}

// Event listener for keydown events
document.addEventListener('keydown', (event) => {
    if (event.code === 'ArrowUp') {
        clearInterval(speedDecreaseInterval); // Clear any speed decrease interval
        speedIncreaseInterval = setInterval(() => {
            speed = Math.min(maxSpeed, speed + 2); // Increase speed up to the maximum
        }, 100);
    } else if (event.code === 'ArrowDown') {
        clearInterval(speedIncreaseInterval); // Clear any speed increase interval
        speedDecreaseInterval = setInterval(() => {
            speed = Math.max(baseSpeed, speed - 2); // Decrease speed down to the base speed
        }, 100);
    } else if (event.code === 'KeyW') {
        isWPressed = true; // Set state for "W" key press
        isSPressed = false; // Unset state for "S" key press
    } else if (event.code === 'KeyS') {
        isSPressed = true; // Set state for "S" key press
        isWPressed = false; // Unset state for "W" key press
    } else if (event.code === 'NumpadAdd') {
        numStars = Math.min(maxStars, numStars + 50); // Increase the number of stars
        populateStars(); // Repopulate stars
    } else if (event.code === 'NumpadSubtract') {
        numStars = Math.max(50, numStars - 50); // Decrease the number of stars
        populateStars(); // Repopulate stars
    }
});

// Event listener for keyup events
document.addEventListener('keyup', (event) => {
    if (event.code === 'KeyW') {
        isWPressed = false; // Unset state for "W" key press
    } else if (event.code === 'KeyS') {
        isSPressed = false; // Unset state for "S" key press
    } else if (event.code === 'ArrowUp') {
        clearInterval(speedIncreaseInterval); // Clear speed increase interval
    } else if (event.code === 'ArrowDown') {
        clearInterval(speedDecreaseInterval); // Clear speed decrease interval
    }
});

// Event listener for mouse move events
canvas.addEventListener('mousemove', (event) => {
    if (!isGameOver) {
        ship.x = event.clientX; // Update ship's x position
        ship.y = event.clientY; // Update ship's y position
    }
});

// Event listener for mouse click events
canvas.addEventListener('click', (event) => {
    if (isGameOver) {
        ship.x = event.clientX; // Update ship's x position
        ship.y = event.clientY; // Update ship's y position
        resetGame(); // Reset the game
    }
});

// Event listener for touch move events
canvas.addEventListener('touchmove', (event) => {
    if (!isGameOver) {
        const touch = event.touches[0];
        ship.x = touch.clientX; // Update ship's x position
        ship.y = touch.clientY - 300; // Update ship's y position with offset
    }
});

// Event listener for touch start events
canvas.addEventListener('touchstart', (event) => {
    if (isGameOver) {
        const touch = event.touches[0];
        ship.x = touch.clientX; // Update ship's x position
        ship.y = touch.clientY - 300; // Update ship's y position with offset
        resetGame(); // Reset the game
    }
});

// Function to reset the game
function resetGame() {
    if (score > highScore) {
        highScore = score; // Update high score if current score is higher
        localStorage.setItem('highScore', highScore); // Save high score to local storage
    }
    score = 0; // Reset score
    speed = baseSpeed; // Reset speed
    numStars = 50; // Reset number of stars
    isGameOver = false; // Reset game over state
    gameOverDiv.style.display = 'none'; // Hide game over div
    populateStars(); // Repopulate stars
    comets.length = 0; // Clear comets array
    updateStars(); // Start updating stars
}

// Function to handle game over state
function gameOver() {
    isGameOver = true; // Set game over state
    gameOverDiv.style.display = 'block'; // Show game over div
    highScoreDiv.textContent = `High Score: ${highScore}`; // Display high score
}

// Function to update stars
function updateStars() {
    if (isGameOver) return;

    // Adjust speed based on score
    const speedMultiplier = 1 + Math.floor(score / 1000) / 15; // Adjust the divisor to control the rate of speed increase
    speed = Math.min(maxSpeed, baseSpeed * speedMultiplier); // Update speed with multiplier

    // Check if "W" or "S" keys are pressed
    if (isWPressed) {
        speed = Math.min(maxSpeed, speed * 5); // Increase speed to 5x current speed while held
    } else if (isSPressed) {
        speed /= 2; // Set speed to current speed / 2 while pressed
    }

    // Clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the ship
    context.drawImage(shipImg, ship.x - ship.width / 2, ship.y - ship.height / 2, ship.width, ship.height);

    // Update and draw each star
    for (let i = 0; i < stars.length; i++) {
        let star = stars[i];
        star.z -= star.isSpecial ? (speed / 3) * star.speedVariation : speed * star.speedVariation;

        if (star.z <= 0) {
            if (!star.isSpecial) {
                score += 1; // Increase score for non-special stars
            }
            Object.assign(star, createStar(i)); // Reset star properties
            star.z = canvas.width; // Reset star depth
        }

        // Calculate star's position on the canvas
        const sx = (star.x - ship.x) * (canvas.width / star.z) + ship.x;
        const sy = (star.y - ship.y) * (canvas.width / star.z) + ship.y;
        star.size = Math.max((1 - star.z / canvas.width) * 10, 2); // Gradually increase the size

        // Set star color based on whether it is special
        context.fillStyle = star.isSpecial ? "red" : "white";
        context.beginPath();
        context.arc(sx, sy, star.size / 2, 0, Math.PI * 2);
        context.fill();

        // Draw trails for fast-moving stars
        if (speed >= baseSpeed * 5) {
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

        // Check for collision with special stars
        if (star.isSpecial && sx > ship.x - ship.width / 2 && sx < ship.x + ship.width / 2 && sy > ship.y - ship.height / 2 && sy < ship.y + ship.height / 2) {
            score += 1000; // Increase score for special stars
            Object.assign(star, createStar(i)); // Reset star properties
            star.z = canvas.width; // Reset star depth
        }
    }

    // Increase the number of stars based on score
    if (score % 100 === 0 && numStars < maxStars) {
        numStars += 10;
        populateStars();
    }

    // Add new comets based on score
    if (score % 100 === 0) {
        comets.push(createComet());
    }

    // Update and draw each comet
    for (let i = 0; i < comets.length; i++) {
        let comet = comets[i];
        comet.x += comet.vx;
        comet.y += comet.vy;

        // Draw the comet
        context.drawImage(cometImg, comet.x - comet.size, comet.y - comet.size, comet.size * 2, comet.size * 2);

        // Remove comets that have moved off the screen
        if (comet.x < 0 || comet.x > canvas.width || comet.y < 0 || comet.y > canvas.height) {
            comets.splice(i, 1);
            i--;
        }

        // Check for collision with the ship
        if (comet.x > ship.x - ship.width / 2 && comet.x < ship.x + ship.width / 2 && comet.y > ship.y - ship.height / 2 && comet.y < ship.y + ship.height / 2) {
            gameOver(); // End the game
            return;
        }
    }

    // Update the score display
    scoreDiv.textContent = `Score: ${score}`;
    highScoreDiv.textContent = `High Score: ${highScore}`;

    // Request the next animation frame
    requestAnimationFrame(updateStars);
}

// Function to initialize the game
function initGame() {
    startButton.addEventListener('click', () => {
        instructionsDiv.style.display = 'none'; // Hide instructions div
        canvas.addEventListener('mousemove', handleMouseMove); // Add mouse move event listener
        canvas.addEventListener('touchstart', handleTouchStart); // Add touch start event listener
        resetGame(); // Reset the game
    });

    // Load ship image and start the game when loaded
    shipImg.onload = () => {
        populateStars(); // Populate stars
        updateStars(); // Start updating stars
    };
}

// Function to handle mouse move events
function handleMouseMove(event) {
    if (!isGameOver) {
        ship.x = event.clientX; // Update ship's x position
        ship.y = event.clientY; // Update ship's y position
    }
}

// Function to handle touch start events
function handleTouchStart(event) {
    if (!isGameOver) {
        const touch = event.touches[0];
        ship.x = touch.clientX; // Update ship's x position
        ship.y = touch.clientY; // Update ship's y position
    }
}

// Initialize the game
initGame();
