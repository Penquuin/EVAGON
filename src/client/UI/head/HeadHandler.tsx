import Roact, { Portal } from "@rbxts/roact";
import { Players } from "@rbxts/services";
import { DisplayHandler } from "../geometry/displayhandler";

export const HeadHandler: Roact.FunctionComponent = () => {
	return (
		<Portal target={Players.LocalPlayer.WaitForChild("PlayerGui")}>
			<DisplayHandler />
		</Portal>
	);
};
