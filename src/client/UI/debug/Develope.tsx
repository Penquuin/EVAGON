import Roact from "@rbxts/roact";

interface lp {
	s: string;
	lf: (s: string) => unknown;
}
class LogOnce extends Roact.Component<lp> {
	static defaultProps: lp = {
		s: "None",
		lf: warn,
	};
	constructor(p: lp) {
		super(p);
		this.props.lf(this.props.s);
	}
	render() {
		return Roact.createElement("StringValue", { Name: this.props.s, Value: this.props.s });
	}
}

export const InDev: Roact.FunctionComponent = () => {
	return <LogOnce s={"Component requires development"} />;
};

export const Obsolete: Roact.FunctionComponent = () => {
	return <LogOnce s={"Component has been deprecated"} />;
};
