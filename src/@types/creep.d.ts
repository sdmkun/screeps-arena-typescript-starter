declare module "game/prototypes" {
  interface Creep {
    initialPos: RoomPosition;
    role: "melee" | "ranged" | "heal" | null | undefined;
    act: (() => void) | null | undefined;
  }
}

export {};
