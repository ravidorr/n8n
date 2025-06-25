import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { PendoClient } from './pendo-client.js';
import {
	PendoConfig,
	GetPagesInputSchema,
	GetAccountsInputSchema,
	GetVisitorsInputSchema,
	GetEventsInputSchema,
	GetFeatureUsageInputSchema,
	GetGuidesInputSchema,
	CreateGuideInputSchema,
	UpdateGuideInputSchema,
} from './types.js';

export class PendoMCPServer {
	public server: Server;
	private pendoClient: PendoClient;

	constructor(config: PendoConfig) {
		this.pendoClient = new PendoClient(config);

		this.server = new Server(
			{
				name: 'pendo-server',
				version: '1.0.0',
				description: 'MCP server for Pendo Engage API integration',
			},
			{
				capabilities: {
					tools: {},
				},
			},
		);

		this.setupHandlers();
	}

	private setupHandlers(): void {
		// List available tools
		this.server.setRequestHandler(ListToolsRequestSchema, async () => {
			return {
				tools: [
					{
						name: 'get_pages',
						description:
							'Get pages from Pendo. Retrieve information about pages tracked in your Pendo application.',
						inputSchema: {
							type: 'object',
							properties: {
								limit: {
									type: 'number',
									description: 'Maximum number of pages to return (1-1000, default: 100)',
									minimum: 1,
									maximum: 1000,
								},
								offset: {
									type: 'number',
									description: 'Number of pages to skip for pagination (default: 0)',
									minimum: 0,
								},
								app_id: {
									type: 'string',
									description: 'Filter pages by application ID',
								},
							},
						},
					},
					{
						name: 'get_accounts',
						description:
							'Get accounts from Pendo. Retrieve information about accounts (organizations) using your application.',
						inputSchema: {
							type: 'object',
							properties: {
								limit: {
									type: 'number',
									description: 'Maximum number of accounts to return (1-1000, default: 100)',
									minimum: 1,
									maximum: 1000,
								},
								offset: {
									type: 'number',
									description: 'Number of accounts to skip for pagination (default: 0)',
									minimum: 0,
								},
								filter: {
									type: 'string',
									description: 'Filter accounts by name or other criteria',
								},
							},
						},
					},
					{
						name: 'get_visitors',
						description:
							'Get visitors from Pendo. Retrieve information about individual users who have visited your application.',
						inputSchema: {
							type: 'object',
							properties: {
								limit: {
									type: 'number',
									description: 'Maximum number of visitors to return (1-1000, default: 100)',
									minimum: 1,
									maximum: 1000,
								},
								offset: {
									type: 'number',
									description: 'Number of visitors to skip for pagination (default: 0)',
									minimum: 0,
								},
								account_id: {
									type: 'string',
									description: 'Filter visitors by account ID',
								},
							},
						},
					},
					{
						name: 'get_events',
						description:
							'Get events from Pendo. Retrieve user interaction events and analytics data.',
						inputSchema: {
							type: 'object',
							properties: {
								visitor_id: {
									type: 'string',
									description: 'Filter events by visitor ID',
								},
								account_id: {
									type: 'string',
									description: 'Filter events by account ID',
								},
								event_name: {
									type: 'string',
									description: 'Filter events by event name/type',
								},
								start_date: {
									type: 'string',
									description: 'Start date for event filtering (YYYY-MM-DD format)',
								},
								end_date: {
									type: 'string',
									description: 'End date for event filtering (YYYY-MM-DD format)',
								},
								limit: {
									type: 'number',
									description: 'Maximum number of events to return (1-1000, default: 100)',
									minimum: 1,
									maximum: 1000,
								},
							},
						},
					},
					{
						name: 'get_feature_usage',
						description:
							'Get feature usage analytics from Pendo. Retrieve data about how features are being used.',
						inputSchema: {
							type: 'object',
							properties: {
								feature_id: {
									type: 'string',
									description: 'Filter by specific feature ID',
								},
								page_id: {
									type: 'string',
									description: 'Filter by specific page ID',
								},
								start_date: {
									type: 'string',
									description: 'Start date for analytics (YYYY-MM-DD format) - required',
								},
								end_date: {
									type: 'string',
									description: 'End date for analytics (YYYY-MM-DD format) - required',
								},
								period: {
									type: 'string',
									enum: ['day', 'week', 'month'],
									description: 'Aggregation period for analytics (default: day)',
								},
							},
							required: ['start_date', 'end_date'],
						},
					},
					{
						name: 'get_guides',
						description:
							'Get guides from Pendo. Retrieve information about in-app guides and walkthroughs.',
						inputSchema: {
							type: 'object',
							properties: {
								state: {
									type: 'string',
									enum: ['active', 'inactive', 'draft', 'all'],
									description: 'Filter guides by state (default: all)',
								},
								limit: {
									type: 'number',
									description: 'Maximum number of guides to return (1-1000, default: 100)',
									minimum: 1,
									maximum: 1000,
								},
								offset: {
									type: 'number',
									description: 'Number of guides to skip for pagination (default: 0)',
									minimum: 0,
								},
							},
						},
					},
					{
						name: 'create_guide',
						description:
							'Create a new guide in Pendo. Build in-app guides and walkthroughs for your users.',
						inputSchema: {
							type: 'object',
							properties: {
								name: {
									type: 'string',
									description: 'Name of the guide - required',
								},
								steps: {
									type: 'array',
									description: 'Array of guide steps - required',
									items: {
										type: 'object',
										properties: {
											type: {
												type: 'string',
												description: 'Step type (e.g., tooltip, modal, banner)',
											},
											element: {
												type: 'string',
												description: 'CSS selector for the target element',
											},
											content: {
												type: 'string',
												description: 'Content/text for the step',
											},
										},
										required: ['type'],
									},
								},
								launch_method: {
									type: 'string',
									enum: ['auto', 'badge', 'dom'],
									description: 'How the guide should be launched (default: auto)',
								},
								targeting: {
									type: 'object',
									description: 'Targeting rules for the guide',
									properties: {
										visitor_rules: {
											type: 'array',
											description: 'Rules for targeting specific visitors',
										},
										account_rules: {
											type: 'array',
											description: 'Rules for targeting specific accounts',
										},
										page_rules: {
											type: 'array',
											description: 'Rules for targeting specific pages',
										},
									},
								},
							},
							required: ['name', 'steps'],
						},
					},
					{
						name: 'update_guide',
						description:
							'Update an existing guide in Pendo. Modify guide properties, steps, or targeting.',
						inputSchema: {
							type: 'object',
							properties: {
								guide_id: {
									type: 'string',
									description: 'ID of the guide to update - required',
								},
								name: {
									type: 'string',
									description: 'New name for the guide',
								},
								state: {
									type: 'string',
									enum: ['active', 'inactive', 'draft'],
									description: 'New state for the guide',
								},
								steps: {
									type: 'array',
									description: 'Updated array of guide steps',
									items: {
										type: 'object',
										properties: {
											type: {
												type: 'string',
												description: 'Step type',
											},
											element: {
												type: 'string',
												description: 'CSS selector for the target element',
											},
											content: {
												type: 'string',
												description: 'Content/text for the step',
											},
										},
									},
								},
							},
							required: ['guide_id'],
						},
					},
					{
						name: 'delete_guide',
						description: 'Delete a guide from Pendo. Permanently remove a guide and all its data.',
						inputSchema: {
							type: 'object',
							properties: {
								guide_id: {
									type: 'string',
									description: 'ID of the guide to delete - required',
								},
							},
							required: ['guide_id'],
						},
					},
					{
						name: 'get_account',
						description:
							'Get a specific account by ID from Pendo. Retrieve detailed information about a single account.',
						inputSchema: {
							type: 'object',
							properties: {
								account_id: {
									type: 'string',
									description: 'ID of the account to retrieve - required',
								},
							},
							required: ['account_id'],
						},
					},
					{
						name: 'get_visitor',
						description:
							'Get a specific visitor by ID from Pendo. Retrieve detailed information about a single visitor.',
						inputSchema: {
							type: 'object',
							properties: {
								visitor_id: {
									type: 'string',
									description: 'ID of the visitor to retrieve - required',
								},
							},
							required: ['visitor_id'],
						},
					},
					{
						name: 'get_page',
						description:
							'Get a specific page by ID from Pendo. Retrieve detailed information about a single page.',
						inputSchema: {
							type: 'object',
							properties: {
								page_id: {
									type: 'string',
									description: 'ID of the page to retrieve - required',
								},
							},
							required: ['page_id'],
						},
					},
					{
						name: 'test_connection',
						description:
							'Test the connection to Pendo API. Verify that the API credentials are working.',
						inputSchema: {
							type: 'object',
							properties: {},
						},
					},
				],
			};
		});

		// Handle tool calls
		this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
			const { name, arguments: args } = request.params;

			try {
				switch (name) {
					case 'get_pages': {
						const validatedArgs = GetPagesInputSchema.parse(args);
						const result = await this.pendoClient.getPages(validatedArgs);
						return {
							content: [
								{
									type: 'text',
									text: JSON.stringify(result, null, 2),
								},
							],
						};
					}

					case 'get_accounts': {
						const validatedArgs = GetAccountsInputSchema.parse(args);
						const result = await this.pendoClient.getAccounts(validatedArgs);
						return {
							content: [
								{
									type: 'text',
									text: JSON.stringify(result, null, 2),
								},
							],
						};
					}

					case 'get_visitors': {
						const validatedArgs = GetVisitorsInputSchema.parse(args);
						const result = await this.pendoClient.getVisitors(validatedArgs);
						return {
							content: [
								{
									type: 'text',
									text: JSON.stringify(result, null, 2),
								},
							],
						};
					}

					case 'get_events': {
						const validatedArgs = GetEventsInputSchema.parse(args);
						const result = await this.pendoClient.getEvents(validatedArgs);
						return {
							content: [
								{
									type: 'text',
									text: JSON.stringify(result, null, 2),
								},
							],
						};
					}

					case 'get_feature_usage': {
						const validatedArgs = GetFeatureUsageInputSchema.parse(args);
						const result = await this.pendoClient.getFeatureUsage(validatedArgs);
						return {
							content: [
								{
									type: 'text',
									text: JSON.stringify(result, null, 2),
								},
							],
						};
					}

					case 'get_guides': {
						const validatedArgs = GetGuidesInputSchema.parse(args);
						const result = await this.pendoClient.getGuides(validatedArgs);
						return {
							content: [
								{
									type: 'text',
									text: JSON.stringify(result, null, 2),
								},
							],
						};
					}

					case 'create_guide': {
						const validatedArgs = CreateGuideInputSchema.parse(args);
						const result = await this.pendoClient.createGuide(validatedArgs);
						return {
							content: [
								{
									type: 'text',
									text: JSON.stringify(result, null, 2),
								},
							],
						};
					}

					case 'update_guide': {
						const validatedArgs = UpdateGuideInputSchema.parse(args);
						const result = await this.pendoClient.updateGuide(validatedArgs);
						return {
							content: [
								{
									type: 'text',
									text: JSON.stringify(result, null, 2),
								},
							],
						};
					}

					case 'delete_guide': {
						if (!args || typeof args !== 'object' || !('guide_id' in args)) {
							throw new Error('guide_id is required');
						}
						const guideId = String(args.guide_id);
						await this.pendoClient.deleteGuide(guideId);
						return {
							content: [
								{
									type: 'text',
									text: `Guide ${guideId} deleted successfully`,
								},
							],
						};
					}

					case 'get_account': {
						if (!args || typeof args !== 'object' || !('account_id' in args)) {
							throw new Error('account_id is required');
						}
						const accountId = String(args.account_id);
						const result = await this.pendoClient.getAccount(accountId);
						return {
							content: [
								{
									type: 'text',
									text: JSON.stringify(result, null, 2),
								},
							],
						};
					}

					case 'get_visitor': {
						if (!args || typeof args !== 'object' || !('visitor_id' in args)) {
							throw new Error('visitor_id is required');
						}
						const visitorId = String(args.visitor_id);
						const result = await this.pendoClient.getVisitor(visitorId);
						return {
							content: [
								{
									type: 'text',
									text: JSON.stringify(result, null, 2),
								},
							],
						};
					}

					case 'get_page': {
						if (!args || typeof args !== 'object' || !('page_id' in args)) {
							throw new Error('page_id is required');
						}
						const pageId = String(args.page_id);
						const result = await this.pendoClient.getPage(pageId);
						return {
							content: [
								{
									type: 'text',
									text: JSON.stringify(result, null, 2),
								},
							],
						};
					}

					case 'test_connection': {
						const isConnected = await this.pendoClient.testConnection();
						return {
							content: [
								{
									type: 'text',
									text: isConnected
										? 'Connection to Pendo API successful!'
										: 'Failed to connect to Pendo API. Please check your API key and configuration.',
								},
							],
						};
					}

					default:
						throw new Error(`Unknown tool: ${name}`);
				}
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
				return {
					content: [
						{
							type: 'text',
							text: `Error: ${errorMessage}`,
						},
					],
					isError: true,
				};
			}
		});
	}

	async run(): Promise<void> {
		const transport = new StdioServerTransport();
		await this.server.connect(transport);
		console.error('Pendo MCP server running on stdio transport');
	}
}
