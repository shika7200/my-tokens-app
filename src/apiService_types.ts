/**
 * Типы и интерфейсы для работы с сохранением данных и документов API Ficto.
 */

/**
 * Интерфейс для строки таблицы в запросе сохранения данных без избыточного указания panel_id.
 * panel_id будет выставлено автоматически на уровне формирования запроса.
 */
export interface SaveDataRowRaw<TColumns> {
    row_id: number;
    type_id: number;
    columns: TColumns;
  }
  
  /**
   * Обобщённый интерфейс запроса сохранения данных.
   * Здесь panel_id задаётся один раз, а массив table содержит строки без panel_id.
   */
  export interface SaveDataRequest<TPanelId extends number, TColumns> {
    panel_id: TPanelId;
    table: SaveDataRowRaw<TColumns>[];
  }
  
  /**
   * Определения для различных вариантов тела запроса сохранения данных.
   *
   * Обратите внимание, что panel_id задаётся один раз, а строки содержат только row_id, type_id и columns.
   */
  
  // Раздел 1.2 – panel_id: 3253, ключи столбцов: "36715", "36717"
  export type SaveDataSection12 = SaveDataRequest<3253, {
    "36715": number | null;
    "36717": number | null;
  }>;
  
  // Раздел 1.3 – panel_id: 3255, ключи столбцов: "36723", "36725"
  export type SaveDataSection13 = SaveDataRequest<3255, {
    "36723": number | null;
    "36725": number | null;
  }>;
  
  // Раздел 1.4 – panel_id: 3257, ключи столбцов: "36731", "36733", "36735", "36737", "36739"
  export type SaveDataSection14 = SaveDataRequest<3257, {
    "36731": number | null;
    "36733": number | null;
    "36735": number | null;
    "36737": number | null;
    "36739": number | null;
  }>;
  
  // Раздел 1.5 – panel_id: 3259, ключи столбцов: "36745", "36747", "36749", "36751", "36753", "36755"
  export type SaveDataSection15 = SaveDataRequest<3259, {
    "36745": number | null;
    "36747": number | null;
    "36749": number | null;
    "36751": number | null;
    "36753": number | null;
    "36755": number | null;
  }>;
  
  // Раздел 1.6 – panel_id: 3261, ключ: "36761"
  export type SaveDataSection16 = SaveDataRequest<3261, {
    "36761": number | null;
  }>;
  
  // Раздел 2.1 – panel_id: 3263, ключи: "36767", "36769", "36771"
  export type SaveDataSection21 = SaveDataRequest<3263, {
    "36767": number | null;
    "36769": number | null;
    "36771": number | null;
  }>;
  
  // Раздел 2.2 – panel_id: 3265, ключи: "36777", "36779"
  export type SaveDataSection22 = SaveDataRequest<3265, {
    "36777": number | null;
    "36779": number | null;
  }>;
  
  // Раздел 2.3 – panel_id: 3267, ключ: "36785"
  export type SaveDataSection23 = SaveDataRequest<3267, {
    "36785": number | null;
  }>;
  
  // Раздел 2.4 – panel_id: 3269, ключ: "36791"
  export type SaveDataSection24 = SaveDataRequest<3269, {
    "36791": number | null;
  }>;
  
  // Раздел 2.5 – panel_id: 3271, ключи: "36797", "36799", "36801"
  export type SaveDataSection25 = SaveDataRequest<3271, {
    "36797": number | null;
    "36799": number | null;
    "36801": number | null;
  }>;
  
  // Раздел 2.6 – panel_id: 3273, ключи: "36807", "36809", "36811"
  export type SaveDataSection26 = SaveDataRequest<3273, {
    "36807": number | null;
    "36809": number | null;
    "36811": number | null;
  }>;
  
  // Раздел 2.7 – panel_id: 3275, ключ: "36817"
  export type SaveDataSection27 = SaveDataRequest<3275, {
    "36817": number | null;
  }>;
  
  // Раздел 3.1 – panel_id: 3277, ключи: "36823", "36825", "36827"
  export type SaveDataSection31 = SaveDataRequest<3277, {
    "36823": number | null;
    "36825": number | null;
    "36827": number | null;
  }>;
  
  // Раздел 3.2 – panel_id: 3279, ключи: "36833", "36835", "36837"
  export type SaveDataSection32 = SaveDataRequest<3279, {
    "36833": number | null;
    "36835": number | null;
    "36837": number | null;
  }>;
  
  // Раздел 3.3 – panel_id: 3281, ключи: "36843", "36845", "36847", "36849", "36851", "36853", "36855", "36857", "36859", "36861", "36863"
  export type SaveDataSection33 = SaveDataRequest<3281, {
    "36843": number | null;
    "36845": number | null;
    "36847": number | null;
    "36849": number | null;
    "36851": number | null;
    "36853": number | null;
    "36855": number | null;
    "36857": number | null;
    "36859": number | null;
    "36861": number | null;
    "36863": number | null;
  }>;
  
  // Раздел 3.4 – panel_id: 3283, ключи: "36869", "36871"
  export type SaveDataSection34 = SaveDataRequest<3283, {
    "36869": number | null;
    "36871": number | null;
  }>;
  
  // Раздел 3.5 – panel_id: 3285, ключ: "36877"
  export type SaveDataSection35 = SaveDataRequest<3285, {
    "36877": number | null;
  }>;
  
  // Раздел 3.6 – panel_id: 3287, ключ: "36883"
  export type SaveDataSection36 = SaveDataRequest<3287, {
    "36883": number | null;
  }>;
  
  /**
   * Enum для выбора нужного варианта тела запроса сохранения данных.
   */
  export enum SaveDataSection {
    SECTION_12 = 'SECTION_12',
    SECTION_13 = 'SECTION_13',
    SECTION_14 = 'SECTION_14',
    SECTION_15 = 'SECTION_15',
    SECTION_16 = 'SECTION_16',
    SECTION_21 = 'SECTION_21',
    SECTION_22 = 'SECTION_22',
    SECTION_23 = 'SECTION_23',
    SECTION_24 = 'SECTION_24',
    SECTION_25 = 'SECTION_25',
    SECTION_26 = 'SECTION_26',
    SECTION_27 = 'SECTION_27',
    SECTION_31 = 'SECTION_31',
    SECTION_32 = 'SECTION_32',
    SECTION_33 = 'SECTION_33',
    SECTION_34 = 'SECTION_34',
    SECTION_35 = 'SECTION_35',
    SECTION_36 = 'SECTION_36'
  }
  
  /**
   * Маппинг enum для выбора соответствующего интерфейса запроса сохранения данных.
   */
  export interface SaveDataMapping {
    [SaveDataSection.SECTION_12]: SaveDataSection12;
    [SaveDataSection.SECTION_13]: SaveDataSection13;
    [SaveDataSection.SECTION_14]: SaveDataSection14;
    [SaveDataSection.SECTION_15]: SaveDataSection15;
    [SaveDataSection.SECTION_16]: SaveDataSection16;
    [SaveDataSection.SECTION_21]: SaveDataSection21;
    [SaveDataSection.SECTION_22]: SaveDataSection22;
    [SaveDataSection.SECTION_23]: SaveDataSection23;
    [SaveDataSection.SECTION_24]: SaveDataSection24;
    [SaveDataSection.SECTION_25]: SaveDataSection25;
    [SaveDataSection.SECTION_26]: SaveDataSection26;
    [SaveDataSection.SECTION_27]: SaveDataSection27;
    [SaveDataSection.SECTION_31]: SaveDataSection31;
    [SaveDataSection.SECTION_32]: SaveDataSection32;
    [SaveDataSection.SECTION_33]: SaveDataSection33;
    [SaveDataSection.SECTION_34]: SaveDataSection34;
    [SaveDataSection.SECTION_35]: SaveDataSection35;
    [SaveDataSection.SECTION_36]: SaveDataSection36;
  }
  
  /**
   * Интерфейс для ответа от сервера при сохранении данных.
   */
  export interface SaveDataResponse {
    status: boolean;
  }
  
  /**
   * Интерфейс для ответа статуса документа.
   */
  export interface DocumentResponse {
    status: boolean;
    document: {
      signature_access: boolean;
      validations_errors: unknown[];
      build_id: number;
      status_id: number;
      message: string | null;
      dateadd: string;
      dateupdate: string;
      approved: boolean;
      username: string;
      disabled_complite: boolean;
      show_prem_preloader: boolean;
      show_prem_download: boolean;
      show_disabled: boolean;
      show_btn_signature: boolean;
      show_download_ready: boolean;
      show_message: boolean;
      is_active: boolean;
      show_not_accepted: boolean;
      show_errors: boolean;
      show_btn_complite: boolean;
      allowed_delete_build: boolean;
      file_preliminary_link: string | null;
      file_cert_logo_link: string | null;
    };
    fixation: {
      items: unknown[];
      history: Record<string, unknown>;
    };
    disabled: boolean;
  }
  