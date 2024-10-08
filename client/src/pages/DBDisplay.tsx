// React & React Router & React Query Modules;
import React, { useRef } from 'react';
import { useParams } from 'react-router-dom';

//import login from '../assets/right-to-bracket-solid.svg'; // Ensure the path is correct
//import default_pfp from '../assets/default_pfp.svg';

// Components Imported;
import FeatureTab from '../components/DBDisplay/FeatureTab';
import AddReference from '../components/DBDisplay/AddReference';
import Flow from '../components/ReactFlow/Flow';
import InputModal from '../components/Modals/InputModal';
import DeleteTableModal from '../components/Modals/DeleteTableModal';
import useSettingsStore from '../store/settingsStore.js';

const DBDisplay: React.FC = () => {
  let { dbId } = useParams<{ dbId: string }>();
  if (!dbId) {
    dbId = 'not-set';
  }

  // Zustand state setters/getters from settingsStore
  const {
    editRefMode,
    inputModalState,
    setInputModalState,
    deleteTableModalState,
    setDeleteTableModalState,
    currentTable
  } = useSettingsStore((state:any) => state);

  const openAddTableModal = () => setInputModalState(true, 'table');
  const openDeleteTableModal = () => setDeleteTableModalState(true);

  //create references for HTML elements
  const mainId: any = useRef();

  return (
    <>
      <div id="DBDisplay" className=" transition-colors duration-500">
        <div
          id="mySidenav"
          className="sidenav bg-[#fbf3de] shadow-2xl dark:bg-gray-900"
        >
          {/* "AddReference" => change reference in schema */}
          {editRefMode ? <AddReference dbId={dbId}/> : <></>}
        </div>
        {/* <!-- Add all page content inside this div if you want the side nav to push page content to the right (not used if you only want the sidenav to sit on top of the page --> */}
        <div ref={mainId} id="main" className="mx-auto transition-colors duration-500">
          <Flow/>
          <FeatureTab
            openAddTableModal={openAddTableModal}
            openDeleteTableModal={openDeleteTableModal}
            dbId={dbId}
          />
        </div>

        {inputModalState.isOpen ? (
          <InputModal
            mode={inputModalState.mode as 'table' | 'column'}
            tableNameProp={currentTable}
            closeInputModal={() => setInputModalState(false)}
            dbId={dbId}
          />
        ) : null}
        {deleteTableModalState.isOpen ? (
          <DeleteTableModal
            closeDeleteTableModal={() => setDeleteTableModalState(false)}
            dbId={dbId}
          />
        ) : null}
      </div>
    </>
  );
};

export default DBDisplay;
