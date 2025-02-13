import { useDispatch } from 'react-redux';
import { Outlet } from 'react-router-dom'

const LightLayout = () => {
  const dispatch = useDispatch();

  // useEffect(() => {
  //   dispatch(blackCursor());
  // }, []);

  return (
    <main className="h-screen w-full bg-gray-97 p-8 text-black">
      <Outlet />
    </main>
  )
}

export default LightLayout