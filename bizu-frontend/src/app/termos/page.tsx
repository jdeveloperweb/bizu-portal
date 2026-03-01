export default function TermsPage() {
    return (
        <div className="max-w-4xl mx-auto py-20 px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl font-black mb-2 tracking-tight">Termos de Uso</h1>
            <p className="text-muted-foreground mb-10">Última atualização: Março de 2026</p>

            <div className="prose prose-invert max-w-none text-foreground/80 space-y-6 text-base leading-relaxed">
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-foreground">1. Aceitação dos Termos</h2>
                    <p>
                        Ao acessar e usar a <strong>Axon Academy</strong>, você concorda em cumprir e ficar vinculado aos seguintes Termos de Uso.
                        Se você não concordar com qualquer parte destes termos, você não deve usar nossos serviços.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-foreground">2. Uso da Plataforma</h2>
                    <p>
                        Você concorda em usar a plataforma apenas para fins lícitos e de maneira que não infrinja os direitos de terceiros
                        nem restrinja ou iniba o uso da plataforma por qualquer outra pessoa. O compartilhamento de senhas e a pirataria
                        dos materiais exclusivos (vídeos, PDFs e Simulados) resultarão em banimento automático sem direito a reembolso.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-foreground">3. Conta do Usuário</h2>
                    <p>
                        Para acessar os recursos completos, você precisa criar uma conta e adquirir uma assinatura (Plano). Você é responsável
                        por manter a confidencialidade de sua conta e senha, bem como por restringir o acesso ao seu computador ou dispositivo.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-foreground">4. Propriedade Intelectual</h2>
                    <p>
                        Todo o conteúdo presente na Axon Academy, incluindo, mas não se limitando a, textos, gráficos, logotipos,
                        ícones, imagens, clipes de áudio e software, é propriedade exclusiva da Axon Academy ou de seus fornecedores
                        de conteúdo, sendo protegido pelas leis de direitos autorais internacionais e do Brasil.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-foreground">5. Cancelamento e Reembolso</h2>
                    <p>
                        Oferecemos a garantia incondicional de 7 dias após a data da compra. Se você não estiver satisfeito
                        com seu plano, poderá solicitar o reembolso integral dentro desse prazo, diretamente pelo painel do usuário
                        ou entrando em contato com nosso suporte via E-mail ou WhatsApp corporativo.
                    </p>
                </section>

                <section className="space-y-4 mt-12 pt-8 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                        Para dúvidas e avisos legais, entre em contato: <a href="mailto:contato@axonacademy.com.br" className="text-primary hover:underline">contato@axonacademy.com.br</a>
                    </p>
                </section>
            </div>
        </div>
    );
}
