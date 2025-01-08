"use client";

import { useState, useEffect } from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
} from "@headlessui/react";

interface CountdownFormInputsProps {
  id: string;
  description: string;
  onIdChange: (id: string, isCustom: boolean) => void;
  onDescriptionChange: (description: string) => void;
  minDate: string;
  existingCustomIds: string[];
  isCustomId: boolean;
}

export default function CountdownFormInputs({
  id,
  description,
  onIdChange,
  onDescriptionChange,
  minDate,
  existingCustomIds,
  isCustomId,
}: CountdownFormInputsProps) {
  const [isCustomInput, setIsCustomInput] = useState(isCustomId);
  const [customInput, setCustomInput] = useState(isCustomId ? id : "");
  const [query, setQuery] = useState("");

  const filteredCustomIds =
    query === ""
      ? existingCustomIds
      : existingCustomIds.filter((customId) =>
          customId.toLowerCase().includes(query.toLowerCase())
        );

  const handleIdTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const useCustom = e.target.value === "custom";
    setIsCustomInput(useCustom);
    if (!useCustom) {
      onIdChange("", false);
    } else {
      setCustomInput("");
      setQuery("");
      onIdChange("", true);
    }
  };

  useEffect(() => {
    if (id === "") {
      setCustomInput("");
      setQuery("");
    }
  }, [id]);

  return (
    <>
      <div className="space-y-4">
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="idType"
              value="date"
              checked={!isCustomInput}
              onChange={handleIdTypeChange}
              className="cursor-pointer accent-primary"
            />
            Date
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="idType"
              value="custom"
              checked={isCustomInput}
              onChange={handleIdTypeChange}
              className="cursor-pointer accent-primary"
            />
            Custom Text
          </label>
        </div>

        <div className="min-h-20">
          {!isCustomInput ? (
            <div>
              <label htmlFor="date" className="block text-sm font-medium mb-1">
                Date
              </label>
              <input
                className="w-full p-2 border rounded-md bg-background cursor-pointer"
                type="date"
                id="date"
                value={id}
                onChange={(e) => onIdChange(e.target.value, false)}
                min={minDate}
                required
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label
                htmlFor="customId"
                className="block text-sm font-medium mb-1"
              >
                Custom Text
              </label>
              <Combobox
                value={customInput}
                onChange={(value) => {
                  if (value === null) return;
                  setCustomInput(value);
                  onIdChange(value, true);
                }}
              >
                <div className="relative">
                  <ComboboxInput
                    className="w-full p-2 border rounded-md bg-background cursor-text"
                    placeholder="Type to search or create new..."
                    displayValue={(value: string) => value}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setCustomInput(e.target.value);
                      if (e.target.value.trim()) {
                        onIdChange(e.target.value.trim(), true);
                      }
                    }}
                    onFocus={() => setQuery("")}
                    required
                  />
                  <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2 cursor-pointer">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        d="M7 7l3-3 3 3m0 6l-3 3-3-3"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </ComboboxButton>
                  <ComboboxOptions className="absolute z-10 w-full mt-1 overflow-auto bg-background rounded-md border max-h-60">
                    {filteredCustomIds.length === 0 && query !== "" ? (
                      <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                        Nothing found. Press Enter to create "{query}".
                      </div>
                    ) : (
                      filteredCustomIds.map((customId) => (
                        <ComboboxOption
                          key={customId}
                          value={customId}
                          className={({ active }) =>
                            `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                              active ? "bg-primary text-white" : "text-gray-900"
                            }`
                          }
                        >
                          {customId}
                        </ComboboxOption>
                      ))
                    )}
                  </ComboboxOptions>
                </div>
              </Combobox>
            </div>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Description
        </label>
        <input
          type="text"
          id="description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className="w-full p-2 border rounded-md bg-background"
          placeholder="e.g. 4-year 'ILY' anniversary. ❤️"
          required
        />
      </div>
    </>
  );
}
