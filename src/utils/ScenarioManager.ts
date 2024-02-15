import * as dataStadenIRorelseSv from "@/data/scenarios/Staden_i_rorelse_sv.json";
import * as dataStadenIRorelseEn from "@/data/scenarios/Staden_i_rorelse_en.json";
import * as dataStadenOchKlimatetSv from "@/data/scenarios/Staden_och_klimatet_sv.json";
import * as dataStadenOchKlimatetEn from "@/data/scenarios/Staden_och_klimatet_en.json";
import * as dataStadensSammansattningSv from "@/data/scenarios/Stadens_sammansattning_sv.json";
import * as dataStadensSammansattningEn from "@/data/scenarios/Stadens_sammansattning_en.json";
import * as dataStadensUtvecklingSv from "@/data/scenarios/Stadens_utveckling_sv.json";
import * as dataStadensUtvecklingEn from "@/data/scenarios/Stadens_utveckling_en.json";
import * as dataBilderFranOvanSv from "@/data/scenarios/Bilder_fran_ovan_sv.json";
import * as dataBilderFranOvanEn from "@/data/scenarios/Bilder_fran_ovan_en.json";
import * as dataAISv from "@/data/scenarios/AI_sv.json";
import * as dataAIEn from "@/data/scenarios/AI_en.json";
import { languageManager } from "./LanguageManager";
import { safeString } from "./functions";

export interface ScenarioData {
	Title: string;
	Sections: {
		Label1: string;
		SectionObject: {
			Title: string;
			Text1: string;
			Text2: string;
			Datasource: string;
			Legend1: string;
			Legend2: string;
			Default: boolean;
			Idle: boolean;
			Filenames: string;
			LegendTitle: string;
			LegendColors: {
				color: string;
				text: string;
			}[];
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
	}[];
}

export enum ScenarioKey {
	rorelse = "rorelse",
	klimatet = "klimatet",
	sammansattning = "sammansattning",
	utveckling = "utveckling",
	ovan = "ovan",
	ai = "ai",
}

export interface Section {
	key: string; // Used to fetch localized texts
	scenario: ScenarioKey; // Parent scenario id
	legend: string; // Legend image id sent to blocks
	default: boolean; // If section is selected by default
	idle: boolean; // If section is shown during attraction mode
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

export class ScenarioManager {
	private sections: { [key in ScenarioKey]: Section[] };

	constructor() {
		this.sections = {
			[ScenarioKey.rorelse]: [],
			[ScenarioKey.klimatet]: [],
			[ScenarioKey.sammansattning]: [],
			[ScenarioKey.utveckling]: [],
			[ScenarioKey.ovan]: [],
			[ScenarioKey.ai]: [],
		};
	}

	// Called by LanguageManager. Extracts raw scenario data and localization.
	fetchLanguageData(
		swedishLocales: { [key: string]: string },
		englishLocales: { [key: string]: string }
	) {
		// Raw scenario data
		const scenariosSv: { [key in ScenarioKey]: ScenarioData } = {
			[ScenarioKey.rorelse]: dataStadenIRorelseSv,
			[ScenarioKey.klimatet]: dataStadenOchKlimatetSv,
			[ScenarioKey.sammansattning]: dataStadensSammansattningSv,
			[ScenarioKey.utveckling]: dataStadensUtvecklingSv,
			[ScenarioKey.ovan]: dataBilderFranOvanSv,
			[ScenarioKey.ai]: dataAISv,
		};
		const scenariosEn: { [key in ScenarioKey]: ScenarioData } = {
			[ScenarioKey.rorelse]: dataStadenIRorelseEn,
			[ScenarioKey.klimatet]: dataStadenOchKlimatetEn,
			[ScenarioKey.sammansattning]: dataStadensSammansattningEn,
			[ScenarioKey.utveckling]: dataStadensUtvecklingEn,
			[ScenarioKey.ovan]: dataBilderFranOvanEn,
			[ScenarioKey.ai]: dataAIEn,
		};

		// Iterate over all scenarios
		Object.values(ScenarioKey).forEach((scenarioKey: ScenarioKey) => {
			// Add scenario titles to locales
			swedishLocales[scenarioKey + "title"] = scenariosSv[scenarioKey].Title;
			englishLocales[scenarioKey + "title"] = scenariosEn[scenarioKey].Title;

			// Not sure why it even is an array
			if (scenariosSv[scenarioKey].Sections.length != 1) {
				console.error("Not supported");
			}

			// Fetch section lists
			const sectionsSv = scenariosSv[scenarioKey].Sections[0].SectionObject;
			const sectionsEn = scenariosEn[scenarioKey].Sections[0].SectionObject;
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

				// Setup custom section object
				let section: Section = {
					key: sectionKey,
					scenario: scenarioKey,
					legend: sectionSv.Legend1,
					default: sectionSv.Default,
					idle: sectionSv.Idle,
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
			}
		});
	}

	getScenarioKeys(): string[] {
		return Object.keys(ScenarioKey);
	}

	getScenarioSections(scenario: ScenarioKey) {
		return this.sections[scenario];
	}
}

const scenarioManager: ScenarioManager = new ScenarioManager();

export { scenarioManager };
