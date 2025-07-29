import { z } from "zod";

const PriceList = z.object({
	auction: z.enum(["Copart", "IAAI"]),
	auctionName: z.string().regex(new RegExp("[A-Z]{2} - [A-Za-z\s\.]+")),
	location: z.string(),
	zip: z.string(),
	port: z.string().regex(new RegExp("[A-Za-z\s]+,\s([A-Za-z]+|[A-Z]{2})")),
	rate: z.number().gt(0),
})

export type PriceList = z.infer<typeof PriceList>;

const OceanFee = z.object({
	state: z.string().regex(new RegExp("[A-Za-z\s]+,\s([A-Za-z]+|[A-Z]{2})")),
	shorthand: z.string().toUpperCase(),
	rate: z.number().gt(0),
})

export type OceanFee = z.infer<typeof OceanFee>;

const ExtraFee = z.object({
	type: z.string(),
	rate: z.number().gt(0),
})

export type ExtraFee = z.infer<typeof ExtraFee>;

const AuctionData = z.object({
	auction: z.string(),
	auctionLocation: z.string(),
	port: z.string(),
	zip: z.string(),
	rate: z.number().gt(0),
})

export type AuctionData = z.infer<typeof AuctionData>;

// New types for user-based pricing system
const UserPricingConfig = z.object({
	id: z.number(),
	userId: z.string(),
	oceanRates: z.array(z.object({
		state: z.string(),
		shorthand: z.string(),
		rate: z.number().min(0),
	})),
	groundFeeAdjustment: z.number(), // Can be negative for decreases
	pickupSurcharge: z.number().min(0),
	serviceFee: z.number().min(0),
	hybridSurcharge: z.number().min(0),
	isActive: z.boolean(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

const DefaultPricingConfig = z.object({
	id: z.number(),
	oceanRates: z.array(z.object({
		state: z.string(),
		shorthand: z.string(),
		rate: z.number().min(0),
	})),
	groundFeeAdjustment: z.number(),
	pickupSurcharge: z.number().min(0),
	serviceFee: z.number().min(0),
	hybridSurcharge: z.number().min(0),
	isActive: z.boolean(),
	updatedAt: z.date(),
});

const CsvDataVersion = z.object({
	id: z.number(),
	versionName: z.string(),
	csvData: z.string(), // JSON string
	isActive: z.boolean(),
	uploadedBy: z.string(),
	uploadedAt: z.date(),
	description: z.string().optional(),
});

export type UserPricingConfig = z.infer<typeof UserPricingConfig>;
export type DefaultPricingConfig = z.infer<typeof DefaultPricingConfig>;
export type CsvDataVersion = z.infer<typeof CsvDataVersion>;
