import { events } from "shared/rbxnet/events";

export namespace ServerEph {
  export const SendEvent = events.Server.Create("SendEvent");
  export const EventDispatch = events.Server.Create("EventDispatch");
}
