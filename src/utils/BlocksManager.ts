import { ScenarioId, scenarioManager, Section } from "./ScenarioManager";
import { LogType } from "./SocketManager";
import { config } from "@/utils/RuntimeConfig";
import scenarioConfig from "@/data/scenarios.json";

class BlocksManager {
	private callbacks: ((message: string, type: LogType) => void)[] = [];
	private isShowingLoopingVideo: boolean = false;

	constructor() {}

	setDefaultLegend() {
		this.sendRequest("SimStad-default");

		if (this.isShowingLoopingVideo) {
			this.sendRequest(scenarioConfig.defaultBlocksVideo);
		}
	}

	setLegend(section: Section) {
		this.sendRequest("SimStad-" + section.legendImage);
	}

	setWallVideo(scenarioId: ScenarioId) {
		const key = scenarioManager.getScenario(scenarioId).blocksVideo;
		this.sendRequest(key);

		this.isShowingLoopingVideo = key === "VisualCity-Wall_Eastlink";
	}

	sendBlocksAudio(enabled: boolean) {
		const task = enabled
			? "VisualCity-Wall_PlayAudio"
			: "VisualCity-Wall_PauseAudio";

		this.sendRequest(task);
	}

	private sendRequest(task: string) {
		if (!config.ONLINE) return;
		if (!config.BLOCKS_URL) {
			return console.warn("Missing `BLOCKS_URL` in config.json");
		}

		fetch(config.BLOCKS_URL, {
			method: "POST",
			body: JSON.stringify({ task }),
			headers: {
				"Content-type": "application/json; charset=UTF-8",
			},
		})
			.then((response) => response.text())
			.then((text) => this.announce(text, LogType.BlocksReceive));

		this.announce(task, LogType.BlocksSend);
	}

	subscribe(callback: (message: string, type: LogType) => void) {
		this.callbacks.push(callback);
	}

	announce(message: string, type: LogType) {
		console.log("Blocks:", message);
		this.callbacks.forEach((callback) => callback(message, type));
	}
}

export const blocksManager: BlocksManager = new BlocksManager();
