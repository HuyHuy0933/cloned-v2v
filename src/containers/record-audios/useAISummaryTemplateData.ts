import {
  SUMMARY_AI_TEMPLATE,
  SUMMARY_SECTION_KEYS,
  TemplateDetail,
} from "@/features/record-audios/types";
import { tMessages } from "@/locales/messages";
import { useState } from "react";
import { useTranslation } from "react-i18next";

type AISummaryTemplateData = {
  data: TemplateDetail[];
  getSectionTitle: (name: string, sectionName: string) => string;
};

const useAISummaryTemplateData = (): AISummaryTemplateData => {
  const { t } = useTranslation();

  const [data] = useState<TemplateDetail[]>([
    {
      icon: "🎤",
      name: SUMMARY_AI_TEMPLATE.INTERVIEW,
      title: t(tMessages.summaryAITemplate.interview()),
      sections: new Map<string, string>([
        [
          SUMMARY_SECTION_KEYS.SECTION_1,
          t(tMessages.summaryAITemplateDetail.interview.item1()),
        ],
        [
          SUMMARY_SECTION_KEYS.SECTION_2,
          t(tMessages.summaryAITemplateDetail.interview.item2()),
        ],
        [
          SUMMARY_SECTION_KEYS.SECTION_3,
          t(tMessages.summaryAITemplateDetail.interview.item3()),
        ],
        [
          SUMMARY_SECTION_KEYS.SECTION_4,
          t(tMessages.summaryAITemplateDetail.interview.item4()),
        ],
        [
          SUMMARY_SECTION_KEYS.SECTION_5,
          t(tMessages.summaryAITemplateDetail.interview.item5()),
        ],
      ]),
    },
    { 
      icon: "🤝",
      name: SUMMARY_AI_TEMPLATE.MEETING,
      title: t(tMessages.summaryAITemplate.meeting()),
      sections: new Map<string, string>([
        [
          SUMMARY_SECTION_KEYS.SECTION_1,
          t(tMessages.summaryAITemplateDetail.meeting.item1()),
        ],
        [
          SUMMARY_SECTION_KEYS.SECTION_2,
          t(tMessages.summaryAITemplateDetail.meeting.item2()),
        ],
        [
          SUMMARY_SECTION_KEYS.SECTION_3,
          t(tMessages.summaryAITemplateDetail.meeting.item3()),
        ],
        [
          SUMMARY_SECTION_KEYS.SECTION_4,
          t(tMessages.summaryAITemplateDetail.meeting.item4()),
        ],
        [
          SUMMARY_SECTION_KEYS.SECTION_5,
          t(tMessages.summaryAITemplateDetail.meeting.item5()),
        ],
      ]),
    },
    {
      icon: "🎧",
      name: SUMMARY_AI_TEMPLATE.PODCAST,
      title: t(tMessages.summaryAITemplate.podcast()),
      sections: new Map<string, string>([
        [
          SUMMARY_SECTION_KEYS.SECTION_1,
          t(tMessages.summaryAITemplateDetail.podcast.item1()),
        ],
        [
          SUMMARY_SECTION_KEYS.SECTION_2,
          t(tMessages.summaryAITemplateDetail.podcast.item2()),
        ],
        [
          SUMMARY_SECTION_KEYS.SECTION_3,
          t(tMessages.summaryAITemplateDetail.podcast.item3()),
        ],
        [
          SUMMARY_SECTION_KEYS.SECTION_4,
          t(tMessages.summaryAITemplateDetail.podcast.item4()),
        ],
        [
          SUMMARY_SECTION_KEYS.SECTION_5,
          t(tMessages.summaryAITemplateDetail.podcast.item5()),
        ],
      ]),
    },
    {
      icon: "💼",
      name: SUMMARY_AI_TEMPLATE.BUSINESS,
      title: t(tMessages.summaryAITemplate.business()),
      sections: new Map<string, string>([
        [
          SUMMARY_SECTION_KEYS.SECTION_1,
          t(tMessages.summaryAITemplateDetail.business.item1()),
        ],
        [
          SUMMARY_SECTION_KEYS.SECTION_2,
          t(tMessages.summaryAITemplateDetail.business.item2()),
        ],
        [
          SUMMARY_SECTION_KEYS.SECTION_3,
          t(tMessages.summaryAITemplateDetail.business.item3()),
        ],
        [
          SUMMARY_SECTION_KEYS.SECTION_4,
          t(tMessages.summaryAITemplateDetail.business.item4()),
        ],
        [
          SUMMARY_SECTION_KEYS.SECTION_5,
          t(tMessages.summaryAITemplateDetail.business.item5()),
        ],
      ]),
    },
    {
      icon: "📊",
      name: SUMMARY_AI_TEMPLATE.PRESENTATION,
      title: t(tMessages.summaryAITemplate.presentation()),
      sections: new Map<string, string>([
        [
          SUMMARY_SECTION_KEYS.SECTION_1,
          t(tMessages.summaryAITemplateDetail.presentation.item1()),
        ],
        [
          SUMMARY_SECTION_KEYS.SECTION_2,
          t(tMessages.summaryAITemplateDetail.presentation.item2()),
        ],
        [
          SUMMARY_SECTION_KEYS.SECTION_3,
          t(tMessages.summaryAITemplateDetail.presentation.item3()),
        ],
        [
          SUMMARY_SECTION_KEYS.SECTION_4,
          t(tMessages.summaryAITemplateDetail.presentation.item4()),
        ],
        [
          SUMMARY_SECTION_KEYS.SECTION_5,
          t(tMessages.summaryAITemplateDetail.presentation.item5()),
        ],
      ]),
    },
    {
      icon: "👨‍🏫",
      name: SUMMARY_AI_TEMPLATE.WORKSHOP,
      title: t(tMessages.summaryAITemplate.workshop()),
      sections: new Map<string, string>([
        [
          SUMMARY_SECTION_KEYS.SECTION_1,
          t(tMessages.summaryAITemplateDetail.workshop.item1()),
        ],
        [
          SUMMARY_SECTION_KEYS.SECTION_2,
          t(tMessages.summaryAITemplateDetail.workshop.item2()),
        ],
        [
          SUMMARY_SECTION_KEYS.SECTION_3,
          t(tMessages.summaryAITemplateDetail.workshop.item3()),
        ],
        [
          SUMMARY_SECTION_KEYS.SECTION_4,
          t(tMessages.summaryAITemplateDetail.workshop.item4()),
        ],
        [
          SUMMARY_SECTION_KEYS.SECTION_5,
          t(tMessages.summaryAITemplateDetail.workshop.item5()),
        ],
      ]),
    },
    {
      icon: "🗣️",
      name: SUMMARY_AI_TEMPLATE.DISCUSSION,
      title: t(tMessages.summaryAITemplate.discussion()),
      sections: new Map<string, string>([
        [
          SUMMARY_SECTION_KEYS.SECTION_1,
          t(tMessages.summaryAITemplateDetail.discussion.item1()),
        ],
        [
          SUMMARY_SECTION_KEYS.SECTION_2,
          t(tMessages.summaryAITemplateDetail.discussion.item2()),
        ],
        [
          SUMMARY_SECTION_KEYS.SECTION_3,
          t(tMessages.summaryAITemplateDetail.discussion.item3()),
        ],
        [
          SUMMARY_SECTION_KEYS.SECTION_4,
          t(tMessages.summaryAITemplateDetail.discussion.item4()),
        ],
        [
          SUMMARY_SECTION_KEYS.SECTION_5,
          t(tMessages.summaryAITemplateDetail.discussion.item5()),
        ],
      ]),
    },
  ]);

  const getSectionTitle = (
    name: string,
    sectionName: string,
  ): string => {
    const section = data.find((s) => s.name === name);

    if (!section) {
      return "";
    }

    return section.sections.get(sectionName) ?? "";
  };

  return { data, getSectionTitle };
};

export { useAISummaryTemplateData };
