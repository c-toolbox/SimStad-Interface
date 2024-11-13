import { BaseScene } from "@/scenes/BaseScene";
import { ScenarioId, scenarioManager, Section } from "./ScenarioManager";
import { ONLINE } from "./constants";

export class BlocksManager extends Phaser.GameObjects.Container {
	constructor(scene: BaseScene) {
		super(scene, 0, 0);
		this.scene = scene;
		scene.add.existing(this);
	}

	setDefaultLegend() {
		this.sendRequest("SimStad-default");
	}

	setLegend(section: Section) {
		this.sendRequest("SimStad-" + section.legendImage);
	}

	setWallVideo(scenarioId: ScenarioId) {
		const key = scenarioManager.getScenario(scenarioId).blocksVideo;
		this.sendRequest(key);
	}

	private sendRequest(legend: string) {
		if (!ONLINE) return;

		fetch("https://blocks.c.itn.liu.se:443/rest/script/invoke/WebTask/start", {
			method: "POST",
			body: JSON.stringify({
				task: legend,
			}),
			headers: {
				"Content-type": "application/json; charset=UTF-8",
			},
		})
			.then((response) => response.json())
			.then((json) => console.log("Blocks:", json));
	}
}
