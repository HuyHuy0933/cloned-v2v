import { motion, AnimatePresence } from "motion/react";
import { useRef, useState, useEffect } from "react";
import { Input } from "@/components";
import { Cross2Icon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useTranslation } from "react-i18next";
import { tMessages } from "@/locales/messages";

type SearchComponentProps = {
  query: string;
  onSearchChange: (query: string) => void;
};

const SearchComponent: React.FC<SearchComponentProps> = ({
  query,
  onSearchChange,
}) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState(query);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchBarRef, onSearchChange]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearchChange(value);
  };

  const clearSearch = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchTerm("");
    onSearchChange("");
    if (searchInputRef.current) searchInputRef.current.focus();
  };

  return (
    <div className="relative flex items-center" ref={searchBarRef}>
      <motion.div
        className="flex items-center"
        initial={{ width: "40px" }}
        animate={{ width: isExpanded ? "280px" : "40px" }}
        transition={{ duration: 0.4, ease: "linear" }}
      >
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="relative flex-1"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "100%" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                className="h-8 pr-16 focus:border-none focus:outline-none"
                placeholder={`${t(tMessages.common.search())}…`}
                autoFocus
              />
              {searchTerm && (
                <button
                  className="absolute right-10 top-1/2 -translate-y-1/2 transform pl-5 text-gray-400 hover:text-black"
                  onClick={clearSearch}
                >
                  <Cross2Icon />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button
          className="absolute right-2 top-1/2 flex -translate-y-1/2 transform items-center justify-center"
          onClick={toggleExpand}
        >
          <MagnifyingGlassIcon className="h-6 w-6 transition duration-200 hover:scale-[1.2]" />
        </motion.button>
      </motion.div>
    </div>
  );
};

export default SearchComponent;
