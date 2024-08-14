"use client";

import { useState } from "react";
import { auctionData, oceanShippingRates, extraFees } from "@/lib/utils";
import Image from "next/image";
import Ship from "../../../public/ship.png"

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
		<div className="w-full grid place-items-center">
			<h2 className="text-4xl font-bold mb-4">Shipping Calculator</h2>
			<form className="w-full flex justify-center">
				<div className="w-1/3 p-3 rounded-l-md bg-white flex flex-col justify-evenly items-stretch gap-2">
					<div>
						<label className="text-nowrap mb-0.5 text-xl text-black">
							Car Type
						</label>
						<select
							value={carType}
							onChange={(e) => setCarType(e.target.value)}
							className="block w-full p-2 pl-10 text-sm text-white"
						>
							<option value="">Select Car Type</option>
							<option value="Sedan">Sedan</option>
							<option value="SUV">SUV</option>
							<option value="Truck">Truck</option>
						</select>
					</div>
					<br />
					<div>
						<label className="text-nowrap mb-0.5 text-xl text-black">
							Location
						</label>
						<select
							onChange={(e) => handleAuctionLocationChange(e.target.value)}
							value={auctionLocation}
							className="block w-full p-2 pl-10 text-sm text-white"
						>
							<option value="">Select Auction Location</option>
							{Array.from(new Set(auctionData.map((data) => data.auctionLocation))).map((location) => (
								<option key={location} value={location}>
									{location}
								</option>
							))}
						</select>
					</div>
					<br />
					<div>
						<label className="text-nowrap mb-0.5 text-xl text-black block">
							Auction
						</label>
						<select
							value={auction}
							onChange={(e) => setAuction(e.target.value)}
							className="block w-full p-2 pl-10 text-sm text-white"
						>
							<option value="">Select Auction</option>
							{auctionData.filter((data) => data.auctionLocation === auctionLocation).map((data) => (
								<option key={data.auction} value={data.auction}>
									{data.auction}
								</option>
							))}
						</select>
					</div>
					<br />
					<div>
						<label className="text-nowrap mb-0.5 text-xl text-black">
							USA Port
						</label>
						<select
							value={port}
							onChange={(e) => setPort(e.target.value)}
							className="block w-full p-2 pl-10 text-sm text-white"
						>
							<option value="">Select USA Port</option>
							{availablePorts.map((port) => (
								<option key={port} value={port}>
									{port}
								</option>
							))}
						</select>
					</div>
					<Image
						src={Ship}
						alt="Logo"
						width={250}
						style={{ alignSelf: "center" }}
					/>
				</div>
				<div className="flex flex-col p-3 rounded-r-md bg-blue-500 justify-between">
					<div>
						<label className="block mb-2 text-lg">
							Additional Fees
						</label>
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
					</div>
					<br />
					<p className="text-lg font-semibold">Estimated Fee: <span className="text-xl font-bold">${estimatedFee}</span></p>
					<br />
					<button
						onClick={handleCalculate}
						className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded"
					>
						Calculate Estimated Fee
					</button>
				</div>
			</form>
		</div>
	);
}
