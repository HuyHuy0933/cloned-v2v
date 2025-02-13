import {
  Button,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  IconButton,
} from "@/components";
import { tMessages } from "@/locales/messages";
import { Dialog } from "@radix-ui/react-dialog";
import { Cross1Icon } from "@radix-ui/react-icons";
import { useTranslation } from "react-i18next";

const TermsOfServiceModal = () => {
  const { t } = useTranslation();
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="link"
          className="text-base text-primary-foreground hover:text-white hover:no-underline"
        >
          {t(tMessages.common.termsOfUse())}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:[70%] w-[90%] max-w-full border-none px-3 sm:px-6 max-h-[90%]">
        <DialogHeader>
          <DialogTitle className="text-left underline underline-offset-4">
            {t(tMessages.termsOfUseTooltip.title())}
          </DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="flex h-[80dvh] w-full flex-col gap-4 overflow-auto text-justify text-sm text-white/80 sm:text-base">
          <p>
            {t(tMessages.termsOfUseTooltip.desc1())}
            <strong>{t(tMessages.termsOfUseTooltip.desc2())}</strong>
            {t(tMessages.termsOfUseTooltip.desc3())}
          </p>
          <p>{t(tMessages.termsOfUseTooltip.desc4())}</p>

          {/* Terms 1 */}
          <div>
            <p>{t(tMessages.termsOfUseTooltip.term1())}</p>
            <ul className="ml-4 mt-2 list-inside list-decimal space-y-1">
              <li>{t(tMessages.termsOfUseTooltip.term1Desc1())}</li>
              <li>{t(tMessages.termsOfUseTooltip.term1Desc2())}</li>
            </ul>
          </div>
          {/* Terms 2 */}
          <div>
            <p>{t(tMessages.termsOfUseTooltip.term2())}</p>
            <ul className="ml-4 mt-2 list-inside list-disc space-y-1">
              <li>{t(tMessages.termsOfUseTooltip.term2Desc())}</li>
            </ul>
          </div>
          {/* Terms 3 */}
          <div>
            <p>{t(tMessages.termsOfUseTooltip.term3())}</p>
            <ul className="ml-4 mt-2 list-inside list-decimal space-y-1">
              <li>{t(tMessages.termsOfUseTooltip.term3Desc1())}</li>
              <li>{t(tMessages.termsOfUseTooltip.term3Desc2())}</li>
            </ul>
          </div>

          {/* Terms 4 */}
          <p>
            {t(tMessages.termsOfUseTooltip.term4())}
            {t(tMessages.termsOfUseTooltip.term4Desc1())}
          </p>
          {/* Terms 5 */}
          <div>
            <p>
              {t(tMessages.termsOfUseTooltip.term5())}
              {t(tMessages.termsOfUseTooltip.term5Desc1())}
            </p>
            <ul className="ml-4 mt-2 list-inside list-decimal space-y-1">
              <li>{t(tMessages.termsOfUseTooltip.term5Desc2())}</li>
              <li>{t(tMessages.termsOfUseTooltip.term5Desc3())}</li>
              <li>{t(tMessages.termsOfUseTooltip.term5Desc4())}</li>
              <li>{t(tMessages.termsOfUseTooltip.term5Desc5())}</li>
              <li>{t(tMessages.termsOfUseTooltip.term5Desc6())}</li>
              <li>{t(tMessages.termsOfUseTooltip.term5Desc7())}</li>
            </ul>
          </div>
          {/* Terms 6 */}
          <div>
            <p>{t(tMessages.termsOfUseTooltip.term6())}</p>
            <ul className="ml-4 mt-2 list-inside list-decimal space-y-1">
              <li>{t(tMessages.termsOfUseTooltip.term6Desc1())}</li>
              <li>{t(tMessages.termsOfUseTooltip.term6Desc2())}</li>
              <li>{t(tMessages.termsOfUseTooltip.term6Desc3())}</li>
              <li>{t(tMessages.termsOfUseTooltip.term6Desc4())}</li>
            </ul>
          </div>

          {/* Terms 7 */}
          <div>
            <p>
              {t(tMessages.termsOfUseTooltip.term7())}
              {t(tMessages.termsOfUseTooltip.term6Desc1())}
            </p>
            <ul className="ml-4 mt-2 list-inside list-decimal space-y-1">
              <li>{t(tMessages.termsOfUseTooltip.term7Desc2())}</li>
              <li>{t(tMessages.termsOfUseTooltip.term7Desc3())}</li>
              <li>{t(tMessages.termsOfUseTooltip.term7Desc4())}</li>
            </ul>
          </div>

          {/* Terms 8 */}
          <div>
            <p>{t(tMessages.termsOfUseTooltip.term8())}</p>
            <ul className="ml-4 mt-2 list-inside list-decimal space-y-1">
              <li>{t(tMessages.termsOfUseTooltip.term8Desc1())}</li>
              <li>{t(tMessages.termsOfUseTooltip.term8Desc2())}</li>
            </ul>
          </div>

          {/* Terms 9 */}
          <p>
            {t(tMessages.termsOfUseTooltip.term9())}
            {t(tMessages.termsOfUseTooltip.term9Desc())}
          </p>

          {/* Terms 4 */}
          <p>
            {t(tMessages.termsOfUseTooltip.term10())}
            {t(tMessages.termsOfUseTooltip.term10Desc())}
          </p>
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

export default TermsOfServiceModal;
