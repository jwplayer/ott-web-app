import ApiService from "@jwp/ott-common-next/src/services/ApiService";

import PlaylistDetails from "../../../components/client-pages/playlist-details";

const apiService = new ApiService();

export const generateStaticParams = async () => []


export async function generateMetadata({ params }: { params: Promise<{ paths: string[] }> }) {
  try {

    const playlistId = (await params).paths[0];

    const playlist = await apiService.getPlaylistById(playlistId, {
    });

    if (!playlist) return { title: "Playlist Not Found" };

    return {
      title: playlist.title,
      description: playlist.description,

      openGraph: {
        title: playlist.title,
        description: playlist.description,
        url: `/p/${playlistId}`,
      },
    };
  } catch (error) {
    return { title: "Playlist Not Found" };
  }
}


export default async function PlaylistPage() {

  return <PlaylistDetails />
}