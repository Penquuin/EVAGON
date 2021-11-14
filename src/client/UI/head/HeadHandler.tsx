import Roact, { Portal } from "@rbxts/roact";
import { Players } from "@rbxts/services";
import { PlayerHandlerService } from "../advanced/playerhandler";
import { DisplayHandler } from "../geometry/displayhandler";

export const HeadHandler: Roact.FunctionComponent = () => {
  return (
    <Portal target={Players.LocalPlayer.WaitForChild("PlayerGui")}>
      <DisplayHandler Key={"DisplayHandler"} />
      <PlayerHandlerService Key={"PlayerHandlerService"} />
    </Portal>
  );
};
