"use client";

import { useId, useState } from "react";

type Tier = {
  min: number;
  max: number;
  price: number;
  message: string;
};

const TIERS: Tier[] = [
  { min: 100, max: 499, price: 1.2, message: "Base rate unlocked" },
  { min: 500, max: 1999, price: 0.9, message: "You've unlocked 25% off" },
  { min: 2000, max: 4999, price: 0.7, message: "You've unlocked 42% off" },
  { min: 5000, max: 14999, price: 0.5, message: "You've unlocked 58% off" },
  { min: 15000, max: Infinity, price: 0.4, message: "You've unlocked our highest bulk discount" },
];

const MIN_ORDER = 500;

function getTier(records: number): Tier {
  return TIERS.find((t) => records >= t.min && records <= t.max) ?? TIERS[0];
}

const USD = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const USD_FRACTIONAL = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

export function SliderCalculator() {
  const [records, setRecords] = useState(500);
  const sliderId = useId();
  const tier = getTier(records);
  const computedTotal = records * tier.price;
  const total = Math.max(MIN_ORDER, computedTotal);
  const enforcedMinimum = total > computedTotal;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-wider text-cyan-700">Bulk pricing</p>
      <h3 className="mt-2 text-xl font-black text-slate-950">See your price as you build your list</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Select your estimated record count. As your order grows, your price per record drops automatically.
        Minimum order is {USD(MIN_ORDER)}.
      </p>

      <div className="mt-6">
        <label htmlFor={sliderId} className="flex items-center justify-between gap-3 text-sm">
          <span className="font-semibold text-slate-700">Estimated contacts selected</span>
          <span className="text-xl font-black tabular-nums text-slate-950">
            {records.toLocaleString()}
            {records >= 15000 ? "+" : ""}
          </span>
        </label>
        <input
          id={sliderId}
          type="range"
          min={100}
          max={15000}
          step={50}
          value={records}
          onChange={(e) => setRecords(Number(e.target.value))}
          aria-valuetext={`${records.toLocaleString()} records at ${USD_FRACTIONAL(tier.price)} each — ${tier.message}. Total ${USD(total)}.`}
          className="mt-2 w-full cursor-pointer accent-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
        />
        <div className="mt-1 flex justify-between text-xs text-slate-500">
          <span>100</span>
          <span>5,000</span>
          <span>15,000+</span>
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-md bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Your current estimated price
          </p>
          <p className="mt-1 text-3xl font-black tabular-nums text-slate-950">{USD(total)}</p>
          <p className="mt-1 text-xs text-slate-500">
            {USD_FRACTIONAL(tier.price)} per record × {records.toLocaleString()} contacts
            {enforcedMinimum ? ` (rounded up to ${USD(MIN_ORDER)} minimum)` : ""}
          </p>
        </div>
        <div className="rounded-md bg-teal-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">Discount tier</p>
          <p className="mt-1 text-sm font-bold leading-6 text-teal-900">{tier.message}</p>
          {records >= 15000 ? (
            <p className="mt-2 text-xs leading-5 text-teal-900">
              At 15,000+ records, you&apos;re at our highest bulk discount — or talk to sales for fully
              custom pricing.
            </p>
          ) : (
            <p className="mt-2 text-xs leading-5 text-teal-900">
              Buying more? Your discount increases automatically — slide right to see.
            </p>
          )}
        </div>
      </div>

      <p className="mt-4 text-xs leading-5 text-slate-500">
        For the full U.S. database, the <strong className="font-bold text-slate-700">National Founder License at $12,500/year</strong> gives you the best total effective value.
      </p>
    </div>
  );
}
