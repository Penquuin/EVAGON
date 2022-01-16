import { events } from "shared/rbxnet/events";

export namespace ClientEph {
  export const SendEvent = events.Client.Get("SendEvent");
  export const EventDispatch = events.Client.Get("EventDispatch");
}
