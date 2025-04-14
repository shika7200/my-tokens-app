
import { InputJson } from "./apiService_types";
import { dataMapping } from "./mapping";

const isNumeric = (value: string): boolean => /^-?\d+(\.\d+)?$/.test(value);
const parseValue = (value: string): number | string => isNumeric(value) ? Number(value) : value;

type TableRow = {
  panel_id: number;
  row_id: number;
  type_id: number;
  columns: Record<string, number | string | null>;
};

type SectionRequest = {
  params: { panel_id: number };
  table: TableRow[];
  panel_id: number;
};

const panelIdMapping: Record<string, number> = {
  SECTION_12: 3253,
  SECTION_13: 3255,
  SECTION_14: 3257,
  SECTION_15: 3259,
  SECTION_16: 3261,
  SECTION_21: 3263,
  SECTION_22: 3265,
  SECTION_23: 3267,
  SECTION_24: 3269,
  SECTION_25: 3271,
  SECTION_26: 3273,
  SECTION_27: 3275,
  SECTION_31: 3277,
  SECTION_32: 3279,
  SECTION_33: 3281,
  SECTION_34: 3283,
  SECTION_35: 3285,
  SECTION_36: 3287,
};

export const createSectionRequest = (sectionKey: string, input: InputJson): SectionRequest => {
  const rows = dataMapping[sectionKey as keyof typeof dataMapping];
  const panel_id = panelIdMapping[sectionKey];

  const table: TableRow[] = rows.map(({ row_id, columns }) => {
    const parsedColumns: Record<string, number | string | null> = {};

    for (const [columnId, factorKey] of Object.entries(columns)) {
        if (factorKey === null) {
          parsedColumns[columnId] = null;
          continue; // если factorKey равен null, переходим к следующей итерации
        }
        const rawValue = input.factors[factorKey];
        parsedColumns[columnId] =
          rawValue === undefined || rawValue === ''
            ? null
            : parseValue(rawValue);
      }
      
    return {
      panel_id,
      row_id,
      type_id: 2,
      columns: parsedColumns,
    };
  });

  return {
    params: { panel_id },
    table,
    panel_id,
  };
};