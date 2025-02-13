import React from 'react';
import { Button } from '@/components';
import { CustomStyles } from '@/lib/styles';

export enum TabSettingGroup {
  STT = "stt",
  AI = "ai",
  TTS = "tts",
}

type TabSettingProps = {
  selectedGroup: TabSettingGroup;
  currentGroup: TabSettingGroup;
  handleTabSelect: (group: TabSettingGroup) => void;
  tabText: string;
}

const TabSetting: React.FC<TabSettingProps> = ({
  selectedGroup,
  currentGroup,
  handleTabSelect,
  tabText,
}) => {
  return (
    <Button
      className={`flex-grow ${CustomStyles.tabItem} 
                  ${selectedGroup === currentGroup ? CustomStyles.tabItemActive : ""}
                  px-[4px] py-[8px] md:py-[10px]
                `}
      onClick={() => handleTabSelect(currentGroup)}
    >
      <span className="text-white text-xs md:text-sm text-wrap">{tabText}</span>
    </Button>
  );
};

export default TabSetting;
