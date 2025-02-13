import React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { IconButton } from "./IconButton";
import { QuestionMarkIcon } from "../icons";
import { Cross1Icon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { tMessages } from "@/locales/messages";

const finedTuneWords = [
  "iDeCo",
  "MAB",
  "MAB-FPI",
  "MONEX VIEW",
  "MONEX VISION",
  "NISA",
  "REIT",
  "TTB",
  "TTM",
  "TTS",
  "おかねの育て方",
  "イオン銀行",
  "インフレ",
  "エフピー教育出版",
  "ドル・コスト平均法",
  "マネックス証券",
  "リスクとリターン",
  "リビング・ニーズ特約",
  "一時払変額年金保険",
  "一時払定額年金保険",
  "一時払終身保険",
  "三菱アセット・ブレインズ",
  "住宅ローン",
  "傷害特約",
  "円建終身保険",
  "合同運用指定金銭信託",
  "変額保険",
  "外貨建保険",
  "外貨預金",
  "定期預金",
  "平準払終身保険",
  "投資信託",
  "時間分散",
  "災害割増特約",
  "為替変動リスク",
  "特定疾病保険",
  "生命保険料控除",
  "確定拠出年金",
  "税制適格特約",
  "退職所得控除",
  "金融商品仲介",
  "高額療養費制度",
  "期限前返済",
  "為替差損益",
  "信託財産運用",
  "外貨定期預金",
  "利息",
  "総合口座",
  "受託者",
  "信託業務",
  "外貨預金規定",
  "利回りの賢人",
  "兼営法施行規則",
  "保護預り約款",
  "受益者",
  "債権譲渡",
  "金銭消費貸借契約",
  "地方債",
  "ムーディーズＳＦジャパン",
  "繰上返済",
  "信託",
  "外国証券",
  "外貨普通預金口座",
  "一般債振替",
  "外貨普通預金",
  "円普通預金",
  "団体信用生命保険付保",
  "イオン銀行ダイレクト",
  "コマーシャルペーパー",
  "為替レート",
  "信託財産状況報告書",
  "指定紛争解決機関",
  "未払利息",
  "格付投資情報センター",
  "信託財産",
  "貸付債権",
  "信託法",
  "契約締結前書面",
  "債権保全",
  "相殺",
  "外貨インターネットバンキング",
  "日本格付研究所",
  "つなぎローン",
  "金融商品仲介業務",
  "期限の利益",
  "流動性補完",
  "上場株式",
  "信託受益権",
  "外貨建一時払保険",
  "ベビーファンド",
  "源泉分離課税",
  "団体信用生命保険",
  "ベビーファンド信託約款",
  "期限前解約利率",
  "自己資金",
  "約定利率",
  "連帯保証人",
];

type FineTunedModelTooltipModalProps = {
  className?: string;
  iconClassName?: string;
};

const FineTunedModelTooltipModal: React.FC<FineTunedModelTooltipModalProps> = ({
  className = "",
  iconClassName,
}) => {
  const { t } = useTranslation();
  return (
    <Dialog>
      <DialogTrigger asChild>
        <IconButton
          className={className}
        >
          <QuestionMarkIcon className={cn("size-5 transition duration-200 hover:scale-[1.2]", iconClassName)} />
        </IconButton>
      </DialogTrigger>
      <DialogContent className="sm:[70%] w-[90%] max-w-full border-none px-3 sm:px-6">
        <DialogHeader>
          <DialogTitle className="text-left underline underline-offset-4">
            {t(tMessages.finedTuneTooltip.title())}
          </DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="flex h-auto w-full flex-col gap-4 overflow-auto text-justify text-sm text-white/80 sm:text-base">
          <p>{t(tMessages.finedTuneTooltip.description())}</p>

          <div>
            <p>{t(tMessages.finedTuneTooltip.selectSettings())}</p>
            <ul className="mt-2 list-inside list-decimal space-y-2">
              <li>
                {t(tMessages.finedTuneTooltip.general())}
                <ul className="ml-4 mt-1 list-inside list-circle">
                  <li>{t(tMessages.finedTuneTooltip.generalDesc())}</li>
                </ul>
              </li>
              <li>
                {t(tMessages.finedTuneTooltip.finance())}
                <ul className="ml-4 mt-1 list-inside list-circle space-y-1">
                  <li>{t(tMessages.finedTuneTooltip.financeDesc())}</li>
                  <ul className="ml-4 h-[150px] list-inside list-square overflow-auto rounded-md border border-primary p-2">
                    {finedTuneWords.map((word: string, index: number) => (
                      <li key={`fined_tune_word_${index + 1}`}>{word}</li>
                    ))}
                  </ul>
                </ul>
              </li>
            </ul>
          </div>
        </div>
        <DialogClose asChild>
          <IconButton type="button" className="absolute right-4 top-6">
            <Cross1Icon className="size-5" />
          </IconButton>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export { FineTunedModelTooltipModal };
