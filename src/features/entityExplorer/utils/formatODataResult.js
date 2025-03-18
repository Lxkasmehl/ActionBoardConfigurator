function parseODataDate(dateString) {
  if (!dateString || typeof dateString !== 'string') return dateString;

  const matchWithOffset = dateString.match(/\/Date\((-?\d+)([+-]\d{4})\)\//);
  if (matchWithOffset) {
    const timestamp = parseInt(matchWithOffset[1], 10);
    const date = new Date(timestamp);
    return formatDate(date);
  }

  const matchSimple = dateString.match(/\/Date\((-?\d+)\)\//);
  if (matchSimple) {
    const timestamp = parseInt(matchSimple[1], 10);
    const date = new Date(timestamp);
    return formatDate(date);
  }

  return dateString;
}

function formatDate(date) {
  if (date.getHours() || date.getMinutes()) {
    return date.toLocaleString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  return date.toLocaleDateString('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function cleanupODataObject(item) {
  const cleanItem = {};

  for (const [key, value] of Object.entries(item)) {
    if (key === '__metadata' || key === 'metadata' || key.startsWith('__')) {
      continue;
    }

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      cleanItem[key] = cleanupODataObject(value);
    } else if (Array.isArray(value)) {
      cleanItem[key] = value.map((v) =>
        typeof v === 'object' ? cleanupODataObject(v) : parseODataDate(v),
      );
    } else {
      cleanItem[key] = parseODataDate(value);
    }
  }

  return cleanItem;
}

export function formatODataResult(data) {
  if (!data || typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map((item) => {
      const results = item.d?.results || item.results || item.d || item;
      return Array.isArray(results)
        ? results.map(cleanupODataObject)
        : cleanupODataObject(results);
    });
  }

  const results = data.d?.results || data.results || data.d || data;
  if (Array.isArray(results)) {
    return results.map(cleanupODataObject);
  }

  return cleanupODataObject(results);
}
