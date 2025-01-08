interface CountdownFormInputsProps {
  date: string;
  description: string;
  onDateChange: (date: string) => void;
  onDescriptionChange: (description: string) => void;
  minDate: string;
}

export default function CountdownFormInputs({
  date,
  description,
  onDateChange,
  onDescriptionChange,
  minDate,
}: CountdownFormInputsProps) {
  return (
    <>
      <div>
        <label htmlFor="date" className="block text-sm font-medium mb-1">
          Date
        </label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          min={minDate}
          className="w-full p-2 border rounded-md bg-background"
          required
        />
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
