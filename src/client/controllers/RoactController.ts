import { Controller, OnStart, OnInit } from "@flamework/core";
import Roact from "@rbxts/roact";
import { HeadHandler } from "client/UI/head/HeadHandler";

@Controller({})
export class RoactController implements OnStart, OnInit {
	onInit() {}

	onStart() {
		Roact.mount(Roact.createElement(HeadHandler));
	}
}
