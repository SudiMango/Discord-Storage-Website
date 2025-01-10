const canvas = document.getElementById("matrix")
const ctx = canvas.getContext("2d")
let columnWidth;
let numColumns = 30;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    columnWidth = canvas.width / numColumns;
}
resize();
window.addEventListener("resize", resize);

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()';
const fontSize = 14;
const drops = Array.from({ length: numColumns }, () => Math.floor(Math.random() * (canvas.height / fontSize)));

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.01)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (document.title == "Home") {
        ctx.fillStyle = 'rgb(114, 137, 218, 1)';
    } else {
        ctx.fillStyle = 'rgb(114, 137, 218, 0.5)';
    }
    ctx.font = fontSize + 'px monospace';

    // Loop through drops
    for (let i = 0; i < drops.length; i++) {
        // Random character
        const char = chars[Math.floor(Math.random() * chars.length)];
        
        // Draw character
        const x = i * columnWidth;
        ctx.fillText(char, x, drops[i] * fontSize);

        // Reset drop if it reaches bottom
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }

        drops[i]++;
    }
}

setInterval(draw, 60);