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

	// Called by LanguageManager. Extracts raw scenario data and localization.
	fetchLanguageData(
		swedishLocales: { [key: string]: string },
		englishLocales: { [key: string]: string }
	) {
		/*
		// Iterate over all scenarios
		Object.values(ScenarioKey).forEach((scenarioKey: ScenarioKey) => {
			// Add scenario titles to locales
			swedishLocales[scenarioKey + "title"] = scenariosSv[scenarioKey].Title;
			englishLocales[scenarioKey + "title"] = scenariosEn[scenarioKey].Title;

			// Fetch section lists
			const sectionsSv = scenariosSv[scenarioKey].Sections;
			const sectionsEn = scenariosEn[scenarioKey].Sections;
			if (sectionsSv.length != sectionsEn.length) {
				console.error("Swedish and english scenario sections not matching");
			}

			this.sections[scenarioKey] = [];

			// Add swedish section texts to locales
			for (let i = 0; i < sectionsSv.length; i++) {
				const sectionSv = sectionsSv[i];
				const sectionEn = sectionsEn[i];

				if (sectionSv.Buttons?.length != sectionEn.Buttons?.length) {
					console.error("Swedish and english buttons mismatch: " + scenarioKey);
				}
				if (
					sectionSv.Slider?.Labels.length != sectionEn.Slider?.Labels.length
				) {
					console.error("Swedish and english slider mismatch: " + scenarioKey);
				}
				if (sectionSv.LegendColors.length != sectionEn.LegendColors.length) {
					console.error("Swedish and english legend mismatch: " + scenarioKey);
				}
				if (sectionSv.Filenames != sectionEn.Filenames) {
					console.error(
						`Swedish and english filenames mismatch in '${scenarioKey}'\n- ${sectionSv.Filenames}\n- ${sectionEn.Filenames}`
					);
				}

				// Make safe string
				let sectionKey = scenarioKey + safeString(sectionSv.Title);
				// let sectionKey = scenarioKey + safeString(sectionSv.Id);

				// Setup custom section object
				let section: Section = {
					key: sectionKey,
					scenario: scenarioKey,
					legend: sectionSv.Legend1,
					default: sectionSv.Default,
					legendColors: sectionSv.LegendColors,
					defaultLayer: sectionSv.Filenames,
				};
				if (sectionSv.Buttons) {
					section.layerButtons = sectionSv.Buttons.map(
						(button) => button.Layers
					);
				}
				if (sectionSv.Slider) {
					section.layerSlider = {
						layers: sectionSv.Slider.Layers,
						labels: sectionSv.Slider.Labels.length,
					};
				}
				this.sections[scenarioKey].push(section);

				// Add section text to localization
				swedishLocales[sectionKey + "title"] = sectionSv.Title;
				englishLocales[sectionKey + "title"] = sectionEn.Title;
				swedishLocales[sectionKey + "bread"] = sectionSv.Text1;
				englishLocales[sectionKey + "bread"] = sectionEn.Text1;
				swedishLocales[sectionKey + "legend"] = sectionSv.LegendTitle;
				englishLocales[sectionKey + "legend"] = sectionEn.LegendTitle;
				sectionSv.LegendColors?.forEach(({ text }, index) => {
					swedishLocales[sectionKey + "legend" + index] = text;
				});
				sectionEn.LegendColors?.forEach(({ text }, index) => {
					englishLocales[sectionKey + "legend" + index] = text;
				});
				sectionSv.Buttons?.forEach((button, index) => {
					swedishLocales[sectionKey + "button" + index] = button.Title;
				});
				sectionEn.Buttons?.forEach((button, index) => {
					englishLocales[sectionKey + "button" + index] = button.Title;
				});
				sectionSv.Slider?.Labels.forEach((label, index) => {
					swedishLocales[sectionKey + "sliderLabel" + index] = label;
				});
				sectionEn.Slider?.Labels.forEach((label, index) => {
					englishLocales[sectionKey + "sliderLabel" + index] = label;
				});
				if (sectionSv.Slider) {
					swedishLocales[sectionKey + "sliderTitle"] = sectionSv.Slider.Title;
				}
				if (sectionEn.Slider) {
					englishLocales[sectionKey + "sliderTitle"] = sectionEn.Slider.Title;
				}
				if (sectionSv.LegendSource) {
					swedishLocales[sectionKey + "legendSource"] = sectionSv.LegendSource;
				}
				if (sectionEn.LegendSource) {
					englishLocales[sectionKey + "legendSource"] = sectionEn.LegendSource;
				}
			}
		});
		*/
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
}

export const scenarioManager: ScenarioManager = new ScenarioManager();

// Load all scenario json files
for (const path in import.meta.glob("../data/scenarios/*")) {
	import(path).then((module) => {
		scenarioManager.loadScenario(module.default);
	});
}
