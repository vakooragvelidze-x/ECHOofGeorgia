export function getFriendlyAuthError(error: unknown) {
  const rawMessage =
    error instanceof Error ? error.message : String(error ?? "");

  const message = rawMessage.toLowerCase();

  if (message.includes("invalid login credentials")) {
    return "ელფოსტა ან პაროლი არასწორია.";
  }

  if (message.includes("email not confirmed")) {
    return "ელფოსტა ჯერ დადასტურებული არ არის. შეამოწმე ელფოსტა.";
  }

  if (
    message.includes("user already registered") ||
    message.includes("already registered") ||
    message.includes("already exists")
  ) {
    return "ეს ელფოსტა უკვე რეგისტრირებულია. სცადე შესვლა.";
  }

  if (
    message.includes("password") &&
    (message.includes("6") ||
      message.includes("characters") ||
      message.includes("weak"))
  ) {
    return "პაროლი მინიმუმ 6 სიმბოლო უნდა იყოს.";
  }

  if (message.includes("invalid email") || message.includes("email")) {
    return "შეიყვანე სწორი ელფოსტა.";
  }

  if (
    message.includes("fetch") ||
    message.includes("network") ||
    message.includes("failed to fetch")
  ) {
    return "კავშირი ვერ დამყარდა. გადაამოწმე ინტერნეტი და სცადე თავიდან.";
  }

  if (message.includes("oauth")) {
    return "Google-ით შესვლა ვერ მოხერხდა. სცადე თავიდან.";
  }

  if (
    message.includes("unauthorized") ||
    message.includes("jwt") ||
    message.includes("session")
  ) {
    return "სესია ამოიწურა. გთხოვ, თავიდან შეხვიდე.";
  }

  if (message.includes("rate limit") || message.includes("too many")) {
    return "ძალიან ბევრი მცდელობაა. ცოტა ხანში სცადე თავიდან.";
  }

  return "მოქმედება ვერ შესრულდა. სცადე თავიდან.";
}