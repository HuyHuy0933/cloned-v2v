import { Button, IconButton, Input, TagsInput } from "@/components";
import { setCustomEntities } from "@/features/settings/settingSlice";
import { CustomEntity } from "@/features/settings/types";
import { tMessages } from "@/locales/messages";
import { RootState } from "@/main";
import { CrossCircledIcon, TrashIcon } from "@radix-ui/react-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useDebouncedCallback } from "use-debounce";

const CustomEntityInputs = React.memo(() => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const customEntities = useSelector(
    (state: RootState) => state.setting.recorderMeeting.customEntities,
  );

  const onEntityChanged = useDebouncedCallback(
    (index: number, value: string | string[], key: keyof CustomEntity) => {
      const entities = [...customEntities];
      const newEntity: CustomEntity = { ...entities[index], [key]: value };
      entities.splice(index, 1, newEntity);
      dispatch(setCustomEntities(entities));
    },
    1000,
  );

  const onAddEntity = () => {
    dispatch(
      setCustomEntities([
        ...customEntities,
        {
          entity: "",
          values: [],
        },
      ]),
    );
  };

  const onRemoveEntity = (index: number) => {
    const entities = [...customEntities];
    entities.splice(index, 1);
    dispatch(setCustomEntities(entities));
  };

  return (
    <div className="w-full space-y-2">
      {customEntities.map((item, index) => (
        <div key={index} className="flex gap-2">
          <Input
            className="w-[140px] border border-primary-foreground focus:border-primary-foreground focus-visible:ring-0 placeholder:text-xs"
            placeholder={t(tMessages.common.enterEntityPlaceholder())}
            defaultValue={item.entity}
            onChange={(e) => onEntityChanged(index, e.target.value, "entity")}
          />
          <TagsInput
            className="h-auto grow"
            inputClassName="placeholder:text-xs"
            placeholder={t(tMessages.common.enterWordsPlayholder())}
            values={item.values}
            onChange={(values) => onEntityChanged(index, values, "values")}
          />

          <IconButton className="ml-2" onClick={() => onRemoveEntity(index)}>
            <CrossCircledIcon className="size-5 text-neutral-400 hover:text-white" />
          </IconButton>
        </div>
      ))}

      <Button className="text-sm" onClick={onAddEntity}>
        {t(tMessages.common.addEntity())}
      </Button>
    </div>
  );
});

export default CustomEntityInputs;
