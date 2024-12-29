// Select the audio and canvas elements
const audioElement = document.getElementById("backgroundMusic");
const canvas = document.getElementById("fireworksCanvas");
const ctx = canvas.getContext("2d");

// Resize canvas
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Fireworks array
let fireworks = [];

// Audio Context setup
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const audioSource = audioContext.createMediaElementSource(audioElement);
const analyser = audioContext.createAnalyser();

audioSource.connect(analyser);
analyser.connect(audioContext.destination);

// Configure analyser
analyser.fftSize = 256;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

// Firework class
class Firework {
  constructor(x, y, color, size, velocityX, velocityY, life) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.size = size;
    this.velocityX = velocityX;
    this.velocityY = velocityY;
    this.life = life;
  }

  update() {
    this.x += this.velocityX;
    this.y += this.velocityY;
    this.size *= 0.98; // Gradual shrinking effect
    this.life -= 1;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}


// Create firework explosion
function createExplosion(x, y, intensity) {
  const particles = [];
  const colors = ["#FF5733", "#FFBD33", "#75FF33", "#33FFBD", "#3375FF", "#BD33FF"];
  const particleCount = Math.floor(intensity / 2); // Increase particle count for larger explosions

  for (let i = 0; i < particleCount; i++) {
    const angle = (Math.PI * 2 * i) / particleCount;
    const speed = Math.random() * 5 + 2; // Higher speed for bigger explosion
    const velocityX = Math.cos(angle) * speed;
    const velocityY = Math.sin(angle) * speed;
    const size = Math.random() * 5 + 2; // Larger particle size
    const life = Math.random() * 50 + 30; // Longer lifespan for bigger explosions

    const color = colors[Math.floor(Math.random() * colors.length)];
    particles.push(new Firework(x, y, color, size, velocityX, velocityY, life));
  }

  return particles;
}

// Update and draw fireworks
function updateFireworks() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  fireworks.forEach((firework, index) => {
    firework.update();
    firework.draw();

    if (firework.life <= 0) {
      fireworks.splice(index, 1);
    }
  });

  requestAnimationFrame(updateFireworks);
}

// Launch fireworks based on sound intensity
function launchFireworks() {
  analyser.getByteFrequencyData(dataArray);

  const avgIntensity = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;

  if (avgIntensity > 60) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height * 0.5;
    fireworks.push(...createExplosion(x, y, avgIntensity * 1.5)); // Increase intensity multiplier for larger explosions
  }
}

// Start fireworks and music
document.getElementById("celebrateBtn").addEventListener("click", () => {
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  if (audioElement.paused) {
    audioElement.play();
    setInterval(launchFireworks, 100); // Trigger fireworks every 100ms
  } else {
    audioElement.pause();
    fireworks = [];
  }
});

// Handle window resize
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// Start fireworks animation loop
updateFireworks();
