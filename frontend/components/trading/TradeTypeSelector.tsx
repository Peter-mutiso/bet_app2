"use client";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

const CONTRACTS = [
  {
    title: "Rise / Fall",
    items: ["RISE", "FALL"],
  },
  {
    title: "Digits",
    items: [
      "EVEN",
      "ODD",
      "DIGIT_OVER",
      "DIGIT_UNDER",
      "DIGIT_MATCH",
      "DIGIT_DIFFERS",
    ],
  },
];

export default function TradeTypeSelector({
  value,
  onChange,
}: Props) {
  return (
    <div>

      <label className="text-sm text-zinc-400">
        Trade Type
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          mt-2
          w-full
          rounded-xl
          border
          border-zinc-700
          bg-zinc-800
          p-3
          text-white
        "
      >
        {CONTRACTS.map((group) => (
          <optgroup
            key={group.title}
            label={group.title}
          >
            {group.items.map((item) => (
              <option
                key={item}
                value={item}
              >
                {item.replaceAll("_", " ")}
              </option>
            ))}
          </optgroup>
        ))}
      </select>

    </div>
  );
}