// Strips any character outside printable ASCII, so login/registration
// fields can't end up with Thai (or other non-English) input.
export function enOnly(value) {
  return value.replace(/[^\x20-\x7E]/g, "");
}
