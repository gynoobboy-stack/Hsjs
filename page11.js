/* =========================================================
   Chapter 2 page (page11.html)
   Starts automatically. Reads the player's name and their
   Chapter 1 decision saved by page10.html.
   Needs engine.js loaded first.
   ========================================================= */

(function () {
  "use strict";

  var VN = window.VN;
  var state = VN.state;

  var IMAGES = [
    "friendquestion.jpg", "Friendsmile.jpg", "friendtalking.jpg", "handfold.jpg",
    "friendtaking.jpg", "yelling.jpg", "smile.jpg", "friend.jpg", "chap2.jpg"
  ];

  /* ---------- Chapter 2 story ---------- */
  function buildChapter2() {
    var K = "Kusum";
    var P = "player";

    // Small helper so every line is one short call
    function say(who, text, opts) {
      var s = { speaker: who, text: text };
      for (var k in (opts || {})) s[k] = opts[k];
      return s;
    }
    // A choice option: shows the player's chosen words, then the reply lines
    function option(label, replies, save) {
      return { label: label, save: save, next: [say(P, label)].concat(replies) };
    }

    return [
      // PANEL 1 — KUSUM ASKS WHAT IS WRONG
      say(K, "what is happening to you nowadays. I'm noticing that you seem to be very tired , are you alright?",
        { bg: "friendquestion.jpg" }),
      {
        type: "choice",
        id: "c2_tired",
        options: [
          option("Not much, it's just school time pressure and studies.", [
            say(K, "ohh [PLAYER NAME] , you shouldn't make yourself like that, take proper sleep and study lightly"),
            say(P, "thanks for your advice I'll try to do that")
          ]),
          option("Yea, my health is ruined not feeling well nowadays lately.", [
            say(K, "oh girl, you should take care of yourself."),
            say(P, "yea thanks")
          ]),
          option("I'm fine , thanks for asking kusum...", [
            say(K, "oh, it's ok if your don't wanna share."),
            say(P, "alright")
          ])
        ]
      },

      // PANEL 2 — KUSUM'S REASSURANCE
      say(K, "im your friend after all", { bg: "Friendsmile.jpg" }),

      // PANEL 3 — KUSUM OFFERS TO LISTEN (instant background change)
      say(K, "well, it's there anything you wanna share, I am here to listen you",
        { bg: "friendtalking.jpg", instant: true }),
      say(P, "not much, but there is something I would like to share I guess"),
      say(P, "I met Aayush yesterday"),
      say(K, "Aayush ??"),
      say(K, "Aayush ??, Aayush dai? your ex bf ?", { smooth: true }),
      say(P, "yea "),
      say(K, "what did he say"),
      say(P, "he had invited me in his home , He said it was just for a short talk"),
      say(K, "what was your answer?"),

      // PANEL 4 — REMEMBER THE CHAPTER 1 DECISION
      {
        type: "branch",
        key: "chapter1Decision",
        fallback: "tomorrow",
        cases: {
          // Branch A — rejected Aayush
          rejected: [
            say(P, "I rejected him"),
            say(K, "that's sound rude you know"),
            say(P, "yea but I had no option, I even decided I will never go back with him again"),
            say(K, "........."),
            say(K, "you shouldn't say that to him I guess")
          ],
          // Branch B — said she would answer tomorrow
          tomorrow: [
            say(P, "I said I'll tell him tomorrow"),
            say(K, "what you will do then?"),
            say(P, "I'll not gonna go"),
            say(K, "huh??"),
            say(K, "huh??, you will just not go after telling him you will say it later?", { smooth: true }),
            say(P, "I can't do anything, I decided I'll never go back again with him")
          ]
        }
      },

      // PANEL 5 — HANDFOLD SCENE (both branches merge here)
      say(K, "it's like holding someone in hope only to reject at the end", { bg: "handfold.jpg" }),
      say(P, "what I could do , I made that decision because I felt panic after meeting him suddenly"),

      // PANEL 6 — KUSUM'S SUGGESTION
      say(K, "will you do what I'll say?", { bg: "friendtaking.jpg" }),
      {
        type: "choice",
        id: "c2_suggestion",
        options: [
          option("Ok , I'll do it", []),
          option("Yea I guess, unless it's not wrong", [
            say(K, "don't worry it's not wrong for you")
          ])
        ]
      },
      say(P, "ok then"),
      say(K, "you should go"),
      say(P, "what ?? Where ??!!!"),
      say(K, "his house , where else [PLAYER NAME]"),
      say(P, "look!! Even if I go I can never be together with him"),
      say(P, "like never", { speed: 150 }),                 // slow, emotional pause
      say(K, "listen girl calm dow....", { auto: true }),   // interrupted automatically
      say(P, "even if I what should I tell my parents ? That I'm going to a random person's house ?"),
      say(K, "he's not random , he's with you for whole 3 years"),
      say(P, "SO.....??"),
      say(P, "we broke up a year ago"),

      // PANEL 7 — HANDFOLD CONVERSATION
      say(K, "yes I know that , I'm telling you because just to give it a try, even if you don't wanna be with him",
        { bg: "handfold.jpg" }),
      say(K, "just go to his house and talk to him for a while, listen to him. So his desire of talk to you will be fulfill."),
      say(K, "and tell him that u both can never be together"),
      say(P, "I've told him so many times"),
      say(K, "I know, he just wants to talk, he wants you to listen to you , let it be happen and everything will be normal"),
      say(P, "..........."),
      say(P, "how can I tell my parents then? I can't lie to my parents again for him. It just remind me of my past trauma!!"),
      say(K, "he said it's just a short talk so it might just take an house only"),
      say(K, "dont worry about it"),
      say(P, "........."),
      say(P, "I can't do this, I don't wanna go back to my past!!!"),

      // PANEL 8 — KUSUM GETS ANGRY (red-tinted dialogue box)
      say(K, "JUST THINK [PLAYER NAME]", { bg: "yelling.jpg", angry: true }),
      say(K, "would you still step back to love him if you and him were only human beings in the earth???", { angry: true }),
      say(K, "you won't right ??", { angry: true }),
      say(K, "Because if there is no one who will judge, disturbed of ruin things to relation between you and him then....", { angry: true }),
      say(K, "then you would still love him", { angry: true }),
      say(K, "But....", { angry: true }),
      say(K, "loving someone is not that easy because we got our own world where we have to concern what our families say, what society says, what will others say", { angry: true }),

      // PANEL 9 — KUSUM CALMS DOWN (normal box again)
      say(K, "Aren't we girls allowed to love a guy freely by our own way?", { bg: "smile.jpg" }),
      say(K, "I know [PLAYER NAME] if your parents allowed you to have him since the begginng, then you would never ever leave him"),
      say(K, "As more I know, you were forced to leave him cause he hurt you the most and he hurt you because of the people around you around you"),
      say(P, "........."),
      say(K, "apples treess and lillies can't be grown in warm climate, so would you blame the apples and lillies of the climate?"),
      say(K, "sorry....[PLAYER NAME]"),
      say(K, "I said to much I guess"),
      {
        type: "choice",
        id: "c2_apology",
        options: [
          option("It's ok, don't be sorry", []),
          option("You are right don't be sorry", [])
        ]
      },

      // PANEL 10 — KUSUM ASKS FOR THE DECISION
      say(K, "So, what's your decision?", { bg: "friend.jpg" }),
      {
        type: "choice",
        id: "c2_decision",
        options: [
          option("I'll go", []),
          option("I'll go", []),
          option("I'll go", [])
        ]
      },

      // PANEL 11 — CHAPTER 2 ENDING
      // When Chapter 3 exists, set href: "page12.html" below.
      { type: "ending", bg: "chap2.jpg", dim: false, title: "you ended chapter 2", button: "CONTINUE TO CHAPTER 3", href: "", soon: "Chapter 3 is coming soon \uD83C\uDF38" }
    ];
  }

  /* ---------- Start ---------- */
  VN.init({ images: IMAGES, screen: "", petals: false });
  VN.loadProgress();                              // name + Chapter 1 decision
  if (!state.playerName) state.playerName = "Player"; // only if page11 is opened directly
  VN.startChapter(buildChapter2());
})();
