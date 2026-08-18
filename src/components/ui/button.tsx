import { clsx } from "clsx";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

const VARIANT_CLASSES = {
  primary:
    "bg-primary text-on-primary hover:bg-primary-active rounded-sm font-medium",
  secondary:
    "bg-canvas text-ink border border-ink rounded-sm font-medium",
  tertiary: "bg-transparent text-ink underline-offset-2 hover:underline font-medium",
  pill: "bg-primary text-on-primary rounded-full font-medium",
} as const;

const SIZE_CLASSES = {
  md: "h-12 px-6 text-base",
  sm: "h-10 px-5 text-sm",
} as const;

type ButtonVariant = keyof typeof VARIANT_CLASSES;
type ButtonSize = keyof typeof SIZE_CLASSES;

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

type ButtonAsButton = CommonProps &
  ComponentPropsWithoutRef<"button"> & { href?: undefined };

type ButtonAsLink = CommonProps &
  ComponentPropsWithoutRef<typeof Link> & { href: string };

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant = "primary", size = "md", className, ...rest } = props;
  const classes = clsx(
    "inline-flex items-center justify-center gap-2 transition-[color,background-color,transform] duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
    variant !== "tertiary" && SIZE_CLASSES[size],
    VARIANT_CLASSES[variant],
    className,
  );

  if ("href" in rest && rest.href) {
    const { href, ...linkRest } = rest as ButtonAsLink;
    return <Link href={href} className={classes} {...linkRest} />;
  }

  return <button className={classes} {...(rest as ComponentPropsWithoutRef<"button">)} />;
}
