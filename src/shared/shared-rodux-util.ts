import Rodux from "@rbxts/rodux";

export namespace SharedRoduxUtil {
	export function CreateActionGuard<J extends Rodux.Action>() {
		return function <T extends J["type"]>(tc: T, x: J | Rodux.Action<T>): x is Rodux.Action<T> {
			return x.type === tc;
		};
	}
}
