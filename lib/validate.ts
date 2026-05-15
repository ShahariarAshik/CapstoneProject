export interface ValidationReport {
  endpoint:       string;
  totalItems:     number;
  requiredFields: string[];
  missingByField: Record<string, number>; // field → how many items are missing it
  sampleItem:     Record<string, unknown>; // first invalid item's raw payload
  valid:          boolean;
  empty:          boolean; // array exists but has 0 items — structure unverifiable
}

export function validateItems(
  items: unknown[] | null | undefined,
  requiredFields: string[],
  endpoint: string,
): ValidationReport {
  if (!Array.isArray(items)) {
    return {
      endpoint,
      totalItems: 0,
      requiredFields,
      missingByField: { "[response array]": 1 },
      sampleItem: {},
      valid: false,
      empty: false,
    };
  }

  if (items.length === 0) {
    return {
      endpoint,
      totalItems: 0,
      requiredFields,
      missingByField: {},
      sampleItem: {},
      valid: true,
      empty: true,
    };
  }

  const missingByField: Record<string, number> = {};
  let sampleItem: Record<string, unknown> = {};
  let foundSample = false;

  for (const raw of items) {
    const item = raw as Record<string, unknown>;
    let itemHasError = false;

    for (const field of requiredFields) {
      const val = item[field];
      if (val === undefined || val === null || val === "") {
        missingByField[field] = (missingByField[field] ?? 0) + 1;
        itemHasError = true;
      }
    }

    if (itemHasError && !foundSample) {
      sampleItem = item;
      foundSample = true;
    }
  }

  return {
    endpoint,
    totalItems: items.length,
    requiredFields,
    missingByField,
    sampleItem,
    valid: Object.keys(missingByField).length === 0,
    empty: false,
  };
}
