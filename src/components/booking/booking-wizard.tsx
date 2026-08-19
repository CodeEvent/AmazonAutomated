"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { insuranceQuote } from "@/lib/pricing";

type PaymentMethod = "card" | "apple_pay" | "paypal";

const STEP_COUNT = 4;

export function BookingWizard({
  action,
  propertySlug,
  propertyName,
  propertyImage,
  ratingAverage,
  reviewCount,
  isSuperhost,
  rareFind,
  hostName,
  checkInLabel,
  checkOutLabel,
  guestsLabel,
  propertyId,
  checkIn,
  checkOut,
  adults,
  childrenCount,
  infants,
  pets,
  nights,
  nightlyRate,
  subtotal,
  cleaningFee,
  serviceFee,
  baseTotal,
}: {
  action: (formData: FormData) => void;
  propertySlug: string;
  propertyName: string;
  propertyImage: string | undefined;
  ratingAverage: number;
  reviewCount: number;
  isSuperhost: boolean;
  rareFind: boolean;
  hostName: string;
  checkInLabel: string;
  checkOutLabel: string;
  guestsLabel: string;
  propertyId: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  childrenCount: number;
  infants: number;
  pets: number;
  nights: number;
  nightlyRate: number;
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  baseTotal: number;
}) {
  const [step, setStep] = useState(1);
  const [travelInsurance, setTravelInsurance] = useState(false);
  const [payInInstallments, setPayInInstallments] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [guestMessage, setGuestMessage] = useState("");
  const [showPriceDetails, setShowPriceDetails] = useState(false);

  const insuranceFee = insuranceQuote(nightlyRate, nights);
  const total = baseTotal + (travelInsurance ? insuranceFee : 0);
  const messageReady = guestMessage.trim().length > 0;

  const back = () => setStep((s) => Math.max(1, s - 1));
  const next = () => setStep((s) => Math.min(STEP_COUNT, s + 1));

  return (
    <form action={action} className="mx-auto max-w-[560px]">
      <input type="hidden" name="propertyId" value={propertyId} />
      <input type="hidden" name="checkIn" value={checkIn} />
      <input type="hidden" name="checkOut" value={checkOut} />
      <input type="hidden" name="adults" value={adults} />
      <input type="hidden" name="children" value={childrenCount} />
      <input type="hidden" name="infants" value={infants} />
      <input type="hidden" name="pets" value={pets} />
      <input type="hidden" name="guestMessage" value={guestMessage} />
      <input type="hidden" name="travelInsurance" value={travelInsurance ? "1" : "0"} />
      <input type="hidden" name="payInInstallments" value={payInInstallments ? "1" : "0"} />
      <input type="hidden" name="paymentMethod" value={paymentMethod} />

      <div className="flex items-center justify-between px-4 py-4 sm:px-0">
        {step === 1 ? (
          <Link
            href={`/property/${propertySlug}`}
            aria-label="Back to listing"
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-soft"
          >
            <BackIcon />
          </Link>
        ) : (
          <button
            type="button"
            onClick={back}
            aria-label="Back"
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-soft"
          >
            <BackIcon />
          </button>
        )}
        <h1 className="text-base font-semibold text-ink">Request to book</h1>
        <Link
          href={`/property/${propertySlug}`}
          aria-label="Close"
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-soft"
        >
          <CloseIcon />
        </Link>
      </div>

      <div className="px-4 sm:px-0">
        {step === 1 ? (
          <StepReview
            propertyName={propertyName}
            propertyImage={propertyImage}
            ratingAverage={ratingAverage}
            reviewCount={reviewCount}
            isSuperhost={isSuperhost}
            rareFind={rareFind}
            checkInLabel={checkInLabel}
            checkOutLabel={checkOutLabel}
            guestsLabel={guestsLabel}
            propertySlug={propertySlug}
            nights={nights}
            nightlyRate={nightlyRate}
            subtotal={subtotal}
            cleaningFee={cleaningFee}
            serviceFee={serviceFee}
            baseTotal={baseTotal}
            showPriceDetails={showPriceDetails}
            setShowPriceDetails={setShowPriceDetails}
          />
        ) : null}

        {step === 2 ? (
          <StepInsurance
            insuranceFee={insuranceFee}
            travelInsurance={travelInsurance}
            setTravelInsurance={setTravelInsurance}
          />
        ) : null}

        {step === 3 ? (
          <StepPaymentPlan
            total={total}
            payInInstallments={payInInstallments}
            setPayInInstallments={setPayInInstallments}
          />
        ) : null}

        {step === 4 ? (
          <StepMessageAndPay
            hostName={hostName}
            guestMessage={guestMessage}
            setGuestMessage={setGuestMessage}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            total={total}
          />
        ) : null}
      </div>

      <div className="sticky bottom-0 mt-8 border-t border-hairline-soft bg-canvas px-4 py-4 sm:px-0">
        <div className="flex gap-1.5">
          {Array.from({ length: STEP_COUNT }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full ${i < step ? "bg-ink" : "bg-hairline-soft"}`}
            />
          ))}
        </div>

        {step < STEP_COUNT ? (
          <button
            type="button"
            onClick={next}
            className="mt-4 w-full rounded-lg bg-ink py-3 text-base font-semibold text-canvas transition-transform duration-150 hover:bg-ink/90 active:scale-[0.98]"
          >
            Next
          </button>
        ) : (
          <>
            <button
              type="submit"
              disabled={!messageReady}
              className="mt-4 w-full rounded-lg bg-primary py-3 text-base font-semibold text-on-primary transition-transform duration-150 hover:bg-primary-active active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Reserve
            </button>
            <p className="mt-2 text-center text-xs text-muted">
              This is a demo checkout — no real payment is processed.
            </p>
          </>
        )}
      </div>
    </form>
  );
}

function StepReview({
  propertyName,
  propertyImage,
  ratingAverage,
  reviewCount,
  isSuperhost,
  rareFind,
  checkInLabel,
  checkOutLabel,
  guestsLabel,
  propertySlug,
  nights,
  nightlyRate,
  subtotal,
  cleaningFee,
  serviceFee,
  baseTotal,
  showPriceDetails,
  setShowPriceDetails,
}: {
  propertyName: string;
  propertyImage: string | undefined;
  ratingAverage: number;
  reviewCount: number;
  isSuperhost: boolean;
  rareFind: boolean;
  checkInLabel: string;
  checkOutLabel: string;
  guestsLabel: string;
  propertySlug: string;
  nights: number;
  nightlyRate: number;
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  baseTotal: number;
  showPriceDetails: boolean;
  setShowPriceDetails: (v: boolean) => void;
}) {
  return (
    <div className="rounded-xl border border-hairline-soft p-4">
      <div className="flex items-start gap-3">
        {propertyImage ? (
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
            <Image src={propertyImage} alt={propertyName} fill sizes="64px" className="object-cover" />
          </div>
        ) : null}
        <div>
          <p className="text-base font-semibold text-ink">{propertyName}</p>
          {reviewCount > 0 ? (
            <p className="mt-1 flex items-center gap-1 text-sm text-ink">
              <StarIcon /> {ratingAverage.toFixed(2)} ({reviewCount}){" "}
              {isSuperhost ? <span className="text-muted">· Superhost</span> : null}
            </p>
          ) : null}
        </div>
      </div>

      <Row label="Dates" href={`/property/${propertySlug}#reserve`}>
        <p className="text-sm text-ink">
          {checkInLabel} – {checkOutLabel}
        </p>
        {rareFind ? <p className="mt-1 text-sm font-medium text-brand">💎 Rare find</p> : null}
      </Row>

      <Row label="Guests" href={`/property/${propertySlug}#reserve`}>
        <p className="text-sm text-ink">{guestsLabel}</p>
      </Row>

      <div className="border-t border-hairline-soft py-4">
        <button
          type="button"
          onClick={() => setShowPriceDetails(!showPriceDetails)}
          className="flex w-full items-center justify-between"
        >
          <div className="text-left">
            <p className="text-sm font-semibold text-ink">Total price</p>
            <p className="text-sm text-ink">{formatPrice(baseTotal)} USD</p>
          </div>
          <span className="rounded-lg bg-surface-soft px-3 py-1.5 text-sm font-semibold text-ink">Details</span>
        </button>

        {showPriceDetails ? (
          <div className="mt-4 space-y-2 text-sm text-ink">
            <div className="flex justify-between">
              <span>
                {formatPrice(nightlyRate)} × {nights} night{nights === 1 ? "" : "s"}
              </span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Cleaning fee</span>
              <span>{formatPrice(cleaningFee)}</span>
            </div>
            <div className="flex justify-between">
              <span>Service fee</span>
              <span>{formatPrice(serviceFee)}</span>
            </div>
          </div>
        ) : null}
      </div>

      <p className="border-t border-hairline-soft pt-4 text-sm text-muted">
        This reservation is non-refundable.{" "}
        <span className="font-medium text-ink underline">Full policy</span>
      </p>
    </div>
  );
}

function Row({ label, href, children }: { label: string; href: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-t border-hairline-soft py-4">
      <div>
        <p className="text-sm font-semibold text-ink">{label}</p>
        {children}
      </div>
      <Link
        href={href}
        className="shrink-0 rounded-lg bg-surface-soft px-3 py-1.5 text-sm font-semibold text-ink hover:bg-hairline-soft"
      >
        Change
      </Link>
    </div>
  );
}

function StepInsurance({
  insuranceFee,
  travelInsurance,
  setTravelInsurance,
}: {
  insuranceFee: number;
  travelInsurance: boolean;
  setTravelInsurance: (v: boolean) => void;
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-ink">Add travel insurance?</h2>
      <div className="mt-6 rounded-xl bg-surface-soft p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-base font-semibold text-ink">
              Yes, add for {formatPrice(insuranceFee)}
            </p>
            <p className="text-sm text-muted">Only available when booking.</p>
          </div>
          <button
            type="button"
            onClick={() => setTravelInsurance(!travelInsurance)}
            className={`shrink-0 rounded-lg border px-4 py-2 text-sm font-semibold ${
              travelInsurance ? "border-ink bg-ink text-canvas" : "border-hairline-soft bg-canvas text-ink"
            }`}
          >
            {travelInsurance ? "Added" : "Add"}
          </button>
        </div>
        <p className="mt-4 text-sm text-body">
          Get up to 100% of the cost of your stay back if you cancel for covered reasons.
        </p>
      </div>
    </div>
  );
}

function StepPaymentPlan({
  total,
  payInInstallments,
  setPayInInstallments,
}: {
  total: number;
  payInInstallments: boolean;
  setPayInInstallments: (v: boolean) => void;
}) {
  const installment = Math.round(total / 3);

  return (
    <div>
      <h2 className="text-2xl font-bold text-ink">Choose when to pay</h2>
      <div className="mt-6 divide-y divide-hairline-soft rounded-xl border border-hairline-soft">
        <label className="flex cursor-pointer items-center justify-between gap-4 p-4">
          <span className="text-base text-ink">Pay {formatPrice(total)} now</span>
          <input
            type="radio"
            name="paymentPlanUi"
            checked={!payInInstallments}
            onChange={() => setPayInInstallments(false)}
            className="h-5 w-5 accent-ink"
          />
        </label>
        <label className="flex cursor-pointer items-start justify-between gap-4 p-4">
          <span>
            <span className="block text-base text-ink">Pay in 3 payments</span>
            <span className="mt-1 block text-sm text-muted">
              3 payments of {formatPrice(installment)} each (0% APR).
            </span>
          </span>
          <input
            type="radio"
            name="paymentPlanUi"
            checked={payInInstallments}
            onChange={() => setPayInInstallments(true)}
            className="mt-1 h-5 w-5 shrink-0 accent-ink"
          />
        </label>
      </div>
    </div>
  );
}

function StepMessageAndPay({
  hostName,
  guestMessage,
  setGuestMessage,
  paymentMethod,
  setPaymentMethod,
  total,
}: {
  hostName: string;
  guestMessage: string;
  setGuestMessage: (v: string) => void;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (v: PaymentMethod) => void;
  total: number;
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-ink">Write a message to the host</h2>
      <p className="mt-2 text-sm text-muted">
        Before you can continue, let {hostName} know a little about your trip and why their place is a
        good fit.
      </p>
      <textarea
        value={guestMessage}
        onChange={(event) => setGuestMessage(event.target.value)}
        rows={5}
        placeholder={`Example: "Hi ${hostName}, my partner and I are visiting for a few days and your place looks perfect."`}
        className="mt-4 w-full rounded-lg border border-hairline p-4 text-base text-ink placeholder:text-muted focus:border-ink focus:outline-none"
      />

      <h2 className="mt-8 text-lg font-semibold text-ink">Payment method</h2>
      <div className="mt-3 divide-y divide-hairline-soft rounded-xl border border-hairline-soft">
        {(
          [
            { id: "card", label: "Credit or debit card" },
            { id: "apple_pay", label: "Apple Pay" },
            { id: "paypal", label: "PayPal" },
          ] as const
        ).map((option) => (
          <label key={option.id} className="flex cursor-pointer items-center justify-between gap-4 p-4">
            <span className="text-base text-ink">{option.label}</span>
            <input
              type="radio"
              name="paymentMethodUi"
              checked={paymentMethod === option.id}
              onChange={() => setPaymentMethod(option.id)}
              className="h-5 w-5 accent-ink"
            />
          </label>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-hairline-soft pt-4 text-base font-semibold text-ink">
        <span>Total (USD)</span>
        <span>{formatPrice(total)}</span>
      </div>
    </div>
  );
}

function StarIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className="h-3.5 w-3.5 fill-ink">
      <path d="M8 0l2.163 5.279 5.837.451-4.5 3.792L12.9 15.5 8 12.2 3.1 15.5l1.4-5.978L0 5.73l5.837-.451z" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 fill-none stroke-ink stroke-2">
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 fill-none stroke-ink stroke-2">
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}
