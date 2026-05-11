export function applyPostTemplate(currentContent: string, templateText: string): string {
  const base = currentContent.trim();
  if (!base) return templateText;
  return `${currentContent.replace(/\s*$/, "")}\n\n${templateText}`;
}

