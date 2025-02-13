import { lazy } from "react";

const Recorder = lazy(() => import('@/containers/recorder/Recorder'))
const RecordAudios = lazy(() => import('@/containers/record-audios/RecordAudios'))
const RecordAudioDetails = lazy(() => import('@/containers/record-audios/RecordAudioDetails'))
const Conversation = lazy(() => import('@/containers/conversation/Conversation'))
const AccountSetting = lazy(() => import('@/containers/account-setting/AccountSetting'))
const MyProfile = lazy(() => import('@/containers/my-profile/MyProfile'))
const FAQs = lazy(() => import('@/containers/account-setting/FAQs'))
const Inbox = lazy(() => import('@/containers/account-setting/Inbox'))
const AddVoice = lazy(() => import('@/containers/voice-setting/AddVoice'))
const VoiceList = lazy(() => import('@/containers/voice-setting/VoiceList'))
const MeetingSetting = lazy(() => import('@/containers/meeting/MeetingSetting'))
const Meeting = lazy(() => import('@/containers/meeting/Meeting'))
const MeetingInvitation = lazy(() => import('@/containers/meeting/MeetingInvitation'))
const CustomIdMeetingCheckIn = lazy(() => import('@/containers/meeting/CustomIdMeetingCheckIn'))
const CustomMeetingCheckOut = lazy(() => import('@/containers/meeting/CustomMeetingCheckOut'))
const RecordingTranscription = lazy(() => import('@/containers/recording-meeting/RecordingTranscription'))
const MicrophoneTest = lazy(() => import('@/containers/microphone-test/MicrophoneTest'))
const TutorialList = lazy(() => import('@/containers/tutorials/TutorialList'))

export {
  Recorder,
  RecordAudios,
  RecordAudioDetails,
  Conversation,
  AccountSetting,
  AddVoice,
  VoiceList,
  MeetingSetting,
  Meeting,
  MeetingInvitation,
  CustomIdMeetingCheckIn,
  CustomMeetingCheckOut,
  MyProfile,
  FAQs,
  Inbox,
  RecordingTranscription,
  MicrophoneTest,
  TutorialList
}