import { t } from "i18next";
import { tMessages } from "@/locales/messages";
import { TUTORIAL_ENUM, TutorialData } from "@/features/tutorial/types";
import { useState } from "react";

export const useTutorialData = (): TutorialData[] => {
  const [data] = useState<TutorialData[]>([
    {
      title: t(tMessages.tutorial.data.tutorial1()),
      name: TUTORIAL_ENUM.basic,
    },
    {
      title: t(tMessages.tutorial.data.tutorial2()),
      name: "",
    },
    {
      title: t(tMessages.tutorial.data.tutorial3()),
      name: "",
    },
    {
      title: t(tMessages.tutorial.data.tutorial4()),
      name: "",
    },
    {
      title: t(tMessages.tutorial.data.tutorial5()),
      name: "",
    },
    {
      title: t(tMessages.tutorial.data.tutorial6()),
      name: "",
    },
    {
      title: t(tMessages.tutorial.data.tutorial7()),
      name: "",
    },
    {
      title: t(tMessages.tutorial.data.tutorial8()),
      name: "",
    },
    {
      title: t(tMessages.tutorial.data.tutorial9()),
      name: "",
    },
    {
      title: t(tMessages.tutorial.data.tutorial10()),
      name: "",
    },
    {
      title: t(tMessages.tutorial.data.tutorial11()),
      name: "",
    },
    {
      title: t(tMessages.tutorial.data.tutorial12()),
      name: "",
    },
    {
      title: t(tMessages.tutorial.data.tutorial13()),
      name: "",
    },
    {
      title: t(tMessages.tutorial.data.tutorial14()),
      name: "",
    },
  ]);

  return data;
};
