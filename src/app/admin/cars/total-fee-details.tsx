"use client";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Separator } from "@/components/ui/separator"

type Props = {
  purchaseFee: number;
  auctionFee: number;
  gateFee: number;
  titleFee: number;
  environmentalFee: number;
  virtualBidFee: number;
  shippingFee: number;
  groundFee: number;
  oceanFee: number;
  totalFee: number;
}

export const TotalFeeDetails = ({ purchaseFee, auctionFee, gateFee, titleFee, environmentalFee, virtualBidFee, shippingFee, groundFee, oceanFee, totalFee }: Props) => {
  return (
    <div>
      <HoverCard>
        <HoverCardTrigger>
          <p className="hover:text-primary/50 transition-all">{totalFee}</p>
        </HoverCardTrigger>
        <HoverCardContent>
          <div>
            <h3 className="font-bold mb-2">Total Purchase Fee: {purchaseFee + auctionFee + gateFee + titleFee + environmentalFee + virtualBidFee}$</h3>
            <ul className="list-none pl-4 mb-4">
              <li>Base Purchase Fee: {purchaseFee }$</li>
              <li>+ Auction Fee: {auctionFee}$</li>
              <li>+ Gate Fee: {gateFee}$</li>
              <li>+ Title Fee: {titleFee}$</li>
              <li>+ Environmental Fee: {environmentalFee}$</li>
              <li>+ Virtual Bid Fee: {virtualBidFee}$</li>
            </ul>
            <p className="font-semibold text-sm pl-4">= Total Purchase Fee: {purchaseFee}$</p>
            <Separator className="my-2" />
            <h3 className="font-bold mb-2">Shipping Fee: {shippingFee}$</h3>
            <ul className="list-none pl-4">
              <li>Ground Fee: {groundFee}$</li>
              <li>Ocean Fee: {oceanFee}$</li>
            </ul>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
} 
