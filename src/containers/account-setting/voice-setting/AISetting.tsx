import {
  autoPlayOptions,
  reverseOptions,
  setCensoredWords,
  setCustomNames,
  setPrompt,
  setSystemPrompt,
  setTranslationMode,
  toggleReverseText,
  translationOptions,
  toggleAutoPlay,
  setRecorderMeeting,
  setPiiCategories,
} from "@/features/settings/settingSlice";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/main";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, OptionSelect } from "@/components";
import { useTranslation } from "react-i18next";
import { tMessages } from "@/locales/messages";
import { Label, TagsInput, Switch, Textarea } from "@/components";
import { useDebouncedCallback } from "use-debounce";
import { useCurrentUser } from "@/hooks";
import { TooltipModal } from "@/components/shared/TooltipModal";
import { PiiCategory, TRANSLATION_MODE } from "@/features/settings/types";
import CustomEntityInputs from "./CustomEntityInputs";
import PIITreeView from "./PIITreeView";

const AISetting = () => {
  const { t } = useTranslation();
  const setting = useSelector((state: RootState) => state.setting);
  const dispatch = useDispatch();
  const [toggleDeveloperSettings, setDeveloperSettings] = useState(false);
  const { setting: userSetting } = useCurrentUser();

  const selectTranslationMode = (value: string) => {
    dispatch(setTranslationMode(value));
  };

  const onCustomNamesChangeDebounced = useDebouncedCallback(
    (values: string[]) => {
      dispatch(setCustomNames(values.join("\n")));
    },
    1000,
  );

  const onCensoredWordsChangeDebounced = useDebouncedCallback(
    (values: string[]) => {
      dispatch(setCensoredWords(values.join("\n")));
    },
    1000,
  );

  const onTextAreaChangeDebounced = useDebouncedCallback((event: any) => {
    const name = event.target.name;
    const value = event.target.value;

    if (name === "prompt") {
      dispatch(setPrompt(value));
    }

    if (name === "systemPrompt") {
      dispatch(setSystemPrompt(value));
    }
  }, 1000);

  const onEntityExtractionChange = (value: boolean) => {
    dispatch(
      setRecorderMeeting({
        entityExtraction: value,
      }),
    );
    if (!value) {
      dispatch(
        setRecorderMeeting({
          transcriptSharing: value,
        }),
      );
    }
  };

  const ontranscriptSharingChange = (value: boolean) => {
    dispatch(
      setRecorderMeeting({
        transcriptSharing: value,
      }),
    );
  };

  const onSpeakerSegmentChange = (value: boolean) => {
    dispatch(
      setRecorderMeeting({
        speakerSegment: value,
      }),
    );
  };

  const onCustomEntitiesChangeDebounced = useDebouncedCallback(
    (values: string[]) => {
      // dispatch(setCustomEntities(values.join("\n")));
    },
    1000,
  );

  const onPiiCategoriesChange = (piiCategories: PiiCategory[]) => {
    dispatch(setPiiCategories(piiCategories));
  };

  const supportedLanguageTooltip = () => {
    const supportedLanguages = t(tMessages.common.spacySupportedLanguages());
    let languages = supportedLanguages.split(", ");
    if (userSetting.language == "ar-SA") {
      languages = supportedLanguages.split("،");
    }
    if (languages) {
      return (
        <div className="flex flex-col gap-2">
          <p className="font-bold">
            {t(tMessages.common.supportedLanguagesText())}
          </p>
          <ul className="max-h-[400px] list-inside list-disc gap-1 overflow-scroll border-[1px] border-neutral-700 p-3">
            {languages.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      );
    }
  };

  const entityExtractionTooltip = (
    <div className="flex flex-col gap-3">
      <p>{t(tMessages.common.entityExtractionDesc())}</p>
      {supportedLanguageTooltip()}
    </div>
  );

  const trancriptSharingTooltip = (
    <div className="flex flex-col gap-3">
      <p>{t(tMessages.common.trancriptSharingDesc())}</p>
      {supportedLanguageTooltip()}
    </div>
  );

  return (
    <div className="flex w-full grow flex-col gap-4">
      <p className="w-full text-center text-xs text-primary-foreground">
        {t(tMessages.setting.aiTabDesc())}
      </p>
      <div className="flex flex-col space-y-2">
        {/* translation mode */}
        <OptionSelect
          label={t(tMessages.common.translationSettings())}
          value={setting.translationMode}
          onChange={selectTranslationMode}
          options={translationOptions}
        />
        {/* translation mode */}

        {/* custom names */}
        {setting.translationMode !== TRANSLATION_MODE.ONLINE && (
          <div className="flex flex-col">
            <Label className="text-sm">
              {t(tMessages.common.autoPhraseList())}
            </Label>
            <TagsInput
              className="mt-2 h-auto"
              values={[...setting.customNames.split("\n").filter((x) => !!x)]}
              onChange={onCustomNamesChangeDebounced}
              placeholder={t(tMessages.common.autoPhraseListPlaceHolder())}
            />
          </div>
        )}
        {/* custom names */}
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-sm">
          {t(tMessages.common.conversationSettings())}
        </Label>
        {/* auto play toggle */}
        <OptionSelect
          value={setting.autoPlay.toString()}
          onChange={(value) => dispatch(toggleAutoPlay(value === "true"))}
          options={autoPlayOptions}
        />

        {/* reverse text toggle */}
        <OptionSelect
          value={setting.isReversedText.toString()}
          onChange={(value) => dispatch(toggleReverseText(value === "true"))}
          options={reverseOptions}
          bottomContent={
            <>
              <p>{t(tMessages.setting.reverseTooltip())}</p>
              <p className="mt-2">
                ※{t(tMessages.setting.reverseTooltipNote1())}
                <strong className="underline">
                  {t(tMessages.bottomTabs.conversation())}
                </strong>
                {t(tMessages.setting.reverseTooltipNote2())}
              </p>
            </>
          }
        />
      </div>

      {/* censored words */}
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between">
          <Label className="text-sm">
            {t(tMessages.common.maskingWords())}
          </Label>
          <TooltipModal>
            <div className="mt-4 space-y-2">
              <p>{t(tMessages.setting.maskingTooltip())}</p>
            </div>
          </TooltipModal>
        </div>
        <TagsInput
          className="mt-2 h-auto"
          inputClassName="w-[260px]"
          values={[...setting.censoredWords.split("\n").filter((x) => !!x)]}
          onChange={onCensoredWordsChangeDebounced}
          placeholder={t(tMessages.common.maskingWordsPlaceholder())}
        />
      </div>
      {/* censored words */}

      {/* PPI masking */}
      <div className="flex flex-col space-y-2">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem
            key="pii_tree_view"
            value="pii_tree_view"
            className="rounded border-none"
          >
            <AccordionTrigger className="hover:no-underline font-medium py-2">
              <div className="flex w-full items-center justify-between font-semibold ">
                <Label className="text-sm">Data Masking Entity</Label>
              </div>
            </AccordionTrigger>

            <AccordionContent className="pb-0 text-justify text-white/70">
              <div id="treeview-container" className="border-solid border-x border-y border-primary-foreground rounded p-2">
                <PIITreeView piiCategories={setting.piiCategories} onChange={onPiiCategoriesChange}/>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      {/* PPI masking */}

      {/* recorder meeting entity extraction, transcription sharing, speaker segmentation, custom entities */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <Label className="text-sm">
              {t(tMessages.common.recorderEntityExtraction())}
            </Label>
            <TooltipModal>{entityExtractionTooltip}</TooltipModal>
          </div>

          <Switch
            className="hover:shadow-switch transition duration-200"
            checked={setting.recorderMeeting.entityExtraction}
            onCheckedChange={onEntityExtractionChange}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <Label className="text-sm">
              {t(tMessages.common.recorderTrancriptSharing())}
            </Label>
            <TooltipModal>{trancriptSharingTooltip}</TooltipModal>
          </div>

          <Switch
            className="hover:shadow-switch transition duration-200"
            checked={setting.recorderMeeting.transcriptSharing}
            onCheckedChange={ontranscriptSharingChange}
          />
        </div>

        {process.env.NODE_ENV === "development" && (
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <Label className="text-sm">
                {t(tMessages.common.recordSpeakerSegment())}
              </Label>
              <TooltipModal>
                <div className="flex flex-col gap-3">
                  <p className="font-bold">
                    {t(tMessages.speakerSegmentTooltip.title())}
                  </p>
                  <p>{t(tMessages.speakerSegmentTooltip.subTitle())}</p>
                  <ul className="list-inside list-disc space-y-1">
                    <li>{t(tMessages.speakerSegmentTooltip.desc1())}</li>
                    <li>{t(tMessages.speakerSegmentTooltip.desc2())}</li>
                    <li>{t(tMessages.speakerSegmentTooltip.desc3())}</li>
                  </ul>
                </div>
              </TooltipModal>
            </div>

            <Switch
              className="hover:shadow-switch transition duration-200"
              checked={setting.recorderMeeting.speakerSegment}
              onCheckedChange={onSpeakerSegmentChange}
            />
          </div>
        )}

        <div className="flex flex-col space-y-2">
          <div className="flex space-x-2">
            <Label className="text-sm">
              {t(tMessages.common.addCustomEntity())}
            </Label>
            <TooltipModal>
              <div className="w-full space-y-1">
                <p>{t(tMessages.customEntityTooltip.desc1())}</p>
                <p>{t(tMessages.customEntityTooltip.desc2())}</p>
                <p>{t(tMessages.customEntityTooltip.desc3())}</p>
              </div>
            </TooltipModal>
          </div>
          <CustomEntityInputs />
        </div>
      </div>
      {/* recorder meeting entity extraction, transcription sharing, speaker segmentation */}

      {/* developer settings toggle */}
      <div className="mt-2 flex items-center justify-between">
        <Label className="text-sm">
          {t(tMessages.common.developerSettings())}
        </Label>
        <Switch
          className="hover:shadow-switch transition duration-200"
          checked={toggleDeveloperSettings}
          onCheckedChange={(value) => setDeveloperSettings(value)}
        />
      </div>
      {/* developer settings toggle */}

      {/* user prompt and system prompt */}
      {toggleDeveloperSettings ? (
        <>
          {/* user prompt */}
          <div className="flex flex-col">
            <Label className="text-sm">
              {t(tMessages.common.userPrompt())}
            </Label>
            <Textarea
              className="mt-2"
              name="prompt"
              rows={5}
              onChange={onTextAreaChangeDebounced}
              defaultValue={setting.prompt}
            />
          </div>

          {/* system prompt */}
          <div className="flex flex-col">
            <Label className="text-sm">
              {t(tMessages.common.systemPrompt())}
            </Label>
            <Textarea
              className="mt-2"
              name="systemPrompt"
              rows={5}
              onChange={onTextAreaChangeDebounced}
              defaultValue={setting.systemPrompt}
            />
          </div>
        </>
      ) : null}
      {/* user prompt and system prompt */}
    </div>
  );
};

export default AISetting;
