export type IthielExpression =
  | "default"
  | "smile"
  | "surprised"
  | "smug"
  | "troubled"
  | "frustrated"
  | "thinking"
  | "determined";

export interface StoryDialogue {
  speaker: string;
  expression: IthielExpression;
  text: string;
}

export interface StoryScene {
  id: string;
  stageId: number;
  type: "prologue" | "epilogue";
  title: string;
  dialogues: StoryDialogue[];
}
