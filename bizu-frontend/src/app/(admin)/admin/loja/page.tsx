"use client";

import PageHeader from "../../../../components/PageHeader";
import {
    ShoppingCart,
    Plus,
    Save,
    X,
    Loader2,
    Trash2,
    Edit2,
    Tag,
    Coins,
    Sparkles,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { Avatar } from "@/components/ui/Avatar";
import { AvatarEffects } from "@/components/ui/AvatarEffects";

interface StoreItem {
    id: string;
    code: string;
    name: string;
    description: string;
    price: number;
    category: string;
    metadata: any;
    active: boolean;
}

export default function AdminLojaPage() {
    const [items, setItems] = useState<StoreItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingItem, setEditingItem] = useState<StoreItem | null>(null);
    const [formData, setFormData] = useState({
        code: "",
        name: "",
        description: "",
        price: 0,
        category: "status",
        metadata: {} as any,
        active: true
    });

    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await apiFetch(`/admin/store/items`);
            if (res.ok) {
                const data = await res.json();
                setItems(data);
            }
        } catch (error) {
            console.error("Erro ao buscar itens da loja:", error);
            toast.error("Erro ao carregar itens da loja.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleOpenModal = (item: StoreItem | null = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                code: item.code,
                name: item.name,
                description: item.description,
                price: item.price,
                category: item.category,
                metadata: item.metadata || {},
                active: item.active
            });
        } else {
            setEditingItem(null);
            setFormData({
                code: "",
                name: "",
                description: "",
                price: 0,
                category: "status",
                metadata: {},
                active: true
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const url = editingItem ? `/admin/store/items/${editingItem.id}` : `/admin/store/items`;
            const method = editingItem ? 'PUT' : 'POST';

            const res = await apiFetch(url, {
                method,
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success(editingItem ? "Item atualizado!" : "Item criado!");
                fetchItems();
                setIsModalOpen(false);
            } else {
                toast.error("Erro ao salvar item.");
            }
        } catch (error) {
            toast.error("Erro de conexão.");
        } finally {
            setSubmitting(false);
        }
    };

    const updateMetadata = (key: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            metadata: {
                ...prev.metadata,
                visual: {
                    ...prev.metadata?.visual,
                    [key]: value
                }
            }
        }));
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Excluir este item permanentemente?")) return;
        try {
            const res = await apiFetch(`/admin/store/items/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success("Item removido.");
                setItems(prev => prev.filter(i => i.id !== id));
            }
        } catch (error) {
            toast.error("Erro ao remover.");
        }
    };

    return (
        <div className="w-full px-8 py-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <PageHeader
                    title="Loja de Axons"
                    description="Gerencie os itens disponíveis na loja, altere preços e defina novos cosméticos."
                    badge="GAMIFICAÇÃO"
                />
                <Button
                    onClick={() => handleOpenModal()}
                    className="h-14 rounded-2xl font-black text-base gap-2 shadow-lg shadow-primary/20"
                >
                    <Plus className="w-5 h-5" />
                    Novo Item
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-6 shadow-sm">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <ShoppingCart className="w-7 h-7" />
                    </div>
                    <div>
                        <div className="text-2xl font-black">{items.length}</div>
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Itens Totais</div>
                    </div>
                </div>
                <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-6 shadow-sm">
                    <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                        <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <div>
                        <div className="text-2xl font-black">{items.filter(i => i.active).length}</div>
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Itens Ativos</div>
                    </div>
                </div>
                <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-6 shadow-sm">
                    <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                        <Sparkles className="w-7 h-7" />
                    </div>
                    <div>
                        <div className="text-2xl font-black">{items.filter(i => i.category === 'aura' || i.category === 'border').length}</div>
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Cosméticos Visuais</div>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead className="bg-muted/30 border-b border-border">
                            <tr>
                                <th className="px-8 py-5 text-xs font-black text-muted-foreground uppercase tracking-widest">Item</th>
                                <th className="px-8 py-5 text-xs font-black text-muted-foreground uppercase tracking-widest">Preço (Axons)</th>
                                <th className="px-8 py-5 text-xs font-black text-muted-foreground uppercase tracking-widest">Categoria</th>
                                <th className="px-8 py-5 text-xs font-black text-muted-foreground uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-xs font-black text-muted-foreground uppercase tracking-widest text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-12 text-center text-muted-foreground">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                                        Carregando itens...
                                    </td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-12 text-center text-muted-foreground font-medium">
                                        Nenhum item encontrado.
                                    </td>
                                </tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={item.id} className="hover:bg-muted/20 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-muted/50 rounded-lg">
                                                    <Tag className="w-4 h-4 text-primary" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-base">{item.name}</div>
                                                    <div className="text-[10px] text-muted-foreground font-bold tracking-tight">{item.code}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-1.5 font-black text-indigo-600">
                                                <Coins size={14} />
                                                {item.price.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="pill pill-secondary text-[10px] py-1">
                                                {item.category.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            {item.active ? (
                                                <div className="flex items-center gap-1.5 text-emerald-600 text-[11px] font-bold">
                                                    <CheckCircle2 size={12} /> ATIVO
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold">
                                                    <AlertCircle size={12} /> INATIVO
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    onClick={() => handleOpenModal(item)}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="rounded-xl h-10 w-10 p-0 hover:bg-primary/10 text-primary"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    onClick={() => handleDelete(item.id)}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="rounded-xl h-10 w-10 p-0 hover:bg-destructive/10 text-destructive"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-card w-full max-w-4xl rounded-3xl p-8 shadow-2xl relative border border-border mt-20 mb-10">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-6 right-6 rounded-xl"
                            onClick={() => setIsModalOpen(false)}
                        >
                            <X className="w-5 h-5" />
                        </Button>
                        <div className="mb-8 border-b border-border pb-6">
                            <h2 className="text-2xl font-black flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <Tag className="w-6 h-6" />
                                </div>
                                {editingItem ? "Configurar Item" : "Novo Item do Laboratório"}
                            </h2>
                            <p className="text-muted-foreground mt-2 font-medium">Defina o comportamento e o visual deste item na plataforma.</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            {/* Form Column */}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Dados Básicos
                                    </h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1.5 ml-1">ID Interno (Código)</label>
                                            <input
                                                required
                                                disabled={!!editingItem}
                                                type="text"
                                                value={formData.code}
                                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                                className="w-full h-12 px-4 bg-muted/50 border border-border rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 transition-all"
                                                placeholder="AURA_FLAME"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1.5 ml-1">Preço (Axons)</label>
                                            <div className="relative">
                                                <Coins size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" />
                                                <input
                                                    required
                                                    type="number"
                                                    value={formData.price}
                                                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                                                    className="w-full h-12 pl-10 pr-4 bg-muted/50 border border-border rounded-2xl font-black text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1.5 ml-1">Nome de Exibição</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full h-12 px-4 bg-muted/50 border border-border rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                            placeholder="Ex: Aura Lendária de Fogo"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1.5 ml-1">Categoria de Uso</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full h-12 px-4 bg-muted/50 border border-border rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                                        >
                                            <option value="consumable">⚡ Consumível (Efeito Temporário)</option>
                                            <option value="permanent">🎒 Permanente (Inventário)</option>
                                            <option value="status">🏷️ Status / Título (Perfil)</option>
                                            <option value="aura">✨ Aura Visual (Avatar)</option>
                                            <option value="border">🖼️ Moldura Decorativa (Avatar)</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Visual Designer Section */}
                                <div className="space-y-4 pt-4 border-t border-border">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" /> Designer Visual
                                    </h3>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1.5 ml-1">Cor da Aura/Efeito</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="color"
                                                        value={formData.metadata?.visual?.auraColor || "#6366f1"}
                                                        onChange={(e) => updateMetadata("auraColor", e.target.value)}
                                                        className="h-12 w-12 rounded-xl border border-border bg-white cursor-pointer"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={formData.metadata?.visual?.auraColor || "#6366f1"}
                                                        onChange={(e) => updateMetadata("auraColor", e.target.value)}
                                                        className="flex-1 h-12 px-4 bg-muted/50 border border-border rounded-2xl font-mono text-xs uppercase"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1.5 ml-1">Estilo da Aura</label>
                                                <select
                                                    value={formData.metadata?.visual?.auraStyle || "steady"}
                                                    onChange={(e) => updateMetadata("auraStyle", e.target.value)}
                                                    className="w-full h-12 px-4 bg-muted/50 border border-border rounded-2xl font-bold text-sm"
                                                >
                                                    <option value="steady">Fixo (Brilho Constante)</option>
                                                    <option value="pulse">Pulsante (Coração)</option>
                                                    <option value="glitch">Glitch (Cibernético)</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1.5 ml-1">Efeito de Partículas</label>
                                                <select
                                                    value={formData.metadata?.visual?.particles || ""}
                                                    onChange={(e) => updateMetadata("particles", e.target.value || null)}
                                                    className="w-full h-12 px-4 bg-muted/50 border border-border rounded-2xl font-bold text-sm"
                                                >
                                                    <option value="">Sem Partículas</option>
                                                    <option value="snow">❄️ Neve / Névoa</option>
                                                    <option value="sparks">✨ Faíscas Brilhantes</option>
                                                    <option value="coins">💰 Moedas Caindo</option>
                                                    <option value="hearts">❤️ Corações Flutuando</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1.5 ml-1">Tipo de Moldura</label>
                                                <select
                                                    value={formData.metadata?.visual?.borderStyle || "solid"}
                                                    onChange={(e) => updateMetadata("borderStyle", e.target.value)}
                                                    className="w-full h-12 px-4 bg-muted/50 border border-border rounded-2xl font-bold text-sm"
                                                >
                                                    <option value="solid">Borda Normal</option>
                                                    <option value="rainbow">🌈 Arco-íris Animado</option>
                                                    <option value="pulse">💫 Borda Pulsante</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 py-2">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="active"
                                                checked={formData.active}
                                                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                                className="w-5 h-5 rounded-lg text-primary border-border focus:ring-primary/20"
                                            />
                                            <label htmlFor="active" className="text-sm font-bold text-slate-700">Item Ativo</label>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <Button disabled={submitting} type="submit" className="w-full h-14 rounded-2xl font-black text-lg gap-2 shadow-xl shadow-primary/20">
                                        {submitting ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
                                        {submitting ? 'PROCESSANDO...' : 'SALVAR ITEM ÉPICO'}
                                    </Button>
                                </div>
                            </form>

                            {/* Preview Column */}
                            <div className="bg-muted/30 rounded-3xl p-8 flex flex-col items-center justify-center border border-dashed border-border sticky top-0 h-[600px]">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-12">Preview em Tempo Real</h3>

                                <div className="relative scale-150">
                                    <Avatar
                                        size="xl"
                                        name="Preview Bizu"
                                        auraMetadata={formData.metadata}
                                        borderMetadata={formData.metadata}
                                    />
                                </div>

                                <div className="mt-20 w-full max-w-xs bg-white rounded-3xl p-6 shadow-xl border border-border">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-2xl bg-muted animate-pulse" />
                                        <div className="space-y-2">
                                            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                                            <div className="h-3 w-20 bg-muted/50 rounded animate-pulse" />
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground font-medium leading-relaxed italic">
                                        "Este é um preview de como o item será exibido no perfil e ranking dos estudantes."
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
