import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
	PendoConfig,
	PendoPage,
	PendoAccount,
	PendoVisitor,
	PendoEvent,
	PendoFeatureUsage,
	PendoGuide,
	GetPagesInput,
	GetAccountsInput,
	GetVisitorsInput,
	GetEventsInput,
	GetFeatureUsageInput,
	GetGuidesInput,
	CreateGuideInput,
	UpdateGuideInput,
} from './types.js';

export class PendoClient {
	private client: AxiosInstance;
	private config: PendoConfig;

	constructor(config: PendoConfig) {
		this.config = config;
		const baseURL = config.baseUrl || 'https://engageapi.pendo.io';

		this.client = axios.create({
			baseURL,
			headers: {
				'x-pendo-integration-key': config.apiKey,
				'Content-Type': 'application/json',
			},
			timeout: 30000,
		});

		// Add response interceptor for error handling
		this.client.interceptors.response.use(
			(response) => response,
			(error) => {
				if (error.response) {
					const status = error.response.status;
					const message = error.response.data?.message || error.response.statusText;
					throw new Error(`Pendo API Error (${status}): ${message}`);
				} else if (error.request) {
					throw new Error('Network error: Unable to reach Pendo API');
				} else {
					throw new Error(`Request error: ${error.message}`);
				}
			},
		);
	}

	/**
	 * Get pages from Pendo
	 */
	async getPages(input: GetPagesInput): Promise<PendoPage[]> {
		const params = new URLSearchParams();

		if (input.limit) params.append('limit', input.limit.toString());
		if (input.offset) params.append('offset', input.offset.toString());
		if (input.app_id) params.append('app_id', input.app_id);

		const response: AxiosResponse<PendoPage[]> = await this.client.get(`/api/v1/pages?${params}`);
		return response.data || [];
	}

	/**
	 * Get accounts from Pendo
	 */
	async getAccounts(input: GetAccountsInput): Promise<PendoAccount[]> {
		const params = new URLSearchParams();

		if (input.limit) params.append('limit', input.limit.toString());
		if (input.offset) params.append('offset', input.offset.toString());
		if (input.filter) params.append('filter', input.filter);

		const response: AxiosResponse<PendoAccount[]> = await this.client.get(
			`/api/v1/accounts?${params}`,
		);
		return response.data || [];
	}

	/**
	 * Get visitors from Pendo
	 */
	async getVisitors(input: GetVisitorsInput): Promise<PendoVisitor[]> {
		const params = new URLSearchParams();

		if (input.limit) params.append('limit', input.limit.toString());
		if (input.offset) params.append('offset', input.offset.toString());
		if (input.account_id) params.append('account_id', input.account_id);

		const response: AxiosResponse<PendoVisitor[]> = await this.client.get(
			`/api/v1/visitors?${params}`,
		);
		return response.data || [];
	}

	/**
	 * Get events from Pendo
	 */
	async getEvents(input: GetEventsInput): Promise<PendoEvent[]> {
		const params = new URLSearchParams();

		if (input.visitor_id) params.append('visitor_id', input.visitor_id);
		if (input.account_id) params.append('account_id', input.account_id);
		if (input.event_name) params.append('event_name', input.event_name);
		if (input.start_date) params.append('start_date', input.start_date);
		if (input.end_date) params.append('end_date', input.end_date);
		if (input.limit) params.append('limit', input.limit.toString());

		const response: AxiosResponse<PendoEvent[]> = await this.client.get(`/api/v1/events?${params}`);
		return response.data;
	}

	/**
	 * Get feature usage analytics from Pendo
	 */
	async getFeatureUsage(input: GetFeatureUsageInput): Promise<PendoFeatureUsage[]> {
		const params = new URLSearchParams();

		if (input.feature_id) params.append('feature_id', input.feature_id);
		if (input.page_id) params.append('page_id', input.page_id);
		params.append('start_date', input.start_date);
		params.append('end_date', input.end_date);
		if (input.period) params.append('period', input.period);

		const response: AxiosResponse<PendoFeatureUsage[]> = await this.client.get(
			`/api/v1/analytics/feature-usage?${params}`,
		);
		return response.data;
	}

	/**
	 * Get guides from Pendo
	 */
	async getGuides(input: GetGuidesInput): Promise<PendoGuide[]> {
		const params = new URLSearchParams();

		if (input.state && input.state !== 'all') params.append('state', input.state);
		if (input.limit) params.append('limit', input.limit.toString());
		if (input.offset) params.append('offset', input.offset.toString());

		const response: AxiosResponse<PendoGuide[]> = await this.client.get(`/api/v1/guides?${params}`);
		return response.data;
	}

	/**
	 * Create a new guide in Pendo
	 */
	async createGuide(input: CreateGuideInput): Promise<PendoGuide> {
		const response: AxiosResponse<PendoGuide> = await this.client.post('/api/v1/guides', input);
		return response.data;
	}

	/**
	 * Update an existing guide in Pendo
	 */
	async updateGuide(input: UpdateGuideInput): Promise<PendoGuide> {
		const { guide_id, ...updateData } = input;
		const response: AxiosResponse<PendoGuide> = await this.client.put(
			`/api/v1/guides/${guide_id}`,
			updateData,
		);
		return response.data;
	}

	/**
	 * Delete a guide from Pendo
	 */
	async deleteGuide(guideId: string): Promise<void> {
		await this.client.delete(`/api/v1/guides/${guideId}`);
	}

	/**
	 * Get account details by ID
	 */
	async getAccount(accountId: string): Promise<PendoAccount> {
		const response: AxiosResponse<PendoAccount> = await this.client.get(
			`/api/v1/account/${accountId}`,
		);
		return response.data;
	}

	/**
	 * Get visitor details by ID
	 */
	async getVisitor(visitorId: string): Promise<PendoVisitor> {
		const response: AxiosResponse<PendoVisitor> = await this.client.get(
			`/api/v1/visitor/${visitorId}`,
		);
		return response.data;
	}

	/**
	 * Get page details by ID
	 */
	async getPage(pageId: string): Promise<PendoPage> {
		const response: AxiosResponse<PendoPage> = await this.client.get(`/api/v1/page/${pageId}`);
		return response.data;
	}

	/**
	 * Test the API connection
	 */
	async testConnection(): Promise<boolean> {
		try {
			// Try to get a specific visitor to test the connection
			// Using 'test' as a visitor ID that might not exist, but will test auth
			const response = await this.client.get('/api/v1/visitor/test');
			return true; // If we get here without an error, connection is good
		} catch (error: any) {
			// If we get a 404, that's fine - it means the API is working but the visitor doesn't exist
			// If we get a 401/403, that means auth failed
			if (error.message && error.message.includes('404')) {
				return true; // API is working, just no visitor found
			}
			return false;
		}
	}
}
