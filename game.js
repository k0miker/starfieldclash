window.onload = function () {
    const loadingDiv = document.getElementById('loading');
    const canvas = document.getElementById('2dcanvas');
    const context = canvas.getContext('2d');
    const scoreDiv = document.getElementById('score');
    const highScoreDiv = document.getElementById('highscore');
    const gameOverDiv = document.getElementById('gameover');
    const instructionsDiv = document.getElementById('instructions');
    const startButton = document.getElementById('startButton');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let numStars = 500;
    const stars = [];
    const comets = [];
    let baseSpeed = 5;
    let speed = baseSpeed;
    let score = 0;
    let isGameOver = false;
    let highScore = localStorage.getItem('highScore') || 0;

    const ship = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        width: 50,
        height: 50
    };

    const shipImg = new Image();
    shipImg.onload = function () {
        loadingDiv.style.display = 'none';
        canvas.hidden = false;
        scoreDiv.hidden = false;
        highScoreDiv.hidden = false;
        instructionsDiv.hidden = false;
        initGame();
    };
    shipImg.src = 'ship.png'; // Ensure the ship.png file is in the correct directory

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
            size: Math.max((Math.random() * 10 + 3), 1) * (index % 50 === 0 ? 3 : 1), // Min size 4x4 pixels, tripled if special
            isSpecial: index % 50 === 0 // Every 50th star is special
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
        stars.length = 0;
        for (let i = 0; i < numStars; i++) {
            stars.push(createStar(i));
        }
    }

    function resetGame() {
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore);
        }
        score = 0;
        speed = baseSpeed;
        numStars = 500;
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

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(shipImg, ship.x - ship.width / 2, ship.y - ship.height / 2, ship.width, ship.height);

        stars.forEach((star, index) => {
            star.z -= speed;
            if (star.z <= 0) {
                if (!star.isSpecial) {
                    score += 1;
                }
                stars[index] = createStar(index);
                star.z = canvas.width;
            }

            const sx = (star.x - ship.x) * (canvas.width / star.z) + ship.x;
            const sy = (star.y - ship.y) * (canvas.width / star.z) + ship.y;
            const size = Math.max((1 - star.z / canvas.width) * star.size, 4);

            context.fillStyle = star.isSpecial ? "red" : "white";
            context.beginPath();
            context.arc(sx, sy, size / 2, 0, Math.PI * 2);
            context.fill();

            // Collision detection
            if (sx > ship.x - ship.width / 2 && sx < ship.x + ship.width / 2 && sy > ship.y - ship.height / 2 && sy < ship.y + ship.height / 2) {
                if (star.isSpecial) {
                    score += 1000;
                    stars[index] = createStar(index);
                    star.z = canvas.width;
                } else {
                    gameOver();
                    return;
                }
            }
        });

        // Comets
        if (score % 100 === 0 && comets.length < 10) {
            comets.push(createComet());
        }

        comets.forEach((comet, i) => {
            comet.x += comet.vx;
            comet.y += comet.vy;

            context.fillStyle = "orange";
            context.beginPath();
            context.arc(comet.x, comet.y, comet.size, 0, Math.PI * 2);
            context.fill();

            // Remove comets that move off-screen
            if (comet.x < 0 || comet.x > canvas.width || comet.y < 0 || comet.y > canvas.height) {
                comets.splice(i, 1);
            }

            // Comet collision with the ship
            if (comet.x > ship.x - ship.width / 2 && comet.x < ship.x + ship.width / 2 && comet.y > ship.y - ship.height / 2 && comet.y < ship.y + ship.height / 2) {
                gameOver();
                return;
            }
        });

        scoreDiv.textContent = `Score: ${score}`;
        highScoreDiv.textContent = `High Score: ${highScore}`;

        // Increase speed and number of stars based on the score
        speed = baseSpeed + Math.floor(score / 10000);
        if (score % 10000 === 0) {
            numStars += 200;
            populateStars();
        }

        requestAnimationFrame(updateStars);
    }

    function initGame() {
        populateStars();
        updateStars();
    }
}
