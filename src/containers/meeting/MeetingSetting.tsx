import {
  Button,
  Container,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Header,
  HorizontalTransition,
  IconButton,
  Input,
  Label,
  LanguageSelect,
  OptionSelect,
  Spinner,
  Textarea,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components";

import { CircleLeftArrowIcon, TeamsIcon } from "@/components/icons";
import {
  useCheckMeetingPasswordMutation,
  useCreateMeetingMutation,
} from "@/features/meeting/mutations";
import { useMeetingsQuery } from "@/features/meeting/queries";
import {
  CreateMeetingRequest,
  MeetingRoom,
  MeetingUser,
  MeetingUserRole,
} from "@/features/meeting/types";
import { allLanguages, LanguageOption, QUERY_KEY } from "@/lib/constaints";
import { RootState } from "@/main";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { debounce } from "lodash";
import MeetingItem from "./MeetingItem";
import { hideMetLgRecordBtn, pcLayout } from "@/features/ui/uiSlice";
import ProfileDropdown from "../account-setting/ProfileDropdown";
import { HelpTooltipModal } from "./mobile/HelpTooltipModal";
import { useCurrentUser } from "@/hooks";
import "./styles/GlowStyle.scss";
import { SOCKET_EVENT, useSocketClient } from "@/features/socket/socketClient";
import { MeetingContextTooltipModal } from "./mobile/MeetingContextTooltipModal";
import InputPassword from "./password/InputPassword";
import { useTranslation } from "react-i18next";
import { tMessages } from "@/locales/messages";
import { t } from "i18next";
import { config } from "@/lib/config";
import NetworkIndicator from "./NetworkIndicator";
import CreateMeetingButton from "./CreateMeetingButton";
import { PrivateMeetingTooltip } from "./mobile/PrivateMeetingTooltip";
import { CustomStyles } from "@/lib/styles";
import {v4 as uuidv4} from "uuid";

const getRandomGlowColor = () => {
  const randomIndex = Math.floor(Math.random() * glowColors.length);
  return glowColors[randomIndex];
};

export enum MEETING_USER_ROLE {
  ADMIN = "admin",
  SPEAKER = "speaker",
  SECRETARY = "secretary",
  OBSERVER = "observer",
}

const glowColors = [
  "lightcyan",
  "lightpink",
  "palegreen",
  "lavender",
  "peach",
  "softblue",
  "lightgoldenrod",
  "lightsalmon",
  "palevioletred",
  "powderblue",
  "mintcream",
  "lightgray",
];

export const meetingRoleOptions: MeetingUserRole[] = [
  {
    title: tMessages.common.presenter,
    value: MEETING_USER_ROLE.SPEAKER,
    icon: "💬",
  },
  {
    title: tMessages.common.secretaryPCUseOnly,
    value: MEETING_USER_ROLE.SECRETARY,
    icon: "✏️",
  },
  {
    title: tMessages.common.observerNoSpeak,
    value: MEETING_USER_ROLE.OBSERVER,
    icon: "👂",
  },
  {
    title: tMessages.common.chairPersonMaxOne,
    value: MEETING_USER_ROLE.ADMIN,
    icon: "👑",
  },
];

enum MEETING_ACTION {
  SELECT_MEETING = "select_meeting",
  CREATE_MEETING = "create_meeting",
  JOIN_MEETING = "join_meeting",
}

const meetingSchema = z
  .object({
    meetingName: z.string().min(1, {
      message: "Required",
    }),
    role: z.string(),
    meeting_context: z.string(),
    is_protected: z.boolean().optional(),
    private: z.boolean().optional(),
    password: z.string().optional(),
    url: z.string().refine(
      (data) => {
        if (data.length > 0) {
          return new RegExp(/^https:\/\/teams\.(microsoft|live)\.com\//).test(
            data,
          );
        }
        return true;
      },
      {
        message: t(tMessages.common.teamsUrlFormat()),
      },
    ),
    is_bot: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.is_protected) {
        return data.password && data.password.length === 5;
      }
      return true;
    },
    {
      message: t(tMessages.common.meetingPasscodeLimit()),
      path: ["password"],
    },
  )
  .refine(
    (data) => {
      if (data.is_bot) {
        return data.url.length > 0;
      }
      return true;
    },
    {
      message: "Required",
      path: ["url"],
    },
  );

type MeetingSchemaType = z.infer<typeof meetingSchema>;
export type MeetingSettingRouteState = {
  customMeeting?: MeetingRoom;
  invitationMeeting?: MeetingRoom;
};

const MeetingSetting = () => {
  const { t } = useTranslation();
  const socket = useSocketClient();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const { currentUser, setting: userSetting } = useCurrentUser();
  const customMeeting = (location.state as MeetingSettingRouteState)
    ?.customMeeting;
  const invitationMeeting = (location.state as MeetingSettingRouteState)
    ?.invitationMeeting;

  const {
    data: meetingList,
    isFetched: isFetchedMeetings,
    refetch: refetchMeetingList,
  } = useMeetingsQuery();

  // const createMeetingMutation = useCreateMeetingMutation();
  // const checkMeetingPasswordMutation = useCheckMeetingPasswordMutation();

  const userLanguage =
    allLanguages.find((x) => x.code === userSetting.language) ||
    allLanguages[1];
  const setting = useSelector((state: RootState) => state.setting);
  const [language, setLanguage] = useState<LanguageOption>(() => userLanguage);
  const [currentMeeting, setCurrrentMeeting] = useState<
    MeetingRoom | undefined
  >(undefined);
  const [action, setAction] = useState<string>(MEETING_ACTION.SELECT_MEETING);
  const [currentGlowColor, setCurrentGlowColor] = useState("");
  const [creating, setCreating] = useState(false);
  const [open, setOpen] = useState(false);
  const [pwdVal, setPwdVal] = useState("");
  const [inValidPassword, setInvalidPasword] = useState(false);
  const [meetingUser, setMeetingUser] = useState<MeetingUser>();
  const [copiedMeetingLink, setCopiedMeetingLink] = useState(false);
  const [triggerReset, setTriggerReset] = useState(false);

  let isHasAdmin = false;
  if (currentMeeting?.users) {
    isHasAdmin = currentMeeting.users.some(
      (x) => x.role === MEETING_USER_ROLE.ADMIN,
    );
  }
  const isBotMeeting = currentMeeting && !!currentMeeting.bot_url;
  const invitationMeetingId = searchParams.get("invitation_meeting_id");
  const custom_room_id = searchParams.get("roomId") || undefined;
  const custom_token = searchParams.get("token") || undefined;
  const custom_meeting_name = searchParams.get("title") || undefined;
  const showLeftArrow =
    action !== MEETING_ACTION.SELECT_MEETING &&
    meetingList &&
    meetingList.length > 0 &&
    !invitationMeetingId &&
    !custom_room_id;
  const showCreateIcon =
    action !== MEETING_ACTION.CREATE_MEETING &&
    !invitationMeetingId &&
    !custom_room_id;

  const form = useForm<MeetingSchemaType>({
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      meetingName: "",
      role: MEETING_USER_ROLE.SPEAKER,
      meeting_context: "",
      is_protected: false,
      private: false,
      password: "",
      url: "",
      is_bot: false,
    },
    reValidateMode: "onSubmit",
    mode: "onChange",
  });

  // Watch the 'is_protected' field
  const isProtected = form.watch("is_protected");
  let toggleBotMeeting = form.watch("is_bot");

  useEffect(() => {
    if (isProtected) {
      form.resetField("password");
    }
  }, [isProtected]);

  useEffect(() => {
    const onJoinChannel = debounce(() => {
      console.log("meeting setting - user join");
      refetchMeetingList();
    }, 300);
    const onLeaveChannel = debounce(() => {
      console.log("meeting setting - user leave");
      refetchMeetingList();
    }, 300);

    socket.on(SOCKET_EVENT.join_channel, onJoinChannel);
    socket.on(SOCKET_EVENT.leave_channel, onLeaveChannel);
    // socket.connect();
    return () => {
      socket.off(SOCKET_EVENT.join_channel, onJoinChannel);
      socket.off(SOCKET_EVENT.leave_channel, onLeaveChannel);

      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.MEETING_LIST],
        refetchType: "none",
      });
    };
  }, []);

  useEffect(() => {
    if (!isFetchedMeetings || !meetingList || !!custom_room_id) return;

    if (invitationMeeting) {
      clickSelectMeeting(invitationMeeting, getRandomGlowColor());
      return;
    }

    if (meetingList.length === 0) {
      setAction(MEETING_ACTION.CREATE_MEETING);
    }

    setSearchParams({});
  }, [meetingList, isFetchedMeetings, invitationMeeting, custom_room_id]);

  useEffect(() => {
    if (customMeeting) {
      clickSelectMeeting(customMeeting, getRandomGlowColor());
      return;
    }

    if (custom_room_id && custom_meeting_name) {
      setAction(MEETING_ACTION.CREATE_MEETING);
      form.setValue("role", MEETING_USER_ROLE.ADMIN);
      form.setValue("meetingName", custom_meeting_name);
    }
  }, [custom_room_id, custom_token, custom_meeting_name, customMeeting]);

  const createMeeting = async (
    user: MeetingUser,
    values: MeetingSchemaType,
  ) => {
    setCreating(true);
    const meeting: MeetingRoom = {
      meetingId: "",
      meetingName: values.meetingName,
      contexts: setting.contexts,
      customNames: setting.customNames,
      userPrompt: setting.prompt,
      systemPrompt: setting.systemPrompt,
      censoredWords: setting.censoredWords,
      meeting_context: values.meeting_context,
      bot_url: values.url,
      custom_room_id: custom_room_id,
      remote_access: !!custom_room_id ? "nfc" : "",
      private: values.private,
    };
    // const result = await createMeetingMutation.mutateAsync({
    //   ...meeting,
    //   ...user,
    //   createdAt: new Date().getTime(),
    //   password: values.password,
    //   custom_token: custom_token,
    //   stt_model: setting.sttMode,
    // } as CreateMeetingRequest);
    setCreating(false);
    meeting.meetingId = uuidv4();
    return meeting;
  };

  const navigateUrl = (user: MeetingUser, meeting: MeetingRoom) => {
    const isSecretary = user.role === MEETING_USER_ROLE.SECRETARY;

    if (isSecretary) {
      dispatch(pcLayout());
    }

    if (meeting.bot_url) {
      dispatch(hideMetLgRecordBtn());
    }

    navigate(`/meeting/${meeting.meetingId}`, {
      state: { currentUser: user, meeting },
    });
  };

  const onSubmit = async (values: MeetingSchemaType) => {
    const meetingUser: MeetingUser = {
      userId: currentUser.id,
      email: currentUser.email,
      username: currentUser.name,
      language: language.code,
      role: values.role,
    };

    let meeting = undefined;
    if (action === MEETING_ACTION.CREATE_MEETING) {
      meeting = await createMeeting(meetingUser, values);
      navigateUrl(meetingUser, meeting);
      return;
    }

    // join meeting
    meeting = currentMeeting;

    if (!meeting) return;

    // open passcode modal to input
    if (meeting.isProtected) {
      setOpen(true);
      setMeetingUser(meetingUser);
      setInvalidPasword(false);
      return;
    }

    navigateUrl(meetingUser, meeting);
  };

  const clickSelectMeeting = (meeting: MeetingRoom, color: string) => {
    setCurrrentMeeting(meeting);
    setAction(MEETING_ACTION.JOIN_MEETING);
    setCurrentGlowColor(color);
    form.setValue("meetingName", meeting.meetingName);
    if (meeting.bot_url) {
      form.setValue("role", MEETING_USER_ROLE.OBSERVER, {
        shouldDirty: true,
      });
    } else if (meeting.custom_room_id) {
      form.setValue("role", MEETING_USER_ROLE.SPEAKER, {
        shouldDirty: true,
      });
    }
  };

  const clickLeftButton = () => {
    resetForm();
    if (meetingList && meetingList.length > 0) {
      setAction(MEETING_ACTION.SELECT_MEETING);
    } else {
      setAction(MEETING_ACTION.CREATE_MEETING);
    }
  };

  const handleCreateMeeting = (createBotMeeting: boolean | undefined) => {
    clickRightButton();
    form.setValue("is_bot", createBotMeeting, { shouldValidate: true });
    if (createBotMeeting) {
      form.setValue("role", MEETING_USER_ROLE.OBSERVER);
    }
  };

  const clickRightButton = () => {
    setCurrrentMeeting(undefined);
    resetForm();
    setAction(MEETING_ACTION.CREATE_MEETING);
  };

  const resetForm = () => {
    form.reset();
    setLanguage(userLanguage);
    form.clearErrors();
  };

  const toggleTeamsBot = (isEnableBot: boolean) => {
    form.setValue("is_bot", isEnableBot, { shouldValidate: true });
    if (!isEnableBot) {
      form.setValue("url", "");
      form.setValue("role", MEETING_USER_ROLE.SPEAKER);
    } else {
      form.setValue("meeting_context", "");
      form.setValue("role", MEETING_USER_ROLE.OBSERVER);
    }
    form.clearErrors();
  };

  const onOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      setPwdVal("");
    }
  };

  const checkMeetingPassword = async (password: string) => {
    if (!currentMeeting || !meetingUser) return;
    // const result = await checkMeetingPasswordMutation.mutateAsync({
    //   id: currentMeeting.meetingId,
    //   password: password,
    // });

    // if (!result) {
    //   setInvalidPasword(true);
    //   setPwdVal("");
    //   return;
    // }

    // navigateUrl(meetingUser, currentMeeting);
  };

  const onChangePassword = (value: string) => {
    setPwdVal(value);
    setInvalidPasword(false);

    if (value.length === 5) {
      checkMeetingPassword(value);
    }
  };

  const copyMeetingLink = async () => {
    await navigator.clipboard.writeText(
      `${config.clientBaseUrl}/meeting/${currentMeeting?.meetingId}/invitation`,
    );
    setCopiedMeetingLink(true);
    setTimeout(() => {
      setCopiedMeetingLink(false);
    }, 1000);
  };

  if (!isFetchedMeetings) {
    return (
      <HorizontalTransition>
        <Container className="items-center justify-center">
          <Spinner />
        </Container>
      </HorizontalTransition>
    );
  }

  let title = t(tMessages.common.createMeetingTitle());
  if (currentMeeting) {
    title = "";
  }

  let passwordDialog = <></>;
  if (open) {
    passwordDialog = (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[90%] max-w-xl md:w-[700px] md:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-md w-full text-center text-white">
              {t(tMessages.common.meeingPasscodePrompt())}
            </DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center">
            <InputPassword value={pwdVal} onChange={onChangePassword} />
            {inValidPassword && (
              <span className="mt-2 text-sm text-red-600">
                {t(tMessages.common.meetingPasscodeInvalid())}
              </span>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  let rightHeader: JSX.Element | undefined = (
    <div className="flex gap-3">
      <NetworkIndicator />
      <ProfileDropdown />
    </div>
  );

  let leftHeader: JSX.Element | undefined = undefined;
  if (showLeftArrow) {
    leftHeader = (
      <IconButton onClick={clickLeftButton}>
        <CircleLeftArrowIcon className="size-8 transition duration-200 hover:scale-[1.2]" />
      </IconButton>
    );
  }

  const v2vDesc = (
    <>
      <p>{t(tMessages.meetingCreation.v2vMeeting.desc1())}</p>
      <p>{t(tMessages.meetingCreation.v2vMeeting.desc2())}</p>
      <p>{t(tMessages.meetingCreation.v2vMeeting.desc3())}</p>
      <p>{t(tMessages.meetingCreation.v2vMeeting.desc4())}</p>
      <p>{t(tMessages.meetingCreation.v2vMeeting.desc5())}</p>
    </>
  );

  const teamsDesc = (
    <>
      <p>{t(tMessages.meetingCreation.teamsMeeting.desc1())}</p>
      <p>{t(tMessages.meetingCreation.teamsMeeting.desc2())}</p>
      <p>{t(tMessages.meetingCreation.teamsMeeting.desc3())}</p>
    </>
  );

  const headerText = !toggleBotMeeting ? (
    t(tMessages.meetingCreation.v2vMeeting.headerText())
  ) : (
    <div className="flex gap-2">
      <TeamsIcon /> {t(tMessages.meetingCreation.teamsMeeting.headerText())}
    </div>
  );

  let content = (
    <div className="m-auto flex w-full flex-col items-center gap-4 sm:w-[300px]">
      {meetingList &&
        meetingList.map((item: MeetingRoom) => {
          const glowColor = getRandomGlowColor();
          return (
            <MeetingItem
              className={glowColor}
              meeting={item}
              key={item.meetingId}
              onClick={() => clickSelectMeeting(item, glowColor)}
            />
          );
        })}
    </div>
  );

  if (
    action === MEETING_ACTION.CREATE_MEETING ||
    action === MEETING_ACTION.JOIN_MEETING
  ) {
    // create and join form
    content = (
      <div
        className={`mt-4 flex h-full w-full flex-col items-center overflow-auto px-2 ${action === MEETING_ACTION.CREATE_MEETING ? "justity-start" : "justify-center"} gap-4 pb-4`}
      >
        {action === MEETING_ACTION.CREATE_MEETING && (
          <div className="flex w-full flex-col items-center justify-start">
            {/* Tabs */}
            {!custom_room_id && (
              <div className="flex w-full justify-between overflow-x-auto border-b border-primary-foreground">
                <Button
                  className={`w-full ${CustomStyles.tabItem} ${!toggleBotMeeting ? CustomStyles.tabItemActive : ""}`}
                  onClick={() => toggleTeamsBot(false)}
                >
                  <span>{t(tMessages.meetingCreation.v2vMeeting.title())}</span>
                </Button>
                <Button
                  className={`w-full ${CustomStyles.tabItem} ${toggleBotMeeting ? CustomStyles.tabItemActive : ""}`}
                  onClick={() => toggleTeamsBot(true)}
                >
                  <span>
                    {t(tMessages.meetingCreation.teamsMeeting.title())}
                  </span>
                </Button>
              </div>
            )}

            {/* Description */}
            <div className="mt-3 flex w-full flex-col items-center justify-center gap-3">
              <h1 className="text-lg font-bold">{headerText}</h1>
              <div className="flex w-full flex-col text-center text-sm text-primary-foreground">
                {!toggleBotMeeting ? v2vDesc : teamsDesc}
              </div>
            </div>
          </div>
        )}
        <Form key="form" {...form}>
          <form
            className={`flex flex-col gap-4 ${action === MEETING_ACTION.CREATE_MEETING ? "w-full" : "w-full sm:w-[300px]"}`}
            // onSubmit={form.handleSubmit(onSubmit)}
          >
            {currentMeeting && (
              <MeetingItem
                meeting={currentMeeting}
                selected
                className={currentGlowColor}
              />
            )}

            {action === MEETING_ACTION.CREATE_MEETING && (
              <>
                {/* Meeting name */}
                <FormField
                  name="meetingName"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex w-full flex-col space-y-1">
                      <FormLabel className="text-sm">
                        {t(tMessages.common.meetingName())}
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="border border-primary-foreground focus:border-primary-foreground focus-visible:ring-0"
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          placeholder={t(
                            tMessages.common.meetingNamePlaceHolder(),
                          )}
                          disabled={!!custom_room_id}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Meeting bot url */}
                {toggleBotMeeting && (
                  <FormField
                    name="url"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col space-y-1">
                        <FormLabel className="text-sm">
                          {t(tMessages.common.teamsURL())}
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="border border-primary-foreground focus:border-primary-foreground focus-visible:ring-0"
                            name={field.name}
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            placeholder={t(tMessages.common.teamsURL())}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </>
            )}

            {/* User lanaguage */}
            <div
              className={action === MEETING_ACTION.CREATE_MEETING ? "" : "mt-5"}
            >
              <LanguageSelect
                label={t(tMessages.common.language())}
                value={language}
                onChange={setLanguage}
                options={allLanguages}
                triggerClass="h-[40px] rounded-lg py-0"
              />
            </div>

            {/* User role */}
            <Controller
              name="role"
              control={form.control}
              render={({ field }) => (
                <OptionSelect
                  triggerClass="h-[40px] rounded-lg py-0"
                  label={
                    <div className="flex justify-between">
                      <Label className="text-sm">
                        {t(tMessages.common.role())}
                      </Label>
                      <HelpTooltipModal />
                    </div>
                  }
                  value={field.value}
                  onChange={(role) => {
                    form.setValue("role", role);
                  }}
                  options={meetingRoleOptions}
                  disabled={
                    isBotMeeting || toggleBotMeeting || !!custom_room_id
                  }
                  disabledOption={(value) =>
                    value === MEETING_USER_ROLE.ADMIN && isHasAdmin
                  }
                />
              )}
            />

            {action === MEETING_ACTION.CREATE_MEETING && (
              <>
                {/* Meeting context */}
                {!toggleBotMeeting && (
                  <FormField
                    name="meeting_context"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="flex w-full flex-col space-y-1">
                        <div className="flex justify-between">
                          <FormLabel className="text-sm">
                            {t(tMessages.common.meetingContext())}
                          </FormLabel>
                          <MeetingContextTooltipModal />
                        </div>
                        <FormControl>
                          <Textarea
                            className="h-[150px] overflow-auto"
                            name={field.name}
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            placeholder={t(
                              tMessages.common.meetingCtxPlaceholder(),
                            )}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* private meeting option */}
                <div className="flex items-center justify-between">
                  <FormField
                    control={form.control}
                    name="private"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-1">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>
                          {t(tMessages.common.privateMeeting())}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <PrivateMeetingTooltip />
                </div>

                {/* password protection opiton */}
                <div className="flex w-full flex-col gap-2">
                  <FormField
                    control={form.control}
                    name="is_protected"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-1">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>
                          {t(tMessages.common.setPassword())}
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  {/* Passcode */}
                  {form.getValues("is_protected") && (
                    <div className="flex flex-col justify-center gap-1 py-2">
                      <Controller
                        name="password"
                        control={form.control}
                        render={({ field: { onChange, value } }) => (
                          <InputPassword value={value} onChange={onChange} />
                        )}
                      />
                      {form.formState.errors.password && (
                        <span className="py-1 text-center text-[12px] text-red-500">
                          {form.formState.errors.password.message}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <Button
                  className="h-10 w-full bg-neutral-200 text-black hover:bg-white"
                  disabled={!form.formState.isValid}
                  type="submit"
                >
                  {toggleBotMeeting
                    ? t(tMessages.common.add())
                    : t(tMessages.common.toHold())}
                  {creating && <Spinner className="ml-2 size-4 text-modal" />}
                </Button>
              </>
            )}

            {action === MEETING_ACTION.JOIN_MEETING && (
              <a
                className="text-right text-sm italic text-primary-foreground underline underline-offset-2"
                onClick={copyMeetingLink}
              >
                {copiedMeetingLink
                  ? t(tMessages.common.copied())
                  : t(tMessages.common.copyMeetingLink())}
              </a>
            )}
          </form>
        </Form>
      </div>
    );
  }

  return (
    <HorizontalTransition className="relative">
      <Header leftItem={leftHeader} rightItem={rightHeader} />
      <Container
        className={`justify-center ${action === MEETING_ACTION.SELECT_MEETING ? "overflow-auto px-2" : "overflow-clip"}`}
      >
        {passwordDialog}
        {content}
      </Container>
      {showCreateIcon ? (
        <CreateMeetingButton
          createMeeting={(value) => handleCreateMeeting(value)}
        />
      ) : (
        <></>
      )}
    </HorizontalTransition>
  );
};

export default MeetingSetting;
