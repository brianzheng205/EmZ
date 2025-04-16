const loseMsgs = [
  "Boohoo! You lose!",
  "Guess you'll never know what the gift was :(",
];

const mealWinMsgs = [
  "Congratulations! You've won all of the gifts!",
  "The first was my letter.",
  // insert conditional msg here
  "This last one is...",
  "an all inclusive meal at the restaurant of your choice! (even Wagyu House)",
];

const doubleOrNothingMsgs = [
  "What's that? You want to double or nothing?",
  "I guess you can since you're the birthday boy.",
  "Choose the last gift!",
];

const text = {
  intro: {
    msgs: [
      "Happy birthday, Brian!",
      "I've prepared 3 special gifts for this special day!",
      "Choose wisely!",
    ],
    // getNext: () => "outro",
  },
  // first present
  letter: {
    msgs: [
      "Congratulations! You've chosen Emily's letter <3",
      "I'll write it in this text box because I'm lazy ;p",
      "Hi bao bei! Hope you're enjoying your birthday so far <3 I know you're a big fan of Stardew Valley (me too) and it gives you a lot of energy so I themed this year's birthday around it!",
      "Originally it was a completely different concept but that'll have to wait for a diff year :p",
      "Anyways, HAPPY 21!! It's time to get wasted (but not without me !!!!!) I can't wait to celebrate with you IRL even if there's a delay.",
      "Thank you for always being my #1 supporter and for always being there for me! I hope that I can be the same kind of rock for you that you are for me.",
      "Thanks for always being productive with me, even if you have nothing to do and I love our study hangouts (it truly helps me work B) )",
      "Thanks for always being willing to sacrifice your sleep and time and money for me. I hope for many more visits in the future (until there's none B) )",
      "I LOVE YOU AND HAVE A HAPPY BIRTHDAY - EMILY <3",
      "Wow, wasn't that such a sweet letter? I'm sure you'll cherish it forever!",
      "What's that? You want to gamble the letter for the other presents?",
      "Well, alright :( Choose the gift you want to gamble for the letter",
    ],
  },
  // start gamble
  startGamble: {
    msgs: ["Choose a color to gamble on:"],
  },
  duringGamble: {
    msgs: ["*Gulp*"],
  },
  // second present win
  gpuWin: {
    msgs: [
      "Congratulations! You've won the gift!",
      "It's a...",
      "1/2 of a 5090????????",
      "Guess you'll have to wait to find the other half to use it.",
      ...doubleOrNothingMsgs,
    ],
  },
  // second present lose
  gpuLose: {
    msgs: [...loseMsgs, ...doubleOrNothingMsgs],
  },
  // third present win w/ prev win
  mealWinWin: {
    msgs: [
      ...mealWinMsgs.slice(0, 2),
      "The second was half of a 5090",
      ...mealWinMsgs.slice(2),
    ],
  },
  // third present win w/ prev lose
  mealWinLose: {
    msgs: [
      ...mealWinMsgs.slice(0, 2),
      "The second gift was...",
      "half of a 5090???????",
      "Guess you'll have to wait to find the other half to use it.",
      ...mealWinMsgs.slice(2),
    ],
  },
  // third present lose
  mealLose: {
    msgs: loseMsgs,
  },
};

export default text;
