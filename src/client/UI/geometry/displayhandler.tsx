import Roact, { Component } from "@rbxts/roact";
import { Animated } from "../base/Bases";
import { ConfettiHandler } from "./confettihandler";

export const DisplayHandler: Roact.FunctionComponent = () => {
	return (
		<>
			<screengui ResetOnSpawn={false} IgnoreGuiInset={true}>
				<NoticeSingleton />
				<frame Size={new UDim2(1, 0, 1, 0)} BackgroundTransparency={1}>
					<ConfettiHandler />
				</frame>
			</screengui>
		</>
	);
};

class ConfettiSingleton extends Component<{}, { render: boolean }> {
	constructor(p: {}) {
		super(p);
		this.setState({ render: true });
	}
	didMount() {
		task.delay(15, () => {
			this.setState({ render: false });
		});
	}
	render() {
		if (!this.state.render) return;
		return <ConfettiHandler />;
	}
}

class NoticeSingleton extends Component<{}, { c: number }> {
	static singleton: NoticeSingleton;
	static Refresh() {
		if (NoticeSingleton.singleton) NoticeSingleton.singleton.refresh();
	}
	constructor(p: {}) {
		super(p);
		this.setState({ c: 0 });
		NoticeSingleton.singleton = this;
	}
	/**
	 * Refresh
	 */
	public refresh() {
		this.setState({ c: (this.state.c + 1) % 50 });
	}

	private rtime = true;
	didMount() {
		task.spawn(() => {
			while (this.rtime) {
				task.wait(8);
				NoticeSingleton.Refresh();
			}
		});
	}
	willUnmount() {
		this.rtime = false;
	}

	render() {
		return (
			<Animated.TypeWriter
				Text={
					"Welcome to Evagon! This is a test game made for pseudo ownership system in Rodux with typescript! Please message me @SilkMatic for more info."
				}
				Position={new UDim2(0, 20, 1, -20)}
				AnchorPoint={new Vector2(0, 1)}
				BackgroundTransparency={1}
				TextSize={16}
				Size={new UDim2(0.4, 0, 0, 80)}
				Key={"Ok" + this.state.c}
			/>
		);
	}
}
