import type { PropsWithChildren } from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function Layout({ children }: PropsWithChildren) {
    return (
        <div className="app-container">
            <Navbar links={['CyberTCG', 'About', 'Decks','Discover', /*'Search'*/]}/>  {/* hiding search for now */}
            <main className="content">{children}</main>
            <Footer />
        </div>
    );
}
