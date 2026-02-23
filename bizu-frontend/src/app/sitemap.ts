import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://bizu.mjolnix.com.br';

    // Em produção, aqui buscaríamos os slugs de todos os cursos do banco
    const courses = [
        { slug: 'direito-administrativo', lastModified: new Date() },
        { slug: 'raciocinio-logico', lastModified: new Date() },
    ];

    const courseUrls = courses.map((course) => ({
        url: `${baseUrl}/cursos/${course.slug}`,
        lastModified: course.lastModified,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/simulados`,
            lastModified: new Date(),
            changeFrequency: 'always',
            priority: 0.9,
        },
        ...courseUrls,
    ];
}
