const images = {
  ASKING_IMAGE: "/specialOccasions/2024/valentines/asking.png",
  VICTORY_IMAGE: "/specialOccasions/2024/valentines/victory.png",
  REPEAT1_IMAGE: "/specialOccasions/2024/valentines/mocha_question.png",
  REPEAT3_IMAGE: "/specialOccasions/2024/valentines/milk_annoyed.png",
};

type Prompt = {
  text: string;
  nextPromptYes?: PromptId;
  nextPromptNo?: PromptId;
  image: any;
};

export type PromptId =
  | "question"
  | "questionRepeat"
  | "victory"
  | "repeat1"
  | "repeat2"
  | "repeat3"
  | "repeat4"
  | "reluctantVictory";

export const prompts: { [id: string]: Prompt } = {
  question: {
    text: "Will you be my Valentine?",
    nextPromptYes: "victory",
    nextPromptNo: "repeat1",
    image: images.ASKING_IMAGE,
  },
  questionRepeat: {
    text: "So will you be my Valentine?",
    nextPromptYes: "victory",
    nextPromptNo: "repeat1",
    image: images.ASKING_IMAGE,
  },
  victory: {
    text: "Yay!",
    image: images.VICTORY_IMAGE,
  },
  repeat1: {
    text: "Are you sure?",
    nextPromptYes: "repeat2",
    nextPromptNo: "questionRepeat",
    image: images.REPEAT1_IMAGE,
  },
  repeat2: {
    text: "Really?",
    nextPromptYes: "repeat3",
    nextPromptNo: "questionRepeat",
    image: images.REPEAT1_IMAGE,
  },
  repeat3: {
    text: "Pretty please, will you be my Valentine?",
    nextPromptYes: "victory",
    nextPromptNo: "repeat4",
    image: images.REPEAT3_IMAGE,
  },
  repeat4: {
    text: "Fine, I'll just ask one last time. Will you be my Valentine?",
    nextPromptYes: "victory",
    image: images.ASKING_IMAGE,
  },
  reluctantVictory: {
    text: "Oops too slow! Guess you'll have to be my Valentine now!",
    image: images.ASKING_IMAGE,
  },
};
