import React from 'react';
import { UsageTooltipModal } from './UsageTooltipModal';
import { useTranslation } from "react-i18next";
import { tMessages } from "@/locales/messages";

const UsageSeparator = () => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col px-2 mt-2 gap-2">
        <div className="flex justify-between items-center">
            <p><strong>{t(tMessages.common.usageTitle())}</strong></p>
            <UsageTooltipModal />
        </div>
        <div className="w-full h-[1px] bg-gray-500"></div>
        </div>
    );
}

export default UsageSeparator;
