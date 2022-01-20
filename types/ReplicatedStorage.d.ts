import { Tools } from "./Tools";

interface ReplicatedStorage extends Instance {
  entity_interface: Folder & {
    prefabs: Folder & {
      DebugTool: Tools.DebugTool;
    };
  };
}
