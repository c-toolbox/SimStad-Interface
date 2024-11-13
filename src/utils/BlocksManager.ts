import { BaseScene } from "@/scenes/BaseScene";
import { ScenarioId, scenarioManager, Section } from "./ScenarioManager";
import { ONLINE } from "./constants";

const BLOCKS_URL =
	"https://blocks.c.itn.liu.se:443/rest/script/invoke/WebTask/start";

class BlocksManager {
	constructor() {}

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

	sendBlocksAudio(enabled: boolean) {
		const task = enabled
			? "VisualCity-Wall_PlayAudio"
			: "VisualCity-Wall_PauseAudio";

		this.sendRequest(task);
	}

	private sendRequest(task: string) {
		if (!ONLINE) return;

		fetch(BLOCKS_URL, {
			method: "POST",
			body: JSON.stringify({ task }),
			headers: {
				"Content-type": "application/json; charset=UTF-8",
			},
		})
			.then((response) => response.json())
			.then((json) => console.log("Blocks:", json));
	}
}

export const blocksManager: BlocksManager = new BlocksManager();
