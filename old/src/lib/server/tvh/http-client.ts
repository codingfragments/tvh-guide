import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

declare module 'axios' {
	// eslint-disable-next-line @typescript-eslint/no-empty-interface,@typescript-eslint/no-explicit-any
	interface AxiosResponse<T = any> extends Promise<T> {}
}

export abstract class HttpClient {
	protected readonly instance: AxiosInstance;

	public constructor(baseURL: string, opts: AxiosRequestConfig = {}) {
		this.instance = axios.create({
			baseURL,
			...opts
		});

		this._initializeResponseInterceptor();
	}

	private _initializeResponseInterceptor() {
		this.instance.interceptors.response.use(this._handleResponse, this._handleError);
	}

	private _handleResponse = ({ data }: AxiosResponse) => data;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	protected _handleError = (error: any) => Promise.reject(error);
}
