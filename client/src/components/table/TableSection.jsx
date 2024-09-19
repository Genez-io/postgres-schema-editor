import React, { useEffect, useMemo } from "react";
import {useData} from "../../hooks/useData";
import Table from "./Table.jsx";

import Loader from "../../assets/loader.svg";

const TableSection = React.memo(({ query, isOpen, setSchema, navigationMenuRef }) => {
  const { data, schema, loading, runtime, error } = useData(query);

  const columns = useMemo(() => {
    if (data.length > 0) {
      if (schema.length > 0) {
        setSchema(schema);
      }
      return Object.keys(data[0]).map((key) => {
        return {
          Header: key,
          accessor: key,
        };
      });
    } else if (schema.length > 0) {
      setSchema(schema);
      return schema.map((columnName) => ({
        Header: columnName,
        accessor: columnName,
      }));
    }
  }, [data, schema]);

  useEffect(() => {
    if (loading == false) {
      if (query.match(/^\s*(create|drop)\s+table\s+/i)) {
        navigationMenuRef.current.refreshTables();
      } 
     }
  }, [loading]);

  if (error)
    return (
      <section
        className={`${
          isOpen ? "col-start-2" : "col-start-1"
        } col-end-3 row-start-3 row-end-4 text-white m-6`}
      >
        <h1 className="text-center font-bold text-xl text-primary-dark">
          Something Went Wrong{" "}
          <span role="img" aria-label="sad face">
            😔
          </span>
        </h1>
      </section>
    );
  return (
    <>
      <section
        className={`${
          isOpen ? "col-start-2" : "col-start-1"
        } col-end-3 row-start-3 row-end-4 text-white mx-6 my-12 lg:mx-12 overflow-hidden`}
      >
        {!loading ? (
          <>
            {columns && columns.length > 0 ? (
              <>
                <p className="text-primary-dark">
                  Query took:{" "}
                  <span className="font-bold">{`${runtime.toFixed(2)} ms`}</span>
                </p>
                <Table
                  columns={columns}
                  data={data}
                  query={query}
                />
              </>
            ) : null}
          </>
        ) : (
          <img src={Loader} className="w-20 mx-auto" alt="loader" />
        )}
      </section>
    </>
  );
});

export default TableSection;
