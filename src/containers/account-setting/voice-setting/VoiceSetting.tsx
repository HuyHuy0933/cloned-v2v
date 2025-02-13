import { Button } from '@/components';
import React, { useEffect, useState } from 'react';
import STTSetting from './STTSetting';
import AISetting from './AISetting';
import TTSSetting from './TTSSetting';
import { useTranslation } from 'react-i18next';
import { tMessages } from '@/locales/messages';
import TabSetting, { TabSettingGroup } from './TabSetting';

const VoiceSetting = () => {
  const { t } = useTranslation();
  const [selectedGroup, setSelectedGroup] = useState<TabSettingGroup>(TabSettingGroup.STT);
  
  const handleTabSelect = (group: TabSettingGroup) => {
    setSelectedGroup(group);
  };

  const sttText = t(tMessages.common.sttSettingTab());
  const aiText = t(tMessages.common.aiSettingTab());
  const ttsText = t(tMessages.common.ttsSettingTab());

  let content = <></>;  
  if (selectedGroup == TabSettingGroup.STT) {
    content = <STTSetting />;    
  }
  if (selectedGroup == TabSettingGroup.AI) {
    content = <AISetting />;    
  }
  if (selectedGroup == TabSettingGroup.TTS) {
    content = <TTSSetting />;    
  }

  const tabs = 
    <div className="flex justify-evently bg-[#1a1A1A]">
      <TabSetting 
        selectedGroup={selectedGroup}
        currentGroup={TabSettingGroup.STT}
        handleTabSelect={handleTabSelect}
        tabText={`🎙️ ${sttText}`}
      />
      <TabSetting 
        selectedGroup={selectedGroup}
        currentGroup={TabSettingGroup.AI}
        handleTabSelect={handleTabSelect}
        tabText={`🤖 ${aiText}`}
      />
      <TabSetting 
        selectedGroup={selectedGroup}
        currentGroup={TabSettingGroup.TTS}
        handleTabSelect={handleTabSelect}
        tabText={`🔊 ${ttsText}`}
      />
    </div>

  return (
    <div className="flex flex-col p-3 bg-primary rounded-2xl gap-4">      
      {/* Group voice setting tabs */}
      {tabs}
            
      {/* Voice Setting by Group */}
      {content}
    </div>
  );
};

export default VoiceSetting;
