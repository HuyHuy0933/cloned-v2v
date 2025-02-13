import { Button, OptionSelect } from "@/components";
import { ChevronSelectorVerticalIcon } from "@/components/icons";
import { OptionItem } from "@/features/settings/types";
import { tMessages } from "@/locales/messages";
import { SortAscIcon, SortDescIcon } from "lucide-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

type AudioSortProps = {
  sortBy: string;
  sortOrder: string;
  onSortByChange: (sortBy: string) => void;
  onSortOrderChange: (sortDirection: string) => void;
};

const AudioSort: React.FC<AudioSortProps> = React.memo(
  ({ sortBy, sortOrder, onSortByChange, onSortOrderChange }) => {
    const { t } = useTranslation();

    // value is the key of RecordedAudio
    const [sortByOptions] = useState<OptionItem[]>([
      {
        value: "startDateTime",
        title: t(tMessages.common.date()),
      },
      {
        value: "name",
        title: t(tMessages.common.title()),
      },
      {
        value: "duration",
        title: t(tMessages.common.duration()),
      },
    ]);

    const title = sortByOptions.find((x) => x.value === sortBy)?.title;

    return (
      <div className="flex items-center">
        <OptionSelect
          value={sortBy}
          onChange={onSortByChange}
          options={sortByOptions}
          trigger={
            <Button className="h-9 rounded-none rounded-bl rounded-tl px-4 py-2 text-sm transition duration-200">
              <span>{typeof title === "function" ? t(title()) : title}</span>
              <ChevronSelectorVerticalIcon className="ml-2" />
            </Button>
          }
        />

        <Button
          className="h-9 rounded-none rounded-br rounded-tr border-l border-primary-foreground px-4 py-2 text-sm transition duration-200"
          onClick={() => {
            onSortOrderChange(sortOrder === "asc" ? "desc" : "asc");
          }}
        >
          {sortOrder === "asc" ? (
            <SortAscIcon className="size-4" />
          ) : (
            <SortDescIcon className="size-4" />
          )}
        </Button>
      </div>
    );
  },
);

export default AudioSort;
