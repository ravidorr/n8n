import { z } from 'zod';

// Pendo API Configuration
export interface PendoConfig {
	apiKey: string;
	baseUrl?: string;
}

// Pendo API Response schemas
export const PendoPageSchema = z.object({
	id: z.string(),
	name: z.string(),
	url: z.string(),
	title: z.string().optional(),
	created_by: z.string().optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
	app_id: z.string().optional(),
});

export const PendoAccountSchema = z.object({
	id: z.string(),
	name: z.string(),
	metadata: z.record(z.any()).optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
});

export const PendoVisitorSchema = z.object({
	id: z.string(),
	visitor_id: z.string(),
	account_id: z.string().optional(),
	metadata: z.record(z.any()).optional(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
});

export const PendoEventSchema = z.object({
	id: z.string(),
	event: z.string(),
	visitor_id: z.string(),
	account_id: z.string().optional(),
	timestamp: z.number(),
	properties: z.record(z.any()).optional(),
});

export const PendoFeatureUsageSchema = z.object({
	feature_id: z.string(),
	feature_name: z.string(),
	page_id: z.string(),
	page_name: z.string(),
	usage_count: z.number(),
	unique_visitors: z.number(),
	period: z.string(),
});

export const PendoGuideSchema = z.object({
	id: z.string(),
	name: z.string(),
	state: z.enum(['active', 'inactive', 'draft']),
	created_at: z.string(),
	updated_at: z.string(),
	steps: z
		.array(
			z.object({
				id: z.string(),
				type: z.string(),
				element: z.string().optional(),
				content: z.string().optional(),
			}),
		)
		.optional(),
});

// Tool input schemas
export const GetPagesInputSchema = z.object({
	limit: z.number().min(1).max(1000).optional().default(100),
	offset: z.number().min(0).optional().default(0),
	app_id: z.string().optional(),
});

export const GetAccountsInputSchema = z.object({
	limit: z.number().min(1).max(1000).optional().default(100),
	offset: z.number().min(0).optional().default(0),
	filter: z.string().optional(),
});

export const GetVisitorsInputSchema = z.object({
	limit: z.number().min(1).max(1000).optional().default(100),
	offset: z.number().min(0).optional().default(0),
	account_id: z.string().optional(),
});

export const GetEventsInputSchema = z.object({
	visitor_id: z.string().optional(),
	account_id: z.string().optional(),
	event_name: z.string().optional(),
	start_date: z.string().optional(),
	end_date: z.string().optional(),
	limit: z.number().min(1).max(1000).optional().default(100),
});

export const GetFeatureUsageInputSchema = z.object({
	feature_id: z.string().optional(),
	page_id: z.string().optional(),
	start_date: z.string(),
	end_date: z.string(),
	period: z.enum(['day', 'week', 'month']).optional().default('day'),
});

export const GetGuidesInputSchema = z.object({
	state: z.enum(['active', 'inactive', 'draft', 'all']).optional().default('all'),
	limit: z.number().min(1).max(1000).optional().default(100),
	offset: z.number().min(0).optional().default(0),
});

export const CreateGuideInputSchema = z.object({
	name: z.string(),
	steps: z.array(
		z.object({
			type: z.string(),
			element: z.string().optional(),
			content: z.string().optional(),
		}),
	),
	launch_method: z.enum(['auto', 'badge', 'dom']).optional().default('auto'),
	targeting: z
		.object({
			visitor_rules: z.array(z.record(z.any())).optional(),
			account_rules: z.array(z.record(z.any())).optional(),
			page_rules: z.array(z.record(z.any())).optional(),
		})
		.optional(),
});

export const UpdateGuideInputSchema = z.object({
	guide_id: z.string(),
	name: z.string().optional(),
	state: z.enum(['active', 'inactive', 'draft']).optional(),
	steps: z
		.array(
			z.object({
				type: z.string(),
				element: z.string().optional(),
				content: z.string().optional(),
			}),
		)
		.optional(),
});

// Type definitions
export type PendoPage = z.infer<typeof PendoPageSchema>;
export type PendoAccount = z.infer<typeof PendoAccountSchema>;
export type PendoVisitor = z.infer<typeof PendoVisitorSchema>;
export type PendoEvent = z.infer<typeof PendoEventSchema>;
export type PendoFeatureUsage = z.infer<typeof PendoFeatureUsageSchema>;
export type PendoGuide = z.infer<typeof PendoGuideSchema>;

export type GetPagesInput = z.infer<typeof GetPagesInputSchema>;
export type GetAccountsInput = z.infer<typeof GetAccountsInputSchema>;
export type GetVisitorsInput = z.infer<typeof GetVisitorsInputSchema>;
export type GetEventsInput = z.infer<typeof GetEventsInputSchema>;
export type GetFeatureUsageInput = z.infer<typeof GetFeatureUsageInputSchema>;
export type GetGuidesInput = z.infer<typeof GetGuidesInputSchema>;
export type CreateGuideInput = z.infer<typeof CreateGuideInputSchema>;
export type UpdateGuideInput = z.infer<typeof UpdateGuideInputSchema>;
