import { useRouter } from "next/router"
import { ArrowLeftIcon } from "@heroicons/react/24/solid"

type BackButtonProps = {
    fallbackHref?: string
    className?: string
    ariaLabel?: string
}

export default function BackButton({
                                       fallbackHref = "/",
                                       className = "",
                                       ariaLabel = "Go back",
                                   }: BackButtonProps) {
    const router = useRouter()

    function handleBack() {
        const canGoBack = window.history.length > 1
        const previousPage = document.referrer

        // check if previous page is from this site
        const fromThisSite = previousPage && previousPage.startsWith(window.location.origin)

        if (canGoBack && fromThisSite) {
            router.back()
        } else {
            router.push(fallbackHref)
        }
    }

    return (
        <button
            type="button"
            onClick={handleBack}
            aria-label={ariaLabel}
            className={`flex h-9 w-9 hover:cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 ${className}`}
        >
            <ArrowLeftIcon className="h-4 w-4" />
        </button>
    )
}