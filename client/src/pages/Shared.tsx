import {Outlet} from 'react-router-dom';

function Shared() {
  return (
    <>
    {/* Outlet renders child elements */}
    <Outlet/>
    </>
  )
}

export default Shared;