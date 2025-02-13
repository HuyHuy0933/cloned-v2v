import { TextWritter, UserAvatar } from "@/components";
import React, { useMemo } from "react";
import { TreeNodeEntity } from "./EntityCheckboxes";
import HighlightLabelText from "./HighlightLabelText";
import { RecordingMessage } from "@/features/recording-meeting/types";
import { format } from "date-fns";
import { cn, decodeHtmlEntities } from "@/lib/utils";

type ActiveLabel = {
  label: string;
  entities: string[];
  color?: string;
  title: string;
};

type RecordingMessageProps = {
  message: RecordingMessage;
  entities: TreeNodeEntity[];
  className?: string;
  hideTime?: boolean;
};

const RecordingMessageItem: React.FC<RecordingMessageProps> = React.memo(
  ({ message, entities, className, hideTime = false }) => {
    const entity_labels = message.entity_labels;

    const collectActiveLabels = (tree: TreeNodeEntity[]) => {
      const activeLabels: ActiveLabel[] = [];
      for (const node of tree) {
        if (node.checked) {
          activeLabels.push({
            title: node.title || node.label,
            label: node.label,
            entities:
              node.children
                ?.filter((child) => child.checked)
                .map((child) => child.label.toLowerCase()) || [],
            color: node.activeColor,
          });
        }
      }
      return activeLabels;
    };

    // Filter active labels based on the tree state
    const activeLabels: ActiveLabel[] = useMemo(
      () => collectActiveLabels(entities),
      [entities],
    );

    const highlightTextWithLabel = useMemo(() => {
      if (!message.entity_labels || message.entity_labels.length === 0)
        return (
          <span className="text-xs text-primary-foreground sm:text-sm">
            {message.text}
          </span>
        );
      const { text } = message;

      let lastIndex = 0;
      const chunks: JSX.Element[] = [];

      message.entity_labels.forEach(({ start, end, label, entity }, index) => {
        if (start > lastIndex) {
          // Add non-highlighted text before the entity
          chunks.push(
            <span
              className="text-xs text-primary-foreground sm:text-sm"
              key={`text-${index}-${lastIndex}`}
            >
              {decodeHtmlEntities(text.slice(lastIndex, start))}
            </span>,
          );
        }

        // Check if the entity or its parent label is active
        const activeLabel = activeLabels.find((item) => item.label === label);
        const isEntityActive =
          activeLabel &&
          (activeLabel.entities.includes(entity.toLowerCase()) ||
            activeLabel.entities.length === 0);

        if (isEntityActive) {
          chunks.push(
            <HighlightLabelText
              key={`entity-${index}`}
              text={decodeHtmlEntities(text.slice(start, end))}
              label={activeLabel.title || label}
              color={activeLabel?.color}
            />,
          );
        } else {
          // Add plain text for inactive labels
          chunks.push(
            <span
              className="text-xs text-primary-foreground sm:text-sm"
              key={`plain-${index}`}
            >
              {decodeHtmlEntities(text.slice(start, end))}
            </span>,
          );
        }

        lastIndex = end;
      });

      // Add remaining text after the last entity
      if (lastIndex < text.length) {
        chunks.push(
          <span className="text-sm text-primary-foreground" key={`text-end`}>
            {text.slice(lastIndex)}
          </span>,
        );
      }

      return chunks;
    }, [message, entity_labels, activeLabels]);

    return (
      <div
        className={cn(
          "recording-message min-h-[40px] w-full shrink-0 flex-col justify-center gap-2 border-b-[1px] px-4 py-2",
          className,
        )}
      >
        <div className="flex w-full items-start gap-4">
          <div className="relative">
            <UserAvatar
              className="shrink-0"
              username={message.username || ""}
            />
          </div>
          <div className="w-full leading-7">
            {message.is_final ? (
              <div className="highlight-text-label w-full">
                {highlightTextWithLabel}
              </div>
            ) : message.is_whisper ? (
              <p className="w-full text-xs text-primary-foreground sm:text-sm">
                {message.text}
              </p>
            ) : (
              <TextWritter
                className="w-full text-xs text-primary-foreground sm:text-sm"
                text={message.text}
              />
            )}

            {!hideTime && (
              <span className="text-[10px] text-primary-foreground">
                {format(message.createdAt, "HH:mm")}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  },
);

export default RecordingMessageItem;
