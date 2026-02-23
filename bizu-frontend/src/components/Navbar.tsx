import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Navbar() {
    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="text-2xl font-black tracking-tighter text-primary">
                    BIZU! <span className="text-foreground">PORTAL</span>
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    <Link href="/cursos" className="text-sm font-medium hover:text-primary transition-colors">Cursos</Link>
                    <Link href="/simulados" className="text-sm font-medium hover:text-primary transition-colors">Simulados</Link>
                    <Link href="/flashcards" className="text-sm font-medium hover:text-primary transition-colors">Flashcards</Link>
                    <Link href="/arena" className="text-sm font-medium hover:text-primary transition-colors">Arena</Link>
                    <Link href="/desempenho" className="text-sm font-medium hover:text-primary transition-colors">Desempenho</Link>
                    <Link href="/perfil" className="text-sm font-medium hover:text-primary transition-colors">Perfil</Link>
                    <Link href="/pricing" className="text-sm font-medium hover:text-primary transition-colors">Preços</Link>
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">Entrar</Link>
                    <Button variant="default" size="sm" className="rounded-full">
                        Criar Conta
                    </Button>
                </div>
            </div>
        </nav>
    );
}
