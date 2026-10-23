// Spawns drifting pink lily petals into the .sky background layer.
// Shared across pages — just add <script src="petals.js"></script>.

(function () {
  const sky = document.querySelector(".sky");
  if (!sky) return;

  const LILY_COUNT = 7;

  for (let i = 0; i < LILY_COUNT; i++) {
    const lily = document.createElement("span");
    lily.className = "lily";
    lily.textContent = "🌸";

    const left = Math.random() * 100;
    const duration = 10 + Math.random() * 9;
    const delay = Math.random() * 10;
    const size = 1.6 + Math.random() * 1.6;
    const sway = 40 + Math.random() * 60;

    lily.style.left = `${left}%`;
    lily.style.fontSize = `${size}rem`;
    lily.style.animationDuration = `${duration}s`;
    lily.style.animationDelay = `${delay}s`;
    lily.style.setProperty("--sway", `${sway}px`);

    sky.appendChild(lily);
  }
})();
