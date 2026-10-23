// Spawns falling autumn/spring leaves and hearts into the .sky layer.
// Used on page5.html instead of petals.js for a different themed effect.

(function () {
  const sky = document.querySelector(".sky");
  if (!sky) return;

  const ITEMS = ["🍃", "🍂", "🍁", "♡"];
  const COUNT = 12;

  for (let i = 0; i < COUNT; i++) {
    const el = document.createElement("span");
    el.className = "lily";
    el.textContent = ITEMS[Math.floor(Math.random() * ITEMS.length)];

    const left = Math.random() * 100;
    const duration = 9 + Math.random() * 8;
    const delay = Math.random() * 9;
    const size = 1.4 + Math.random() * 1.4;
    const sway = 40 + Math.random() * 60;

    el.style.left = `${left}%`;
    el.style.fontSize = `${size}rem`;
    el.style.animationDuration = `${duration}s`;
    el.style.animationDelay = `${delay}s`;
    el.style.setProperty("--sway", `${sway}px`);

    sky.appendChild(el);
  }
})();
