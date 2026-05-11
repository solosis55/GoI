import { describe, expect, it } from "vitest";
import { applyPostTemplate } from "./postComposerTemplates";

describe("applyPostTemplate", () => {
  it("uses template directly when content is empty", () => {
    expect(applyPostTemplate("", "Plantilla base")).toBe("Plantilla base");
    expect(applyPostTemplate("   ", "Plantilla base")).toBe("Plantilla base");
  });

  it("appends template with spacing when content exists", () => {
    expect(applyPostTemplate("Hoy entrené duro", "Plantilla base")).toBe("Hoy entrené duro\n\nPlantilla base");
  });

  it("trims trailing spaces before append", () => {
    expect(applyPostTemplate("Texto actual   \n", "Plantilla base")).toBe("Texto actual\n\nPlantilla base");
  });
});

