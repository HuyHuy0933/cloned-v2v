

export const enum TUTORIAL_ENUM {
  basic = "basic",
}

export const enum TUTORIAL_STATUS {
  not_started = "not_started",
  pending = "pending",
  completed = "completed",
}

export type SaveTutorialRequest = Record<string, TUTORIAL_STATUS>;

export type TutorialData = {
  title: string;
  name: string;
};