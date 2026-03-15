import { useState } from "react"
import Tilt from "react-parallax-tilt"

interface Props {
    src: string
    alt?: string
    width?: number
    height?: number

    name: string
    setName?: string

    onClick?: () => void
    clickAriaLabel?: string

    showOverlay?: boolean
    overlayText?: string
    overlayIcon?: string

    showDetails?: boolean
    detailsWidth?: number
}

export default function Card({
                                 src,
                                 alt = "card image",
                                 width = 250,
                                 height = 350,

                                 name,
                                 setName = "Unknown set",

                                 onClick,
                                 clickAriaLabel,

                                 showOverlay = false,
                                 overlayText = "Add",
                                 overlayIcon = "+",

                                 showDetails = false,
                                 detailsWidth = 220,
                             }: Props) {

    const [isHovered, setIsHovered] = useState(false)

    const darkenCard = isHovered && (showOverlay || showDetails)
    const isClickable = Boolean(onClick)

    const cardInner = (
        <Tilt
            tiltMaxAngleX={10}
            tiltMaxAngleY={10}
            scale={1.05}
            transitionSpeed={350}
            className="relative rounded-xl overflow-hidden shadow-lg"
            style={{ width, height }}
            onEnter={() => setIsHovered(true)}
            onLeave={() => setIsHovered(false)}
        >
            <img
                src={src}
                alt={alt}
                className={`h-full w-full object-cover ${darkenCard ? "brightness-75" : ""}`} // Darken card img when hovered so add text easy to read
            />

            {showOverlay && (
                <div
                    className={`absolute inset-0 flex flex-col items-center justify-center ${isHovered ? "opacity-100" : "opacity-0"}`}
                >
                    <span className="text-6xl font-bold text-white drop-shadow-md">
                        {overlayIcon}
                    </span>

                    <span className="mt-3 text-xl font-semibold text-white drop-shadow-md">
                        {overlayText}
                    </span>
                </div>
            )}
        </Tilt>
    )

    return (
        <div className="relative inline-block" style={{ width, height, zIndex: isHovered ? 100 : 1 }}> {/* make details box ontop */}
            {isClickable ? (
                <button
                    type="button"
                    onClick={onClick}
                    className="block cursor-pointer"
                    style={{ width, height }}
                    aria-label={clickAriaLabel ?? name}
                >
                    {cardInner}
                </button>
            ) : (
                <div style={{ width, height }}>{cardInner}</div>
            )}

            {/* Card details section*/}
            {showDetails && (
                <div
                    className={`absolute top-0 left-full ml-3 rounded-xl border border-white/10 bg-slate-900/95 ${isHovered ? "opacity-100" : "opacity-0"}`}
                    style={{height, width: detailsWidth,}}
                >
                    <div className="flex h-full flex-col justify-normal p-4 text-slate-100">
                        <div>
                            <h3 className="text-lg mb-3 font-bold leading-tight">{name}</h3>
                        </div>

                        <div>
                            <p className="text-xs uppercase tracking-widest text-slate-400">
                                Set
                            </p>
                            <p className="text-sm font-medium text-slate-100">
                                {setName}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
