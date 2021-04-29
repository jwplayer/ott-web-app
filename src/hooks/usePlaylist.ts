import { useQuery } from "react-query";

const baseUrl = 'https://content.jwplatform.com'; // temp data, till config arrives

const getPlaylistById = (playlistId: string) => {
    return fetch(`${baseUrl}/v2/playlists/${playlistId}`).then(res =>
        res.json())
};



export default function usePlaylist(playlistId: string) {
    return useQuery(["playlist", playlistId], () => getPlaylistById(playlistId));
}
