import React from 'react';
import { createRoot } from 'react-dom/client';
import { CommonProvider } from '../background/context';
import Scraper from './Scraper';
import './style.css'

function init() {
  const div = document.createElement('div');
  div.id = '__root';
  document.body.appendChild(div);

  const rootContainer = document.querySelector('#__root');
  if (!rootContainer) throw new Error("Can't find Options root element");
  const root = createRoot(rootContainer);


  root.render(<div className="fixed left-[540px] top-[100px] z-[9999] w-[300px]">
    <CommonProvider>
      <Scraper />
    </CommonProvider>
  </div>);
}

init();
