import { TreeNodeEntity } from "@/containers/recording-meeting/EntityCheckboxes";
import { ENTITY_LABEL_ENUM } from "@/features/recording-meeting/types";
import { tMessages } from "@/locales/messages";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const useDefaultEntitiesState = (): [
  TreeNodeEntity[],
  React.Dispatch<React.SetStateAction<TreeNodeEntity[]>>,
] => {
  const { t } = useTranslation();
  const [entityTree, setEntityTree] = useState<TreeNodeEntity[]>([
    {
      id: ENTITY_LABEL_ENUM.PERSON,
      label: ENTITY_LABEL_ENUM.PERSON,
      title: t(tMessages.entityLabel.person.title()),
      desc: t(tMessages.entityLabel.person.desc()),
      example: t(tMessages.entityLabel.person.example()),
      color: "#66C166",
      activeColor: "#4CAF50",
      checked: false,
      icon: "👤",
      children: [],
    },
    {
      id: ENTITY_LABEL_ENUM.NORP,
      label: ENTITY_LABEL_ENUM.NORP,
      title: t(tMessages.entityLabel.norp.title()),
      desc: t(tMessages.entityLabel.norp.desc()),
      example: t(tMessages.entityLabel.norp.example()),
      color: "#E76AA5",
      activeColor: "#C2185B",
      checked: false,
      icon: "🌍",
      children: [],
    },
    {
      id: ENTITY_LABEL_ENUM.ORG,
      label: ENTITY_LABEL_ENUM.ORG,
      title: t(tMessages.entityLabel.org.title()),
      desc: t(tMessages.entityLabel.org.desc()),
      example: t(tMessages.entityLabel.org.example()),
      color: "#3FA9F5",
      activeColor: "#0288D1",
      checked: false,
      icon: "🏢",
      children: [],
    },
    {
      id: ENTITY_LABEL_ENUM.GPE,
      label: ENTITY_LABEL_ENUM.GPE,
      title: t(tMessages.entityLabel.gpe.title()),
      desc: t(tMessages.entityLabel.gpe.desc()),
      example: t(tMessages.entityLabel.gpe.example()),
      color: "#FFA62B",
      activeColor: "#FF6F00",
      checked: false,
      icon: "🗺️",
      children: [],
    },
    {
      id: ENTITY_LABEL_ENUM.LOC,
      label: ENTITY_LABEL_ENUM.LOC,
      title: t(tMessages.entityLabel.loc.title()),
      desc: t(tMessages.entityLabel.loc.desc()),
      example: t(tMessages.entityLabel.loc.example()),
      color: "#FF7F50",
      activeColor: "#E65100",
      checked: false,
      icon: "⛰️",
      children: [],
    },
    {
      id: ENTITY_LABEL_ENUM.PRODUCT,
      label: ENTITY_LABEL_ENUM.PRODUCT,
      title: t(tMessages.entityLabel.product.title()),
      desc: t(tMessages.entityLabel.product.desc()),
      example: t(tMessages.entityLabel.product.example()),
      color: "#bbb",
      activeColor: "#757575",
      checked: false,
      icon: "📦",
      children: [],
    },
    {
      id: ENTITY_LABEL_ENUM.EVENT,
      label: ENTITY_LABEL_ENUM.EVENT,
      title: t(tMessages.entityLabel.event.title()),
      desc: t(tMessages.entityLabel.event.desc()),
      example: t(tMessages.entityLabel.event.example()),
      color: "#bbb",
      activeColor: "#546E7A",
      checked: false,
      icon: "🎉",
      children: [],
    },
    {
      id: ENTITY_LABEL_ENUM.WORK_OF_ART,
      label: ENTITY_LABEL_ENUM.WORK_OF_ART,
      title: t(tMessages.entityLabel.work_of_art.title()),
      desc: t(tMessages.entityLabel.work_of_art.desc()),
      example: t(tMessages.entityLabel.work_of_art.example()),
      color: "#bbb",
      activeColor: "#5C6BC0",
      checked: false,
      icon: "🎨",
      children: [],
    },
    {
      id: ENTITY_LABEL_ENUM.LANGUAGE,
      label: ENTITY_LABEL_ENUM.LANGUAGE,
      title: t(tMessages.entityLabel.language.title()),
      desc: t(tMessages.entityLabel.language.desc()),
      example: t(tMessages.entityLabel.language.example()),
      color: "#bbb",
      activeColor: "#7E57C2",
      checked: false,
      icon: "🗣️",
      children: [],
    },
    {
      id: ENTITY_LABEL_ENUM.DATE,
      label: ENTITY_LABEL_ENUM.DATE,
      title: t(tMessages.entityLabel.date.title()),
      desc: t(tMessages.entityLabel.date.desc()),
      example: t(tMessages.entityLabel.date.example()),
      color: "#bbb",
      activeColor: "#009688",
      checked: false,
      icon: "📅",
      children: [],
    },
    {
      id: ENTITY_LABEL_ENUM.TIME,
      label: ENTITY_LABEL_ENUM.TIME,
      title: t(tMessages.entityLabel.time.title()),
      desc: t(tMessages.entityLabel.time.desc()),
      example: t(tMessages.entityLabel.time.example()),
      color: "#bbb",
      activeColor: "#FF5722",
      checked: false,
      icon: "⏰",
      children: [],
    },
    {
      id: ENTITY_LABEL_ENUM.PERCENT,
      label: ENTITY_LABEL_ENUM.PERCENT,
      title: t(tMessages.entityLabel.percent.title()),
      desc: t(tMessages.entityLabel.percent.desc()),
      example: t(tMessages.entityLabel.percent.example()),
      color: "#bbb",
      activeColor: "#FFC107",
      checked: false,
      icon: "📊",
      children: [],
    },
    {
      id: ENTITY_LABEL_ENUM.MONEY,
      label: ENTITY_LABEL_ENUM.MONEY,
      title: t(tMessages.entityLabel.money.title()),
      desc: t(tMessages.entityLabel.money.desc()),
      example: t(tMessages.entityLabel.money.example()),
      color: "#bbb",
      activeColor: "#CDDC39",
      checked: false,
      icon: "💵",
      children: [],
    },
    {
      id: ENTITY_LABEL_ENUM.QUANTITY,
      label: ENTITY_LABEL_ENUM.QUANTITY,
      title: t(tMessages.entityLabel.quantity.title()),
      desc: t(tMessages.entityLabel.quantity.desc()),
      example: t(tMessages.entityLabel.quantity.example()),
      color: "#bbb",
      activeColor: "#8BC34A",
      checked: false,
      icon: "📏",
      children: [],
    },
    {
      id: ENTITY_LABEL_ENUM.ORDINAL,
      label: ENTITY_LABEL_ENUM.ORDINAL,
      title: t(tMessages.entityLabel.ordinal.title()),
      desc: t(tMessages.entityLabel.ordinal.desc()),
      example: t(tMessages.entityLabel.ordinal.example()),
      color: "#bbb",
      activeColor: "#FF9800",
      checked: false,
      icon: "🔢",
      children: [],
    },
    {
      id: ENTITY_LABEL_ENUM.CARDINAL,
      label: ENTITY_LABEL_ENUM.CARDINAL,
      title: t(tMessages.entityLabel.cardinal.title()),
      desc: t(tMessages.entityLabel.cardinal.desc()),
      example: t(tMessages.entityLabel.cardinal.example()),
      color: "#bbb",
      activeColor: "#9C27B0",
      checked: false,
      icon: "#️⃣",
      children: [],
    },
  ]);

  return [entityTree, setEntityTree];
};

export { useDefaultEntitiesState };
