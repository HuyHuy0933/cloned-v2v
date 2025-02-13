import { UserAvatar } from "@/components";
import {
  Participant,
  RecordedAudioSummary,
  SUMMARY_AI_TEMPLATE,
  SUMMARY_SECTION_KEYS,
} from "@/features/record-audios/types";
import { tMessages } from "@/locales/messages";
import { useTranslation } from "react-i18next";
import { BOT_NAME } from "../meeting/Meeting";
import { TeamsIcon } from "@/components/icons";
import { useAISummaryTemplateData } from "./useAISummaryTemplateData";
import { meetingRoleOptions } from "../meeting/MeetingSetting";
import { config } from "@/lib/config";

type AudioSummaryProps = {
  enableAISummary: boolean;
  summaryAITemplate: SUMMARY_AI_TEMPLATE | string;
  summaryDetail: RecordedAudioSummary;
  participants?: Participant[];
};

const AudioSummary: React.FC<AudioSummaryProps> = ({
  enableAISummary,
  summaryAITemplate,
  summaryDetail,
  participants,
}) => {
  const { t } = useTranslation();

  const { getSectionTitle } = useAISummaryTemplateData();

  const renderContent = (content: string) => {
    if (!content || content === "None") {
      return t(tMessages.common.none());
    }

    if (content.includes(";")) {
      return (
        <ul className="list-disc pl-3">
          {content.split(";").map((item, index) => (
            <li key={`item_${index + 1}`}>{item.trim()}</li>
          ))}
        </ul>
      );
    }

    return content;
  };

  const mapRoleToIcon = (roleName: string) => {
    const role = meetingRoleOptions.find((item) => item.value === roleName);
    if (role) {
      return role.icon;
    }
    return "";
  };

  const hideSectionForKuritaVersion = (sectionKey: string) => {
    if (!config.kuritaVersion) return false;
    if (
      summaryAITemplate === SUMMARY_AI_TEMPLATE.MEETING &&
      sectionKey === SUMMARY_SECTION_KEYS.SECTION_5
    )
      return true;

    return false;
  };

  return enableAISummary ? (
    <div className="flex w-full flex-col items-start gap-4 overflow-auto px-2">
      {participants && (
        <div className="flex flex-col items-start gap-1">
          <span className="text-xs font-bold text-primary-foreground sm:text-sm">
            {t(tMessages.common.participants())}
          </span>

          <ul className="ml-4 mt-1 text-xs sm:text-sm">
            {participants.map((participant: Participant) => (
              <li className="mt-1 flex items-center gap-2" key={participant.id}>
                {participant.name === BOT_NAME ? (
                  <TeamsIcon />
                ) : (
                  <UserAvatar username={participant.name} />
                )}
                {participant.name}{" "}
                <span className="-mt-2 text-lg">
                  {mapRoleToIcon(participant.role)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Summary detail */}
      {summaryDetail.summaries.map((section) =>
        !hideSectionForKuritaVersion(section.key) ? (
          <div
            key={`${section.key}`}
            className="flex flex-col items-start gap-1"
          >
            <span className="text-xs font-bold text-primary-foreground sm:text-sm">
              {getSectionTitle(summaryAITemplate, section.key)}
            </span>

            <span className="ml-4 text-start text-xs sm:text-sm">
              {renderContent(section.content)}
            </span>
          </div>
        ) : (
          <></>
        ),
      )}
    </div>
  ) : (
    <div className="flex w-full flex-col items-start gap-4 overflow-auto px-2">
      <div className="flex flex-col items-start gap-1">
        {t(tMessages.common.AISummarySkipped())}
      </div>
    </div>
  );
};

export default AudioSummary;
