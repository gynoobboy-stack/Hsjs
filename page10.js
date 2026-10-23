/* =========================================================
   Chapter 1 page (page10.html)
   Title screen, name entry and the Chapter 1 story.
   Needs engine.js loaded first.
   ========================================================= */

(function () {
  "use strict";

  var VN = window.VN;
  var state = VN.state;
  var el = VN.el;
  var $ = function (id) { return document.getElementById(id); };

  var ui = {
    startBtn: $("start-btn"),
    nameInput: $("name-input"),
    nameError: $("name-error"),
    enterBtn: $("enter-btn")
  };

  var IMAGES = [
    "background.jpg", "first.jpg", "wave.jpg", "teethsmile.jpg", "smile.jpg",
    "img.jpg", "shy.jpg", "backside.jpg", "empty.jpg",
    "school.jpg", "classroom.jpg", "friend.jpg"
  ];

  /* ---------- Chapter 1 story ---------- */
  function buildChapter1() {
    var A = "aayush";
    var P = "player";

    return [
      // PANEL 1
      { bg: "first.jpg", speaker: "???", nameColor: "red", text: "........" },

      // PANEL 2
      { bg: "wave.jpg", speaker: A, text: "hello.....I'm Aayush" },
      {
        type: "choice",
        id: "panel2",
        options: [
          {
            label: "hi...",
            next: [
              { speaker: P, text: "hi..." },
              { bg: "teethsmile.jpg", speaker: A, text: "Didnt expect that I'd meet you here" }
            ]
          },
          {
            label: "don't say anything..",
            next: [
              {
                bg: "smile.jpg",
                speaker: A,
                text: "It's ok, if you don't wanna talk, it might because we had been in a long distance for a year."
              }
            ]
          }
        ]
      },

      // PANEL 3
      { bg: "smile.jpg", speaker: A, text: "you have came this far it means you saw everything that I made for you, right ?" },
      { speaker: A, text: "that took me months to create!" },
      { speaker: A, text: "that took me months to create, anyways leave it", smooth: true },

      // PANEL 4
      { bg: "img.jpg", speaker: A, text: "I have a small request" },
      { speaker: P, text: "what is it?" },

      // PANEL 5
      { bg: "img.jpg", speaker: A, text: "will you...." },
      { speaker: P, text: "will I...what ??" },
      {
        bg: "shy.jpg",
        speaker: A,
        text: "will you come to my house. Only for a short talk. It's been a year so.......will you?"
      },
      {
        type: "choice",
        id: "panel5",
        options: [
          {
            label: "no I can't sorry about that",
            save: { chapter1Decision: "rejected" },
            next: [
              // PANEL 6 — choice 1
              { speaker: P, text: "no I can't sorry about that" },
              { bg: "backside.jpg", speaker: A, text: "it's ok, tell me if you change your mind" },
              { type: "empty", bg: "empty.jpg" }
            ]
          },
          {
            label: "I can't make that choice now, I'll tell you tomorrow.",
            save: { chapter1Decision: "tomorrow" },
            next: [
              // PANEL 6 — choice 2
              { speaker: P, text: "I can't make that choice now, I'll tell you tomorrow." },
              { bg: "smile.jpg", speaker: A, text: "it's ok, take your time and think feely" },
              { type: "empty", bg: "empty.jpg" }
            ]
          }
        ]
      },

      // PANEL 7 — RUNNING LATE (runs after either branch's empty.jpg scene)
      {
        bg: "school.jpg",
        speaker: P,
        thought: true,
        text: "I might be late for the school, gotta hurry up it's already 6:14 A.M"
      },

      // PANEL 8 — CLASSROOM
      { bg: "classroom.jpg", speaker: P, thought: true, text: "another 12 hours in school, how boring !" },
      { speaker: P, thought: true, text: "I'm tired" },
      { speaker: "???", text: "Hey!!! [PLAYER NAME]" },

      // PANEL 9 — FRIEND
      { bg: "friend.jpg", speaker: P, text: "Mmmm...., hmmm??" },

      // CHAPTER 1 ENDING
      { type: "ending", dim: true, title: "you ended chapter 1", button: "CONTINUE TO CHAPTER 2", href: "page11.html" }
    ];
  }

  /* ---------- Title + name entry ---------- */
  var navLock = false;

  async function onStart() {
    if (navLock) return;
    navLock = true;
    // Best effort: on phones, go fullscreen and lock to landscape (ignored if unsupported)
    try {
      if (window.matchMedia("(pointer: coarse)").matches && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        if (screen.orientation && screen.orientation.lock) await screen.orientation.lock("landscape");
      }
    } catch (err) { /* not supported — CSS rotation handles it */ }
    VN.updateLayout();
    await VN.showScreen("name-screen");
    ui.nameInput.focus({ preventScroll: true });
    navLock = false;
  }

  function showNameError(msg) {
    ui.nameError.textContent = msg;
    ui.nameError.classList.add("show");
  }

  async function onEnterName() {
    if (navLock) return;
    var name = ui.nameInput.value.trim();
    if (!name) {
      showNameError("Please enter a name to begin \uD83C\uDF38");
      ui.nameInput.focus();
      return;
    }
    navLock = true;
    state.playerName = name;
    VN.saveProgress();
    ui.nameError.classList.remove("show");
    await VN.startChapter(buildChapter1());
    navLock = false;
  }

  /* ---------- Events ---------- */
  ui.startBtn.addEventListener("click", onStart);
  ui.enterBtn.addEventListener("click", onEnterName);
  ui.nameInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") onEnterName();
  });
  ui.nameInput.addEventListener("input", function () {
    ui.nameError.classList.remove("show");
  });

  /* ---------- Init ---------- */
  VN.init({
    images: IMAGES,
    screen: "start-screen",
    petals: true,
    background: "background.jpg"
  });
})();
