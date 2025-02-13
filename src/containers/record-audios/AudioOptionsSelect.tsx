import {
  Checkbox,
  CustomTooltip,
  FineTunedModelTooltipModal,
  JollyFieldGroup,
  JollyLabel,
  JollyNumberField,
  JollyNumberFieldInput,
  JollyNumberFieldSteppers,
  Label,
  Separator,
  TooltipModal,
} from "@/components";
import { tMessages } from "@/locales/messages";
import React, { useMemo } from "react";
import { Trans, useTranslation } from "react-i18next";
import FinedTuneModelSelect from "./FinedTuneModelSelect";
import { SummaryAITemplateTooltipModal } from "@/components/shared/SummaryAITemplateTooltipModal";
import SummaryAITemplateSelect from "./SummaryAITemplateSelect";
import { fineTuneOptions } from "./RecordAudios";
import {
  FINE_TUNED_MODEL,
  TemplateDetail,
} from "@/features/record-audios/types";
import { useAISummaryTemplateData } from "./useAISummaryTemplateData";

type AudioOptionsSelectProps = {
  removeNoise: boolean;
  setRemoveNoise: (value: boolean) => void;
  masking: boolean;
  setMasking: (value: boolean) => void;
  analyzeSentiment: boolean;
  setAnalyzeSentiment: (value: boolean) => void;
  model: string;
  setModel: (value: string) => void;
  enableSummaryAI: boolean;
  setEnableSummaryAI: (value: boolean) => void;
  summaryAITemplate: string;
  setSummaryAITemplate: (value: string) => void;
  numSpeakers: number;
  setNumSpeakers: (value: number) => void;
};

const AudioOptionsSelect: React.FC<AudioOptionsSelectProps> = React.memo(
  ({
    removeNoise,
    setRemoveNoise,
    masking,
    setMasking,
    analyzeSentiment,
    setAnalyzeSentiment,
    model,
    setModel,
    enableSummaryAI,
    setEnableSummaryAI,
    summaryAITemplate,
    setSummaryAITemplate,
    numSpeakers,
    setNumSpeakers,
  }) => {
    const { t } = useTranslation();

    const { data } = useAISummaryTemplateData();

    const summaryTemplateOptions = useMemo(() => {
      return data.map((template: TemplateDetail) => ({
        value: template.name,
        title: template.title,
      }));
    }, [data]);

    return (
      <div className="mt-2 flex w-full flex-col gap-2">
        {/* AI Summary checkbox */}
        <div className="field flex w-full items-start space-x-2">
          <Checkbox
            id="ai-summary"
            checked={enableSummaryAI}
            onCheckedChange={(checked) => setEnableSummaryAI(checked === true)}
          />
          <Label className="text-sm" htmlFor="ai-summary">
            {t(tMessages.common.AISummary())}
          </Label>

          <CustomTooltip className="bg-neutral-700 text-[10px] text-xs">
          {t(tMessages.common.AISummaryHint())}
          </CustomTooltip>
        </div>

        {/* Select fine-tuned model */}
        <div className="field w-full space-y-1">
          <div className="flex w-full justify-between">
            <Label className="text-sm">
              {t(tMessages.common.finedTuneLabel())}
            </Label>
            <FineTunedModelTooltipModal />
          </div>

          <FinedTuneModelSelect
            value={model}
            options={fineTuneOptions}
            onValueChange={(currentValue) => {
              setModel(currentValue);
            }}
          />
          {model !== FINE_TUNED_MODEL.GENERAL && (
            <p>
              ⚠️{" "}
              <span className="text-sm text-primary-foreground">
                {t(tMessages.common.financeModelWarning())}
              </span>
            </p>
          )}
        </div>

        {/* The number of speakers */}
        {model !== FINE_TUNED_MODEL.GENERAL && (
          <div className="field w-full">
            <JollyNumberField
              defaultValue={numSpeakers}
              minValue={1}
              step={1}
              onChange={(value) => {
                setNumSpeakers(value);
              }}
            >
              <JollyLabel>{t(tMessages.common.numOfSpeakers())}</JollyLabel>
              <JollyFieldGroup
                className="bg-transparent"
                style={{
                  boxShadow: "none",
                }}
              >
                <JollyNumberFieldInput
                  onKeyDown={(event) => {
                    const invalidKeys = [".", "e", "+", "-"];
                    if (invalidKeys.includes(event.key)) {
                      event.preventDefault();
                    }
                  }}
                />
                <JollyNumberFieldSteppers />
              </JollyFieldGroup>
            </JollyNumberField>
          </div>
        )}

        {enableSummaryAI && ( // Conditionally render this block
          <div className="field mt-1 w-full space-y-1">
            <div className="flex w-full justify-between">
              <Label className="text-sm">
                {t(tMessages.common.summaryAITemplate())}
              </Label>
              <SummaryAITemplateTooltipModal />
            </div>

            <SummaryAITemplateSelect
              value={summaryAITemplate}
              options={summaryTemplateOptions}
              onValueChange={(currentValue) => {
                setSummaryAITemplate(currentValue);
              }}
            />
          </div>
        )}

        <Separator className="my-2 h-[0.5px] bg-primary-foreground" />

        <div className="flex w-full flex-col gap-2">
          <p className="text-sm">{t(tMessages.common.advancedSettings())}</p>
          <p className="text-xs text-muted-foreground">
            {t(tMessages.common.saveAudioAdvancedSettingsNote())}
          </p>

          {/* remove noise checkbox */}
          <div className="field mt-2 flex w-full items-start space-x-3">
            <Checkbox
              id="audio-isolation"
              checked={removeNoise}
              onCheckedChange={(checked) => setRemoveNoise(checked === true)}
            />
            <Label className="text-sm" htmlFor="audio-isolation">
              {t(tMessages.common.removeNoiseTitle())}
            </Label>
            <CustomTooltip className="bg-neutral-700 text-[10px] text-xs">
              {t(tMessages.common.removeNoiseTitleHint())}
            </CustomTooltip>
          </div>

          {/* masking checkbox */}
          <div className="field flex w-full items-start space-x-3">
            <Checkbox
              id="audio-masking"
              checked={masking}
              onCheckedChange={(checked) => setMasking(checked === true)}
            />
            <Label className="text-sm" htmlFor="audio-masking">
              {t(tMessages.common.performMasking())}
              <br />
            </Label>
            <CustomTooltip className="bg-neutral-700 text-[10px] text-xs leading-4">
              <Trans i18nKey={tMessages.common.performMaskingHint()} />
            </CustomTooltip>
          </div>

          {/* Analyze sentiment checkbox */}
          <div className="field flex w-full items-start space-x-2">
            <Checkbox
              id="audio-sentiment"
              checked={analyzeSentiment}
              onCheckedChange={(checked) =>
                setAnalyzeSentiment(checked === true)
              }
            />
            <Label className="text-sm" htmlFor="audio-sentiment">
              {t(tMessages.common.analyzeSentiment())}
              <br />
            </Label>
            <CustomTooltip className="bg-neutral-700 text-[10px] text-xs">
              <Trans i18nKey={tMessages.common.analyzeSentimentLonger()} />
            </CustomTooltip>
          </div>
        </div>
      </div>
    );
  },
);

export default AudioOptionsSelect;
