import { useTranslation } from "react-i18next";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Controller, useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import {
  Button,
  IconButton,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components";
import { tMessages } from "@/locales/messages";
import { CloseIcon, ShareLinkIcon } from "@/components/icons";
import { useLocation, useParams } from "react-router-dom";
import {
  AUDIO_PERMISSION,
  ShareRecordAudioRequest,
} from "@/features/record-audios/types";
import { useUsersRecordAudioSharedQuery } from "@/features/record-audios/queries";
import { useShareRecordAudioMutation } from "@/features/record-audios/mutations";
import { useCurrentUser } from "@/hooks";

interface UserRole {
  email: string;
  role: AUDIO_PERMISSION;
}

const defaultValues: UserRole = {
  email: "",
  role: AUDIO_PERMISSION.VIEWER,
};

interface ToggleSharePopupProps {
  isVisible: boolean;
  onClose: () => void;
}

const ToggleSharePopup: React.FC<ToggleSharePopupProps> = ({
  isVisible,
  onClose,
}) => {
  const params = useParams();
  const { toast } = useToast();
  const { t } = useTranslation();
  const location = useLocation();
  const audioId = location.state?.id || params.id;
  const { data: users = [] } = useUsersRecordAudioSharedQuery(audioId);
  const shareRecordAudioMutation = useShareRecordAudioMutation();
  const { currentUser } = useCurrentUser();

  const {
    handleSubmit,
    reset,
    control,
    register,
    formState: { isValid, isSubmitting },
  } = useForm<UserRole>({ defaultValues });

  const popupVariants = React.useMemo(
    () => ({
      hidden: { y: "100%", opacity: 0 },
      visible: { y: 0, opacity: 1 },
      exit: { y: "100%", opacity: 0 },
    }),
    [],
  );

  const getTextPermission = (permission: AUDIO_PERMISSION): string => {
    const permissionMapping: Record<AUDIO_PERMISSION, string> = {
      [AUDIO_PERMISSION.OWNER]: t(tMessages.shareHistoryMeeting.owner()),
      [AUDIO_PERMISSION.EDITOR]: t(tMessages.shareHistoryMeeting.canEdit()),
      [AUDIO_PERMISSION.VIEWER]: t(tMessages.shareHistoryMeeting.viewOnly()),
    };
    return permissionMapping[permission] || "";
  };

  const showToast = (message: string, type: "success" | "error") => {
    toast({
      className: `fixed w-[300px] md:w-[400px] py-2 ${
        type === "success"
          ? "bg-green-400 border-green-500"
          : "bg-red-400 border-red-500"
      } top-4 right-4 text-white`,
      title: message,
      duration: 2000,
    });
  };

  const sendInvite = async (payload: ShareRecordAudioRequest) => {
    try {
      await shareRecordAudioMutation.mutateAsync({ id: audioId, payload });
      showToast(t(tMessages.shareHistoryMeeting.success()), "success");
    } catch (error: any) {
      console.error(error?.response?.data?.message);
      showToast(
        error?.response?.data?.message ||
          t(tMessages.shareHistoryMeeting.somethingWentWrong()),
        "error",
      );
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    await sendInvite({
      recipient: data.email,
      audio_permission: data.role,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    reset();
  });

  const onUpdatePermission = async (
    recipient: string,
    audio_permission: AUDIO_PERMISSION,
  ) => {
    await sendInvite({
      recipient,
      audio_permission,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    reset();
  };

  const handleCopy = async () => {
    try {
      const currentURL = window.location.href;
      await navigator.clipboard.writeText(currentURL);
      showToast(t(tMessages.shareHistoryMeeting.success()), "success");
    } catch {
      showToast(t(tMessages.shareHistoryMeeting.somethingWentWrong()), "error");
    }
  };

  const canShareMeeting = () => {
    return users.some(
      (u) => u.user_id === currentUser.id && u.audio_permission === "owner",
    );
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50">
          <motion.div
            className="relative flex w-full max-w-5xl justify-center bg-background"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={popupVariants}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="w-full rounded-t-lg bg-primary text-sm font-semibold text-white">
              <div className="flex items-center justify-between border-b border-primary-foreground px-6 py-3">
                <h2>{t(tMessages.shareHistoryMeeting.shareThisProject())}</h2>

                <div className="flex items-center gap-4">
                  <IconButton
                    className="flex items-center gap-2 text-sky-300 hover:brightness-125"
                    onClick={handleCopy}
                  >
                    <ShareLinkIcon />
                    {t(tMessages.shareHistoryMeeting.copyLink())}
                  </IconButton>

                  <IconButton onClick={onClose}>
                    <CloseIcon className="size-6 text-primary-foreground hover:text-white" />
                  </IconButton>
                </div>
              </div>

              <div className="space-y-4 px-6 py-4">
                {canShareMeeting() && (
                  <form
                    onSubmit={onSubmit}
                    className="flex items-center gap-2 text-xs"
                  >
                    <div className="flex w-full gap-2 rounded-md border border-primary-foreground bg-transparent">
                      <Input
                        type="email"
                        placeholder="Enter email"
                        {...register("email", {
                          required: "Email is required.",
                          pattern: {
                            value: /\S+@\S+\.\S+/,
                            message: "Invalid email format.",
                          },
                        })}
                        autoComplete="off"
                        className="h-full w-full bg-transparent px-3 py-3 text-white focus-visible:ring-transparent"
                      />
                      {/* <select
                      {...register("role")}
                      className="mr-2 bg-transparent py-3 text-sm focus:outline-none"
                    >
                      {Object.values(AUDIO_PERMISSION).map((permission) => (
                        <option
                          key={permission}
                          disabled={permission === AUDIO_PERMISSION.OWNER}
                          value={permission}
                        >
                          {getTextPermission(permission)}
                        </option>
                      ))}
                    </select> */}

                      <Controller
                        name="role"
                        control={control}
                        defaultValue={AUDIO_PERMISSION.VIEWER}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="h-full w-40 border-none py-3 focus-visible:ring-transparent">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="mr-2 border-primary-foreground bg-gray-700 py-3">
                              {Object.values(AUDIO_PERMISSION).map(
                                (permission) => (
                                  <SelectItem
                                    key={permission}
                                    disabled={
                                      permission === AUDIO_PERMISSION.OWNER
                                    }
                                    value={permission}
                                  >
                                    {getTextPermission(permission)}
                                  </SelectItem>
                                ),
                              )}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting || !isValid}
                      className="rounded bg-primary px-3 py-3 text-xs text-foreground text-white hover:bg-primary-foreground"
                    >
                      {t(tMessages.shareHistoryMeeting.sendInvite())}
                    </Button>
                  </form>
                )}

                {/* Todo: implement favorites users later */}
                {/* <div className="flex items-center gap-2 text-xs">
                  {favorites.map(({ name }, idx) => (
                    <IconButton
                      key={idx}
                      className="flex gap-2 rounded bg-primary px-2 py-1 text-white hover:bg-primary-foreground"
                    >
                      <PlusIcon className="size-4" />
                      {name}
                    </IconButton>
                  ))}
                </div> */}

                <p className="text-primary-foreground">
                  {t(tMessages.shareHistoryMeeting.whoHasAccess())}
                </p>

                <div className="max-h-96 space-y-4 overflow-auto text-xs">
                  {users.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between"
                    >
                      <div className="flex w-full items-center">
                        {/* Avatar */}
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 uppercase text-white">
                          {item.user_profile.email[0]}
                        </div>

                        {/* User Details */}
                        <div className="ml-3">
                          <p>
                            {item.user_profile.email}
                            {item.user_profile.email === currentUser.email && (
                              <span className="text-sm font-semibold">
                                {` (${t(tMessages.shareHistoryMeeting.you())})`}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <Select
                        value={item.audio_permission}
                        onValueChange={(value) =>
                          item.audio_permission !== AUDIO_PERMISSION.OWNER &&
                          onUpdatePermission(
                            item.user_profile.email,
                            value as AUDIO_PERMISSION,
                          )
                        }
                        disabled={
                          item.audio_permission === AUDIO_PERMISSION.OWNER ||
                          !canShareMeeting()
                        }
                      >
                        <SelectTrigger className="w-50 border-none py-3 focus-visible:ring-transparent">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent
                          className={`mr-2 border-primary-foreground bg-gray-700 py-3`}
                        >
                          {Object.values(AUDIO_PERMISSION).map((permission) => (
                            <SelectItem
                              key={permission}
                              disabled={permission === AUDIO_PERMISSION.OWNER}
                              value={permission}
                            >
                              {getTextPermission(permission)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ToggleSharePopup;
