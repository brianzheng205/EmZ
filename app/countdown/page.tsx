"use client";

import { useState } from "react";

import "../globals.css";

type CountdownDays = "TODAY" | "∞" | number;

type CountdownItem = {
  days: CountdownDays;
  events: string[];
};

function parseCountdowns(text: string): CountdownItem[] {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const countdowns: CountdownItem[] = [];
  let currentDays: CountdownDays | null = null;
  let currentEvents: string[] = [];

  for (const line of lines) {
    if (line.startsWith("#")) {
      if (currentDays !== null && currentEvents.length > 0) {
        countdowns.push({ days: currentDays, events: [...currentEvents] });
        currentEvents = [];
      }

      const daysMatch = line.match(/TODAY|D-(\d+|♾️|∞)/);
      if (daysMatch) {
        if (daysMatch[0] === "TODAY") {
          currentDays = "TODAY";
        } else if (daysMatch[1] === "♾️" || daysMatch[1] === "∞") {
          currentDays = "∞";
        } else {
          currentDays = parseInt(daysMatch[1]);
        }
      }
    } else if (line.startsWith("-") && currentDays !== null) {
      const event = line.substring(1).trim();
      if (event) {
        currentEvents.push(event);
      }
    }
  }

  if (currentDays !== null && currentEvents.length > 0) {
    countdowns.push({ days: currentDays, events: [...currentEvents] });
  }

  return countdowns.sort((a, b) => {
    if (a.days === "∞") return 1;
    if (b.days === "∞") return -1;
    if (a.days === "TODAY") return -1;
    if (b.days === "TODAY") return 1;
    if (typeof a.days === "number" && typeof b.days === "number") {
      return a.days - b.days;
    }
    return 0;
  });
}

function updateCountdowns(countdowns: CountdownItem[]): CountdownItem[] {
  return countdowns
    .map((item) => {
      if (item.days === "∞") return item;
      if (item.days === "TODAY") return null;
      if (item.days === 1) {
        return { days: "TODAY", events: item.events };
      }
      if (typeof item.days === "number") {
        return { days: item.days - 1, events: item.events };
      }
      return item;
    })
    .filter((item): item is CountdownItem => item !== null)
    .sort((a, b) => {
      if (a.days === "∞") return 1;
      if (b.days === "∞") return -1;
      if (a.days === "TODAY") return -1;
      if (b.days === "TODAY") return 1;
      if (typeof a.days === "number" && typeof b.days === "number") {
        return a.days - b.days;
      }
      return 0;
    });
}

function formatCountdowns(countdowns: CountdownItem[]): string {
  return countdowns
    .map((item) => {
      const header =
        item.days === "∞"
          ? "# **D-∞**"
          : item.days === "TODAY"
          ? "# **TODAY**"
          : `# **D-${item.days}**`;
      const events = item.events.map((event) => `- ${event}`).join("\n");
      return `${header}\n${events}`;
    })
    .join("\n");
}

export default function Countdown() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<CountdownItem[]>([]);

  const copyToClipboard = () => {
    const formattedText = formatCountdowns(output);
    navigator.clipboard.writeText(formattedText);
  };

  return (
    <div className="flex gap-8 p-4">
      <div className="w-1/2 space-y-4">
        <textarea
          className="w-full p-4 text-xl border border-primary rounded-md font-mono h-[750px] bg-accent"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          className="w-full px-4 py-2 bg-primary text-white rounded hover:bg-secondary"
          onClick={() => setOutput(updateCountdowns(parseCountdowns(input)))}
        >
          Next Day
        </button>
      </div>
      <div className="w-1/2 space-y-4">
        <div className="flex flex-col gap-4 h-[750px] overflow-y-auto border border-primary rounded-md p-2">
          {output.map((item, index) => (
            <div key={index} className="bg-accent rounded-2xl p-4">
              <h2 className="text-xl font-bold mb-2">
                {item.days === "∞"
                  ? "D-∞"
                  : item.days === "TODAY"
                  ? "TODAY"
                  : `D-${item.days}`}
              </h2>
              <ul className="list-disc list-inside space-y-1">
                {item.events.map((event, eventIndex) => (
                  <li key={eventIndex}>{event}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <button
          className="w-full px-4 py-2 bg-primary text-white rounded hover:bg-secondary"
          onClick={copyToClipboard}
        >
          Copy Updated Countdowns
        </button>
      </div>
    </div>
  );
}
