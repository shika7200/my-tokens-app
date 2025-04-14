import { InputJson, SaveDataMappingGeneric, SaveDataRowRawGeneric } from "./apiService_types";
import { dataMapping } from "./mapping";



// Функция для проверки является ли строка числом
const parseValue = (value: string): number | string => {
  const num = Number(value);
  return !isNaN(num) ? num : value;
};

// Универсальная функция создания итогового запроса по dataMapping
export const createSaveDataRequest = (input: InputJson): SaveDataMappingGeneric => {
  const result = {} as SaveDataMappingGeneric;

  for (const sectionKey in dataMapping) {
    const sectionRows = dataMapping[sectionKey as keyof typeof dataMapping];

    // Получаем panel_id для каждой секции (можете хранить их отдельно или прямо здесь)
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

    const table: SaveDataRowRawGeneric[] = sectionRows.map(({ row_id, columns }) => {
      const parsedColumns: Record<string, number | string | null> = {};

      for (const columnId in columns) {
        const typedColumnId = columnId as keyof typeof columns;
        const factorKey = columns[typedColumnId];
        const rawValue = input.factors[factorKey];

        if (rawValue === undefined || rawValue === '') {
          parsedColumns[columnId] = null;
        } else {
          parsedColumns[columnId] = parseValue(rawValue);
        }
      }

      return {
        row_id,
        type_id: 0, // укажите нужный type_id
        columns: parsedColumns,
      };
    });

    result[sectionKey as keyof typeof dataMapping] = {
      panel_id: panelIdMapping[sectionKey],
      table,
    };
  }

  return result;
};
