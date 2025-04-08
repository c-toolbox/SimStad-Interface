import scenarioConfig from "@/data/scenarios.json";

interface ScenarioJson {
	Id: string;
	Title: string;
	Sections: {
		Id: string;
		Title: string;
		Text1: string;
		Legend1: string;
		Default: boolean;
		Filenames: string;
		LegendTitle: string;
		LegendColors: {
			color: string;
			text: string;
			type?: string;
		}[];
		LegendSource?: string;
		Buttons?: {
			Title: string;
			Layers: string;
		}[];
		Slider?: {
			Title: string;
			Labels: string[];
			Layers: string[];
		};
	}[];
}

export type ScenarioId = string;

export interface Section {
	key: string; // Used to fetch localized texts
	scenarioId: ScenarioId; // Parent scenario id
	legendImage: string; // Legend image id sent to blocks
	legendSource: string; // Legend image source text
	default: boolean; // If section is selected by default
	defaultLayer: string; // Datalayer used by default
	layerButtons?: string[];
	layerSlider?: {
		labels: number;
		layers: string[];
	};
	legendColors: {
		color: string;
		text: string;
		type?: string;
	}[];
}

export interface Scenario {
	id: string;
	thumbnail: string;
	blocksVideo: string;
	sections: Section[];
}

export class ScenarioManager {
	private scenarios: Scenario[];

	constructor() {
		this.scenarios = [];
		scenarioConfig.scenarios.forEach((scenario) => {
			this.scenarios.push({
				id: scenario.id,
				thumbnail: scenario.thumbnail,
				blocksVideo: scenario.blocksVideo,
				sections: [],
			});
		});
	}

	loadScenario(scenarioData: ScenarioJson) {
		const { Id, Sections } = scenarioData;
		const scenario = this.getScenario(Id);
		scenario.sections = Sections.map((section) => {
			return {
				key: section.Id,
				scenarioId: scenario.id,
				legendImage: section.Legend1,
				legendSource: section.LegendSource || "",
				default: section.Default,
				defaultLayer: section.Filenames,
				layerButtons: section.Buttons?.map((button) => button.Layers) || [],
				layerSlider: section.Slider
					? {
							labels: section.Slider.Labels.length,
							layers: section.Slider.Layers,
					  }
					: undefined,
				legendColors: section.LegendColors,
			};
		});
	}

	getScenarios(): Scenario[] {
		return this.scenarios;
	}

	getScenarioIds(): ScenarioId[] {
		return this.scenarios.map((scenario) => scenario.id);
	}

	getScenario(id: ScenarioId): Scenario {
		return this.scenarios.find((scenario) => scenario.id == id)!;
	}

	getSectionIds(scenarioId: ScenarioId): string[] {
		const scenario = this.getScenario(scenarioId);
		if (scenario) {
			return scenario.sections.map((section) => section.key);
		}
		return [];
	}

	getScenarioSection(
		scenarioId: ScenarioId,
		sectionId: string
	): Section | undefined {
		const scenario = this.getScenario(scenarioId);
		if (scenario) {
			return scenario.sections.find((section) => section.key == sectionId);
		}
	}

	getLayerUseCount(layer: string): number {
		let count = 0;
		this.scenarios.forEach((scenario) => {
			scenario.sections.forEach((section) => {
				if (
					!section.layerSlider &&
					section.layerButtons?.length == 0 &&
					section.defaultLayer.split(",").includes(layer)
				) {
					count++;
				}
				section.layerSlider?.layers.forEach((sliderLayer) => {
					if (sliderLayer.split(",").includes(layer)) {
						count++;
					}
				});
				section.layerButtons?.forEach((buttonLayer) => {
					if (buttonLayer.split(",").includes(layer)) {
						count++;
					}
				});
			});
		});
		return count;
	}
}

export const scenarioManager: ScenarioManager = new ScenarioManager();

import scenarioAI from "@/data/scenarios/AI.json";
import scenarioBilder_fran_ovan from "@/data/scenarios/Bilder_fran_ovan.json";
import scenarioKommunen from "@/data/scenarios/Kommunen.json";
import scenarioStaden_i_rorelse from "@/data/scenarios/Staden_i_rorelse.json";
import scenarioStaden_och_klimatet from "@/data/scenarios/Staden_och_klimatet.json";
import scenarioStadens_sammansattning from "@/data/scenarios/Stadens_sammansattning.json";
import scenarioStadens_utveckling from "@/data/scenarios/Stadens_utveckling.json";
import scenarioTrafikverket from "@/data/scenarios/Trafikverket.json";

// Load all scenario json files
// for (const path in import.meta.glob("../data/scenarios/*")) {
// 	import(path).then((module) => {
// 		scenarioManager.loadScenario(module.default);
// 	});
// }

scenarioManager.loadScenario(scenarioAI);
scenarioManager.loadScenario(scenarioBilder_fran_ovan);
scenarioManager.loadScenario(scenarioKommunen);
scenarioManager.loadScenario(scenarioStaden_i_rorelse);
scenarioManager.loadScenario(scenarioStaden_och_klimatet);
scenarioManager.loadScenario(scenarioStadens_sammansattning);
scenarioManager.loadScenario(scenarioStadens_utveckling);
scenarioManager.loadScenario(scenarioTrafikverket);
