import Link from "next/link";
import ArrowLeftIcon from "../icons/ArrowLeftIcon";
import ArrowRightIcon from "../icons/ArrowRightIcon";

export default function DocFooterNav({
                                         prev,
                                         next,
                                     }: {
    prev?: { href: string; label: string };
    next?: { href: string; label: string };
}) {
    return (
        <footer className="mt-12 flex justify-between">
            {prev ? (
                <Link
                    href={prev.href}
                    className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
                >
                    <ArrowLeftIcon />
                    {prev.label}
                </Link>
            ) : (
                <div />
            )}

            {next && (
                <Link
                    href={next.href}
                    className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
                >
                    {next.label}
                    <ArrowRightIcon />
                </Link>
            )}
        </footer>
    );
}
