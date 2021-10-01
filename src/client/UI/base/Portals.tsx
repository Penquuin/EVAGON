import Roact, { Children, Portal } from "@rbxts/roact";
import { Players } from "@rbxts/services";

export namespace Portals {
	export const PlayerGui: Roact.FunctionComponent = (p) => {
		return <Portal target={Players.LocalPlayer.WaitForChild("PlayerGui")}>{p[Children]}</Portal>;
	};
}
