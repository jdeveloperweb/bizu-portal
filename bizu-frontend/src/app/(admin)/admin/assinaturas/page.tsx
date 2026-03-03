import SubscriptionsList from "./SubscriptionsList";

export const metadata = {
    title: "Gestão de Assinaturas | Admin",
    description: "Monitore os planos ativos, renovações e status de pagamento dos alunos.",
};

export default function AdminSubscriptionsPage() {
    return <SubscriptionsList />;
}
