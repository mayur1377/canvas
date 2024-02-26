import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import CanvasJSReact from '@canvasjs/react-charts';
import './App.css'; // Import your CSS file

const CanvasJSChart = CanvasJSReact.CanvasJSChart;

const App = () => {
  const [data, setData] = useState([]);
  const [fruitNames, setFruitNames] = useState([]);
  const barColors = ['#1976d2', '#689f38', '#f57c00', '#d32f2f', '#7b1fa2']; // Define an array of bar colors
  const lineColors = ['#64b5f6', '#9ccc65', '#ffca28', '#ff8a65', '#ba68c8']; // Define an array of line colors
  const chartRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      // Extract fruit names from the first row of the Excel sheet
      const fruitNames = jsonData[0].slice(1);

      // Remove the first row (header) from the jsonData
      jsonData.shift();

      setData(jsonData.map((row, index) => {
        const date = new Date(row[0]);
        const fruits = row.slice(1).reduce((acc, val, idx) => {
          acc[fruitNames[idx]] = parseInt(val);
          return acc;
        }, {});
        return { date, ...fruits };
      }));
      setFruitNames(fruitNames);
    };

    reader.readAsArrayBuffer(file);
  };

  const downloadChart = () => {
    const chart = chartRef.current.chart;
    chart.exportChart({ format: 'png' });
  };
  let gap = 1/fruitNames.length;
  //console.log(gap);
  const options = {
    title: {
    },
    axisX: {
      title: 'Date',
      interval: 1,
      valueFormatString: 'DD/MM/YYYY' // Format for displaying dates on the x-axis
    },
    axisY: {
      title: 'Price',
      valueFormatString: '0' // Format for displaying y-axis values as integers
    },
    zoomEnabled: true, // Enable zooming in the graph
    data: fruitNames.flatMap((fruitName, index) => [
      {
        type: 'column',
        name: fruitName,
        color: barColors[index % barColors.length], // Assign a different color to each bar
        borderColor: barColors[index % barColors.length], // Border color same as bar color
        borderWidth: 1, // Border width for the bar
        showInLegend: true,
        dataPoints: data.map((row, idx) => ({ x: idx , y: row[fruitName] }))
      },
      {
        type: 'line',
        name: fruitName,
        color: lineColors[index % lineColors.length], // Use a different color for the line
        showInLegend: true,
        dataPoints: data.map((row, idx) => ({ x: idx + ((index * gap)-(Math.ceil((fruitNames.length/2))*gap) + gap/2), y: row[fruitName] }))
      }
    ])
  };
  
  return (
    <div>
      <h1>Data Visualizer</h1>
      <div className="upload-container">
        <label className="upload-button">
          Upload Excel File
          <input type="file" onChange={handleFileUpload} />
        </label>
      </div>
      {data.length > 0 && (
        <>
          <div className="download-button">
            <button onClick={downloadChart}>Download as PNG</button>
          </div>
          <CanvasJSChart options={options} ref={chartRef} />
        </>
      )}
    </div>
  );
};

export default App;
