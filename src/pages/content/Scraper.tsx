import { useEffect, useState } from 'react';
import Draggable from 'react-draggable';
import { Loading, LoginPanel, StartScraper } from './components';
import { useCommonContext } from '../background/context/index'

export default function Scraper() {
  const [showId, setShowId] = useState(0)
  const { userData, loading } = useCommonContext()

  const init = () => {
    // if(loading) {
    //   setShowId(0)
    // } else if (userData?.id) {
    //   setShowId(2)
    // } else {
    //   setShowId(1)
    // }
  }
  
  useEffect(() => {
    init()
  }, [])

  return (
    <Draggable>
      {/* <div className="relative rounded-lg border border-gray-200 bg-white shadow-lg">
        {showId == 0 && <Loading />}
        {showId == 1 && <LoginPanel />}
        {showId == 2 && <StartScraper />}
      </div> */}
      <div className='text-white'>dddddd</div>
    </Draggable>
  );
}
