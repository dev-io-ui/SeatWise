import { parse as parseCsv } from "csv-parse/sync";
import ExcelJS from "exceljs";
import path from "path";

const normalizeRow = (row) =>
  Object.entries(row).reduce((accumulator, [key, value]) => {
    const normalizedKey = String(key).trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    accumulator[normalizedKey] = typeof value === "string" ? value.trim() : value;
    return accumulator;
  }, {});

const worksheetToRows = (worksheet) => {
  let headers = [];
  const rows = [];

  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    const values = row.values
      .slice(1)
      .map((value) => {
        if (value === null || value === undefined) {
          return "";
        }

        if (value instanceof Date) {
          return value.toISOString().split("T")[0];
        }

        if (typeof value === "object") {
          if ("text" in value && value.text) {
            return value.text;
          }

          if ("result" in value && value.result) {
            return value.result;
          }
        }

        return value;
      })
      .map((value) => String(value).trim());

    if (rowNumber === 1) {
      headers = values;
      return;
    }

    if (!headers.length) {
      throw new Error("The uploaded workbook does not contain a header row.");
    }

    const entry = headers.reduce((accumulator, header, index) => {
      if (header) {
        accumulator[header] = values[index] ?? "";
      }

      return accumulator;
    }, {});

    if (Object.values(entry).some((value) => String(value).trim() !== "")) {
      rows.push(entry);
    }
  });

  return rows;
};

const readRows = async (buffer, filename = "") => {
  const extension = path.extname(filename).toLowerCase();

  if (extension === ".csv") {
    return parseCsv(buffer.toString("utf-8"), {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
    });
  }

  if (extension === ".xlsx") {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const worksheet = workbook.worksheets[0];

    if (!worksheet) {
      throw new Error("The uploaded workbook does not contain any worksheets.");
    }

    return worksheetToRows(worksheet);
  }

  if (extension === ".xls") {
    throw new Error("Legacy .xls files are not supported. Please save the file as .xlsx or .csv and upload again.");
  }

  throw new Error("Unsupported file type. Please upload a .csv or .xlsx file.");
};

const pickValue = (row, keys) => {
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }

  return "";
};

const toDepartmentArray = (value) =>
  String(value || "")
    .split(/[;,]/)
    .map((item) => item.trim())
    .filter(Boolean);

export const parseStudentsFile = async (buffer, filename) => {
  const rows = await readRows(buffer, filename);

  return rows
    .map((row) => normalizeRow(row))
    .map((row) => ({
      name: String(pickValue(row, ["name", "studentname"])).trim(),
      rollNumber: String(pickValue(row, ["rollnumber", "rollno", "registernumber"])).trim().toUpperCase(),
      department: String(pickValue(row, ["department", "dept", "branch"])).trim(),
      semester: String(pickValue(row, ["semester", "sem", "year"])).trim(),
      email: String(pickValue(row, ["email", "mail"])).trim().toLowerCase(),
      phone: String(pickValue(row, ["phone", "mobilenumber", "contact"])).trim(),
    }))
    .filter((row) => row.name && row.rollNumber && row.department);
};

export const parseExamsFile = async (buffer, filename) => {
  const rows = await readRows(buffer, filename);

  return rows
    .map((row) => normalizeRow(row))
    .map((row) => ({
      examName: String(pickValue(row, ["examname", "exam"])).trim(),
      subject: String(pickValue(row, ["subject", "paper"])).trim(),
      examDate: new Date(String(pickValue(row, ["examdate", "date"])).trim()),
      startTime: String(pickValue(row, ["starttime", "fromtime"])).trim(),
      endTime: String(pickValue(row, ["endtime", "totime"])).trim(),
      departments: toDepartmentArray(pickValue(row, ["departments", "department", "dept"])),
      venueNotes: String(pickValue(row, ["venuenotes", "notes"])).trim(),
    }))
    .filter((row) => row.examName && row.subject && !Number.isNaN(row.examDate.getTime()));
};

export const parseHallsFile = async (buffer, filename) => {
  const rows = await readRows(buffer, filename);

  return rows
    .map((row) => normalizeRow(row))
    .map((row) => ({
      hallName: String(pickValue(row, ["hallname", "hall", "roomname"])).trim(),
      building: String(pickValue(row, ["building", "block"])).trim(),
      floor: String(pickValue(row, ["floor", "level"])).trim(),
      capacity: Number(pickValue(row, ["capacity", "seats"])),
      rows: Number(pickValue(row, ["rows", "rowcount"])) || 5,
      columns: Number(pickValue(row, ["columns", "columncount"])) || 6,
      active: String(pickValue(row, ["active", "status"])).trim().toLowerCase() !== "false",
    }))
    .filter((row) => row.hallName && Number.isFinite(row.capacity) && row.capacity > 0);
};
