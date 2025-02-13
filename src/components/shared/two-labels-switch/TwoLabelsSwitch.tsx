import { Switch } from "@/components/ui/switch";
import "./two-labels-switch.scss";

type TwoLabelsSwitchProps = {
  checked?: boolean;
  onCheckedChange?: (value: boolean) => void;
  leftLabel: string;
  rightLabel: string;
};

const TwoLabelsSwitch: React.FC<TwoLabelsSwitchProps> = ({
  checked,
  onCheckedChange,
  leftLabel,
  rightLabel,
}) => {
  return (
    <div className="two-labels-switch">
      <input
        checked={checked}
        onChange={(event) => onCheckedChange && onCheckedChange(event.target.checked)}
        type="checkbox"
        className="hidden"
        id="two-labels-input"
      />
      <span className={`label left`}>{leftLabel}</span>
      <label htmlFor="two-labels-input" className="slider">
        <span className="toggle">
          <span className="grip"></span>
        </span>
      </label>
      {/* <Switch checked={checked} onCheckedChange={onCheckedChange} /> */}

      <span className="label right">{rightLabel}</span>
    </div>
  );
};

export { TwoLabelsSwitch };
