import Roact from "@rbxts/roact";
import { ConfettiHandler } from "./confettihandler";

export = (v: UIBase) => {
  const t = Roact.mount(<ConfettiHandler />, v);
  return () => {
    Roact.unmount(t);
  };
};
