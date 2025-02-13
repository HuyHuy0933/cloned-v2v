import { createBrowserRouter, Navigate, RouteObject } from "react-router-dom";
import Layout from "./Layout";
import {
  AccountSetting,
  AddVoice,
  RecordAudios,
  RecordAudioDetails,
  Recorder,
  Conversation,
  VoiceList,
  MeetingSetting,
  Meeting,
  MyProfile,
  FAQs,
  Inbox,
  MeetingInvitation,
  CustomIdMeetingCheckIn,
  CustomMeetingCheckOut,
  RecordingTranscription,
  MicrophoneTest,
  TutorialList,
} from "@/containers";
import { ErrorBoundary } from "@/components";
import ProtectedRoute from "./ProtectedRoute";
import { useCurrentUser } from "@/hooks";
import { config } from "@/lib/config";

const FAQChildrenRoutes: RouteObject[] = config.kuritaVersion ? [] : [
  {
    path: "FAQs",
    element: <ProtectedRoute element={<FAQs />} />,
  },
]

const appRouter = createBrowserRouter(
  [
    {
      path: "/",
      element: <Layout />,
      errorElement: <ErrorBoundary />,
      children: [
        {
          index: true,
          element: <Navigate to="/recorder" replace />,
        },
        {
          path: "recorder",
          element: <ProtectedRoute element={<Recorder />} />,
        },
        {
          path: "conversation",
          element: <ProtectedRoute element={<Conversation />} />,
        },
        {
          path: "audios",
          element: <ProtectedRoute element={<RecordAudios />} />,
        },
        {
          path: "audios/:id",
          element: <ProtectedRoute element={<RecordAudioDetails />} />,
        },
        {
          path: "setting",
          element: <ProtectedRoute element={<AccountSetting />} />,
        },
        {
          path: "voice-list",
          element: <ProtectedRoute element={<VoiceList />} />,
        },
        {
          path: "add-voice",
          element: <ProtectedRoute element={<AddVoice />} />,
        },
        {
          path: "meeting-setting",
          element: <ProtectedRoute element={<MeetingSetting />} />,
        },
        {
          path: "meeting/:id",
          element: <ProtectedRoute element={<Meeting />} />,
        },
        // {
        //   path: "meeting/:id/invitation",
        //   element: <ProtectedRoute element={<MeetingInvitation />} />,
        // },
        // {
        //   path: "meeting-checkin",
        //   element: <ProtectedRoute element={<CustomIdMeetingCheckIn />} />,
        // },
        // {
        //   path: "meeting-checkout",
        //   element: <ProtectedRoute element={<CustomMeetingCheckOut />} />,
        // },
        // {
        //   path: "recording-meeting/:id",
        //   element: <ProtectedRoute element={<RecordingTranscription />} />,
        // },
        {
          path: "profile",
          element: <ProtectedRoute element={<MyProfile />} />,
        },
        // ...FAQChildrenRoutes,
        // {
        //   path: "inbox",
        //   element: <ProtectedRoute element={<Inbox />} />,
        // },
        // {
        //   path: "microphone-test",
        //   element: <ProtectedRoute element={<MicrophoneTest />} />,
        // },
        // {
        //   path: "tutorial",
        //   element: <ProtectedRoute element={<TutorialList />} />,
        // },
      ],
    },
  ],
  { basename: config.basename },
);

const recordingRestrictRouter = createBrowserRouter(
  [
    {
      path: "/",
      element: <Layout />,
      errorElement: <ErrorBoundary />,
      children: [
        {
          index: true,
          element: <Navigate to="/recorder" replace />,
        },
        {
          path: "recorder",
          element: <ProtectedRoute element={<Recorder />} />,
        },
        {
          path: "recording-meeting/:id",
          element: <ProtectedRoute element={<RecordingTranscription />} />,
        },
        {
          path: "setting",
          element: <ProtectedRoute element={<AccountSetting />} />,
        },
        {
          path: "voice-list",
          element: <ProtectedRoute element={<VoiceList />} />,
        },
        {
          path: "add-voice",
          element: <ProtectedRoute element={<AddVoice />} />,
        },
        {
          path: "profile",
          element: <ProtectedRoute element={<MyProfile />} />,
        },
        {
          path: "FAQs",
          element: <ProtectedRoute element={<FAQs />} />,
        },
        {
          path: "inbox",
          element: <ProtectedRoute element={<Inbox />} />,
        },
        {
          path: "microphone-test",
          element: <ProtectedRoute element={<MicrophoneTest />} />,
        },
        {
          path: "tutorial",
          element: <ProtectedRoute element={<TutorialList />} />,
        },
      ],
    },
  ],
  { basename: config.basename },
);

export const useRouter = () => {
  const { currentUser } = useCurrentUser();
  return {
    router: currentUser.isRecordingStrict ? recordingRestrictRouter : appRouter,
  };
};
