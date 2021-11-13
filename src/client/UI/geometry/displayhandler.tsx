import Roact from "@rbxts/roact";
import { ConfettiHandler } from "./confettihandler";

export const DisplayHandler: Roact.FunctionComponent = () => {
	return (
		<>
			<screengui ResetOnSpawn={false} IgnoreGuiInset={true}>
				<ConfettiHandler />
			</screengui>
		</>
	);
};
