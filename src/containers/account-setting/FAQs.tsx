import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Container,
  Header,
  HorizontalTransition,
  IconButton,
  Input,
} from "@/components";
import { CircleLeftArrowIcon } from "@/components/icons";
import { useCurrentUser } from "@/hooks";
import { tMessages } from "@/locales/messages";
import { RootState } from "@/main";
import { cloneDeep } from "lodash";
import { ReactNode, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

type Category = {
  name: string;
  value: string | null;
  color: string;
  icon: string;
};

type FAQ = {
  category: string;
  title: string;
  content: ReactNode;
};

const CATEGORY_VALUE = {
  all: "all",
  account: "account",
  data: "data",
  usage: "usage",
  other: "other",
  pricing: "pricing",
  support: "support",
  system: "system",
};

const convertEmailToMailto = (text: string) => {
  const emailPattern = /([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})/g;

  // Replace email with a mailto link
  return text.replace(emailPattern, (email) => {
    return `<a href="mailto:${email}">${email}</a>`;
  });
};

const FAQs = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setting } = useCurrentUser();

  // prettier-ignore
  const [categories] = useState<Category[]>([
    { name: t(tMessages.faqs.categories.all()), value: null, color: "", icon: "🌐" },
    { name: t(tMessages.faqs.categories.usage()), value: "usage", color: "#4a8e8d", icon: "📝" },
    { name: t(tMessages.faqs.categories.account()), value: "account", color: "#8d8d4a", icon: "👤" },
    { name: t(tMessages.faqs.categories.system()), value: "system", color: "#c8dc71", icon: "💻" },
    { name: t(tMessages.faqs.categories.support()), value: "support", color: "#4a4a8d", icon: "🛠️" },
    { name: t(tMessages.faqs.categories.data()), value: "data", color: "#4a8d4a", icon: "📊"},
    { name: t(tMessages.faqs.categories.pricing()), value: "pricing", color: "#8d4a4a", icon: "💲" },
    { name: t(tMessages.faqs.categories.other()), value: "other", color: "#8d4a8d", icon: "🔍" }
  ]);
  // prettier-ignore
  const [faqs] = useState<FAQ[]>([
    // Usage
    { category: CATEGORY_VALUE.usage, title: t(tMessages.faqs.usage.faq1.title()), content: (<span>{t(tMessages.faqs.usage.faq1.desc())}</span>) },
    { category: CATEGORY_VALUE.usage, title: t(tMessages.faqs.usage.faq2.title()), content: (<span>{t(tMessages.faqs.usage.faq2.desc())}</span>) },
    { category: CATEGORY_VALUE.usage, title: t(tMessages.faqs.usage.faq3.title()), content: (<span>{t(tMessages.faqs.usage.faq3.desc())}</span>) },
    { category: CATEGORY_VALUE.usage, title: t(tMessages.faqs.usage.faq4.title()), content: (<span>{t(tMessages.faqs.usage.faq4.desc())}</span>) },
    { category: CATEGORY_VALUE.usage, title: t(tMessages.faqs.usage.faq5.title()), content: (<span>{t(tMessages.faqs.usage.faq5.desc())}</span>) },
    { category: CATEGORY_VALUE.usage, title: t(tMessages.faqs.usage.faq6.title()), content: (<span>{t(tMessages.faqs.usage.faq6.desc())}</span>) },
    { category: CATEGORY_VALUE.usage, title: t(tMessages.faqs.usage.faq7.title()), content: (<span>{t(tMessages.faqs.usage.faq7.desc())}</span>) },
    { category: CATEGORY_VALUE.usage, title: t(tMessages.faqs.usage.faq8.title()), content: (<span>{t(tMessages.faqs.usage.faq8.desc())}</span>) },
    { category: CATEGORY_VALUE.usage, title: t(tMessages.faqs.usage.faq9.title()), content: (<span>{t(tMessages.faqs.usage.faq9.desc())}</span>) },
    { category: CATEGORY_VALUE.usage, title: t(tMessages.faqs.usage.faq10.title()), content: (<span>{t(tMessages.faqs.usage.faq10.desc())}</span>) },
    { category: CATEGORY_VALUE.usage, title: t(tMessages.faqs.usage.faq11.title()), content: (<span>{t(tMessages.faqs.usage.faq11.desc())}</span>) },
    { category: CATEGORY_VALUE.usage, title: t(tMessages.faqs.usage.faq12.title()), content: (<span>{t(tMessages.faqs.usage.faq12.desc())}</span>) },
    { category: CATEGORY_VALUE.usage, title: t(tMessages.faqs.usage.faq13.title()), content: (<span>{t(tMessages.faqs.usage.faq13.desc())}</span>) },
    { category: CATEGORY_VALUE.usage, title: t(tMessages.faqs.usage.faq14.title()), content: (<span>{t(tMessages.faqs.usage.faq14.desc())}</span>) },
    { category: CATEGORY_VALUE.usage, title: t(tMessages.faqs.usage.faq15.title()), content: (<span>{t(tMessages.faqs.usage.faq15.desc())}</span>) },
  
    // Account
    { category: CATEGORY_VALUE.account, title: t(tMessages.faqs.account.faq1.title()), content: (<span dangerouslySetInnerHTML={{ __html: convertEmailToMailto(t(tMessages.faqs.account.faq1.desc())) }}></span>) },
    { category: CATEGORY_VALUE.account, title: t(tMessages.faqs.account.faq2.title()), content: (<span>{t(tMessages.faqs.account.faq2.desc())}</span>) },
    { category: CATEGORY_VALUE.account, title: t(tMessages.faqs.account.faq1.title()), content: (<span dangerouslySetInnerHTML={{ __html: convertEmailToMailto(t(tMessages.faqs.account.faq3.desc())) }}></span>) },
    { category: CATEGORY_VALUE.account, title: t(tMessages.faqs.account.faq4.title()), content: (<span>{t(tMessages.faqs.account.faq4.desc())}</span>) },
    { category: CATEGORY_VALUE.account, title: t(tMessages.faqs.account.faq5.title()), content: (<span>{t(tMessages.faqs.account.faq5.desc())}</span>) },
    
    // System
    { category: CATEGORY_VALUE.system, title: t(tMessages.faqs.system.faq1.title()), content: (<span>{t(tMessages.faqs.system.faq1.desc())}</span>) },
    { category: CATEGORY_VALUE.system, title: t(tMessages.faqs.system.faq2.title()), content: (<span>{t(tMessages.faqs.system.faq2.desc())}</span>) },
    { category: CATEGORY_VALUE.system, title: t(tMessages.faqs.system.faq3.title()), content: (<span>{t(tMessages.faqs.system.faq3.desc())}</span>) },
    { category: CATEGORY_VALUE.system, title: t(tMessages.faqs.system.faq4.title()), content: (<span>{t(tMessages.faqs.system.faq4.desc())}</span>) },
    { category: CATEGORY_VALUE.system, title: t(tMessages.faqs.system.faq5.title()), content: (<span>{t(tMessages.faqs.system.faq5.desc())}</span>) },
    { category: CATEGORY_VALUE.system, title: t(tMessages.faqs.system.faq6.title()), content: (<span>{t(tMessages.faqs.system.faq6.desc())}</span>) },
    { category: CATEGORY_VALUE.system, title: t(tMessages.faqs.system.faq7.title()), content: (<span>{t(tMessages.faqs.system.faq7.desc())}</span>) },
    { category: CATEGORY_VALUE.system, title: t(tMessages.faqs.system.faq8.title()), content: (<span>{t(tMessages.faqs.system.faq8.desc())}</span>) },
    { category: CATEGORY_VALUE.system, title: t(tMessages.faqs.system.faq9.title()), content: (<span>{t(tMessages.faqs.system.faq9.desc())}</span>) },
    { category: CATEGORY_VALUE.system, title: t(tMessages.faqs.system.faq10.title()), content: (<span>{t(tMessages.faqs.system.faq10.desc())}</span>) },
    { category: CATEGORY_VALUE.system, title: t(tMessages.faqs.system.faq11.title()), content: (<span dangerouslySetInnerHTML={{ __html: convertEmailToMailto(t(tMessages.faqs.system.faq11.desc())) }}></span>) },
    { category: CATEGORY_VALUE.system, title: t(tMessages.faqs.system.faq12.title()), content: (<span>{t(tMessages.faqs.system.faq12.desc())}</span>) },
    { category: CATEGORY_VALUE.system, title: t(tMessages.faqs.system.faq13.title()), content: (<span>{t(tMessages.faqs.system.faq13.desc())}</span>) },
    { category: CATEGORY_VALUE.system, title: t(tMessages.faqs.system.faq14.title()), content: (<span>{t(tMessages.faqs.system.faq14.desc())}</span>) },
    { category: CATEGORY_VALUE.system, title: t(tMessages.faqs.system.faq15.title()), content: (<span>{t(tMessages.faqs.system.faq15.desc())}</span>) },
    { category: CATEGORY_VALUE.system, title: t(tMessages.faqs.system.faq16.title()), content: (<span>{t(tMessages.faqs.system.faq16.desc())}</span>) },
    { category: CATEGORY_VALUE.system, title: t(tMessages.faqs.system.faq17.title()), content: (<span>{t(tMessages.faqs.system.faq17.desc())}</span>) },

    // Support
    { category: CATEGORY_VALUE.support, title: t(tMessages.faqs.support.faq1.title()), content: (<span dangerouslySetInnerHTML={{ __html: convertEmailToMailto(t(tMessages.faqs.support.faq1.desc())) }}></span>) },
    { category: CATEGORY_VALUE.support, title: t(tMessages.faqs.support.faq2.title()), content: (<span dangerouslySetInnerHTML={{ __html: convertEmailToMailto(t(tMessages.faqs.support.faq2.desc())) }}></span>) },
    { category: CATEGORY_VALUE.support, title: t(tMessages.faqs.support.faq3.title()), content: (<span>{t(tMessages.faqs.support.faq3.desc())}</span>) },
    { category: CATEGORY_VALUE.support, title: t(tMessages.faqs.support.faq4.title()), content: (<span dangerouslySetInnerHTML={{ __html: convertEmailToMailto(t(tMessages.faqs.support.faq4.desc())) }}></span>) },
    
    // Data
    { category: CATEGORY_VALUE.data, title: t(tMessages.faqs.data.faq1.title()), content: (<span>{t(tMessages.faqs.data.faq1.desc())}</span>) },
    { category: CATEGORY_VALUE.data, title: t(tMessages.faqs.data.faq2.title()), content: (<span>{t(tMessages.faqs.data.faq2.desc())}</span>) },
    { category: CATEGORY_VALUE.data, title: t(tMessages.faqs.data.faq3.title()), content: (<span>{t(tMessages.faqs.data.faq3.desc())}</span>) },
    { category: CATEGORY_VALUE.data, title: t(tMessages.faqs.data.faq4.title()), content: (<span>{t(tMessages.faqs.data.faq4.desc())}</span>) },
    { category: CATEGORY_VALUE.data, title: t(tMessages.faqs.data.faq5.title()), content: (<span>{t(tMessages.faqs.data.faq5.desc())}</span>) },
    { category: CATEGORY_VALUE.data, title: t(tMessages.faqs.data.faq6.title()), content: (<span>{t(tMessages.faqs.data.faq6.desc())}</span>) },

    // Pricing
    { category: CATEGORY_VALUE.pricing, title: t(tMessages.faqs.pricing.faq1.title()), content: (<span dangerouslySetInnerHTML={{ __html: convertEmailToMailto(t(tMessages.faqs.pricing.faq1.desc())) }}></span>) },
    { category: CATEGORY_VALUE.pricing, title: t(tMessages.faqs.pricing.faq2.title()), content: (<span>{t(tMessages.faqs.pricing.faq2.desc())}</span>) },
    { category: CATEGORY_VALUE.pricing, title: t(tMessages.faqs.pricing.faq3.title()), content: (<span dangerouslySetInnerHTML={{ __html: convertEmailToMailto(t(tMessages.faqs.pricing.faq3.desc())) }}></span>) },
    { category: CATEGORY_VALUE.pricing, title: t(tMessages.faqs.pricing.faq4.title()), content: (<span>{t(tMessages.faqs.pricing.faq4.desc())}</span>) },
    { category: CATEGORY_VALUE.pricing, title: t(tMessages.faqs.pricing.faq5.title()), content: (<span>{t(tMessages.faqs.pricing.faq5.desc())}</span>) },

    // Other
    { category: CATEGORY_VALUE.other, title: t(tMessages.faqs.other.faq1.title()), content: (<span>{t(tMessages.faqs.other.faq1.desc())}</span>) },
    { category: CATEGORY_VALUE.other, title: t(tMessages.faqs.other.faq2.title()), content: (<span dangerouslySetInnerHTML={{ __html: convertEmailToMailto(t(tMessages.faqs.other.faq2.desc())) }}></span>) },
    { category: CATEGORY_VALUE.other, title: t(tMessages.faqs.other.faq3.title()), content: (<span dangerouslySetInnerHTML={{ __html: convertEmailToMailto(t(tMessages.faqs.other.faq3.desc())) }}></span>) },
    { category: CATEGORY_VALUE.other, title: t(tMessages.faqs.other.faq4.title()), content: (<span dangerouslySetInnerHTML={{ __html: convertEmailToMailto(t(tMessages.faqs.other.faq4.desc())) }}></span>) },
    { category: CATEGORY_VALUE.other, title: t(tMessages.faqs.other.faq5.title()), content: (<span>{t(tMessages.faqs.other.faq5.desc())}</span>) },
  ]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const profileSettingLastLocation = useSelector(
    (state: RootState) => state.ui.profileSettingLastLocation,
  );

  const categoryLookup = categories.reduce(
    (acc, category) => {
      acc[category.value || "all"] = {
        name: category.name,
        color: category.color,
      };

      return acc;
    },
    {} as Record<string, { name: string; color: string }>,
  );
  const getNameTag = (value: string | null) =>
    categoryLookup[value || "all"]?.name;
  const getColorTag = (value: string | null) =>
    categoryLookup[value || "all"]?.color;

  useEffect(() => {
    const element: any = document.querySelector("elevenlabs-convai");

    if (element && element.shadowRoot && setting.language === 'ja-JP') {
      element.style.display = "block";
    }

    return () => {
      element.style.display = "none";
    };
  }, [setting]);

  const filteredFAQs = faqs.filter((f) => {
    const matchesCategory = selectedCategory
      ? f.category === selectedCategory
      : true;

    const matchesSearch = f.title
      .toLowerCase()
      .includes(searchQuery.trim().toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const generateItemKey = (index: number) => {
    return `item_${selectedCategory ?? "all"}_${index + 1}`;
  };

  const goBack = () => {
    if (profileSettingLastLocation) {
      navigate(
        `${profileSettingLastLocation.pathname}${profileSettingLastLocation.search}`,
        {
          state: cloneDeep(profileSettingLastLocation.state),
        },
      );
    } else {
      navigate("/conversation");
    }
  };

  const leftHeader = (
    <IconButton className="z-10" onClick={goBack}>
      <CircleLeftArrowIcon className="size-8 transition duration-200 hover:scale-[1.2]" />
    </IconButton>
  );

  return (
    <HorizontalTransition className="overflow-auto">
      <Header leftItem={leftHeader} />

      <Container className="align-center flex-col">
        {/* Search box */}
        <div className="my-4 flex justify-center">
          <Input
            className="w-full border border-white md:w-3/5 lg:w-1/2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t(tMessages.common.search())}
          />
        </div>

        {/* Category buttons */}
        <div className="mt-3 flex flex-wrap gap-3 md:justify-center">
          {categories.map((category, index) => (
            <Button
              key={index + 1}
              onClick={() => setSelectedCategory(category.value)}
              className={`rounded px-4 py-2 text-sm ${
                selectedCategory === category.value ? "bg-[#797979]" : ""
              } transition duration-200`}
            >
              <span>{category.icon}</span>
              <span className="px-2">{category.name}</span>
            </Button>
          ))}
        </div>

        {/* FAQ */}
        <Accordion type="single" collapsible className="mt-3 w-full">
          {filteredFAQs.map((item: FAQ, index: number) => (
            <AccordionItem
              key={generateItemKey(index)}
              value={generateItemKey(index)}
              className="my-2 rounded border-none bg-[#303030] px-2"
            >
              <AccordionTrigger className="text-white/90 hover:no-underline">
                <div className="-mr-4 flex w-full items-center justify-between font-semibold">
                  <span className="mr-2 text-left">{item.title}</span>
                  <span
                    className={`z-10 self-center whitespace-nowrap rounded px-2 py-1 text-xs text-white`}
                    style={{ backgroundColor: getColorTag(item.category) }}
                  >
                    {getNameTag(item.category)}
                  </span>
                </div>
              </AccordionTrigger>

              <AccordionContent className="pr-2 text-justify text-white/70">
                {item.content}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Container>
    </HorizontalTransition>
  );
};

export default FAQs;
