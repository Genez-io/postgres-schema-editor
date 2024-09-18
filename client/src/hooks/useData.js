import { useEffect, useState } from "react";
import alasql from "alasql";
import toast from "react-hot-toast";

const runQuery = async (q) => {
  try {
    const dbId = window.location.href.replace(/.*data\//, '')
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/sql/postgres/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Accept-Version': 'genezio-webapp/0.3.0',
        'Db-Id': dbId
      },
      body: JSON.stringify({ query: q })
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error executing query:", error);
    throw error;
  }
}

const fetchTableNames = async (dbId) => {
  try {
    const dbId = window.location.href.replace(/.*data\//, '')
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/sql/postgres/tableNames`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Accept-Version': 'genezio-webapp/0.3.0',
        'Db-Id': dbId
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching table names:", error);
    throw error;
  }
}

const useData = (query) => {
  const [data, setData] = useState([]);
  const [schema, setSchema] = useState([]);
  const [error, setError] = useState(false);
  const [runtime, setRuntime] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = (query) => {
      setLoading(true);
      setData([]);
      setSchema([]);
      setError(false);
      let t0 = performance.now(); //start time
      runQuery(query)
      .then((data) => {
        let t1 = performance.now(); //end time
        setRuntime(t1 - t0);
        if (data.rows) 
          setData(data.rows);
        if (data.schema) 
          setSchema(data.schema);
        setLoading(false);
        })
      .catch((error) => {
        let t1 = performance.now(); //end time
        setRuntime(t1 - t0);
        toast.error(error.message);
        setLoading(false);
      });
    };
    fetchData(query);
  }, [query]);

  return { data, schema, runtime, error, loading };
};

export  {fetchTableNames, useData};
