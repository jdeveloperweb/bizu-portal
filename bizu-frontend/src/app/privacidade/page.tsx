export default function PrivacyPage() {
    return (
        <div className="max-w-4xl mx-auto py-20 px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl font-black mb-2 tracking-tight">Política de Privacidade</h1>
            <p className="text-muted-foreground mb-10">Última atualização: Março de 2026</p>

            <div className="prose prose-invert max-w-none text-foreground/80 space-y-6 text-base leading-relaxed">
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-foreground">1. Informações que Coletamos</h2>
                    <p>
                        Quando você se cadastra na <strong>Axon Academy</strong>, nós coletamos informações pessoais como seu nome,
                        e-mail e histórico de pagamento. Durante o uso, também coletamos dados de progresso (aulas assistidas,
                        desempenho em simulados e notas de estudo) para personalizar sua experiência de aprendizado.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-foreground">2. Uso das Informações</h2>
                    <p>
                        Usamos seus dados para:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mt-2">
                        <li>Processar seu pagamento e garantir acesso aos módulos comprados.</li>
                        <li>Enviar e-mails transacionais (boas-vindas, redefinição de senha e certificados).</li>
                        <li>Melhorar nosso conteúdo recomendando Flashcards ou Simulados baseados na sua taxa de acerto.</li>
                        <li>Gerar métricas analíticas anonimizadas para melhorar a performance da plataforma.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-foreground">3. Compartilhamento de Dados</h2>
                    <p>
                        Nós <strong>não vendemos</strong> suas informações pessoais. Compartilhamos seus dados apenas com
                        terceiros parceiros essenciais para o funcionamento do portal, como provedores de Gateway de Pagamento
                        (Mercado Pago / Stripe / InfinitePay) e hospedagem de e-mails, sob rigorosos contratos de confidencialidade.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-foreground">4. Segurança</h2>
                    <p>
                        Implementamos medidas de segurança técnicas e organizacionais (como criptografia de senhas e SSL em todas
                        as comunicações) para proteger seus dados pessoais contra acesso, alteração ou destruição não autorizados.
                        No entanto, nenhuma transmissão pela internet é 100% segura.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-foreground">5. Seus Direitos (LGPD)</h2>
                    <p>
                        Você tem o direito de acessar, corrigir, portar ou solicitar a exclusão definitiva dos seus dados pessoais da
                        nossa base. Para exercer esses direitos, entre em contato com nosso time de privacidade através do e-mail abaixo.
                    </p>
                </section>

                <section className="space-y-4 mt-12 pt-8 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                        Dúvidas sobre o tratamento dos seus dados? <br />
                        Encarregado de Proteção de Dados (DPO): <a href="mailto:privacidade@axonacademy.com.br" className="text-primary hover:underline">privacidade@axonacademy.com.br</a>
                    </p>
                </section>
            </div>
        </div>
    );
}
