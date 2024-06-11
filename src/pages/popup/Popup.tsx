import { useEffect, useState } from 'react';
import { useCommonContext } from '../background/context/index';
import { Loading, LoginPanel, } from '@components/index';
import { DashboardPanel } from './components';

export default function Popup() {
  const [showId, setShowId] = useState(0)
  const { userData, loading } = useCommonContext()
  const init = () => {
    if(loading) {
      setShowId(0)
    } else if (userData?.id) {
      setShowId(2)
    } else {
      setShowId(1)
    }
  }

  useEffect(() => {
    init()
  }, [loading])

  return (
    <div className="w-full h-full">
      {/* loading */}
      {showId == 0 && <Loading />}
      {/** 登录页面 */}
      {showId == 1 && <LoginPanel />}
      {/** 操作页面 */}
      {showId == 2 && <DashboardPanel changeStatus={() => setShowId(1)} />}
    </div>
  );
}
