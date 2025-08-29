import ApiService from "@jwp/ott-common-next/src/services/ApiService";

import PlaylistDetails from "../../../components/client-pages/playlist-details";

export const apiService = new ApiService();

export const generateStaticParams = async () => []


export async function generateMetadata({ params }: { params: Promise<{ paths: string[] }> }) {

  const playlistId = (await params).paths[0];

  const playlist = await apiService.getPlaylistById(playlistId, {
  });

  if (!playlist) return { title: "Media Not Found" };

  return {
    title: playlist.title,
    description: playlist.description,

    openGraph: {
      title: playlist.title,
      description: playlist.description,
      url: `/p/${playlistId}`,
    },
  };
}


export default async function PlaylistPage({ params }: { params: Promise<{ paths: string[] }> }) {
  const { paths } = await params;

  return <PlaylistDetails />
}