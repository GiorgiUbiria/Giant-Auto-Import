import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { AuctionData } from './drizzle/types';

// Basic calculator state atoms
export const purchaseFeeAtom = atom(0);
export const auctionAtom = atom('');
export const auctionLocationAtom = atom('');
export const portAtom = atom('');
export const additionalFeesAtom = atom<string[]>([]);
export const insuranceAtom = atom(false);
export const estimatedFeeAtom = atom(0);
export const loadingAtom = atom(true);

// Auction data atom
export const auctionDataAtom = atom<AuctionData[]>([]);

// Derived atoms for better performance
export const availableAuctionLocationsAtom = atom((get) => {
    const auctionData = get(auctionDataAtom);
    const selectedAuction = get(auctionAtom);

    if (!selectedAuction) return [];

    return Array.from(
        new Set(
            auctionData
                .filter((data: AuctionData) => data.auction === selectedAuction)
                .map((data: AuctionData) => data.auctionLocation)
        )
    );
});

export const availablePortsAtom = atom((get) => {
    const auctionData = get(auctionDataAtom);
    const selectedAuctionLocation = get(auctionLocationAtom);

    if (!selectedAuctionLocation) return [];

    return auctionData
        .filter((data: AuctionData) => data.auctionLocation === selectedAuctionLocation)
        .map((data: AuctionData) => data.port);
});

// Form validation atom
export const isFormValidAtom = atom((get) => {
    const purchaseFee = get(purchaseFeeAtom);
    const auction = get(auctionAtom);
    const auctionLocation = get(auctionLocationAtom);
    const port = get(portAtom);

    return purchaseFee > 0 && auction && auctionLocation && port;
});

// Calculator style atom (persisted in localStorage)
export const calculatorStyleAtom = atomWithStorage<'a' | 'c'>('calculator-style', 'a');

// User ID atom
export const userIdAtom = atom<string | undefined>(undefined);

// Calculation history atom (persisted in localStorage)
export const calculationHistoryAtom = atomWithStorage<Array<{
    id: string;
    timestamp: number;
    purchaseFee: number;
    auction: string;
    auctionLocation: string;
    port: string;
    additionalFees: string[];
    insurance: boolean;
    estimatedFee: number;
}>>('calculation-history', []);

// Current calculation details atom
export const currentCalculationAtom = atom((get) => {
    const purchaseFee = get(purchaseFeeAtom);
    const auction = get(auctionAtom);
    const auctionLocation = get(auctionLocationAtom);
    const port = get(portAtom);
    const additionalFees = get(additionalFeesAtom);
    const insurance = get(insuranceAtom);
    const estimatedFee = get(estimatedFeeAtom);

    return {
        purchaseFee,
        auction,
        auctionLocation,
        port,
        additionalFees,
        insurance,
        estimatedFee,
    };
});

// Reset all calculator state
export const resetCalculatorAtom = atom(
    null,
    (get, set) => {
        set(purchaseFeeAtom, 0);
        set(auctionAtom, '');
        set(auctionLocationAtom, '');
        set(portAtom, '');
        set(additionalFeesAtom, []);
        set(insuranceAtom, false);
        set(estimatedFeeAtom, 0);
    }
);

// Action atoms for better separation of concerns
export const setAuctionLocationAtom = atom(
    null,
    (get, set, location: string) => {
        set(auctionLocationAtom, location);

        // Auto-select the first available port for this location
        const auctionData = get(auctionDataAtom);
        const availablePorts = auctionData
            .filter((data: AuctionData) => data.auctionLocation === location)
            .map((data: AuctionData) => data.port);

        if (availablePorts.length > 0) {
            set(portAtom, availablePorts[0]);
        }
    }
);

export const setAuctionAtom = atom(
    null,
    (get, set, auction: string) => {
        set(auctionAtom, auction);
        // Reset dependent fields when auction changes
        set(auctionLocationAtom, '');
        set(portAtom, '');
    }
);

export const toggleAdditionalFeeAtom = atom(
    null,
    (get, set, feeType: string) => {
        const currentFees = get(additionalFeesAtom);
        if (currentFees.includes(feeType)) {
            set(additionalFeesAtom, currentFees.filter(f => f !== feeType));
        } else {
            set(additionalFeesAtom, [...currentFees, feeType]);
        }
    }
);

// Save current calculation to history
export const saveCalculationAtom = atom(
    null,
    (get, set) => {
        const currentCalculation = get(currentCalculationAtom);
        const history = get(calculationHistoryAtom);

        if (currentCalculation.estimatedFee > 0) {
            const newEntry = {
                id: Date.now().toString(),
                timestamp: Date.now(),
                ...currentCalculation,
            };

            // Keep only last 10 calculations
            const updatedHistory = [newEntry, ...history.slice(0, 9)];
            set(calculationHistoryAtom, updatedHistory);
        }
    }
);

// Load calculation from history
export const loadCalculationAtom = atom(
    null,
    (get, set, calculationId: string) => {
        const history = get(calculationHistoryAtom);
        const calculation = history.find(calc => calc.id === calculationId);

        if (calculation) {
            set(purchaseFeeAtom, calculation.purchaseFee);
            set(auctionAtom, calculation.auction);
            set(auctionLocationAtom, calculation.auctionLocation);
            set(portAtom, calculation.port);
            set(additionalFeesAtom, calculation.additionalFees);
            set(insuranceAtom, calculation.insurance);
            set(estimatedFeeAtom, calculation.estimatedFee);
        }
    }
);

// Clear calculation history
export const clearHistoryAtom = atom(
    null,
    (get, set) => {
        set(calculationHistoryAtom, []);
    }
); 