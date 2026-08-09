type FontOptions = {
  variable?: string;
};

function mockFont({ variable }: FontOptions = {}) {
  return {
    className: "mock-font",
    style: { fontFamily: "mock-font" },
    variable: variable ? "mock-font-variable" : ""
  };
}

export const Geist_Mono = mockFont;
export const Inter = mockFont;
export const JetBrains_Mono = mockFont;
export const Lora = mockFont;
