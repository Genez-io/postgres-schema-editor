import {Outlet} from 'react-router-dom';
import useCredentialsStore from '../store/credentialsStore.js';

function Shared() {
  //STATE DECLARATION (dbSpy3.0)
  useCredentialsStore(state => state.user);
  useCredentialsStore(state => state.setUser);
  //END: STATE DECLARATION
  
  return (
    <>
    {/* Outlet renders child elements */}
    <Outlet/>
    </>
  )
}

export default Shared;