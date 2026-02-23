import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/api/', '/perfil/'],
        },
        sitemap: 'https://bizu.mjolnix.com.br/sitemap.xml',
    };
}
