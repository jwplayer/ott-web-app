import ApiService from "@jwp/ott-common-next/src/services/ApiService";
import env from "@jwp/ott-common-next/src/env";

import MediaDetails from "../../../components/client-pages/media-details";

const apiService = new ApiService();

export const generateStaticParams = async () => []


export async function generateMetadata({ params }: { params: Promise<{ paths: string[] }> }) {
  try {

    const mediaId = (await params).paths[0];

    const media = await apiService.getMediaById({ id: mediaId, language: 'en' });

    if (!media) return { title: "Video Not Found" };

    return {
      title: media.title,
      description: media.description,

      openGraph: {
        title: media.title,
        description: media.description,
        url: `${env.APP_PUBLIC_URL}/m/${mediaId}`,
      },
    };
  } catch (error) {
    return { title: "Video Not Found" };
  }
}


export default async function MediaPage({ params }: { params: Promise<{ paths: string[] }> }) {
  const { paths } = await params;

  return <MediaDetails paths={paths} />
}