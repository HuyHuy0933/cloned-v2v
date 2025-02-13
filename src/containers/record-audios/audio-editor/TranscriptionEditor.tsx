import {
  RecordedAudio,
  RecordedAudioDiary,
} from "@/features/record-audios/types";
import React, { useEffect, useState } from "react";
import { useRoom } from "@liveblocks/react/suspense";
import * as Y from "yjs";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";
import BlockNoteEditor from "./BlockNoteEditor";

export type TranscriptionEditorProps = {
  audio: RecordedAudio;
  audioPresignUrl: string;
  onTranscriptsChange?: (diaries: RecordedAudioDiary[]) => void;
  onTranscriptsLoaded?: () => void;
};

const TranscriptionEditor: React.FC<TranscriptionEditorProps> = React.memo(
  (props) => {
    const room = useRoom();
    const [doc, setDoc] = useState<Y.Doc>();
    const [provider, setProvider] = useState<any>();

    // Set up Liveblocks Yjs provider
    useEffect(() => {
      const yDoc = new Y.Doc();
      const yProvider = new LiveblocksYjsProvider(room, yDoc);
      setDoc(yDoc);
      setProvider(yProvider);

      return () => {
        yDoc?.destroy();
        yProvider?.destroy();
      };
    }, [room]);

    if (!doc || !provider) {
      return null;
    }

    return <BlockNoteEditor doc={doc} provider={provider} {...props} />;
  },
);

export default TranscriptionEditor;
