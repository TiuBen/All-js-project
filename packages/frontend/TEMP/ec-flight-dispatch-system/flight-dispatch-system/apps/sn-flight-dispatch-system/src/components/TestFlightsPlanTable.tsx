import React from 'react'

function TestFlightsPlanTable() {
  return (
    <table className='border-collapse border border-gray-400'>
      <thead>
        <tr>
          <th>Flight</th>
          <th>Date</th>
          <th>Time</th>
          <th>Duration</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Flight 1</td>
          <td>01/01/2021</td>
          <td>08:00</td>
          <td>2 hours</td>
          <td><span className="status-pending">Pending</span></td>
        </tr>
      </tbody>


    </table>
  )
}

export default TestFlightsPlanTable