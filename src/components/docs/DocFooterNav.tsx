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
        <footer className="mt-10 flex justify-between gap-4 border-t border-gray-200 pt-6 max-sm:flex-col">
            {prev ? (
                <Link
                    href={prev.href}
                    className="inline-flex items-center rounded-md border border-gray-200 bg-white px-4 py-2 font-medium text-blue-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800 max-sm:w-full max-sm:justify-center"
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
                    className="inline-flex items-center justify-end rounded-md border border-gray-200 bg-white px-4 py-2 font-medium text-blue-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800 max-sm:w-full max-sm:justify-center"
                >
                    {next.label}
                    <ArrowRightIcon />
                </Link>
            )}
        </footer>
    );
}
