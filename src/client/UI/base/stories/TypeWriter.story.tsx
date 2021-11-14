import Roact, { mount, unmount } from "@rbxts/roact";
import { Animated } from "../Bases";

export = (v: UIBase) => {
	const t = mount(
		<Animated.TypeWriter
			Position={new UDim2(0.5, 0, 0.5, 0)}
			BackgroundTransparency={1}
			Text={`Hello traveler! Welcome to ${game.Name}`}
		></Animated.TypeWriter>,
		v,
	);
	return () => {
		unmount(t);
	};
};
