
import Image from "next/image";

import { Counter } from "../../../components/counter";

interface Article {
    id: string
    title: string
    content: string
}

const articles: Article[] = [
    { id: '1', title: 'Article 1', content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.' },
    { id: '2', title: 'Article 2', content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.' },
    { id: '3', title: 'Article 3', content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.' },
    { id: '4', title: 'Article 4', content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.' },
]

async function getArticle(id: string): Promise<Article | null> {
    return new Promise((resolve) => {
        setTimeout(() => {
            const article = articles.find(article => article.id === id)
            resolve(article || null)
        }, 1000)
    })
}

export const generateStaticParams = async () => []


export async function generateMetadata({ params }: { params: { id: string } }) {
    const article = await getArticle(params.id);

    if (!article) return { title: "Article Not Found" };

    return {
        title: article.title,
        description: article.content.slice(0, 160),

        openGraph: {
            title: article.title,
            description: article.content.slice(0, 160),
            url: `https://localhost:3000/article/${params.id}`,
        },
    };
}



export default async function Article({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const article = await getArticle(id);

    if (!article) {
        return <div>Article not found</div>
    }

    return (
        <div className="w-full flex items-center justify-center p-12">
            <div className="flex flex-col gap-4">
                <Image src={`https://dummyimage.com/600x400/000/fff&text=${id}`} alt="Next.js logo" width={600} height={400} />
                <h1 className="text-2xl font-bold">Article {id}</h1>
                <span className="text-sm text-gray-500">
                    Published on <span className="font-bold text-orange-600">{new Date().toLocaleString()}</span>
                </span>
                <p className="text-lg">
                    {JSON.stringify(params)}
                </p>
                <Counter />
            </div>
        </div>
    );
}
