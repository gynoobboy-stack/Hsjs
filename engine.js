/* =========================================================
   Visual novel engine — shared by every chapter page.
   Each chapter page loads this file first, then its own story
   file, which calls VN.init({...}) and VN.startChapter(steps).
   ========================================================= */

/* =========================================================
   Visual Novel — Chapter 1
   Story data lives in buildChapter1(). To add Chapter 2 later,
   write buildChapter2() and call startChapter(buildChapter2())
   from startChapter2() near the bottom of this file.
   ========================================================= */

(function () {
  "use strict";

  /* ---------- Config ---------- */
  var IMAGES = [];   // filled in by VN.init({ images: [...] })
  var TYPE_SPEED = 28;       // ms per character
  var BG_FADE = 900;         // ms, matches CSS .bg-layer transition
  var SCREEN_FADE = 600;     // ms, matches CSS .screen transition
  var PETAL_COUNT = 28;

  /* ---------- State ---------- */
  var state = {
    playerName: "",
    choices: {},          // remembered choices, e.g. state.choices.panel2 = 1
    chapter1Decision: "",  // "rejected" | "tomorrow" — read again in Chapter 2
    endingHref: "",      // page to open from the ending button ("" = show "coming soon")
    endingSoon: "",
    queue: [],            // upcoming story steps
    busy: false,          // blocks input while something is animating
    currentBg: "",
    activeLayer: "a",
    currentScreen: "",
    typingToken: 0,
    lastText: "",
    lastSpeaker: null,
    boxVisible: false
  };

  /* ---------- Elements ---------- */
  var $ = function (id) { return document.getElementById(id); };
  var el = {
    game: $("game"),
    bgA: $("bg-a"),
    bgB: $("bg-b"),
    petals: $("petals"),
    dialogueBox: $("dialogue-box"),
    charName: $("character-name"),
    dialogueText: $("dialogue-text"),
    choices: $("choices"),
    continueBtn: $("continue-btn"),
    endingTitle: $("ending-title"),
    nextChapterBtn: $("next-chapter-btn"),
    comingSoon: $("coming-soon")
  };

  /* ---------- Helpers ---------- */
  function sleep(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  function fillName(text) {
    return text.replace(/\[PLAYER NAME\]/g, state.playerName);
  }

  function preloadImages() {
    IMAGES.forEach(function (src) {
      var img = new Image();
      img.src = src;
    });
  }

  /* ---------- Flower particles ---------- */
  function createPetals() {
    if (!el.petals) return;
    for (var i = 0; i < PETAL_COUNT; i++) {
      var p = document.createElement("span");
      p.className = "petal";
      p.textContent = "\uD83C\uDF38"; // 🌸
      var size = 14 + Math.random() * 22;
      var duration = 12 + Math.random() * 14;
      p.style.fontSize = size + "px";
      p.style.left = (Math.random() * 100) + "%";
      p.style.setProperty("--sway", (Math.random() * 160 - 80) + "px");
      p.style.setProperty("--o", (0.35 + Math.random() * 0.55).toFixed(2));
      p.style.animationDuration = duration + "s";
      p.style.animationDelay = (-Math.random() * duration) + "s";
      el.petals.appendChild(p);
    }
  }

  function setPetals(on) {
    if (el.petals) el.petals.classList.toggle("on", on);
  }

  /* ---------- Saved decisions ---------- */
  function saveProgress() {
    try {
      localStorage.setItem("vn_playerName", state.playerName);
      localStorage.setItem("vn_chapter1Decision", state.chapter1Decision);
    } catch (err) { /* storage unavailable — in-memory state is still used */ }
  }
  function loadProgress() {
    try {
      if (!state.playerName) state.playerName = localStorage.getItem("vn_playerName") || "";
      if (!state.chapter1Decision) state.chapter1Decision = localStorage.getItem("vn_chapter1Decision") || "";
    } catch (err) { /* ignore */ }
  }

  /* ---------- Layout (landscape sizing) ---------- */
  function updateLayout() {
    el.game.classList.toggle("compact", el.game.clientHeight < 520);
    if (el.petals) el.petals.style.setProperty("--h", el.game.clientHeight + "px");
  }

  /* ---------- Backgrounds ---------- */
  function setBackground(src, instant) {
    if (!src || src === state.currentBg) return Promise.resolve();
    state.currentBg = src;

    var incoming = state.activeLayer === "a" ? el.bgB : el.bgA;
    var outgoing = state.activeLayer === "a" ? el.bgA : el.bgB;
    state.activeLayer = state.activeLayer === "a" ? "b" : "a";

    if (instant) {
      // No transition: swap the images immediately
      el.bgA.classList.add("instant");
      el.bgB.classList.add("instant");
    }
    incoming.style.backgroundImage = 'url("' + src + '")';
    // force reflow so the fade runs
    void incoming.offsetWidth;
    incoming.classList.add("visible");
    outgoing.classList.remove("visible");

    if (instant) {
      void incoming.offsetWidth;
      el.bgA.classList.remove("instant");
      el.bgB.classList.remove("instant");
      return Promise.resolve();
    }
    return sleep(BG_FADE);
  }

  /* ---------- Screens ---------- */
  function showScreen(id) {
    var current = $(state.currentScreen);
    var next = $(id);
    if (current === next) return Promise.resolve();

    current.classList.remove("active");
    return sleep(SCREEN_FADE).then(function () {
      next.classList.add("active");
      state.currentScreen = id;
      return sleep(SCREEN_FADE);
    });
  }

  /* ---------- Dialogue rendering ---------- */
  function renderSpeaker(speaker, nameColor) {
    el.charName.textContent = "";
    if (speaker === "aayush") {
      var a = document.createElement("span");
      a.className = "name-aayush";
      a.textContent = "Aayush";
      el.charName.appendChild(a);
    } else if (speaker === "player") {
      var n = document.createElement("span");
      n.className = "name-player";
      n.textContent = state.playerName;
      var y = document.createElement("span");
      y.className = "name-you";
      y.textContent = "(you)";
      el.charName.appendChild(n);
      el.charName.appendChild(document.createTextNode(" "));
      el.charName.appendChild(y);
    } else {
      var o = document.createElement("span");
      o.className = nameColor === "red" ? "name-aayush" : (speaker === "???" || speaker === "Kusum" ? "name-unknown" : "name-neutral");
      o.textContent = speaker;
      el.charName.appendChild(o);
    }
  }

  function commonPrefixLength(a, b) {
    var i = 0;
    while (i < a.length && i < b.length && a[i] === b[i]) i++;
    return i;
  }

  function typeText(full, startIndex, speed) {
    speed = speed || TYPE_SPEED;
    var token = ++state.typingToken;
    el.dialogueText.textContent = full.slice(0, startIndex);
    return new Promise(function (resolve) {
      var i = startIndex;
      (function tick() {
        if (token !== state.typingToken) { resolve(); return; }
        if (i >= full.length) { resolve(); return; }
        i++;
        el.dialogueText.textContent = full.slice(0, i);
        setTimeout(tick, speed);
      })();
    });
  }

  function applyLineStyle(step) {
    el.dialogueText.classList.toggle("thought", !!step.thought);
    el.dialogueBox.classList.toggle("angry", !!step.angry); // red-tinted box
  }

  function hideControls() {
    el.continueBtn.classList.remove("show");
    el.choices.classList.remove("show");
    el.choices.innerHTML = "";
  }

  function showDialogueBox() {
    el.dialogueBox.style.display = "";
    void el.dialogueBox.offsetWidth;
    el.dialogueBox.classList.remove("fade-out");
    el.dialogueBox.classList.add("show");
    state.boxVisible = true;
  }

  function hideDialogueBox() {
    el.dialogueBox.classList.remove("show");
    el.dialogueBox.classList.add("fade-out");
    state.boxVisible = false;
    return sleep(500);
  }

  /* ---------- Story step handlers ---------- */
  async function playLine(step) {
    var text = fillName(step.text);
    var speed = step.speed || TYPE_SPEED;

    // Instant background swap (no transition), keeps the box where it is
    if (step.instant && step.bg && step.bg !== state.currentBg) {
      await setBackground(step.bg, true);
    }

    var bgChanges = step.bg && step.bg !== state.currentBg;
    var speakerChanged = state.lastSpeaker !== step.speaker;

    if (bgChanges || !state.boxVisible) {
      // Background change: fade the box out, swap background, fade box back in
      if (bgChanges) {
        if (state.boxVisible) await hideDialogueBox();
        await setBackground(step.bg);
      }
      renderSpeaker(step.speaker, step.nameColor);
      el.dialogueText.textContent = "";
      applyLineStyle(step);       // style is set while the box is still hidden
      showDialogueBox();
      await sleep(250);
      await typeText(text, 0, speed);
    } else {
      if (speakerChanged) renderSpeaker(step.speaker, step.nameColor);
      // Smooth update: keep the shared beginning of the old line on screen
      var start = 0;
      if (step.smooth && !speakerChanged) {
        start = commonPrefixLength(state.lastText, text);
      }
      applyLineStyle(step);
      await typeText(text, start, speed);
    }

    state.lastText = text;
    state.lastSpeaker = step.speaker;

    if (step.auto) {
      // Interruption: move on by itself, no CONTINUE button
      await sleep(step.autoDelay || 1000);
      await runNext();
      return;
    }
    el.continueBtn.classList.add("show");
  }

  function playChoice(step) {
    el.choices.innerHTML = "";
    step.options.forEach(function (opt, index) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "choice-btn";
      btn.textContent = opt.label;
      btn.addEventListener("click", function () {
        onChoose(step, opt, index);
      });
      el.choices.appendChild(btn);
    });
    el.choices.classList.add("show");
  }

  async function playEmpty(step) {
    if (state.boxVisible) await hideDialogueBox();
    state.lastText = "";
    state.lastSpeaker = null;
    await setBackground(step.bg);
    el.continueBtn.classList.add("show");
  }

  async function playEnding(step) {
    if (state.boxVisible) await hideDialogueBox();
    el.endingTitle.textContent = step.title || "you ended chapter 1";
    el.nextChapterBtn.textContent = step.button || "CONTINUE TO CHAPTER 2";
    state.endingHref = step.href || "";
    state.endingSoon = step.soon || "";
    el.comingSoon.classList.remove("show");
    el.game.classList.toggle("dim", !!step.dim);
    if (step.bg) await setBackground(step.bg);
    await showScreen("ending-screen");
  }

  /* ---------- Story flow ---------- */
  async function runNext() {
    state.busy = true;
    hideControls();

    var step = state.queue.shift();
    if (!step) { state.busy = false; return; }

    if (step.type === "choice") {
      playChoice(step);
    } else if (step.type === "empty") {
      await playEmpty(step);
    } else if (step.type === "branch") {
      // Pick the story path from a remembered variable (e.g. Chapter 1 decision)
      var path = step.cases[state[step.key]] || step.cases[step.fallback] || [];
      state.queue = path.concat(state.queue);
      return runNext();
    } else if (step.type === "ending") {
      await playEnding(step);
    } else {
      await playLine(step);
    }
    state.busy = false;
  }

  function onChoose(step, option, index) {
    if (state.busy) return;
    state.busy = true;                 // block double clicks
    state.choices[step.id] = index + 1; // remember the choice
    if (option.save) { Object.assign(state, option.save); saveProgress(); }
    el.choices.classList.remove("show");
    // Insert the chosen branch at the front of the queue
    state.queue = option.next.concat(state.queue);
    runNext();
  }

  function onContinue() {
    if (state.busy) return;
    runNext();
  }

  async function startChapter(steps) {
    state.queue = steps.slice();
    state.lastText = "";
    state.lastSpeaker = null;
    state.boxVisible = false;
    el.game.classList.remove("dim");
    el.dialogueBox.classList.remove("show", "fade-out");
    hideControls();

    state.busy = true;
    // Fade the name screen away, set the first scene, then reveal the story
    var cur = $(state.currentScreen);
    if (cur) cur.classList.remove("active");
    setPetals(false);
    await sleep(SCREEN_FADE);
    var first = state.queue[0];
    if (first && first.bg) await setBackground(first.bg);
    $("story-screen").classList.add("active");
    state.currentScreen = "story-screen";
    await sleep(SCREEN_FADE);
    runNext();
  }

  /* ---------- Ending button ---------- */
  var leaving = false;
  function onNextChapter() {
    if (leaving) return;
    if (state.endingHref) {
      // Open the next chapter's page with a fade-out
      leaving = true;
      el.game.classList.add("leaving");
      setTimeout(function () { window.location.href = state.endingHref; }, 700);
    } else {
      el.comingSoon.textContent = state.endingSoon || "Coming soon \uD83C\uDF38";
      el.comingSoon.classList.add("show");
    }
  }

  /* ---------- Public API ---------- */
  function init(opts) {
    IMAGES = opts.images || [];
    state.currentScreen = opts.screen || "";
    el.continueBtn.addEventListener("click", onContinue);
    el.nextChapterBtn.addEventListener("click", onNextChapter);
    window.addEventListener("resize", updateLayout);
    window.addEventListener("orientationchange", updateLayout);
    updateLayout();
    preloadImages();
    if (opts.petals) { createPetals(); setPetals(true); }
    if (opts.background) setBackground(opts.background);
  }

  window.VN = {
    state: state,
    el: el,
    init: init,
    startChapter: startChapter,
    showScreen: showScreen,
    updateLayout: updateLayout,
    saveProgress: saveProgress,
    loadProgress: loadProgress
  };
})();
