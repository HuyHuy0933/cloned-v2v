import {
  Container,
  DeletedSwipeLeftCard,
  Header,
  IconButton,
  PrimaryButton,
  Spinner,
} from "@/components";
import { CircleLeftArrowIcon, UserVoiceIcon } from "@/components/icons";
import { useDeleteClonedVoiceMutation } from "@/features/cloned-voices/mutations";
import { useElevenLabsVoicesQuery, useMyVoiceQuery } from "@/features/cloned-voices/queries";
import { ElevenLabsVoice } from "@/features/cloned-voices/types";
import ClonedVoiceDetail from "./cloned-voices/ClonedVoiceDetail";
import { tMessages } from "@/locales/messages";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const VoiceList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: voices, isFetching } = useElevenLabsVoicesQuery();
  const deleteClonedVoiceMutation = useDeleteClonedVoiceMutation();
  const { data: myVoice, isFetching: isFetchingVoice } = useMyVoiceQuery();

  const leftHeader: JSX.Element | undefined = (
    <IconButton className="z-10" onClick={() => navigate("/setting")}>
      <CircleLeftArrowIcon className="size-8 transition duration-200 hover:scale-[1.2]" />
    </IconButton>
  );

  let voiceList = <Spinner />;

  if (!isFetching && voices) {
    const userVoices = voices.filter((x) => !x.is_system_voice);
    const systemVoices = voices.filter((x) => x.is_system_voice);

    const onDeleteMyVoice = async (id: string) => {
      await deleteClonedVoiceMutation.mutateAsync(id);
    };

    voiceList = (
      <>
        {/* user voices */}
        {userVoices.length > 0 && (
          <div className="flex w-full flex-col gap-2">
            <span>{t(tMessages.common.myRegisteredVoice())}</span>
            <div className="flex flex-col bg-modal rounded-2xl">
              {userVoices.map((item: ElevenLabsVoice) => (
                <DeletedSwipeLeftCard
                  className="w-full"
                  title={t(tMessages.common.deleteVoiceConfirm())}
                  onDelete={() => onDeleteMyVoice(item.id)}
                  key={item.id}
                >
                  <PrimaryButton
                    prependIcon={<UserVoiceIcon />}
                    disabled
                    className="disabled:opacity-100"
                  >
                    {item.name}
                  </PrimaryButton>
                </DeletedSwipeLeftCard>
              ))}
              {myVoice && <div className="p-3"><ClonedVoiceDetail voice={myVoice} /></div>}
            </div>
          </div>
        )}

        {/* system voices */}
        <div className="mt-2 flex w-full flex-col gap-2">
          <span>{t(tMessages.common.systemVoice())}</span>
          {systemVoices.map((item: ElevenLabsVoice) => (
            <PrimaryButton
              key={item.id}
              prependIcon={<UserVoiceIcon />}
              disabled
              className="disabled:opacity-100"
            >
              {item.name}
            </PrimaryButton>
          ))}
        </div>
      </>
    );
  }

  return (
    <div className="flex h-full w-full flex-col p-4">
      <Header
        leftItem={leftHeader}
        centerItem={t(tMessages.common.clonedVoiceList())}
      />

      <Container>
        <div className="flex grow flex-col items-center gap-2 py-4">
          {voiceList}
        </div>
      </Container>
    </div>
  );
};

export default VoiceList;
