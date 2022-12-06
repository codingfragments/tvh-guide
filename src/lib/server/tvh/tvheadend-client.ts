import type { AxiosRequestConfig } from 'axios';
import type { ITVHChannel, ITVHEpgEvent, ITVHResponse, ITVHTag } from '$lib/types/epg-interfaces';
import { HttpClient } from './http-client';
import { serverCfg } from '../globals';

export class TVHeadendClient extends HttpClient {
	// private auth: AxiosBasicCredentials;

	public constructor(_host: string, _port: number, _username: string, _password: string) {
		super(`http://${_host}:${_port}/api/`, { auth: { username: _username, password: _password } });
		// this.auth = { username: _username, password: _password };
		this._initializeRequestInterceptor();
	}

	private _initializeRequestInterceptor() {
		this.instance.interceptors.request.use(this._handleRequestAuth, this._handleError);
	}

	private _handleRequestAuth = (config: AxiosRequestConfig) => {
		//config.auth = this.auth
		return config;
	};
	//    public getEpgGrid = () => this.instance.get<any>('/users');

	public async getChannelGrid(count = 99999): Promise<ITVHResponse<ITVHChannel>> {
		return await this.instance.get<ITVHResponse<ITVHChannel>>('channel/grid', {
			params: { limit: count }
		});
	}
	public async getEpgGrid(count = 99999): Promise<ITVHResponse<ITVHEpgEvent>> {
		const events = await this.instance.get<ITVHResponse<ITVHEpgEvent>>('epg/events/grid', {
			params: { limit: count }
		});
		events.total = events.totalCount;
		return events;
	}
	public async getChannelTags(count = 99999): Promise<ITVHResponse<ITVHTag>> {
		return await this.instance.get<ITVHResponse<ITVHTag>>('channeltag/list', {
			params: { limit: count }
		});
	}

	public async getContentTypes(): Promise<ITVHResponse<ITVHTag>> {
		//api/epg/content_type/list
		return await this.instance.get<ITVHResponse<ITVHTag>>('epg/content_type/list', {
			params: { full: 1 }
		});
	}
}

export function createTVHClient() {
	return new TVHeadendClient(
		serverCfg.tvheadend.host,
		serverCfg.tvheadend.port,
		serverCfg.tvheadend.username,
		serverCfg.tvheadend.password
	);
}
