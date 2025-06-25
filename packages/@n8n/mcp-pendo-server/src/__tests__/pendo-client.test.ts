import { PendoClient } from '../pendo-client';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('PendoClient', () => {
	let pendoClient: PendoClient;
	const mockConfig = {
		apiKey: 'test-api-key',
		baseUrl: 'https://test-api.pendo.io',
	};

	beforeEach(() => {
		pendoClient = new PendoClient(mockConfig);
		// Reset all mocks
		jest.clearAllMocks();

		// Mock axios.create
		const mockAxiosInstance = {
			get: jest.fn(),
			post: jest.fn(),
			put: jest.fn(),
			delete: jest.fn(),
			interceptors: {
				response: {
					use: jest.fn(),
				},
			},
		};

		mockedAxios.create.mockReturnValue(mockAxiosInstance as any);
	});

	describe('constructor', () => {
		it('should create axios instance with correct config', () => {
			expect(mockedAxios.create).toHaveBeenCalledWith({
				baseURL: mockConfig.baseUrl,
				headers: {
					Authorization: `Bearer ${mockConfig.apiKey}`,
					'Content-Type': 'application/json',
				},
				timeout: 30000,
			});
		});

		it('should use default baseURL when not provided', () => {
			const configWithoutUrl = { apiKey: 'test-key' };
			new PendoClient(configWithoutUrl);

			expect(mockedAxios.create).toHaveBeenCalledWith({
				baseURL: 'https://engageapi.pendo.io',
				headers: {
					Authorization: `Bearer ${configWithoutUrl.apiKey}`,
					'Content-Type': 'application/json',
				},
				timeout: 30000,
			});
		});
	});

	describe('getPages', () => {
		it('should call correct endpoint with parameters', async () => {
			const mockResponse = { data: [{ id: '1', name: 'Test Page' }] };
			const mockAxiosInstance = mockedAxios.create();
			mockAxiosInstance.get = jest.fn().mockResolvedValue(mockResponse);

			const input = { limit: 50, offset: 10, app_id: 'test-app' };

			// Create a new client to get the fresh axios instance
			const client = new PendoClient(mockConfig);

			// Mock the internal client property
			(client as any).client = mockAxiosInstance;

			const result = await client.getPages(input);

			expect(mockAxiosInstance.get).toHaveBeenCalledWith(
				'/api/v1/pages?limit=50&offset=10&app_id=test-app',
			);
			expect(result).toEqual(mockResponse.data);
		});

		it('should handle empty parameters', async () => {
			const mockResponse = { data: [] };
			const mockAxiosInstance = mockedAxios.create();
			mockAxiosInstance.get = jest.fn().mockResolvedValue(mockResponse);

			const client = new PendoClient(mockConfig);
			(client as any).client = mockAxiosInstance;

			const result = await client.getPages({});

			expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/v1/pages?');
			expect(result).toEqual(mockResponse.data);
		});
	});

	describe('testConnection', () => {
		it('should return true when health endpoint succeeds', async () => {
			const mockAxiosInstance = mockedAxios.create();
			mockAxiosInstance.get = jest.fn().mockResolvedValue({ data: 'OK' });

			const client = new PendoClient(mockConfig);
			(client as any).client = mockAxiosInstance;

			const result = await client.testConnection();

			expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/v1/health');
			expect(result).toBe(true);
		});

		it('should fallback to getPages when health endpoint fails', async () => {
			const mockAxiosInstance = mockedAxios.create();
			mockAxiosInstance.get = jest
				.fn()
				.mockRejectedValueOnce(new Error('Health endpoint not found'))
				.mockResolvedValueOnce({ data: [] });

			const client = new PendoClient(mockConfig);
			(client as any).client = mockAxiosInstance;

			const result = await client.testConnection();

			expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/v1/health');
			expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/v1/pages?limit=1');
			expect(result).toBe(true);
		});

		it('should return false when both endpoints fail', async () => {
			const mockAxiosInstance = mockedAxios.create();
			mockAxiosInstance.get = jest
				.fn()
				.mockRejectedValueOnce(new Error('Health endpoint not found'))
				.mockRejectedValueOnce(new Error('Pages endpoint failed'));

			const client = new PendoClient(mockConfig);
			(client as any).client = mockAxiosInstance;

			const result = await client.testConnection();

			expect(result).toBe(false);
		});
	});
});
