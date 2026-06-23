export function removeOsmIdPrefix(
  osmId: string | undefined,
): string | undefined {
  if (osmId && osmId.startsWith("https://www.openstreetmap.org/")) {
    return osmId.substring("https://www.openstreetmap.org/".length);
  }
  return osmId;
}
