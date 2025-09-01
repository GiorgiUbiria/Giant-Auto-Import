#!/usr/bin/env tsx

/**
 * Simple test script to verify TypeScript syntax
 */

import { calculateDueAmounts } from "../src/lib/calculator-utils";

function testCalculation() {
    console.log("🧪 Testing calculation function...");

    try {
        const result = calculateDueAmounts(
            {
                purchaseFee: 5000,
                auctionFee: 500,
                gateFee: 79,
                titleFee: 20,
                environmentalFee: 10,
                virtualBidFee: 99,
                shippingFee: 800,
                groundFee: 200,
                oceanFee: 1000,
            },
            {
                groundFeeAdjustment: 50,
                pickupSurcharge: 100,
                serviceFee: 75,
                hybridSurcharge: 150,
            },
            "HYBRID_ELECTRIC"
        );

        console.log("✅ Calculation successful!");
        console.log("Purchase Due:", result.purchaseDue);
        console.log("Shipping Due:", result.shippingDue);
        console.log("Total Due:", result.totalDue);

        return true;
    } catch (error) {
        console.error("❌ Calculation failed:", error);
        return false;
    }
}

// Run test
if (require.main === module) {
    const success = testCalculation();
    if (success) {
        console.log("\n🎉 Syntax test passed!");
        process.exit(0);
    } else {
        console.log("\n💥 Syntax test failed!");
        process.exit(1);
    }
}
