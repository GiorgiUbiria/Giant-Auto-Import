"use client";

import { useState } from "react";
import { auctionData, oceanShippingRates, extraFees, styleToJson } from "@/lib/utils";

export function ShippingCalculator() {
	const [auctionLocation, setAuctionLocation] = useState('');
	const [auction, setAuction] = useState('');
	const [purchaseFee, setPurchaseFee] = useState(0);
	const [port, setPort] = useState('');
	const [additionalFees, setAdditionalFees] = useState<string[]>([]);
	const [insurance, setInsurance] = useState(false);
	const [estimatedFee, setEstimatedFee] = useState(0);

	const aStyleData = styleToJson("a");
	const cStyleData = styleToJson("c");

	const calculateFee = (feeData: any[], purchaseFee: number): number => {
		for (const entry of feeData) {
			if (purchaseFee >= entry.minPrice && (typeof entry.maxPrice === 'string' || purchaseFee <= entry.maxPrice)) {
				return typeof entry.fee === 'string'
					? (purchaseFee * parseFloat(entry.fee) / 100)
					: entry.fee;
			}
		}
		return 0;
	};

	const handleCalculate = (e: any) => {
		e.preventDefault();

		const auctionRate = auctionData.find((data) => data.auction === auction && data.auctionLocation === auctionLocation)?.rate;
		const oceanRate = oceanShippingRates.find((rate) => rate.shorthand === availablePort)?.rate;
		const extraFeesTotal = additionalFees.reduce((total, fee) => total + (extraFees.find((extraFee) => extraFee.type === fee)?.rate ?? 0), 0);

		let fee = auction === "a" ? calculateFee(aStyleData, purchaseFee) : calculateFee(cStyleData, purchaseFee);

		const gateFee = 79;
		const titleFee = 20;
		const environmentalFee = 10;

		if (auctionRate && oceanRate && purchaseFee && fee) {
			let totalFee = auctionRate + oceanRate + extraFeesTotal + fee + purchaseFee + gateFee + titleFee + environmentalFee;
			if (insurance === true) {
				totalFee = totalFee + (totalFee * 1.5 / 100)
			}
			setEstimatedFee(totalFee);
		} else {
			setEstimatedFee(0);
		}
	};

	const handleAuctionLocationChange = (location: string) => {
		setAuctionLocation(location);
		setPort('');
	};

	const handleAuctionChange = (auction: string) => {
		setAuction(auction);
		setAuctionLocation('');
		setPort('');
	};

	const availablePorts = auctionData.filter((data) => data.auctionLocation === auctionLocation).map((data) => data.port); const [availablePort] = availablePorts;
	return (
		<div className="w-full grid place-items-center mb-4">
			<h2 className="text-4xl font-bold my-4 text-white drop-shadow-[0_1.3px_1.3px_rgba(0,0,0,1)]">Shipping Calculator</h2>
			<form className="w-full flex justify-center">
				<div className="w-full md:w-1/3 p-3 bg-gray-900/40 flex flex-col justify-evenly items-stretch gap-2 rounded-l-lg">
					<div className="flex flex-col gap-2">
						<label className="text-nowrap text-xl text-white font-bold shadow-sm block">
							Enter your bid
						</label>
						<input
							value={purchaseFee}
							onChange={(e) => setPurchaseFee(parseFloat(e.target.value))}
							type="number"
							className="block w-full p-2 pl-10 text-sm text-black bg-white rounded-md"
						/>
					</div>
					<br />
					<div className="flex flex-col gap-2">
						<label className="text-nowrap text-xl text-white font-bold shadow-sm block">
							Select auction
						</label>
						<select
							value={auction}
							onChange={(e) => handleAuctionChange(e.target.value)}
							className="block w-full p-2 pl-10 text-sm text-black bg-white rounded-md"
						>
							<option value="">Select Auction</option>
							<option value="Copart"> Copart </option>
							<option value="IAAI"> IAAI </option>
						</select>
					</div>
					<br />
					<div className="flex flex-col gap-2">
						<label className="text-nowrap text-xl text-white font-bold shadow-sm">
							Select an auction location
						</label>
						<select
							onChange={(e) => handleAuctionLocationChange(e.target.value)}
							value={auctionLocation}
							className="block w-full p-2 pl-10 text-sm text-black bg-white rounded-md"
						>
							<option value="">Select Auction Location</option>
							{Array.from(new Set(auctionData.filter((data) => data.auction === auction).map((data) => data.auctionLocation))).map((location) => (
								<option key={location} value={location}>
									{location}
								</option>
							))}
						</select>
					</div>
					<br />
					<div className="flex flex-col gap-2">
						<label className="text-nowrap text-xl text-white font-bold shadow-sm">
							From USA Port
						</label>
						<select
							value={port}
							onChange={(e) => setPort(e.target.value)}
							className="block w-full p-2 pl-10 text-sm text-black bg-white rounded-md"
							disabled
						>
							{availablePorts.map((port) => (
								<option key={port} value={port}>
									{port}
								</option>
							))}
						</select>
					</div>
					<div className="flex flex-col gap-2">
						<label className="text-nowrap text-xl text-white font-bold shadow-sm">
							Destination Port
						</label>
						<select
							value="Poti"
							className="block w-full p-2 pl-10 text-sm text-black bg-white rounded-md"
							disabled
						>
							<option value="Poti"> Poti </option>
						</select>
					</div>
				</div>
				<div className="flex md:w-1/3 flex-col p-3 bg-black/40 justify-between rounded-r-lg">
					<div className="flex flex-col gap-2">
						<label className="block text-lg text-white font-semibold">
							Additional Fees
						</label>
						<div className="flex gap-x-2">
							{extraFees.map((fee) => (
								<div key={fee.type} className="flex items-center text-white">
									<input
										type="checkbox"
										checked={additionalFees.includes(fee.type)}
										onChange={(e) => {
											if (e.target.checked) {
												setAdditionalFees([...additionalFees, fee.type]);
											} else {
												setAdditionalFees(additionalFees.filter((f) => f !== fee.type));
											}
										}}
										className="mr-1"
									/>
									<span>{fee.type} (${fee.rate})</span>
								</div>
							))}
							<div className="flex items-center text-white">
								<input
									type="checkbox"
									checked={insurance === true}
									onChange={(e) => {
										if (e.target.checked) {
											setInsurance(true);
										} else {
											setInsurance(false);
										}
									}}
									className="mr-2"
								/>
								<span>Insurance (1.5%)</span>
							</div>
						</div>
					</div>
					<div>
						<p className="text-lg font-semibold text-white">Estimated Total Fee: <span className="text-xl font-bold">${estimatedFee}</span></p>
						<br />
						<button
							onClick={handleCalculate}
							className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded"
						>
							Calculate
						</button>
					</div>
				</div>
			</form>
		</div>
	);
}
