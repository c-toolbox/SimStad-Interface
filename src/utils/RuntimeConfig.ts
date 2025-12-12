export interface RuntimeConfig {
	MEDIA_PATH: string;
	BLOCKS_URL: string;
	OMNI_URL: string;
	OMNI_TOKEN: string;
	CITY_ID: string;
	IDLE_TIME: number;
	IDLE_FADE: number;
	ONLINE: boolean;
}

export const config: RuntimeConfig = {
	MEDIA_PATH: "",
	BLOCKS_URL: "",
	OMNI_URL: "",
	OMNI_TOKEN: "",
	CITY_ID: "",
	IDLE_TIME: 300,
	IDLE_FADE: 10,
	ONLINE: true,
};

export function setRuntimeConfig(obj: Partial<RuntimeConfig>) {
	if (!obj) return;
	Object.assign(config, obj);
}
