import { IconButton, UserAvatar } from "@/components";
import { secondsToTimer } from "@/lib/utils";
import { createReactBlockSpec } from "@blocknote/react";
import { Menu } from "@mantine/core";
import {
  CheckIcon,
  Cross2Icon,
  PauseIcon,
  PlayIcon,
} from "@radix-ui/react-icons";
import { Trash2Icon } from "lucide-react";
import { useRef, useState } from "react";

export const AvatarBlock = createReactBlockSpec(
  {
    type: "avatar",
    propSchema: {
      selectedUser: {
        default: "",
      },
      otherUsersJson: {
        default: "",
      },
    },
    content: "none",
  },
  {
    render: (props) => {
      const { selectedUser, otherUsersJson } = props.block.props;

      const otherUsers: any[] = JSON.parse(otherUsersJson);

      return (
        <div className="w-full">
          {/* Dropdown Menu for selecting a different user */}
          <Menu withinPortal={false}>
            <Menu.Target>
              <div>
                <UserAvatar username={selectedUser} />
              </div>
            </Menu.Target>
            <Menu.Dropdown className="bg-modal">
              {otherUsers.map((user, index) => (
                <Menu.Item
                  className="w-full"
                  key={`${props.block.id}-${index}`}
                  onClick={() => {
                    props.editor.updateBlock(props.block, {
                      props: {
                        ...props.block.props,
                        selectedUser: user,
                      },
                    });
                  }}
                >
                  <div className="flex h-full w-full items-center justify-between gap-4">
                    {user}{" "}
                    {user === selectedUser && (
                      <CheckIcon className="size-4 text-success" />
                    )}
                  </div>
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
        </div>
      );
    },
  },
);

export const TimerBlock = createReactBlockSpec(
  {
    type: "timer",
    propSchema: {
      startTime: {
        default: "",
      },
      endTime: {
        default: "",
      },
      duration: {
        default: "",
      }
    },
    content: "none",
  },
  {
    render: (props: any) => {
      const startTime = Number(props.block.props.startTime);
      const endTime = Number(props.block.props.endTime);
      const duration = Number(props.block.props.duration);
      const playing = props.block.props.playing;

      const audioRef = useRef<HTMLAudioElement | null>(null);
      const [togglePlaying, setTogglePlaying] = useState(playing);

      const renderTimer = (seconds: number) => {
        let result = secondsToTimer(Math.round(seconds));

        if (Math.floor(duration / 3600) <= 0) {
          result = result.substring(3);
        }

        return result;
      };

      const onTogglePlayPause = () => {
        const newTogglePlaying = !togglePlaying;
        setTogglePlaying(newTogglePlaying);

        if (newTogglePlaying) {
          playAudio();
        } else {
          pauseAudio();
        }
      };

      const playAudio = () => {
        if (!audioRef.current) return;

        const audioPlayer = document.getElementById(
          "editor-audio-player",
        ) as HTMLAudioElement;
        if (!audioPlayer) return;
        
        console.log("Playing audio", audioPlayer.src, startTime);
        audioRef.current.src = audioPlayer.src;
        audioRef.current.currentTime = startTime;
        audioRef.current.play();

        const playButtons = document.querySelectorAll(".play-btn");
        if (playButtons.length > 0) {
          playButtons.forEach((button) => {
            if (button.id === props.block.id) return;
            button.setAttribute("disabled", "true");
          });
        }
      };

      const pauseAudio = () => {
        if (!audioRef.current) return;
        audioRef.current.pause();

        const playButtons = document.querySelectorAll(".play-btn");
        if (playButtons.length > 0) {
          playButtons.forEach((button) => {
            button.removeAttribute("disabled");
          });
        }
      };

      const onAudioTimeUpdate = () => {
        if (!audioRef.current) return;
        if (audioRef.current.currentTime >= endTime) {
          audioRef.current.pause();
          setTogglePlaying(false);

          const playButtons = document.querySelectorAll(".play-btn");
          if (playButtons.length > 0) {
            playButtons.forEach((button) => {
              button.removeAttribute("disabled");
            });
          }
        }
      };

      return (
        <div className="w-full space-y-2">
          <p className="w-full text-center">{renderTimer(startTime)}</p>
          <div className="flex w-full justify-center">
            <IconButton
              id={props.block.id}
              className="play-btn text-primary-foreground hover:text-white"
              onClick={onTogglePlayPause}
            >
              {togglePlaying ? (
                <PauseIcon className="size-5" />
              ) : (
                <PlayIcon className="size-5" />
              )}
            </IconButton>
          </div>

          <audio
            ref={audioRef}
            src=""
            className="hidden"
            onTimeUpdate={onAudioTimeUpdate}
            onError={pauseAudio}
          />
        </div>
      );
    },
  },
);

export const DeleteBlock = createReactBlockSpec(
  {
    type: "delete",
    propSchema: {
      rowId: {
        default: "",
      },
    },
    content: "none",
  },
  {
    render: (props: any) => {
      const { rowId } = props.block.props;
      const [openDelete, setOpenDelete] = useState(false);

      const onDelete = () => {
        setOpenDelete(true);
      };

      const onConfirmDelete = () => {
        const rowBlock = props.editor.document.find((x: any) => x.id === rowId);
        if (rowBlock) {
          console.log("Delete row", rowBlock);
          props.editor.removeBlocks([rowBlock]);
        }
      };

      const onCancel = () => {
        setOpenDelete(false);
      };

      return (
        <div className="w-full">
          {!openDelete ? (
            <IconButton
              className="float-right text-primary-foreground hover:text-white"
              onClick={onDelete}
            >
              <Trash2Icon className="size-5" />
            </IconButton>
          ) : (
            <div className="float-right flex flex-col gap-1 sm:flex-row">
              <IconButton
                className="text-primary-foreground hover:text-white"
                onClick={onCancel}
              >
                <Cross2Icon className="size-5" />
              </IconButton>
              <IconButton
                className="text-primary-foreground hover:text-white"
                onClick={onConfirmDelete}
              >
                <CheckIcon className="size-6" />
              </IconButton>
            </div>
          )}
        </div>
      );
    },
  },
);
