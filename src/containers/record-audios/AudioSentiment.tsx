import React, { useMemo, useState } from "react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ReferenceLine,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Button, Spinner, TooltipModal } from "@/components";
import { useTranslation } from "react-i18next";
import { tMessages } from "@/locales/messages";
import { SentimentData } from "@/features/record-audios/types";
import { useSentimentDataQuery } from "@/features/record-audios/queries";
import SentimentDataTable from "./audio-sentiment-table/AudioSentimentTable";
import { useParams } from "react-router-dom";
import { useAnalyzeSentimentMutation } from "@/features/record-audios/mutations";
import { catchError } from "@/lib/trycatch";

type StackedBarData = {
  positive: number;
  negative: number;
};

type SentimentStackedBarChartProps = {
  data: StackedBarData[];
  chartConfig: ChartConfig;
  aggregateSentiment: number;
};

const SentimentStackedBarChart: React.FC<SentimentStackedBarChartProps> =
  React.memo(({ data, chartConfig, aggregateSentiment }) => {
    const { t } = useTranslation();
    return (
      <div>
        <div className="relative flex h-8 w-full justify-end">
          <div className="absolute left-0 w-full space-y-1 text-center text-xs sm:text-sm">
            <p>
              {t(
                tMessages.sentiment.stackedBarChartTooltip.aggregateSentiment(),
              )}
              : {aggregateSentiment.toFixed(2)}
            </p>
            <p>
              {t(
                tMessages.sentiment.stackedBarChartTooltip.totalConversation(),
              )}
              : {data[0].positive + data[0].negative}
            </p>
          </div>
          <TooltipModal className="z-10">
            <p>{t(tMessages.sentiment.stackedBarChartTooltip.title())}</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-left text-white">
              <li>
                <strong>
                  {t(
                    tMessages.sentiment.stackedBarChartTooltip.aggregateSentiment(),
                  )}
                  :
                </strong>{" "}
                {t(
                  tMessages.sentiment.stackedBarChartTooltip.aggregateSentimentDesc(),
                )}
              </li>
              <li>
                <strong>
                  {t(
                    tMessages.sentiment.stackedBarChartTooltip.totalConversation(),
                  )}
                  :
                </strong>{" "}
                {t(
                  tMessages.sentiment.stackedBarChartTooltip.totalConversationDesc(),
                )}
              </li>
              <li>
                <strong>
                  {t(
                    tMessages.sentiment.stackedBarChartTooltip.posNegConversation(),
                  )}
                  :
                </strong>{" "}
                {t(
                  tMessages.sentiment.stackedBarChartTooltip.posNegConversationDesc(),
                )}
              </li>
            </ul>

            <p className="mt-2">
              {t(tMessages.sentiment.stackedBarChartTooltip.bottomDesc())}
            </p>
          </TooltipModal>
        </div>
        <ChartContainer
          config={chartConfig}
          className="h-[180px] w-full cursor-none"
        >
          <BarChart
            accessibilityLayer
            data={data}
            layout="vertical"
            margin={{
              left: -20,
            }}
            style={{
              cursor: "none",
            }}
          >
            <XAxis
              type="number"
              dataKey="positive"
              domain={[0, data[0].positive + data[0].negative]}
              hide
            />
            <YAxis type="category" tickLine={false} axisLine={false} hide />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  className="w-[200px] bg-modal text-white/80"
                  hideLabel
                  formatter={(value, name) => {
                    return (
                      <div className="flex w-full items-center justify-between gap-2">
                        <div
                          className="size-2.5 shrink-0 rounded-[2px]"
                          style={{
                            backgroundColor:
                              name === "positive"
                                ? "var(--color-positive)"
                                : "var(--color-negative)",
                          }}
                        ></div>

                        <div className="flex grow items-center justify-between gap-2">
                          <span>{chartConfig[name].label}</span>
                          <span className="text-white">{value}</span>
                        </div>
                      </div>
                    );
                  }}
                />
              }
            />
            <Bar dataKey="positive" stackId="a" fill="var(--color-positive)">
              <LabelList
                dataKey="positive"
                position="center"
                className="fill-white"
                fontSize={12}
              />
            </Bar>
            <Bar dataKey="negative" stackId="a" fill="var(--color-negative)">
              <LabelList
                dataKey="negative"
                position="center"
                className="fill-white"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>
    );
  });

type SentimentScatterChartProps = {
  positiveData: SentimentData[];
  negativeData: SentimentData[];
  chartConfig: ChartConfig;
};

const SentimentScatterChart: React.FC<SentimentScatterChartProps> = React.memo(
  ({ positiveData, negativeData, chartConfig }) => {
    const { t } = useTranslation();
    return (
      <div>
        <div className="flex w-full justify-between">
          <p>{t(tMessages.sentiment.scatterChart())}</p>
          <TooltipModal>
            <div className="space-y-1">
              <p>{t(tMessages.sentiment.scatterChartTooltip.desc1())}</p>
              <p>{t(tMessages.sentiment.scatterChartTooltip.desc2())}</p>
              <p>{t(tMessages.sentiment.scatterChartTooltip.desc3())}</p>
              <p>{t(tMessages.sentiment.scatterChartTooltip.desc4())}</p>
              <p>{t(tMessages.sentiment.scatterChartTooltip.desc5())}</p>
            </div>
          </TooltipModal>
        </div>
        <ChartContainer
          config={chartConfig}
          className="h-[300px] w-full cursor-none"
        >
          <ScatterChart
            margin={{
              left: -20,
              top: 20,
              bottom: 10,
              right: 10,
            }}
            style={{ cursor: "none" }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              type="number"
              dataKey="id"
              label={{
                value: "ID",
                position: "insideBottom",
                offset: -5,
              }}
              allowDecimals={false}
              domain={[0, positiveData.length + negativeData.length]}
            />
            <YAxis
              type="number"
              dataKey="score"
              name="score"
              label={{
                value: t(tMessages.sentiment.sentimentScore()),
                angle: -90,
              }}
            />
            <ZAxis type="number" dataKey="magnitude" range={[50, 300]} />
            <ReferenceLine y={0} label="" stroke="white" />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  className="w-[250px] bg-modal"
                  hideLabel
                  hideIndicator
                  formatter={(_, name, item) => {
                    if (name !== "score") return undefined;
                    const payload: SentimentData = item.payload;
                    return (
                      <div className="space-y-1 text-xs text-white/80">
                        <p>
                          {t(tMessages.sentiment.speaker())}: {payload.speaker}
                        </p>
                        <p>
                          {t(tMessages.sentiment.score())}:{" "}
                          {payload.score.toFixed(2)}
                        </p>
                        <p>
                          {t(tMessages.sentiment.magnitude())}:{" "}
                          {payload.magnitude.toFixed(2)}
                        </p>

                        <p>
                          {t(tMessages.sentiment.sentence())}:{" "}
                          {payload.sentence}
                        </p>
                      </div>
                    );
                  }}
                />
              }
            />
            <Scatter data={positiveData} fill="var(--color-positive)" />
            <Scatter data={negativeData} fill="var(--color-negative)" />
          </ScatterChart>
        </ChartContainer>
      </div>
    );
  },
);

type AudioSentimentProps = {};

const AudioSentiment: React.FC<AudioSentimentProps> = React.memo(() => {
  const { t } = useTranslation();
  const params = useParams();
  const audioId = params.id as string;
  const { data: sentimentData, isFetching } = useSentimentDataQuery(audioId);
  const analyzeSentimentMutation = useAnalyzeSentimentMutation();
  const [chartConfig] = useState<ChartConfig>({
    positive: {
      label: t(tMessages.sentiment.positiveConversation()),
      color: "hsl(var(--chart-2))",
    },
    negative: {
      label: t(tMessages.sentiment.negativeConversation()),
      color: "hsl(var(--chart-1))",
    },
  });
  const [analyzing, setAnalyzing] = useState(false);

  const positiveData = (sentimentData || []).filter((x) => x.score >= 0);
  const negativeData = (sentimentData || []).filter((x) => x.score < 0);
  const stackedBarChartData: StackedBarData[] = [
    { positive: positiveData.length, negative: negativeData.length },
  ];
  const aggregateSentiment = useMemo(() => {
    // Represents the overall sentiment score, calculated as the weighted sum of score * magnitude for all conversations.
    if (!sentimentData) return 0;
    return sentimentData.reduce(
      (acc, { score, magnitude }) => acc + score * magnitude,
      0,
    );
  }, [sentimentData]);

  const analyzeSentiment = async () => {
    setAnalyzing(true);
    const [_, data] = await catchError(
      analyzeSentimentMutation.mutateAsync(audioId),
    );
    setAnalyzing(false);
  };

  if (isFetching) {
    return (
      <div className="mt-2 flex w-full flex-col items-center">
        <Spinner />
      </div>
    );
  }

  if (sentimentData === null) {
    return (
      <div className="mt-2 flex w-full flex-col items-center gap-4 overflow-auto px-2 text-xs sm:text-sm">
        <div className="w-full space-y-2">
          <p>{t(tMessages.sentiment.notProcessTitle())}</p>
          <p>{t(tMessages.sentiment.clickToProcess())}</p>
        </div>
        <Button
          className="rounded px-4 py-3"
          onClick={analyzeSentiment}
          disabled={analyzing}
        >
          {t(tMessages.common.startProcessing())}
          {analyzing && <Spinner className="ml-2 size-4" />}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4 px-2 pt-2">
      <SentimentStackedBarChart
        data={stackedBarChartData}
        chartConfig={chartConfig}
        aggregateSentiment={aggregateSentiment}
      />

      <SentimentScatterChart
        positiveData={positiveData}
        negativeData={negativeData}
        chartConfig={chartConfig}
      />

      <SentimentDataTable data={sentimentData || []} />
    </div>
  );
});
export default AudioSentiment;
