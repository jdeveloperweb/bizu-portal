"use client";

import PageHeader from "@/components/PageHeader";
import { Search, Filter, FileText, Download, Play, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect, Suspense } from "react";
import { apiFetch } from "@/lib/api";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

function MaterialsContent() {
    const searchParams = useSearchParams();
    const moduleId = searchParams.get("moduleId");

    const [materials, setMaterials] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchMaterials = async () => {
            setIsLoading(true);
            try {
                const endpoint = moduleId
                    ? `/student/materials/module/${moduleId}`
                    : "/student/materials";
                const res = await apiFetch(endpoint);
                if (res.ok) {
                    const data = await res.json();
                    setMaterials(data);
                }
            } catch (error) {
                console.error("Failed to fetch materials", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMaterials();
    }, [moduleId]);

    const filteredMaterials = materials.filter(m =>
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.description && m.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="container mx-auto px-4 py-12 max-w-7xl">
            <PageHeader
                title="Materiais de Estudo"
                description="Acesse apostilas, mapas mentais e resumos para potencializar seus estudos."
                badge="BIBLIOTECA"
            />

            <div className="flex flex-col md:flex-row gap-4 mb-12">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar materiais pelo título ou descrição..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-12 rounded-2xl bg-card border-none shadow-sm focus-visible:ring-primary"
                    />
                </div>
                <button className="flex items-center justify-center gap-2 px-6 h-12 bg-card rounded-2xl border shadow-sm hover:bg-muted transition-colors font-medium text-slate-600">
                    <Filter className="w-4 h-4" />
                    Filtrar Tipo
                </button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-48 rounded-[32px] bg-muted/40 animate-pulse" />
                    ))}
                </div>
            ) : filteredMaterials.length === 0 ? (
                <div className="text-center py-24 bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-600">Nenhum material encontrado</h3>
                    <p className="text-sm text-slate-400">Tente buscar por termos diferentes ou confira seus cursos.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMaterials.map((material) => (
                        <div key={material.id} className="group bg-card border border-slate-100 rounded-[32px] p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                            {/* Accent Background */}
                            <div className={cn(
                                "absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-10 -mr-16 -mt-16 transition-all group-hover:opacity-20",
                                material.fileType === 'VIDEO' ? "bg-indigo-600" : "bg-rose-600"
                            )} />

                            <div className="flex items-start justify-between mb-6 relative z-10">
                                <div className={cn(
                                    "w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                                    material.fileType === 'VIDEO' ? "bg-indigo-50 text-indigo-600" : "bg-rose-50 text-rose-600"
                                )}>
                                    {material.fileType === 'VIDEO' ? <Play className="w-6 h-6 fill-current" /> : <FileText className="w-6 h-6" />}
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                                    {material.fileType}
                                </div>
                            </div>

                            <div className="relative z-10 mb-8">
                                <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                                    {material.title}
                                </h3>
                                <p className="text-sm text-slate-500 line-clamp-2 min-h-[40px]">
                                    {material.description || "Material complementar para auxiliar seus estudos e revisões diárias."}
                                </p>
                            </div>

                            <div className="flex items-center gap-2 relative z-10">
                                <Link href={`/materiais/${material.id}`} className="flex-1">
                                    <button className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                                        <Eye size={16} /> Visualizar
                                    </button>
                                </Link>
                                <button className="w-12 h-12 flex items-center justify-center rounded-2xl border-2 border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all">
                                    <Download size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function MaterialsPage() {
    return (
        <Suspense fallback={<div className="container mx-auto px-4 py-24 text-center">Carregando biblioteca...</div>}>
            <MaterialsContent />
        </Suspense>
    );
}
