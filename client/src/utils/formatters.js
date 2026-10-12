export const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value));
};

export const formatDepartments = (departments) => {
  if (!departments?.length) {
    return "All departments";
  }

  return departments.join(", ");
};

export const formatTimeRange = (startTime, endTime) => {
  if (!startTime && !endTime) {
    return "Time not set";
  }

  return [startTime, endTime].filter(Boolean).join(" - ");
};

