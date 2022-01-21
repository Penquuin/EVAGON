export namespace Tools {
  export type DebugTool = Tool & {
    Handle: Part & {
      ["Handle 🡪 PanelStablizer"]: Weld;
      ["Handle 🡪 DisplayPanel"]: Weld;
    };
    PanelStablizer: Part;
    DisplayPanel: Part & {
      SurfaceGui: SurfaceGui & {
        TextLabel: TextLabel;
      };
    };
  };
}
