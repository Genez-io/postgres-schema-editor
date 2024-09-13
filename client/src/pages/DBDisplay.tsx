// React & React Router & React Query Modules;
import React, { useRef } from 'react';

//import login from '../assets/right-to-bracket-solid.svg'; // Ensure the path is correct
//import default_pfp from '../assets/default_pfp.svg';

// Components Imported;
import Sidebar from '../components/DBDisplay/Sidebar';
import FeatureTab from '../components/DBDisplay/FeatureTab';
import AddReference from '../components/DBDisplay/AddReference';
import Flow from '../components/ReactFlow/Flow';
import DataFlow from '../components/ReactFlow/DataFlow';
import InputModal from '../components/Modals/InputModal';
import DataInputModal from '../components/Modals/DataInputModal';
import DeleteTableModal from '../components/Modals/DeleteTableModal';
import useCredentialsStore from '../store/credentialsStore.js';
import useSettingsStore from '../store/settingsStore.js';

const DBDisplay: React.FC = () => {
  useCredentialsStore();

  // Zustand state setters/getters from settingsStore
  const {
    sidebarDisplayState,
    setSidebarDisplayState,
    welcome,
    editRefMode,
    inputModalState,
    setInputModalState,
    inputDataModalState,
    setDataInputModalState,
    deleteTableModalState,
    setDeleteTableModalState,
    currentTable,
    isSchema,
    setTableMode,
    dbName,
  } = useSettingsStore((state:any) => state);

  const openAddTableModal = () => setInputModalState(true, 'table');
  const openDeleteTableModal = () => setDeleteTableModalState(true);

  const { user } = useCredentialsStore((state): any => state);
  //create references for HTML elements
  const mySideBarId: any = useRef();
  const mainId: any = useRef();

  /* Set the width of the side navigation to 400px and add a right margin of 400px */
  const openNav = () => {
    mySideBarId.current.style.width = '400px';
    mainId.current.style.marginRight = '400px';
  };

  /* Set the width of the side navigation to 0, and a right margin of 50px */
  const closeNav = () => {
    mySideBarId.current.style.width = '0';
    mainId.current.style.marginRight = '50px';
  };

  // dbSpy 6.0: Update handleSidebar to allow opening/closing sidebar on Connect Database click
  function handleSidebar() {
    if (sidebarDisplayState) {
      setSidebarDisplayState();
      closeNav();
    } else {
      setSidebarDisplayState();
      openNav();
    }
  }

  return (
    <>
      <div className="flex h-2 justify-end pr-5">
        {user ? (
          <>
            <span className="text-black-200 inline-block pt-4 dark:text-white lg:mt-0">
              {user.full_name}
            </span>
            <img
              className="ml-2 mr-2 mt-4 inline-block h-[25] rounded-full dark:invert"
              src=""
            />
          </>
        ) : (
          <div className="flex justify-end">
            <a
              className="p-4 text-base font-bold leading-normal text-black dark:text-white"
              href="#"
              onClick={() => {
                let oldToken = localStorage.getItem('token');
                if (!oldToken) {
                  oldToken = '';
                }
                let token = prompt('Please enter your token', oldToken);
                if (token) {
                  localStorage.setItem('token', token);
                }
              }}
            >
              <span>Login</span>
              <img className="ml-3 mr-3 inline-block h-[20] dark:invert" src="" />
            </a>
          </div>
        )}
      </div>
      <div id="DBDisplay" className=" transition-colors duration-500">
        <div
          ref={mySideBarId}
          id="mySidenav"
          className="sidenav bg-[#fbf3de] shadow-2xl dark:bg-gray-900"
        >
          <a href="#" className="closebtn" onClick={closeNav}>
            &times;
          </a>
          <Sidebar closeNav={closeNav} />
          {/* "AddReference" => change reference in schema */}
          {editRefMode ? <AddReference /> : <></>}
        </div>
        {/* <!-- Add all page content inside this div if you want the side nav to push page content to the right (not used if you only want the sidenav to sit on top of the page --> */}
        <div ref={mainId} id="main" className="mx-auto transition-colors duration-500">
          {/* <div>"Current Database Name:"</div> */}
          {welcome ? (
            <div className="canvas-ConnectToDatabase relative right-[142px] m-auto flex w-[50%] flex-col transition-colors duration-500 dark:text-[#f8f4eb]">
              <h3 className="text-center">Welcome to dbSpy!</h3>
            </div>
          ) : // If welcome state is false, check isSchema condition
          isSchema ? (
            // If isSchema state is true, render Show Data button and Flow component
            <>
              <Flow />
              <button
                id="showSchema"
                className=" rounded bg-black px-4 py-2 font-bold text-white hover:bg-yellow-500"
                onClick={setTableMode}
              >
                Show data
              </button>
              <span id="text" className="ml-5 text-black dark:text-white">
                Current Database: {dbName}
              </span>
            </>
          ) : (
            // If isSchema state is false, render Show Schema button and DataFlow component
            <>
              <DataFlow />
              <button
                id="showSchema"
                className="rounded bg-black px-4 py-2 font-bold text-white hover:bg-yellow-500"
                onClick={setTableMode}
              >
                Show Schema
              </button>
              <span id="text" className="ml-5 text-white">
                Current Database: {dbName}
              </span>
            </>
          )}
        </div>
        <FeatureTab
          handleSidebar={handleSidebar}
          openAddTableModal={openAddTableModal}
          openDeleteTableModal={openDeleteTableModal}
        />
        {inputModalState.isOpen ? (
          <InputModal
            mode={inputModalState.mode as 'table' | 'column'}
            tableNameProp={currentTable}
            closeInputModal={() => setInputModalState(false)}
          />
        ) : null}
        {inputDataModalState.isOpen ? (
          <DataInputModal
            mode={inputModalState.mode}
            tableNameProp={currentTable}
            closeDataInputModal={() => setDataInputModalState(false)}
          />
        ) : null}
        {deleteTableModalState.isOpen ? (
          <DeleteTableModal
            closeDeleteTableModal={() => setDeleteTableModalState(false)}
          />
        ) : null}
      </div>
    </>
  );
};

export default DBDisplay;
