"use client";

import { useState } from "react";
import { auctionData, oceanShippingRates, extraFees } from "@/lib/utils";

export function ShippingCalculator() {
	const [carType, setCarType] = useState('');
	const [auctionLocation, setAuctionLocation] = useState('');
	const [auction, setAuction] = useState('');
	const [port, setPort] = useState('');
	const [additionalFees, setAdditionalFees] = useState<string[]>([]);
	const [estimatedFee, setEstimatedFee] = useState(0);

	const handleCalculate = (e: any) => {
		e.preventDefault();
		const auctionRate = auctionData.find((data) => data.auction === auction && data.auctionLocation === auctionLocation)?.rate;
		const oceanRate = oceanShippingRates.find((rate) => rate.shorthand === port)?.rate;
		const extraFeesTotal = additionalFees.reduce((total, fee) => total + (extraFees.find((extraFee) => extraFee.type === fee)?.rate ?? 0), 0);

		console.log(auctionRate, oceanRate, extraFeesTotal)

		if (auctionRate && oceanRate) {
			setEstimatedFee(auctionRate + oceanRate + extraFeesTotal);
		} else {
			setEstimatedFee(0);
		}
	};

	const handleAuctionLocationChange = (location: string) => {
		setAuctionLocation(location);
		setPort('');
	};

	const availablePorts = auctionData.filter((data) => data.auctionLocation === auctionLocation).map((data) => data.port);

	return (
		<div>
			<div className="max-w-md mx-auto p-4 pt-6">
				<h2 className="text-2xl font-bold mb-4">Shipping Calculator</h2>
				<form>
					<label className="block mb-2">
						Car Type:
						<select
							value={carType}
							onChange={(e) => setCarType(e.target.value)}
							className="block w-full p-2 pl-10 text-sm text-gray-700"
						>
							<option value="">Select Car Type</option>
							<option value="Sedan">Sedan</option>
							<option value="SUV">SUV</option>
							<option value="Truck">Truck</option>
						</select>
					</label>
					<br />
					<label className="block mb-2">
						Auction Location:
						<select
							value={auctionLocation}
							onChange={(e) => handleAuctionLocationChange(e.target.value)}
							className="block w-full p-2 pl-10 text-sm text-gray-700"
						>
							<option value="">Select Auction Location</option>
							{Array.from(new Set(auctionData.map((data) => data.auctionLocation))).map((location) => (
								<option key={location} value={location}>
									{location}
								</option>
							))}
						</select>
					</label>
					<br />
					<label className="block mb-2">
						Auction:
						<select
							value={auction}
							onChange={(e) => setAuction(e.target.value)}
							className="block w-full p-2 pl-10 text-sm text-gray-700"
						>
							<option value="">Select Auction</option>
							{auctionData.filter((data) => data.auctionLocation === auctionLocation).map((data) => (
								<option key={data.auction} value={data.auction}>
									{data.auction}
								</option>
							))}
						</select>
					</label>
					<br />
					<label className="block mb-2">
						USA Port:
						<select
							value={port}
							onChange={(e) => setPort(e.target.value)}
							className="block w-full p-2 pl-10 text-sm text-gray-700"
						>
							<option value="">Select USA Port</option>
							{availablePorts.map((port) => (
								<option key={port} value={port}>
									{port}
								</option>
							))}
						</select>
					</label>
					<br />
					<label className="block mb-2">
						Additional Fees:
						{extraFees.map((fee) => (
							<div key={fee.type} className="flex items-center mb-2">
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
									className="mr-2"
								/>
								<span>{fee.type} (${fee.rate})</span>
							</div>
						))}
					</label>
					<br />
					<button
						onClick={handleCalculate}
						className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded"
					>
						Calculate Estimated Fee
					</button>
					<p className="text-lg font-bold">Estimated Fee: ${estimatedFee}</p>
				</form>
			</div>
		</div>
	);
}
