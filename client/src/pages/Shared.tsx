import {Outlet} from 'react-router-dom';
import useCredentialsStore from '../store/credentialsStore.js';

function Shared() {
  useCredentialsStore(state => state.user);
  useCredentialsStore(state => state.setUser);
  
  return (
    <>
    {/* Outlet renders child elements */}
    <Outlet/>
    </>
  )
}

export default Shared;