import React from 'react';
import { Link } from 'react-router-dom';

import styles from './Download.module.scss';

import appStore from '#src/assets/download/app_store.png';
import playStore from '#src/assets/download/play_store.png';
import amazonStore from '#src/assets/download/amazon_store.png';
import rokuStore from '#src/assets/download/roku_store.png';

const Download = () => {
  return (
    <div>
      <title>Download</title>
      <main className={styles.main}>
        <div className={styles.title}>
          <h1>Get Tankee now!</h1>
        </div>
        <div className={styles.cards}>
          <div className={styles.card}>
            <Link to={'https://apps.apple.com/us/app/tankee/id1339413435?ls=1'}>
              <img alt={appStore} src={appStore} className={styles.image} />
            </Link>
            <h6>Tankee for iPhone, iPads & AppleTV</h6>
          </div>
          <div className={styles.card}>
            <Link to={'https://play.google.com/store/apps/details?id=com.tankeeinc.tankee'}>
              <img alt={playStore} src={playStore} className={styles.image} />
            </Link>
            <h6>Tankee for Android Phones & Tablets</h6>
          </div>
          <div className={styles.card}>
            <Link to={'https://channelstore.roku.com/en-ot/details/accae28b3787770272483f98e0c8e043/tankee-minecraft-roblox-and-more'}>
              <img alt={rokuStore} src={rokuStore} className={styles.image} />
            </Link>
            <h6>Tankee for Roku devices & TV&apos;s</h6>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Download;
