/* Protocol types */

export enum Request {
	OmniToken = "token",

	Ping = "PingRequest",
	Layer = "LayerRequest",
	LiveTraffic = "LiveTrafficRequest",
	Light = "LightRequest",
	MapLight = "MapLightRequest",
	Reset = "ResetRequest",
	Recache = "RecacheRequest",
}

export enum Response {
	OmniConnect = "server_connect",
	OmniDisconnect = "server_disconnect",
	OmniAuthorized = "server_authorized",
	OmniJoin = "server_join",
	OmniLeave = "server_leave",
	OmniError = "server_error",

	Ping = "PingResponse",
	Layer = "LayerResponse",
	Reset = "ResetResponse",
	LiveTraffic = "LiveTrafficResponse",
	Recache = "RecacheResponse",
}

/* Omni*/

// Sending token
export interface OmniToken {
	token: string;
}

// Upon connecting successfully
export interface OmniConnect {
	type: Response.OmniConnect;
	message: string;
}

// Upon forced disconnect, such as guests being kicked after host disconnects
export interface OmniDisconnect {
	type: Response.OmniDisconnect;
	message: string;
}

// Upon authorizing successfully
export interface OmniAuthorized {
	type: Response.OmniAuthorized;
	message: string;
}

// Upon new application connecting.
export interface OmniJoin {
	type: Response.OmniJoin;
	role: "host" | "client" | "guest";
	user: string;
}

// Upon application disconnecting.
export interface OmniLeave {
	type: Response.OmniLeave;
	role: "host" | "client" | "guest";
	user: string;
}

// Errors including non-json message sent or invalid token.
export interface OmniError {
	type: Response.OmniError;
	message: string;
}

/* Ping */

export interface PingRequest {
	type: Request.Ping;
}

export interface PingResponse {
	type: Response.Ping;
}

/* Data layer activation */

interface LayerSliceCrop {
	type: "slice";
	slice: {
		min_u: number;
		max_u: number;
		min_v: number;
		max_v: number;
	};
}

interface LayerCircleCrop {
	type: "circle";
	circle: {
		u: number;
		v: number;
		radius: number;
	};
}

type LayerCrop = LayerSliceCrop | LayerCircleCrop;

interface LayerBaseData {
	name: string;
	opacity?: number;
	lit?: boolean;
	crop?: LayerCrop;
}

interface LayerImageData extends LayerBaseData {
	type: "image";
}

interface LayerFlowData extends LayerBaseData {
	type: "flow";
	flow: {
		texture: string;
		scale?: number;
		speed?: number;
	};
}

interface LayerMovieData extends LayerBaseData {
	type: "movie";
	movie?: {
		speed: number;
	};
}

interface LayerColorData extends LayerBaseData {
	type: "color";
	color: string;
}

interface LayerBase64Data extends LayerBaseData {
	type: "base64";
	base64: string;
}

export type LayerRequestData =
	| LayerImageData
	| LayerFlowData
	| LayerMovieData
	| LayerColorData
	| LayerBase64Data;

export interface LayerRequest {
	type: Request.Layer;
	flush: boolean;
	layers: LayerRequestData[];
}

export interface LayerResponse {
	type: Response.Layer;
	name: string;
	error?: string;
}

/* Traffic activation */

export interface LiveTrafficRequest {
	type: Request.LiveTraffic;
	active: boolean;
}

export interface LiveTrafficResponse {
	type: Response.LiveTraffic;
	active: boolean;
	error?: string;
}

/* Time of day */

export interface LightRequest {
	type: Request.Light;
	year: number;
	month: number;
	day: number;
	solar_time: number;
}

/* Spotlight */

export interface MapLightRequest {
	type: Request.MapLight;
	name: string;
	northing: number;
	easting: number;
	height: number;
	color: string;
	typeofmessage: "add" | "update" | "delete";
	enable: boolean;
}

/* Reset */

export interface ResetRequest {
	type: Request.Reset;
	misc: string;
}

export interface ResetResponse {
	type: Response.Reset;
}

/* Database recaching */

export interface RecacheRequest {
	type: Request.Recache;
	path: string;
}

export interface RecacheResponse {
	type: Response.Recache;
	index: number;
	max: number;
}

/* All requests*/

export type ValidRequests =
	| OmniToken
	| PingRequest
	| LayerRequest
	| LiveTrafficRequest
	| LightRequest
	| MapLightRequest
	| ResetRequest
	| RecacheRequest;
