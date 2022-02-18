import React, { useContext, useEffect } from 'react';

import LoadingOverlay from '../components/LoadingOverlay/LoadingOverlay';
import type { Playlist, PlaylistItem } from '../../types/playlist';
import { getPlaylistById } from '../services/api.service';
import { Store } from 'pullstate';
import { ConfigContext } from './ConfigProvider';
import { PersonalShelf, PersonalShelves } from '../enum/PersonalShelf';

interface MediaContextData {
  playlists?: {
    [id: string]: Playlist;
  };
  items?: {
    [id: string]: PlaylistItem;
  };
}

export const MediaStore = new Store<MediaContextData>({});

export default function MediaLoader({ children }: { children: JSX.Element }): JSX.Element {
  const config = useContext(ConfigContext);
  const state = MediaStore.useState();

  // This code loads all of the playlists in the config content,
  // storing the data in memory so we don't have to make /v2/media/<id> queries every time a viewer views a video detail page
  // Mostly this is for the logged out with url signing scenario where viewers can get the playlists and metadata,
  // but can't get the media details (which allow the video to be played) without logging in
  useEffect(() => {
    Promise.all(config.content.filter((c) => !PersonalShelves.includes(c.playlistId as PersonalShelf)).map((c) => getPlaylistById(c.playlistId))).then(
      (playlistResponses) => {
        MediaStore.update(() => {
          const items: { [id: string]: PlaylistItem } = {};
          const playlists: { [id: string]: Playlist } = {};

          playlistResponses.forEach((playlist) => {
            if (playlist?.feedid) {
              playlists[playlist.feedid] = playlist;
            }

            playlist?.playlist.forEach((item) => {
              items[item.mediaid] = item;
            });
          });

          return { playlists, items };
        });
      },
    );
  }, [config.content]);

  // Don't render UI while loading (too many downstream dependencies don't gracefully handle no-data)
  if (state.playlists === undefined) {
    return <LoadingOverlay />;
  }
  return children;
}
