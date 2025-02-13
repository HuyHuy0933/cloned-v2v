import {
  RecordedAudioDiary,
} from "@/features/record-audios/types";
import React, { useEffect, useMemo, useState } from "react";
import { TranscriptionEditorProps } from "./TranscriptionEditor";
import * as Y from "yjs";
import { withMultiColumn } from "@blocknote/xl-multi-column";
import { useCreateBlockNote } from "@blocknote/react";
import { stringToBrightHexColor } from "@/lib/utils";
import {
  BlockNoteSchema,
  BlockSchemaFromSpecs,
  defaultBlockSpecs,
  locales,
  PartialBlock,
} from "@blocknote/core";
import { AvatarBlock, DeleteBlock, TimerBlock } from "./custom-blocks";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import "./editor.scss";
import { useCurrentUser } from "@/hooks";
import ContentLoader from "react-content-loader";

const schema = BlockNoteSchema.create({
  blockSpecs: {
    // Adds all default blocks.
    ...defaultBlockSpecs,
    avatar: AvatarBlock,
    delete: DeleteBlock,
    timer: TimerBlock,
  },
});

type BlockNoteEdiorProps = TranscriptionEditorProps & {
  doc: Y.Doc;
  provider: any;
};

// const PAGE_SIZE = 10;

const BlockNoteEditor: React.FC<BlockNoteEdiorProps> = ({
  doc,
  provider,
  audio,
  audioPresignUrl,
  onTranscriptsChange,
  onTranscriptsLoaded,
}) => {
  const { currentUser } = useCurrentUser();

  const [loading, setLoading] = useState(true);
  // const [page, setPage] = useState(1);

  const transcripts = audio.diary;
  const audioDuration = audio.duration;
  // const totalPages = Math.round(transcripts.length / PAGE_SIZE);
  // const showLoadMore = page < totalPages;

  const users = useMemo(() => {
    return audio.participants.map((x: any) => x.name);
  }, [audio.participants]);

  const transcriptsDocument: PartialBlock<
    BlockSchemaFromSpecs<typeof schema.blockSpecs>
  >[] = useMemo(() => {
    const result: any[] = [];

    for (const item of transcripts) {
      const obj: PartialBlock<BlockSchemaFromSpecs<typeof schema.blockSpecs>> =
        {
          id: item.id,
          type: "columnList",
          children: [
            {
              type: "column",
              props: {
                width: 0.2,
              },
              children: [
                {
                  type: "avatar",
                  props: {
                    selectedUser: item.speaker,
                    otherUsersJson: JSON.stringify(users),
                  },
                },
              ],
            },
            {
              type: "column",
              props: {
                width: 1.5,
              },
              children: [
                {
                  type: "paragraph",
                  content: item.transcript,
                },
              ],
            },
            {
              type: "column",
              props: {
                width: 0.4,
              },
              children: [
                {
                  type: "timer",
                  props: {
                    startTime: item.start_time.toString(),
                    endTime: item.end_time.toString(),
                    duration: audioDuration.toString(),
                  },
                },
              ],
            },
            {
              type: "column",
              props: {
                width: 0.2,
              },
              children: [
                {
                  type: "delete",
                  props: {
                    rowId: item.id,
                  },
                },
              ],
            },
          ],
        };

      result.push(obj);
    }

    return result;
  }, [transcripts, audioPresignUrl, users]);

  // Creates a new editor instance.
  const editor = useCreateBlockNote({
    domAttributes: {
      block: {
        class: "text-xs sm:text-sm",
      },
    },
    dictionary: {
      ...locales["en"],
      placeholders: {
        ...locales["en"].placeholders,
        // We override the default placeholder
        default: "",
      },
    },
    // Adds column and column list blocks to the schema.
    schema: withMultiColumn(schema),
    collaboration: {
      provider,
      fragment: doc.getXmlFragment("document-store"),
      user: {
        name: currentUser.name,
        color: stringToBrightHexColor(currentUser.name),
      },
    },
  });

  useEffect(() => {
    function setDefault() {
      if (!editor) {
        return;
      }

      if (editor.document.length === 1) {
        editor.replaceBlocks(editor.document, transcriptsDocument);
      }
      
      setLoading(false);
      onTranscriptsLoaded && onTranscriptsLoaded();
    }

    provider.on("sync", setDefault);
    return () => provider.off("sync", setDefault);
  }, [editor, provider, transcriptsDocument]);

  const onDiariesUpdate = () => {
    const columnList = editor.document.filter(
      (x: any) => x.type === "columnList",
    );

    // Update diaries
    const updatedDiaries: RecordedAudioDiary[] = columnList.map(
      (block: any) => {
        const columnBlocks = block.children.filter(
          (x: any) => x.type === "column",
        );

        const speakerBlock = columnBlocks[0].children[0].props.selectedUser;
        const transcriptBlock = columnBlocks[1].children[0].content[0].text;
        const timerBlock = columnBlocks[2].children[0].props;
        const startTime = timerBlock.startTime;
        const endTime = timerBlock.endTime;
        const rowId = columnBlocks[3].children[0].props.rowId;

        const prevTranscript = transcripts.find((x) => x.id === rowId);
        const updatedTranscript: RecordedAudioDiary = {
          ...prevTranscript,
          id: block.id,
          speaker: speakerBlock,
          transcript: transcriptBlock,
          start_time: Number(startTime),
          end_time: Number(endTime),
        }

        return updatedTranscript;
      },
    );

    console.log(updatedDiaries);

    onTranscriptsChange && onTranscriptsChange(updatedDiaries);
  };

  // const onLoadMore = () => {
  //   const nextPage = page + 1;
  //   const from = page * PAGE_SIZE - 1;
  //   const to =
  //     from + PAGE_SIZE > transcriptsDocument.length
  //       ? transcriptsDocument.length
  //       : from + PAGE_SIZE;

  //   const curLastBlock = editor.document[from];
  //   const nextBlocks = transcriptsDocument.slice(from, to);
  //   console.log("nextBlocks", nextBlocks);
  //   editor.insertBlocks(nextBlocks, curLastBlock, "after");
  //   setPage(nextPage);
  // };

  if (!provider.isReady) {
  }

  return (
    <div className="h-full min-h-8 w-full overflow-auto px-2">
      <BlockNoteView
        // className="mt-4"
        sideMenu={false}
        slashMenu={false}
        formattingToolbar={false}
        editor={editor}
        onChange={onDiariesUpdate}
      ></BlockNoteView>

      {/* {showLoadMore && !loading && (
        <div className="mt-4 w-full justify-center">
          <Button className="rounded px-4 py-3" onClick={onLoadMore}>
            Load more
          </Button>
        </div>
      )} */}

      {loading && (
        <div className="absolute left-0 top-0 h-full w-full">
          {/* <CenterSpinner fillColor="fill-white" /> */}
          <ContentLoader
            speed={2}
            width="100%"
            height="100%"
            backgroundColor="hsl(var(--primary))"
            foregroundColor="hsl(var(--primary-foreground))"
          >
            <rect x="0" y="0" rx="0" ry="0" width="100%" height="100%" />
          </ContentLoader>
        </div>
      )}

      <audio id="editor-audio-player" src={audioPresignUrl} />
    </div>
  );
};

export default BlockNoteEditor;
