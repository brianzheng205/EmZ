import { GridRenderEditCellParams } from "@mui/x-data-grid";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";

export default function TimePickerEditCell(params: GridRenderEditCellParams) {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <TimePicker
        value={params.value}
        onChange={(newDate) => {
          params.api.setEditCellValue({
            id: params.id,
            field: params.field,
            value: newDate,
          });
        }}
      />
    </LocalizationProvider>
  );
}
