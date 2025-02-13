import { Button, Checkbox, Label, Spinner } from "@/components";
import { fetchMeetingDetails } from "@/features/meeting/queries";
import {
  EntityLabelIndex,
  RecordingMessage,
} from "@/features/recording-meeting/types";
import { useDefaultEntitiesState } from "@/hooks";
import { DEFAULT_STALE_TIME_QUERY, QUERY_KEY } from "@/lib/constaints";
import { catchError } from "@/lib/trycatch";
import { CheckedState } from "@radix-ui/react-checkbox";
import { useQueryClient } from "@tanstack/react-query";
import { produce } from "immer";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import RecordingMessageItem from "../recording-meeting/RecordingMessageItem";
import { useExtractEntitiesMutation } from "@/features/recording-meeting/mutations";
import { v4 as uuidv4 } from "uuid";
import { tMessages } from "@/locales/messages";
import { useTranslation } from "react-i18next";
import { TreeNodeEntity } from "../recording-meeting/EntityCheckboxes";
import {
  LanguageChunkMessage,
  MeetingDetailsResponse,
} from "@/features/meeting/types";
import { GetRecordAudio } from "@/features/record-audios/types";

type AudioEntityExtractionProps = {
  meetingId?: string;
  audioId: string;
  language?: string;
};

const AudioEntityExtraction: React.FC<AudioEntityExtractionProps> = React.memo(
  ({ meetingId, audioId, language }) => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [defaultEntities] = useDefaultEntitiesState();
    const [allEntities, setAllEntities] = useState<TreeNodeEntity[]>(() => [
      ...defaultEntities,
    ]);
    const [fetching, setFetching] = useState(false);
    const [messages, setMessages] = useState<RecordingMessage[]>([]);
    const [notExtracted, setNotExtracted] = useState(false);
    const [extracting, setExtracting] = useState(false);
    const [selectedAll, setSelectedAll] = useState(true);

    const fetchedRef = useRef<any>(false);
    const extractEntitiesMutation = useExtractEntitiesMutation();

    const updateEntities = useCallback((entityLabels: EntityLabelIndex[]) => {
      const setEntities = (
        setEntitiesState: React.Dispatch<
          React.SetStateAction<TreeNodeEntity[]>
        >,
      ) => {
        setEntitiesState(
          produce((prev) => {
            for (const item of entityLabels) {
              const entity = prev.find((x) => x.label === item.label);
              if (!entity) continue;

              entity.checked = true;
              entity.children = entity.children || [];
              const child = entity.children.find(
                (x) => x.label.toLowerCase() === item.entity.toLowerCase(),
              );
              if (!child) {
                entity.children.push({
                  id: item.entity,
                  label: item.entity,
                  checked: true,
                  children: [],
                });
              } else {
                child.checked = true;
              }
            }
          }),
        );
      };

      setEntities(setAllEntities);
    }, []);

    const mapHistoriesToMessages = useCallback(
      (histories: LanguageChunkMessage[]) => {
        histories = histories.filter((x: any) => !!x.origin_text);
        if (language) {
          histories = histories.filter(
            (x: any) =>
              (x.origin_language === language &&
                x.target_language === language) ||
              x.target_language === language,
          );
        }

        const messages = histories.map((x) => {
          return {
            id: x.message_id || uuidv4(),
            text: x.translated_text,
            is_final: true,
            entity_labels: x.entity_labels,
            userId: x.user_id,
            username: x.username,
            createdAt: x.createdAt,
            language: x.origin_language,
          } as RecordingMessage;
        });

        return messages;
      },
      [language],
    );

    console.log("meetingId", meetingId);

    useEffect(() => {
      if (!meetingId) {
        setNotExtracted(true);
        fetchedRef.current = true;
        return;
      }

      const fetchMeetingHistories = async () => {
        // get message history
        setFetching(true);
        const [err, data] = await catchError(
          queryClient.fetchQuery({
            queryKey: [QUERY_KEY.MEETING_DETAIL, meetingId],
            queryFn: () => fetchMeetingDetails(meetingId),
            staleTime: DEFAULT_STALE_TIME_QUERY,
          }),
        );

        if (!data) {
          setFetching(false);
          return;
        }

        const messages = mapHistoriesToMessages(data.conversation);
        setMessages(messages);
        setFetching(false);

        const entityLabels = messages
          .map((x) => x.entity_labels)
          .flat()
          .filter((x) => !!x);
        console.log(entityLabels);

        if (entityLabels.length > 0) {
          updateEntities(entityLabels);
        } else if (!data.entity_extracted) {
          setNotExtracted(true);
        }

        if (data.custom_entities) {
          const mappedCustomEntities: TreeNodeEntity[] = [];
          data.custom_entities.forEach((x) => {
            const filteredEntityLabels = entityLabels.filter(
              (y) => y.label === x.entity,
            );
            const extractedCustomEntitieValues = [
              ...new Set(filteredEntityLabels.map((y) => y.entity)),
            ];
            mappedCustomEntities.push({
              id: x.entity,
              label: x.entity,
              title: x.entity,
              checked: true,
              activeColor: "#bbb",
              children: extractedCustomEntitieValues.map((val) => ({
                id: val,
                label: val,
                title: val,
                checked: true,
                children: [],
              })),
            });
          });
          setAllEntities((prev) => [...prev, ...mappedCustomEntities]);
        }
      };

      if (!fetchedRef.current) {
        fetchMeetingHistories();
        fetchedRef.current = true;
      }
    }, [meetingId, mapHistoriesToMessages, updateEntities]);

    const onCheckedChange = useCallback(
      (label: string, checked: CheckedState) => {
        if (checked === "indeterminate") return;

        setAllEntities(
          produce((prev) => {
            const entity = prev.find((x) => x.label === label);
            if (!entity) return;

            entity.checked = checked;
          }),
        );

        if (!checked) {
          setSelectedAll(false);
        } else {
          const allChecked = defaultEntities
            .filter((x) => x.label !== label && x.children.length > 0)
            .every((x) => x.checked);
          setSelectedAll(allChecked);
        }
      },
      [defaultEntities],
    );

    const startExtractEntities = useCallback(async () => {
      setExtracting(true);

      const [_, data] = await catchError(
        extractEntitiesMutation.mutateAsync(audioId),
      );

      if (!data) {
        setExtracting(false);
        return;
      }

      if (meetingId) {
        const meetingDetail: MeetingDetailsResponse | undefined =
          queryClient.getQueryData([QUERY_KEY.MEETING_DETAIL, meetingId]);
        if (meetingDetail) {
          queryClient.setQueryData([QUERY_KEY.MEETING_DETAIL, meetingId], {
            ...meetingDetail,
            entity_extracted: true,
            conversation: data,
          } as MeetingDetailsResponse);
        }
      } else {
        const audioDetail: GetRecordAudio | undefined =
          queryClient.getQueryData([QUERY_KEY.RECORD_AUDIO_DETAIL, audioId]);
        if (audioDetail) {
          queryClient.setQueryData([QUERY_KEY.RECORD_AUDIO_DETAIL, audioId], {
            ...audioDetail,
            meeting_id: data[0].meeting_id,
          } as GetRecordAudio);
        }
      }

      const messages = mapHistoriesToMessages(data);
      setMessages(messages);

      const entityLabels = messages
        .map((x) => x.entity_labels)
        .flat()
        .filter((x) => !!x);
      updateEntities(entityLabels);

      setNotExtracted(false);
      setExtracting(false);
    }, [audioId, mapHistoriesToMessages, updateEntities, meetingId]);

    const onToggleSelectAll = useCallback(() => {
      const newSelectedAll = !selectedAll;
      setSelectedAll((prev) => {
        setAllEntities(
          produce((prev) => {
            for (const item of prev) {
              item.checked = newSelectedAll ? true : false;
            }
          }),
        );
        return !prev;
      });
      setSelectedAll(newSelectedAll);
    }, [selectedAll]);

    const sortedEntities = useMemo(() => {
      return allEntities
        .filter((x) => x.children.length > 0)
        .sort((a, b) => b.children.length - a.children.length);
    }, [allEntities]);

    if (fetching) {
      return (
        <div className="mt-2 flex w-full flex-col items-center">
          <Spinner />
        </div>
      );
    }

    if (notExtracted) {
      return (
        <div className="mt-2 flex w-full flex-col items-center gap-4 overflow-auto px-2 text-xs sm:text-sm">
          <div className="w-full space-y-2">
            <p>⚠️ {t(tMessages.common.entityTabTitle())}</p>
            <p>{t(tMessages.common.entityTabSubTitle())}</p>

            <ul className="list-inside list-disc">
              {defaultEntities.map((item) => (
                <li key={item.id} className="mt-2">
                  {item.icon && item.icon}{" "}
                  <span className="text-primary-foreground">
                    {item.title || item.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-2 w-full">
            {t(tMessages.common.entityTabBottomTitle())}
          </p>
          <Button
            className="rounded px-4 py-3"
            onClick={startExtractEntities}
            disabled={extracting}
          >
            {t(tMessages.common.startProcessing())}
            {extracting && <Spinner className="ml-2 size-4" />}
          </Button>
        </div>
      );
    }

    return (
      <div className="mt-2 flex w-full flex-col items-center gap-4 overflow-auto px-2">
        {/* Entity labels checkboxs */}
        <div className="flex w-full flex-wrap gap-2">
          {sortedEntities.length > 0 && (
            <Label
              className={`flex items-center justify-center rounded px-4 py-2 text-xs text-white sm:text-sm ${selectedAll ? "bg-primary-foreground" : "bg-primary"}`}
              onClick={onToggleSelectAll}
            >
              {selectedAll
                ? t(tMessages.common.deselectAll())
                : t(tMessages.common.selectAll())}
            </Label>
          )}
          {sortedEntities.map((item) => (
            <Label
              key={item.label}
              className="flex items-center justify-center rounded px-4 py-2 text-xs text-white sm:text-sm"
              style={{
                backgroundColor: item.checked
                  ? item.activeColor
                  : "hsl(var(--primary))",
              }}
            >
              <Checkbox
                id={item.id}
                checked={item.checked}
                className="sr-only after:absolute after:inset-0"
                onCheckedChange={(checked) =>
                  onCheckedChange(item.label, checked)
                }
              />
              {item.icon && item.icon} {item.title || item.label}{" "}
              {item.children.length > 0 && `(${item.children.length})`}
            </Label>
          ))}
        </div>

        {/* Highlight enity transcription */}
        <div className="mt-2 flex w-full flex-col items-start gap-3 px-2">
          {messages.map((message) => (
            <RecordingMessageItem
              key={message.id}
              className="border-none p-0"
              message={message}
              entities={sortedEntities}
              hideTime={true}
            />
          ))}
        </div>
      </div>
    );
  },
);

export default AudioEntityExtraction;
