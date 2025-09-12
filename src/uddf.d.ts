export declare function parseUDDF(
  xmlData: string,
  unit?: 'si' | 'metric' | 'imperial'
): Promise<{ unit: string; data: any }>;