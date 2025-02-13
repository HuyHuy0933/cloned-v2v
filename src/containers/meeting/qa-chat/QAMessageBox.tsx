import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Answering
} from "@/components";
import { AutoHeightInput } from "@/components/shared/AutoHeightInput";
import { QAMessage } from "@/features/qa-messages/types";
import React, { useCallback, useState } from "react";
import QAMessageItem from "./QAMessageItem";
import { useTranslation } from "react-i18next";
import { tMessages } from "@/locales/messages";

type QAMessageBoxProps = {
  question: QAMessage;
  onSendAnswer?: (parentId: string, answer: string) => void;
  currentUserId?: string;
};

const QAMessageBox: React.FC<QAMessageBoxProps> = React.memo(
  ({ question, onSendAnswer, currentUserId }) => {
    const { t } = useTranslation();
    const [openAnswerInput, setOpenAnswerInput] = useState(false);
    const [answer, setAnswer] = useState("");

    const onCancel = useCallback(() => {
      setAnswer("");
      setOpenAnswerInput(false);
    }, []);

    const sendAnswer = useCallback(() => {
      onSendAnswer && onSendAnswer(question.id, answer);
      setAnswer("");
    }, [question, answer, onSendAnswer]);

    return (
      <div className="w-full border-b border-primary-foreground p-2 pt-3">
        {/* questions and answers */}
        <div>
          <QAMessageItem
            message={question}
            isYou={question.userId === currentUserId}
          />
          {question.answers.length > 0 && (
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="answers" className="border-0 pl-2">
                <AccordionTrigger className="justify-start gap-2 py-0 text-xs hover:no-underline">
                  <span className="text-blue">Expand all</span>
                </AccordionTrigger>
                <AccordionContent>
                  {question.answers.map((item: QAMessage) => (
                    <QAMessageItem
                      key={item.id}
                      className="mt-1"
                      message={item}
                      isYou={item.userId === currentUserId}
                    />
                  ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
          {question.botAnswering && <Answering />}
        </div>

        {openAnswerInput ? (
          <div className="mt-4 flex w-full flex-col rounded-lg border border-blue/50 p-1">
            <AutoHeightInput
              className="max-h-16 min-h-[40px] border-0 text-xs focus-visible:ring-0"
              placeholder={t(tMessages.common.enterAnswerPlaceholder())}
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              onEnterSubmit={sendAnswer}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                className="h-6 border-primary-foreground bg-transparent px-2 text-sm hover:bg-transparent hover:text-white"
                onClick={onCancel}
              >
                {t(tMessages.common.cancel())}
              </Button>
              <Button
                className="h-6 bg-blue px-2 text-sm hover:bg-blue/90"
                onClick={sendAnswer}
                disabled={!answer}
              >
                {t(tMessages.common.send())}
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-6 flex justify-end">
            <Button
              className="h-6 bg-blue px-2 text-sm hover:bg-blue/90"
              onClick={() => setOpenAnswerInput(true)}
            >
              {t(tMessages.common.answer())}
            </Button>
          </div>
        )}
      </div>
    );
  },
);

export default QAMessageBox;
