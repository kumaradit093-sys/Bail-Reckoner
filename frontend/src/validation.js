import { todayInIndia } from "./date.js";

export function validateCaseValues(values, today = todayInIndia()) {
  const errors = {};
  if (!values.title?.trim()) errors.title = "Enter a case title.";
  if (values.custodyStartDate && values.custodyStartDate > today) {
    errors.custodyStartDate = "Date cannot be in the future.";
  }
  return errors;
}
