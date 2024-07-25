async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    token = data.token;
    highScore = data.highScore;
    highScoreDiv.textContent = `High Score: ${highScore}`;
}

async function register() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    await fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    login();
}
