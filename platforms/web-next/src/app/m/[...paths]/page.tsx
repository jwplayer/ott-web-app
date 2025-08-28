import ApiService from "@jwp/ott-common-next/src/services/ApiService";

import MediaDetails from "../../../components/client-pages/media-details";

export const apiService = new ApiService();

export const generateStaticParams = async () => []


export async function generateMetadata({ params }: { params: Promise<{ paths: string[] }> }) {

  const mediaId = (await params).paths[0];

  const media = await apiService.getMediaById({ id: mediaId, language: 'en' });

  if (!media) return { title: "Media Not Found" };

  return {
    title: media.title,
    description: media.description,

    openGraph: {
      title: media.title,
      description: media.description,
      url: `/m/${mediaId}`,
    },
  };
}


export default async function MediaPage({ params }: { params: Promise<{ paths: string[] }> }) {
  const { paths } = await params;

  return <MediaDetails paths={paths} />
}