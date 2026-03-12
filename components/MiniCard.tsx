import Tilt from "react-parallax-tilt";

// Needed for typescript props in react https://react.dev/learn/typescript
interface Props {
    src: string;
    alt?: string;
    width?: number;
    height?: number;
};

export default function MiniCard({src, alt = "card image", width = 150, height = 210,}: Props) {
    return (
        <Tilt
            tiltMaxAngleX={10}
            tiltMaxAngleY={10}
            scale={1.1} //This makes the card larger when hovered over
            transitionSpeed={350}
            className="rounded-xl overflow-hidden shadow-lg"
            style={{ width, height }}
        >
            <img src={src} alt={alt} className="w-full h-full object-cover"/>
        </Tilt>
    );
}
