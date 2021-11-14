interface Workspace extends Model {
  pillar: Part;
  Camera: Camera & {
    Buildv4LocalParts: Model;
    Buildv4MouseFilter: Model;
  };
  SpawnLocation: SpawnLocation & {
    Decal: Decal;
  };
  Baseplate: Part & {
    Texture: Texture;
  };
}
