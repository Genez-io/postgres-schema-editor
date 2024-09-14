import { useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import DataTableNodeColumn from './DataTableNodeColumn';
import { FaRegPlusSquare } from 'react-icons/fa';
import useSettingsStore from '../../store/settingsStore.js';
import useDataStore from '../../store/dataStore.js';
import useSchemaStore from '../../store/schemaStore.js';

import 'tippy.js/dist/tippy.css';
import { RowsOfData, Data } from '../../Types.js';

export default function DataTableNode({ data }: { data: Data }) {
  //this 'data' is created and passed from createdDataNodes, need DATA, not SCHEMA

  const newData = structuredClone(data);

  const deepClone = { ...newData };
  const [tableData, setTableData] = useState(newData.table);

  const { setDataInputModalState } = useSettingsStore((state:any) => state);
  const { dataStore } = useDataStore((state:any) => state);
  const setDataStore = useDataStore((state:any) => state.setDataStore);
  const { schemaStore } = useSchemaStore((state:any) => state);

  //split up the table into different parts based on how the data is structured. fetch
  const tableName = tableData[0];
  let firstRow: string[] = [];
  let restRowsData: RowsOfData[] | [] = [];
  let secondaryFirstRow: string[] = [];
  // let RowData: RowsOfData[] = Object.values(tableData[1]);
  let RowData: RowsOfData[] = Object.values(deepClone.table[1]);

  //Used to grab the primary key and foreign keys column in the Table
  let schemaName = schemaStore[`public.${tableName}`];
  let PK: string | number | null = null;
  //let FK: string | number | null = null;
  let pkVals = new Set();
  for (let key in schemaName) {
    //if (schemaName[key]['IsForeignKey']) FK = schemaName[key].field_name;
    if (schemaName[key]['IsPrimaryKey']) PK = schemaName[key].field_name;
  }

  //loop through all of RowData, grab each primary key value and store it in object<pkVals>

  for (let i = 0; i < RowData.length; i++) {
    if (PK !== null) {
      pkVals.add(RowData[i][PK]);
    }
  }

  //check if
  if (schemaName !== undefined) {
    secondaryFirstRow = Object.keys(schemaStore[tableName]);
  }

  //Filter out Schemas from data, not sure why schema data would show sometime.
  if (RowData[0] !== undefined) {
    if (RowData[0].IsForeignKey === undefined) {
      firstRow = Object.keys(RowData[0]);
      restRowsData = [...RowData];
    }
  } else {
    firstRow = secondaryFirstRow;
  }

  //UseEffect set Table when the dataStore is changed after on Delete.
  useEffect(() => {
    setTableData([tableName, dataStore[tableName]]);
  }, [dataStore]);

  const deleteRow = async (
    value: RowsOfData,
    index: number,
    id: number | string
  ): Promise<void> => {
    ////////////////////////// CHECK TO SEE IF IT HAS A REFERENCE FOREIGN KEY BEFORE DELETE/////////////
    //loop through all of deleteRow values and check if there is a corresponding referenceStore, if so throw error because it has a corresponding foreign key.
    //   for(let col in value){
    //   if(referenceStore[id] !== undefined ){
    //     if(referenceStore[id][col] !== undefined ){
    //       if(referenceStore[id][col].has(value[col])){
    //         alert(`Can't Delete Foreign Key: ${col}`);
    //         throw new Error(`Can't Delete Foreign Key: ${col}`);
    //       }
    //     }
    //   }
    // }
    ////////////////////////////////////////////////////////////////////////
    const newDatastore = structuredClone(dataStore);
    restRowsData = restRowsData
      .slice(0, index)
      .concat(restRowsData.slice(index + 1, restRowsData.length));
    newDatastore[tableName] = restRowsData;
    const dbId = window.location.href.replace(/.*edit\//, '')

    await fetch(import.meta.env.VITE_API_URL + `/api/sql/postgres/deleteRow`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
        'Accept-Version': 'genezio-webapp/0.3.0',
        'Db-Id': dbId as string
      },
      body: JSON.stringify({ tableName: tableName, value: value }),
    })
      .then(() => {
        setDataStore({ ...newDatastore, [id]: restRowsData });

        return;
      })
      .catch((err: ErrorEvent) => {
        console.error('deleting row error', err);
      });
  };

  //cannot make handles for data table dynamic since size of each column can vary
  //TODO: is there better way to assign handle? more dynamic?
  const tableHandles: JSX.Element[] = [];
  for (let i = 0; i < data.edges.length; i++) {
    if (data.edges[i].source === tableName) {
      tableHandles.push(
        <Handle
          key={`${data.edges[i]}-source-${[i]}`}
          type="source"
          position={Position.Top}
          id={data.edges[i].sourceHandle as string}
          style={{
            background: 'transparent',
            left: '70%',
          }}
        />
      );
    }
    if (data.edges[i].target === tableName) {
      tableHandles.push(
        <Handle
          key={`${data.edges[i]}-target-${[i]}`}
          type="target"
          position={Position.Top}
          id={data.edges[i].targetHandle as string}
          style={{
            background: 'transparent',
            left: '4%',
          }}
        />
      );
    }
  }

  return (
    <>
      <div className="table-node transition-colors duration-500" key={tableName}>
        <div className="table-header relative flex items-center justify-between bg-[#f8f4eb] dark:bg-gray-900">
          {tableHandles}
          <div>
            <label
              htmlFor="text"
              className="text-stroke-black bg-[#f8f4eb] text-black dark:bg-opacity-0 dark:text-white"
              style={{
                marginLeft: '0px',
              }}
            >
              {tableName}
            </label>
          </div>
          <div className="addRowBtn position mb-1.5 ml-3 flex">
            <button
              className="add-field bg-transparent transition-colors duration-500 hover:text-[#618fa7] dark:text-[#fbf3de] dark:hover:text-[#618fa7]"
              onClick={() => {
                setDataInputModalState(true, 'row', tableName);
              }}
            >
              <FaRegPlusSquare size={20} className="text-white" />
            </button>
          </div>
        </div>
        <div
          style={{ maxHeight: '350px', maxWidth: '600px' }}
          className="nowheel scrollbar-hide overflow-auto"
        >
          <div className="table-bg transition-colors duration-500 dark:bg-slate-700">
            <table className="transition-colors duration-500 dark:text-[#fbf3de]">
              <thead>
                <tr className="head-column">
                  {firstRow?.map((each) => (
                    <th
                      key={each}
                      scope="col"
                      className="transition-colors duration-500 dark:text-[#fbf3de]"
                    >
                      <b>{each}</b>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* generates dynamic columns */}
                {restRowsData.map((row, index) => {
                  return (
                    <DataTableNodeColumn
                      row={row}
                      key={`${tableName}-row${index}`}
                      id={tableName}
                      index={index}
                      deleteRow={deleteRow}
                      PK={[PK, pkVals]}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
