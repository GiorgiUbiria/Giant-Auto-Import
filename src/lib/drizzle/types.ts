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