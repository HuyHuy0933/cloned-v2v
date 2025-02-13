import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";
import { Input } from "../ui/input";
import { CrossCircledIcon } from "@radix-ui/react-icons";

type TagsInputProps = {
  className?: string;
  values?: string[];
  onChange?: (values: string[]) => void;
  placeholder?: string;
  inputClassName?: string;
  maxLengthOfTags?: number;
};

const TagsInput: React.FC<TagsInputProps> = ({
  className,
  values = [],
  onChange,
  placeholder = "",
  inputClassName,
  maxLengthOfTags,
}) => {
  const [tags, setTags] = useState<string[]>(() => values || []);
  const inputRef = useRef<any>(null);

  useEffect(() => {    
    setTags(values || []);
  }, [values]);

  const addTag = (value: string) => {
    const newTags = Array.from(tags)
    newTags.push(value);
    setTags(newTags);
    if (onChange) {
      onChange(newTags);
    }

    inputRef.current.value = "";
  };

  const removeTag = (index: number) => {
    if (tags.length === 0) return;
    const newTags = Array.from(tags)
    newTags.splice(index, 1);
    setTags(newTags);   
    if (onChange) {
      onChange(newTags);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {   
    const key = event.key;
    const tagVal = inputRef.current.value;
    switch (key) {
      case "Enter": {
        event.preventDefault()
        if (tagVal && !tags.includes(tagVal)) {
          addTag(tagVal);
        }
        break;
      }
      case "Backspace": {
        if (!tagVal) {
          removeTag(tags.length - 1);
        }
        break;
      }
    }
  };

  return (
    <div
      className={cn(
        "over inline-block h-20 w-full overflow-y-auto overflow-x-hidden rounded-md border border-primary-foreground bg-transparent px-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        className,
      )}
      onClick={() => inputRef.current.focus()}
    >
      {/* tag items */}
      {tags.length > 0 &&
        tags.map((tag: string, index: number) => (
          <span
            key={`tag-${index}`}
            className="float-start mr-2 mt-2 flex h-7 items-center justify-center gap-2 rounded-lg bg-primary-foreground px-1 text-sm"
          >
            {tag}
            <CrossCircledIcon
              className="size-5 text-neutral-400 hover:text-white"
              onClick={() => removeTag(index)}
            />
          </span>
        ))}

      <Input
        className={cn(
          "float-start my-1 ml-2 w-[200px] max-w-full border-none bg-transparent p-0 focus-visible:ring-transparent",
          inputClassName,
        )}
        placeholder={placeholder}
        ref={inputRef}
        onKeyDown={handleKeyDown}  
        readOnly={maxLengthOfTags != null && maxLengthOfTags === tags.length}   
      />
    </div>
  );
};

export { TagsInput };
