import React, { EventHandler } from 'react';
import { TileDock, CYCLE_MODE_STOP } from 'tile-dock';

import logo from '../assets/logo.svg';


// temporary

export const columnMapping = {
  landscape: {
    xs: 1,
    sm: 3,
    md: 4,
    lg: 5,
    xl: 6,
  },
  portrait: {
    xs: 1,
    sm: 4,
    md: 5,
    lg: 7,
    xl: 9,
  },
};

 const Slider = () => {
  const items = Array(10).fill("");

  return (
    <div className="Card-container">
      <TileDock
        items={items}
        tilesToShow={3}
        cycleMode={CYCLE_MODE_STOP}
        animated={true}
        showControls={true}
        transitionTime={'0.6s'}
        spacing={12}
        minimalTouchMovement={30}
        renderLeftControl={({ handleClick }: { handleClick: EventHandler<React.SyntheticEvent> }) => (
          <button
            onClick={handleClick}
            aria-label="Slide left"
          >
            {'<'}
          </button>
        )}
        renderRightControl={({ handleClick }: { handleClick: EventHandler<React.SyntheticEvent> }) => (
          <button
            onClick={handleClick}
            aria-label="Slide right"
          >
            {'>'}
          </button>
        )}
        renderTile={() => {
          return <Card />;
        }}
      />
    </div>
  );
};




const Card = () => {
    return (
      <div className='Container'>
        <img src={logo} width="200" alt="logo" />
      </div>  
    );
}


export default Slider
