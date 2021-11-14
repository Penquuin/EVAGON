import Roact, { Children, Portal } from "@rbxts/roact";
import { Players } from "@rbxts/services";

export namespace Portals {
	export const PlayerGui: Roact.FunctionComponent = (p) => {
		return <Portal target={Players.LocalPlayer.WaitForChild("PlayerGui")}>{p[Children]}</Portal>;
	};
}

export namespace Billboards {
	type basebprops = JSX.IntrinsicElement<BillboardGui>;
	export const Heado: Roact.FunctionComponent<basebprops & { chr?: Character }> = (p) => {
		return (
			<Portals.PlayerGui>
				<billboardgui
					Adornee={p.chr ? (p.chr.WaitForChild("Head") as BasePart) : undefined}
					ResetOnSpawn={false}
					{...{ ...p, chr: undefined }}
				/>
			</Portals.PlayerGui>
		);
	};
}
