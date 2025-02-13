import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Container,
  DeletedSwipeLeftCard,
  Header,
  HorizontalTransition,
} from "@/components";
import {
  AUDIO_STATUS_ENUM,
  FINE_TUNED_MODEL,
  FinedTuneOption,
  GetRecordAudio,
  GetRecordAudiosResponse,
  GetRecordAudioStatusesResponse,
  RECORDED_AUDIO_TYPE,
  RecordedAudio,
  SUMMARY_AI_TEMPLATE,
  SummaryTemplateOption,
} from "@/features/record-audios/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AudioItem from "./AudioItem";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import {
  useFavoriteRecordAudioMutation,
  useRemoveRecordAudioMutation,
} from "@/features/record-audios/mutations";
import {
  checkRecordAudiosStatus,
  groupResponsedByMeetingIdThenMapToRecordedAudio,
  useRecordAudiosQuery,
} from "@/features/record-audios/queries";
import AIChatBot from "../ai-chatbot/AIChatBot";
import SearchComponent from "./SearchComponent";
import ProfileDropdown from "../account-setting/ProfileDropdown";
import WaveAnimation from "./WaveAnimation";
import { queryClient } from "@/main";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { tMessages } from "@/locales/messages";
import PullToRefresh from "./PullToRefresh";
import { QUERY_KEY } from "@/lib/constaints";
import MeetingAudioItem from "./MeetingAudioItem";
import UploadAudioModal from "./UploadAudioModal";
import AudioSort from "./audio-list-toolbar/AudioSort";
import { useCurrentUser } from "@/hooks";
import AudioFilterType from "./audio-list-toolbar/AudioFilterType";
import AudioListLoader from "./AudioListLoader";
import { AudioSwipeLeftCard } from "@/components/shared/AudioSwipeLeftCard";
import { isDesktop } from "@/lib/constaints";

export const fineTuneOptions: FinedTuneOption[] = [
  {
    value: FINE_TUNED_MODEL.GENERAL,
    title: tMessages.common.generalFinedTune,
  },
  {
    value: FINE_TUNED_MODEL.FINANCE,
    title: tMessages.common.longFinanceFinedTune,
  },
  {
    value: FINE_TUNED_MODEL.KURITA,
    title: tMessages.common.kuritaFineTuned,
  },
];

const RecordAudios = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const timeoutRef = useRef<any>(null);
  const [recordAudios, setRecordAudios] = useState<RecordedAudio[]>([]);
  const [playingAudioId, setPlayingAudioId] = useState<string>("");
  const [draging, setDraging] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("startDateTime");
  const [sortOrder, setSortOrder] = useState<string>("desc");
  const [filterType, setFilterType] = useState<string>("");

  const { currentUser, setting } = useCurrentUser();
  const { data: fetchedAudios, isFetched, isFetching } = useRecordAudiosQuery();

  // const removeAudioMutation = useRemoveRecordAudioMutation();
  // const favoriteAudioMutation = useFavoriteRecordAudioMutation();
  const userId = currentUser.id;

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, []);

  // Handle fetching of audios and polling for status updates
  useEffect(() => {
    if (fetchedAudios) {
      setRecordAudios(
        groupResponsedByMeetingIdThenMapToRecordedAudio(fetchedAudios),
      );

      const uploadingAudios = fetchedAudios.filter(
        (x) =>
          x.status === AUDIO_STATUS_ENUM.UPLOADING ||
          x.status === AUDIO_STATUS_ENUM.PROCESSING,
      );
      const uploadingIds = uploadingAudios.map((x) => x.id);
      if (uploadingIds.length > 0) {
        schedulePolling(uploadingIds);
      }
    }
  }, [fetchedAudios]);

  // Polling function for updating audio statuses
  const schedulePolling = (ids: string[]) => {
    if (timeoutRef.current) return;
    timeoutRef.current = setTimeout(() => pollingAudiosStatus(ids), 5000);
  };

  const pollingAudiosStatus = async (ids: string[]) => {
    try {
      timeoutRef.current = null;
      const data: GetRecordAudioStatusesResponse =
        await checkRecordAudiosStatus(ids);
      if (!data) return;

      const remainUploadingIds = data.statuses
        .filter(
          (x: GetRecordAudio) =>
            x.status === AUDIO_STATUS_ENUM.UPLOADING ||
            x.status === AUDIO_STATUS_ENUM.PROCESSING,
        )
        .map((x: GetRecordAudio) => x.id);

      const newStatusAudios = groupResponsedByMeetingIdThenMapToRecordedAudio(
        data.statuses.filter((x) => x.status !== AUDIO_STATUS_ENUM.UPLOADING),
      );

      setRecordAudios((prevAudios) => {
        // Create a new array to avoid direct state mutation
        const updatedAudios = prevAudios.map((audio) => {
          // Check if this audio was in the newly uploadedAudios array
          const uploadedAudio = newStatusAudios.find(
            (item) => item.id === audio.id,
          );
          // If found, return the updated audio, otherwise return the original audio
          return uploadedAudio ? { ...audio, ...uploadedAudio } : audio;
        });

        return updatedAudios;
      });

      // const cachedAudios: GetRecordAudiosResponse | undefined =
      //   queryClient.getQueryData([QUERY_KEY.RECORD_AUDIOS]);
      // if (cachedAudios) {
      //   const prevAudios = cachedAudios.audio_list;
      //   let updatedAudios = [];
      //   for (let i = 0; i < prevAudios.length; i++) {
      //     const audio = prevAudios[i];
      //     const statusAudio = data.statuses.find(
      //       (item) => item.id === audio.id,
      //     );
      //     if (statusAudio) {
      //       updatedAudios.push({ ...audio, ...statusAudio });
      //     } else {
      //       updatedAudios.push(audio);
      //     }
      //   }
      //   console.log("updatedAudios", updatedAudios);
      //   queryClient.setQueryData([QUERY_KEY.RECORD_AUDIOS], {
      //     audio_list: updatedAudios,
      //   });
      // }

      if (remainUploadingIds.length > 0) {
        schedulePolling(remainUploadingIds);
      }
    } catch (err) {
      console.error("Error polling audio status", err);
    }
  };

  const applySort = useCallback(
    (audios: RecordedAudio[]) => {
      return audios.sort((a, b) => {
        let comparison = 0;

        if (sortBy === "name") {
          comparison = a.name.localeCompare(b.name, setting.language);
        } else if (sortBy === "startDateTime") {
          comparison = a.startDateTime - b.startDateTime;
        } else {
          comparison = a.duration - b.duration;
        }

        return sortOrder === "desc" ? -comparison : comparison;
      });
    },
    [sortBy, sortOrder, setting],
  );

  const applyFilterType = useCallback(
    (audios: RecordedAudio[]) => {
      if (filterType === "") return audios;

      return audios.filter((audio) => {
        if (filterType === "teams") {
          return (
            audio.type === RECORDED_AUDIO_TYPE.MEETING &&
            audio.bot_type === filterType
          );
        }

        return audio.type == filterType;
      });
    },
    [filterType],
  );

  const { filteredAudios, uploadingAudios, favoriteAudios, normalAudios } =
    useMemo(() => {
      const audios = Array.from(recordAudios);

      // Uploading audios
      let uploadingAudios: RecordedAudio[] = audios.filter((audio) => {
        if (
          audio.status !== AUDIO_STATUS_ENUM.UPLOADING &&
          audio.status !== AUDIO_STATUS_ENUM.PROCESSING
        ) {
          return false;
        }

        // Check languageAudios if present
        if (audio.languageAudios && audio.languageAudios.length > 1) {
          return audio.languageAudios.every(
            (x) =>
              x.status === AUDIO_STATUS_ENUM.UPLOADING ||
              x.status === AUDIO_STATUS_ENUM.PROCESSING,
          );
        }

        return true;
      });
      uploadingAudios = applySort(applyFilterType(uploadingAudios));

      // Filter uploaded audios and apply search, filters, and sorting
      // get uploaded audios by filter uploadingAudios aboves
      const uploadingAudioIds = new Set(
        uploadingAudios.map((audio) => audio.id),
      );
      let uploadedAudios = audios.filter(
        (audio) => !uploadingAudioIds.has(audio.id),
      );

      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        uploadedAudios = uploadedAudios.filter((audio) =>
          audio.name.toLowerCase().includes(searchLower),
        );
      }

      uploadedAudios = applySort(applyFilterType(uploadedAudios));

      const { favoriteAudios, normalAudios } = uploadedAudios.reduce<{
        favoriteAudios: RecordedAudio[];
        normalAudios: RecordedAudio[];
      }>(
        (acc, audio) => {
          if (userId) {
            const isFavorite =
              audio.favorite?.includes(userId) ||
              audio.languageAudios?.some((langAudio) =>
                langAudio.favorite?.includes(userId),
              );
            if (isFavorite) {
              acc.favoriteAudios.push(audio);
            } else {
              acc.normalAudios.push(audio);
            }
          } else {
            acc.normalAudios.push(audio);
          }
          return acc;
        },
        { favoriteAudios: [], normalAudios: [] },
      );

      const filteredAudios = [...uploadingAudios, ...uploadedAudios];

      return { filteredAudios, uploadingAudios, favoriteAudios, normalAudios };
    }, [searchTerm, recordAudios, applySort, applyFilterType, userId]);

  const onPlayingAudio = (audioId: string, index: number) => {
    setPlayingAudioId(audioId);
  };

  // handle search
  const handleSearchRecord = (query: string) => {
    setSearchTerm(query);
  };

  const onOpenAudioDetail = (audio: RecordedAudio) => {
    if (
      draging ||
      audio.status === AUDIO_STATUS_ENUM.UPLOADING ||
      audio.status?.includes("failed:")
    )
      return;
    setTimeout(() => {
      navigate(`/audios/${audio.id}`, {
        state: { id: audio.id },
      });
    }, 300);
  };

  const deleteAudio = async (id: string) => {
    // if (playing) pauseAudio();
    try {
      // await removeAudioMutation.mutateAsync(id);
    } catch (err) {
      console.error("Error deleting audio", err);
    } finally {
    }
  };

  const favoriteAudio = async (id: string) => {
    try {
      // await favoriteAudioMutation.mutateAsync(id);
    } catch (err) {
      console.error("Error add favorite audio", err);
    } finally {
    }
  };

  const handleRefresh = async () => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY.RECORD_AUDIOS] });
        resolve();
      }, 500);
    });
  };

  const renderAudioList = (audioList: RecordedAudio[]) => {
    return (
      <>
        {audioList.map((audio: RecordedAudio, index: number) =>
          audio.languageAudios && audio.languageAudios.length > 1 ? (
            <div
              key={audio.meeting_id}
              className="w-full rounded-lg bg-modal p-2"
            >
              <Collapsible>
                <CollapsibleTrigger className="group flex w-full items-center justify-start gap-2 overflow-x-hidden sm:gap-3 [&[data-state=open]_.chevronDown]:rotate-180">
                  <ChevronDownIcon className="chevronDown size-4 shrink-0 transition-transform duration-200" />
                  <MeetingAudioItem audio={audio} />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 space-y-2">
                  {audio.languageAudios.map((langAudio: RecordedAudio) => (
                    <AudioSwipeLeftCard
                      key={langAudio.id}
                      className={`${!!playingAudioId && langAudio.id === playingAudioId ? "z-[98]" : "z-50"} w-full`}
                      title={t(tMessages.common.deleteRecordConfirm())}
                      onDelete={() => deleteAudio(langAudio.id)}
                      onDragStart={() => {
                        setDraging(true);
                      }}
                      onDragEnd={() => setTimeout(() => setDraging(false), 300)}
                      // onClick={() => onOpenAudioDetail(langAudio)}
                      drag={!!playingAudioId || isDesktop ? false : "x"}
                      isChildAudio={true}
                      audio={langAudio}
                      onFavorite={() => favoriteAudio(langAudio.id)}
                    >
                      <AudioItem
                        audio={langAudio}
                        onPlayingAudio={(id: string) =>
                          onPlayingAudio(id, index)
                        }
                        disabled={
                          !!playingAudioId && langAudio.id !== playingAudioId
                        }
                      />
                    </AudioSwipeLeftCard>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            </div>
          ) : (
            <AudioSwipeLeftCard
              key={audio.id}
              className={`${!!playingAudioId && audio.id === playingAudioId ? "z-[98]" : "z-50"} w-full`}
              title={t(tMessages.common.deleteRecordConfirm())}
              onDelete={() => deleteAudio(audio.id)}
              onDragStart={() => setDraging(true)}
              onDragEnd={() => setTimeout(() => setDraging(false), 300)}
              onClick={() => onOpenAudioDetail(audio)}
              drag={!!playingAudioId || isDesktop ? false : "x"}
              isChildAudio={false}
              audio={audio}
              onFavorite={() => favoriteAudio(audio.id)}
            >
              <AudioItem
                audio={audio}
                onPlayingAudio={(id: string) => onPlayingAudio(id, index)}
                disabled={!!playingAudioId && audio.id !== playingAudioId}
              />
            </AudioSwipeLeftCard>
          ),
        )}
      </>
    );
  };

  const rightItem = (
    <div className="justify-content-end flex gap-2">
      <SearchComponent query={searchTerm} onSearchChange={handleSearchRecord} />
      <UploadAudioModal />
      <ProfileDropdown />
    </div>
  );

  return (
    <HorizontalTransition>
      <Header rightItem={rightItem} />
      <Container className="mt-2 flex-col overflow-x-clip">
        <PullToRefresh onRefresh={handleRefresh}>
          {!isFetched ? (
            <AudioListLoader />
          ) : (
            <>
              <div className="mb-4 flex w-full gap-2">
                {/* Sort buttons */}
                <AudioSort
                  sortBy={sortBy}
                  onSortByChange={setSortBy}
                  sortOrder={sortOrder}
                  onSortOrderChange={setSortOrder}
                />

                {/* Filter buttons */}
                <AudioFilterType
                  filter={filterType}
                  onFilterChange={setFilterType}
                />
              </div>

              {filteredAudios.length === 0 ? (
                <WaveAnimation />
              ) : (
                <div className="relative flex w-full flex-col items-center gap-2 overflow-y-auto">
                  {/* Favorite list */}
                  {favoriteAudios.length > 0 && (
                    <>
                      <h4 className="self-start text-[16px] font-bold text-[#4caf50]">
                        {t(tMessages.common.myFavorite())}
                      </h4>
                      {renderAudioList(favoriteAudios)}
                      <div className="my-[6px] h-[1px] w-full bg-[#444444]"></div>
                    </>
                  )}
                  {/* Uploading list */}
                  {renderAudioList(uploadingAudios)}

                  {/* Audio list */}
                  {renderAudioList(normalAudios)}
                </div>
              )}
            </>
          )}
        </PullToRefresh>

        {/* <AIChatBot hidden={!!playingAudioId} /> */}
      </Container>
    </HorizontalTransition>
  );
};

export default RecordAudios;
