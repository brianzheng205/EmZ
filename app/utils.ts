// DATES
export const getAdjustedDate = (date: Date) => {
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() + timezoneOffset);
};

// CANVAS
export const resizeCanvas = (canvas: HTMLCanvasElement) => {
  const prevWidth = canvas.width;
  const prevHeight = canvas.height;

  const { width, height } = canvas.parentElement!.getBoundingClientRect();
  canvas.width = width;
  canvas.height = height;

  const scaleX = canvas.width / prevWidth || 1;
  const scaleY = canvas.height / prevHeight || 1;

  return { scaleX, scaleY };
};
