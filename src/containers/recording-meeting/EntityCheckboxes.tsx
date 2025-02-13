import {
  Checkbox,
  Label,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components";
import { QuestionMarkIcon } from "@/components/icons";
import React, { useState, useCallback, ReactNode } from "react";

export type TreeNodeEntity = {
  id: string;
  label: string;
  title?: string;
  desc?: string;
  example?: string;
  color?: string;
  activeColor?: string;
  checked?: boolean;
  icon?: ReactNode;
  children: TreeNodeEntity[];
};

type EntityCheckboxesProps = {
  data: TreeNodeEntity[];
  onChange?: (checkedState: TreeNodeEntity[]) => void;
};

const EntityCheckboxes: React.FC<EntityCheckboxesProps> = ({
  data,
  onChange,
}) => {
  const [expandedState, setExpandedState] = useState<Record<string, boolean>>(
    {},
  );

  const updateTree = (
    nodes: TreeNodeEntity[],
    id: string,
    isChecked: boolean,
  ): TreeNodeEntity[] => {
    // Recursive helper to update children
    const updateChildren = (
      children: TreeNodeEntity[],
      isChecked: boolean,
    ): TreeNodeEntity[] => {
      if (children.length === 0) return [];

      return children.map((child) => ({
        ...child,
        checked: isChecked,
        children: updateChildren(child.children, isChecked),
      }));
    };

    // Recursive helper to calculate parent state
    const updateParentState = (
      nodes: TreeNodeEntity[],
    ): boolean | undefined => {
      const allChecked = nodes.every((node) => node.checked === true);
      const someChecked = nodes.some((node) => node.checked === true);

      return allChecked ? true : someChecked ? true : false; // Parent is true if any sibling is true
    };

    // Recursive main function to update the tree
    return nodes.map((node) => {
      if (node.id === id) {
        // Update current node and its children
        const updatedChildren = updateChildren(node.children, isChecked);
        return {
          ...node,
          checked: isChecked,
          children: updatedChildren,
        };
      }

      // Recursively process children and update parent state
      const updatedChildren = node.children
        ? updateTree(node.children, id, isChecked)
        : node.children;

      return {
        ...node,
        checked:
          updatedChildren.length > 0
            ? updateParentState(updatedChildren)
            : node.checked,
        children: updatedChildren,
      };
    });
  };

  const handleToggle = useCallback(
    (id: string, isChecked: boolean) => {
      const updatedData = updateTree(data, id, isChecked);
      onChange?.(updatedData);
    },
    [data, onChange, updateTree],
  );

  const handleExpandToggle = useCallback((id: string) => {
    setExpandedState((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  }, []);

  const renderTree = useCallback(
    (nodes: TreeNodeEntity[]) => {
      const sortedNodes = Array.from(nodes).sort((a, b) => {
        const aLength = a.children?.length || 0;
        const bLength = b.children?.length || 0;
        return bLength - aLength;
      });
      return sortedNodes.map((node) => {
        const nodeBgColor =
          (node.children && node.children.length > 0
            ? node.activeColor
            : node.color) || "transparent";
        return (
          <div key={node.id} className="space-y-2">
            <div className="flex items-center">
              {node.children && node.children.length > 0 ? (
                <button
                  onClick={() => handleExpandToggle(node.id)}
                  className="mr-2 w-5 text-center text-xs"
                >
                  {expandedState[node.id] ? "-" : "+"}
                </button>
              ) : (
                <span className="mr-2 w-5 text-center text-xs">-</span>
              )}
              <Checkbox
                id={node.id}
                checked={node.checked}
                onCheckedChange={(checked) => {
                  if (checked === "indeterminate") {
                    return;
                  }
                  handleToggle(node.id, checked);
                }}
                className="mr-2 border-black data-[state=checked]:text-black"
              />

              {node.icon && <span className="mr-2 text-base">{node.icon}</span>}
              <Label
                className="rounded-sm px-1 text-base"
                htmlFor={node.id}
                style={{
                  color: nodeBgColor === "transparent" ? "black" : "white",
                  backgroundColor: nodeBgColor,
                }}
              >
                {node.title || node.label}{" "}
                {node.children &&
                  node.children.length > 0 &&
                  `(${node.children.length})`}
              </Label>

              {node.desc && (
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <QuestionMarkIcon className="ml-3 size-5 transition duration-200 hover:scale-[1.2]" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="space-y-2 bg-modal text-sm text-white">
                      <p>{node.desc}</p>
                      <p>{node.example}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            {node.children.length > 0 && expandedState[node.id] && (
              <div className="ml-2 space-y-2 border-l border-gray-300">
                {renderTree(node.children)}
              </div>
            )}
          </div>
        );
      });
    },
    [expandedState, handleExpandToggle, handleToggle],
  );

  return <div className="my-2 h-full space-y-2">{renderTree(data)}</div>;
};

export default React.memo(EntityCheckboxes);
