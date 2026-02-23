import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />

      {/* Footer / Outras Seções virão aqui */}
      <section id="cursos" className="py-24 bg-surface">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Explore Nossos Cursos</h2>
            <p className="text-muted-foreground">Conteúdo atualizado e focado na sua aprovação.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Curso Cards seriam adicionados aqui */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="group p-1 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 hover:from-primary/40 hover:to-accent/40 transition-all duration-500 cursor-pointer">
                <div className="bg-background rounded-[calc(1.5rem-1px)] p-6 h-full">
                  <div className="aspect-video w-full bg-muted rounded-xl mb-4 overflow-hidden">
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary/40 text-sm font-bold">
                      IMAGE_PLACEHOLDER
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">Concurso Magistratura Federal</h3>
                  <p className="text-sm text-muted-foreground mb-4">Preparação intensiva com mais de 2.000 questões comentadas e simulados inéditos.</p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-sm font-bold">R$ 197,00</span>
                    <span className="text-xs text-primary font-bold">VER DETALHES</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
