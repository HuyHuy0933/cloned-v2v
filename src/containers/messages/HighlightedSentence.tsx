import {
  HighlightedRange,
  HIGHLIGHT_TYPE_ENUM,
} from "@/features/messages/types";
import React, { useRef } from "react";

export const annotatorBGColor: Record<HIGHLIGHT_TYPE_ENUM, string> = {
  [HIGHLIGHT_TYPE_ENUM.CHECK]: "#d4f4d2",
  [HIGHLIGHT_TYPE_ENUM.WARNING]: "#f9e4b7",
  [HIGHLIGHT_TYPE_ENUM.ERROR]: "#f7cccc",
};

type HighlightedSentenceProps = React.HTMLAttributes<HTMLDivElement> & {
  sentence: string;
  annotations: HighlightedRange[];
  onHighlight?: (start: number, end: number) => void;
};

const HighlightedSentence: React.FC<HighlightedSentenceProps> = React.memo(
  ({ sentence, annotations, onHighlight, ...rest }) => {
    const sentenceRef = useRef<any>(null);

    const handleTextSelection = () => {
      if (!onHighlight) return;
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0 || !selection.toString())
        return;

      // Get the first range of the selection.
      const range = selection.getRangeAt(0);
      
      // Make sure the selection is within the sentence element.
      if (
        !sentenceRef.current ||
        !sentenceRef.current.contains(range.startContainer)
      )
        return;

      // Create a Range that spans from the beginning of the sentence element to the start of the selection.
      const preRange = document.createRange();
      preRange.selectNodeContents(sentenceRef.current);
      preRange.setEnd(range.startContainer, range.startOffset);

      // The length of the preRange text is the starting index.
      const startIndex = preRange.toString().length;
      const selectedText = range.toString();
      let endIndex = startIndex + selectedText.length;
      if (endIndex > sentence.length) {
        endIndex = sentence.length;
      }

      onHighlight(startIndex, endIndex);
      selection.removeAllRanges();
    };

    const onTextSelectionEvent = (e: any) => {
      e.preventDefault();
      setTimeout(() => {
        handleTextSelection();
      }, 100);
    };

    const renderHighlightedSentence = () => {
      let parts = [];
      let lastIndex = 0;

      Array.from(annotations)
        .sort((a, b) => a.start - b.start)
        .forEach(({ start, end }) => {
          // Add text before the annotation
          if (lastIndex < start) {
            parts.push(
              <span key={lastIndex}>{sentence.slice(lastIndex, start)}</span>,
            );
          }

          // Add the annotated text
          const annotatedText = sentence.slice(start, end);
          parts.push(
            <span
              key={start}
              className="select-none rounded p-1 text-foreground"
              style={{ backgroundColor: '#d4f4d2' }}
              onClick={() => onHighlight && onHighlight(start, annotatedText.length)}
              onTouchStart={() => onHighlight && onHighlight(start, annotatedText.length)}
            >
              {annotatedText} 
              {/* {annotator} */}
            </span>,
          );

          lastIndex = end;
        });

      // Add remaining text after the last annotation
      if (lastIndex < sentence.length) {
        parts.push(<span key={lastIndex}>{sentence.slice(lastIndex)}</span>);
      }

      return parts;
    };

    return (
      <p
        ref={sentenceRef}
        onMouseUp={onTextSelectionEvent}
        onTouchEnd={onTextSelectionEvent}
        {...rest}
      >
        {renderHighlightedSentence()}
      </p>
    );
  },
);

export default HighlightedSentence;
